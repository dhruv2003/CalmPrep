import { CheckIn, GuardianAlert, RiskLevel, UserProfile } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidGuardianEmail(email: string | undefined): email is string {
  return Boolean(email && EMAIL_PATTERN.test(email.trim()));
}

function getRiskLevel(checkIn: CheckIn): RiskLevel | undefined {
  return checkIn.riskLevel ?? checkIn.result?.riskLevel;
}

function normalizeKeyPart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80);
}

export function canAutoSendGuardianAlert(profile: UserProfile | null | undefined, checkIn: CheckIn | null | undefined) {
  if (!profile || !checkIn) return false;
  const riskLevel = getRiskLevel(checkIn);

  return Boolean(
    profile.guardianConsentEnabled &&
      isValidGuardianEmail(profile.guardianEmail) &&
      (riskLevel === 'high' || riskLevel === 'urgent') &&
      checkIn.result?.guardianSafeSummary?.trim()
  );
}

export function getGuardianAlertIdempotencyKey(userId: string, checkIn: CheckIn) {
  const checkInKey = normalizeKeyPart(checkIn.id || checkIn.createdAt || 'latest');
  const riskLevel = getRiskLevel(checkIn) || 'unknown';
  return `guardian-alert-${normalizeKeyPart(userId)}-${checkInKey}-${riskLevel}`.slice(0, 256);
}

export function assertGuardianAlertSafe(alert: GuardianAlert, rawJournalText: string) {
  if (rawJournalText && alert.message.includes(rawJournalText)) {
    throw new Error('Guardian alert must not include raw journal text.');
  }

  if (!isValidGuardianEmail(alert.guardianEmail)) {
    throw new Error('Guardian email is invalid.');
  }
}

function toAlertRiskLevel(riskLevel: RiskLevel | undefined, explicitSupportRequest: boolean): 'high' | 'urgent' {
  if (riskLevel === 'urgent' || riskLevel === 'high') {
    return riskLevel;
  }

  if (explicitSupportRequest) {
    return 'high';
  }

  throw new Error('Guardian alerts require high or urgent risk unless support is explicitly requested.');
}

export function buildGuardianAlert({
  userId,
  profile,
  checkIn,
  explicitSupportRequest = false,
}: {
  userId: string;
  profile: UserProfile;
  checkIn: CheckIn;
  explicitSupportRequest?: boolean;
}): Omit<GuardianAlert, 'id'> {
  if (!profile.guardianConsentEnabled && !explicitSupportRequest) {
    throw new Error('Guardian alert requires consent or an explicit support request.');
  }

  if (!isValidGuardianEmail(profile.guardianEmail)) {
    throw new Error('Guardian email is invalid.');
  }

  const message = checkIn.result?.guardianSafeSummary?.trim();

  if (!message) {
    throw new Error('Guardian alert requires a parent-safe summary.');
  }

  const alert: Omit<GuardianAlert, 'id'> = {
    userId,
    studentName: profile.name,
    guardianEmail: profile.guardianEmail.trim(),
    riskLevel: toAlertRiskLevel(checkIn.riskLevel ?? checkIn.result?.riskLevel, explicitSupportRequest),
    message,
    language: checkIn.language === 'hi' || checkIn.language === 'mr' ? checkIn.language : 'en',
    createdAt: new Date().toISOString(),
    status: 'prepared',
  };

  assertGuardianAlertSafe(alert, checkIn.journalText);

  return alert;
}
