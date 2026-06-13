import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/guardian-alert/route';
import { GuardianAlert } from '@/lib/types';

const alert: Omit<GuardianAlert, 'id'> = {
  userId: 'user-1',
  studentName: 'Demo Student',
  guardianEmail: 'parent@example.com',
  riskLevel: 'urgent',
  message:
    'The student may need a calm check-in and reduced pressure tonight. This is not a medical diagnosis.',
  language: 'en',
  createdAt: '2026-06-13T00:00:00.000Z',
  status: 'prepared',
};

function request(body: unknown) {
  return new Request('http://localhost/api/guardian-alert', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('guardian alert API route', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('GUARDIAN_EMAIL_FROM', 'CalmPrep <alerts@example.com>');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sends one parent-safe email for a valid high or urgent alert', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' }),
      })
    );

    const response = await POST(request({ alert, idempotencyKey: 'guardian-user-1-checkin-1' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'sent', providerId: 'email-123' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('rejects low risk alert attempts', async () => {
    const response = await POST(
      request({
        alert: { ...alert, riskLevel: 'low' },
        idempotencyKey: 'guardian-user-1-checkin-1',
      })
    );

    expect(response.status).toBe(400);
  });
});
