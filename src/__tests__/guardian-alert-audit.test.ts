import { describe, expect, it, vi } from 'vitest';
import { tryCreateGuardianAlertAudit } from '@/lib/guardian-alert-audit';
import { GuardianAlert } from '@/lib/types';

const alert: Omit<GuardianAlert, 'id'> = {
  userId: 'user-1',
  studentName: 'Demo Student',
  guardianEmail: 'parent@example.com',
  riskLevel: 'high',
  message: 'The student may benefit from a calm check-in. This is not a medical diagnosis.',
  language: 'en',
  createdAt: '2026-06-13T00:00:00.000Z',
  status: 'sent',
};

describe('guardian alert audit writes', () => {
  it('does not throw when Firestore rejects the audit write after email delivery', async () => {
    const createAlert = vi.fn().mockRejectedValue(new Error('Missing or insufficient permissions.'));

    await expect(tryCreateGuardianAlertAudit(createAlert, alert)).resolves.toBe(false);
    expect(createAlert).toHaveBeenCalledWith(alert);
  });

  it('returns true when the audit write succeeds', async () => {
    const createAlert = vi.fn().mockResolvedValue(undefined);

    await expect(tryCreateGuardianAlertAudit(createAlert, alert)).resolves.toBe(true);
  });
});
