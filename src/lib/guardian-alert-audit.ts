import { GuardianAlert } from './types';

export type CreateGuardianAlert = (alert: Omit<GuardianAlert, 'id'>) => Promise<void>;

export async function tryCreateGuardianAlertAudit(
  createGuardianAlert: CreateGuardianAlert,
  alert: Omit<GuardianAlert, 'id'>
) {
  try {
    await createGuardianAlert(alert);
    return true;
  } catch (error) {
    console.warn('Guardian alert email was sent, but audit record could not be saved.', error);
    return false;
  }
}
