import { describe, expect, it, vi } from 'vitest';
import { GuardianAlert } from '@/lib/types';
import { sendGuardianEmail } from '@/lib/guardian-email';

const alert: Omit<GuardianAlert, 'id'> = {
  userId: 'user-1',
  studentName: 'Demo Student',
  guardianEmail: 'parent@example.com',
  riskLevel: 'high',
  message:
    'The student appears to be experiencing high exam stress and may benefit from a calm check-in. This is not a medical diagnosis.',
  language: 'en',
  createdAt: '2026-06-13T00:00:00.000Z',
  status: 'prepared',
};

describe('guardian email delivery', () => {
  it('sends parent-safe guardian summary through Resend with an idempotency key', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-123' }),
    });

    const result = await sendGuardianEmail({
      alert,
      resendApiKey: 're_test',
      from: 'CalmPrep <alerts@example.com>',
      idempotencyKey: 'guardian-user-1-checkin-1',
      fetcher,
    });

    expect(result).toEqual({ id: 'email-123' });
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test',
          'Content-Type': 'application/json',
          'Idempotency-Key': 'guardian-user-1-checkin-1',
        }),
      })
    );

    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body.from).toBe('CalmPrep <alerts@example.com>');
    expect(body.to).toEqual(['parent@example.com']);
    expect(body.subject).toContain('CalmPrep guardian alert');
    expect(body.text).toContain(alert.message);
    expect(body.html).toContain(alert.message);
    expect(JSON.stringify(body)).not.toContain('PRIVATE JOURNAL TEXT');
  });

  it('rejects missing Resend configuration before sending', async () => {
    const fetcher = vi.fn();

    await expect(
      sendGuardianEmail({
        alert,
        resendApiKey: '',
        from: '',
        idempotencyKey: 'guardian-user-1-checkin-1',
        fetcher,
      })
    ).rejects.toThrow(/resend/i);

    expect(fetcher).not.toHaveBeenCalled();
  });
});
