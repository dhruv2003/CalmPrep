import { GuardianAlert } from './types';
import { isValidGuardianEmail } from './guardian-alerts';

type Fetcher = typeof fetch;

export interface GuardianEmailResult {
  id: string;
}

export interface SendGuardianEmailArgs {
  alert: Omit<GuardianAlert, 'id'>;
  resendApiKey: string | undefined;
  from: string | undefined;
  idempotencyKey: string;
  fetcher?: Fetcher;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildGuardianEmailText(alert: Omit<GuardianAlert, 'id'>) {
  const studentName = alert.studentName || 'the student';
  return [
    `CalmPrep guardian alert for ${studentName}`,
    '',
    `Risk level: ${alert.riskLevel}`,
    '',
    alert.message,
    '',
    'Suggested next step: Please check in gently, reduce pressure where possible, and help the student access trusted support if they seem unsafe.',
    '',
    'CalmPrep is not a medical, therapy, or crisis service. This alert is a parent-safe wellness summary, not a diagnosis.',
  ].join('\n');
}

export function buildGuardianEmailHtml(alert: Omit<GuardianAlert, 'id'>) {
  const studentName = escapeHtml(alert.studentName || 'the student');
  const riskLevel = escapeHtml(alert.riskLevel);
  const message = escapeHtml(alert.message);

  return `
    <main style="font-family: Arial, sans-serif; line-height: 1.5; color: #141414;">
      <h1>CalmPrep guardian alert</h1>
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Risk level:</strong> ${riskLevel}</p>
      <p>${message}</p>
      <p><strong>Suggested next step:</strong> Please check in gently, reduce pressure where possible, and help the student access trusted support if they seem unsafe.</p>
      <p style="font-size: 13px; color: #555;">CalmPrep is not a medical, therapy, or crisis service. This alert is a parent-safe wellness summary, not a diagnosis.</p>
    </main>
  `.trim();
}

export async function sendGuardianEmail({
  alert,
  resendApiKey,
  from,
  idempotencyKey,
  fetcher = fetch,
}: SendGuardianEmailArgs): Promise<GuardianEmailResult> {
  if (!resendApiKey || !from) {
    throw new Error('Resend email configuration is missing.');
  }

  if (!isValidGuardianEmail(alert.guardianEmail)) {
    throw new Error('Guardian email is invalid.');
  }

  if (alert.riskLevel !== 'high' && alert.riskLevel !== 'urgent') {
    throw new Error('Guardian email requires high or urgent risk.');
  }

  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey.slice(0, 256),
    },
    body: JSON.stringify({
      from,
      to: [alert.guardianEmail],
      subject: `CalmPrep guardian alert: ${alert.riskLevel} support signal`,
      text: buildGuardianEmailText(alert),
      html: buildGuardianEmailHtml(alert),
      tags: [
        { name: 'feature', value: 'guardian_alert' },
        { name: 'risk_level', value: alert.riskLevel },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof data?.message === 'string' ? data.message : 'Resend email delivery failed.');
  }

  if (typeof data?.id !== 'string') {
    throw new Error('Resend email response did not include an id.');
  }

  return { id: data.id };
}
