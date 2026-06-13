import { CheckIn, GuardianAlert, RiskLevel, UserProfile } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidGuardianEmail(email: string | undefined): email is string {
  return Boolean(email && EMAIL_PATTERN.test(email.trim()));
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
