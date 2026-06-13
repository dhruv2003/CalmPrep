import { describe, expect, it } from 'vitest';
import {
  buildGuardianAlert,
  canAutoSendGuardianAlert,
  getGuardianAlertIdempotencyKey,
  isValidGuardianEmail,
} from '@/lib/guardian-alerts';
import { CheckIn, UserProfile } from '@/lib/types';

const profile: UserProfile = {
  name: 'Demo Student',
  email: 'student@example.com',
  guardianEmail: 'parent@example.com',
  guardianConsentEnabled: true,
  preferredLanguage: 'en',
  createdAt: '2026-06-13T00:00:00.000Z',
};

const highRiskCheckIn: CheckIn = {
  examType: 'NEET',
  mood: 'overwhelmed',
  stressLevel: 9,
  sleepHours: 4,
  studyHours: 10,
  energyLevel: 'low',
  biggestPressure: 'Mock score dropped',
  journalText: 'PRIVATE JOURNAL TEXT ABOUT A SPECIFIC FEAR',
  language: 'en',
  riskLevel: 'high',
  crisisSupportRequired: false,
  createdAt: '2026-06-13T00:00:00.000Z',
  result: {
    summary: 'The student is under high exam stress.',
    moodLabel: 'Overwhelmed',
    riskLevel: 'high',
    crisisSupportRequired: false,
    guardianAlertRecommended: true,
    stressTriggers: ['Mock score pressure'],
    emotionalPatterns: ['High pressure before tests'],
    patternExplanation: 'Stress rises near mock exams.',
    selfDoubtSignals: ['Comparing scores'],
    burnoutSignals: ['Low sleep'],
    copingStrategies: [],
    studyRecoveryPlan: {
      next30Minutes: 'Rest and revise one small topic.',
      tonight: 'Stop heavy problem-solving early.',
      tomorrowMorning: 'Start with one easy revision block.',
      whatToAvoid: 'Avoid score comparison.',
      askForHelpWith: 'Ask for one concept clarification.',
    },
    mindfulnessExercise: {
      title: 'Breathing',
      durationMinutes: 3,
      steps: ['Breathe in', 'Breathe out'],
    },
    panicModePlan: {
      title: 'Reset',
      durationMinutes: 1,
      steps: ['Breathe'],
      groundingPrompt: 'Name what you can see.',
      nextTinyAction: 'Open one formula page.',
      companionMessage: 'This moment can pass.',
    },
    motivationalEncouragement: 'One step is enough.',
    companionResponse: {
      message: 'You are not alone.',
      followUpQuestion: 'What would help now?',
    },
    guardianSafeSummary:
      'The student appears to be experiencing high exam stress and may benefit from a calm check-in. This is not a medical diagnosis.',
    nextSmallAction: 'Drink water.',
    safetyNote: 'Seek trusted support if unsafe.',
  },
};

describe('guardian alert helpers', () => {
  it('validates guardian email addresses', () => {
    expect(isValidGuardianEmail('parent@example.com')).toBe(true);
    expect(isValidGuardianEmail('bad-email')).toBe(false);
  });

  it('builds a prepared alert from the parent-safe summary without raw journal text', () => {
    const alert = buildGuardianAlert({
      userId: 'user-1',
      profile,
      checkIn: highRiskCheckIn,
    });

    expect(alert.status).toBe('prepared');
    expect(alert.riskLevel).toBe('high');
    expect(alert.message).toBe(highRiskCheckIn.result?.guardianSafeSummary);
    expect(alert.message).not.toContain(highRiskCheckIn.journalText);
    expect(JSON.stringify(alert)).not.toContain('PRIVATE JOURNAL TEXT');
  });

  it('rejects low and moderate risk alerts unless support is explicitly requested', () => {
    const moderateCheckIn = { ...highRiskCheckIn, riskLevel: 'moderate' as const };

    expect(() =>
      buildGuardianAlert({
        userId: 'user-1',
        profile,
        checkIn: moderateCheckIn,
      })
    ).toThrow(/high or urgent/i);

    expect(
      buildGuardianAlert({
        userId: 'user-1',
        profile,
        checkIn: moderateCheckIn,
        explicitSupportRequest: true,
      }).status
    ).toBe('prepared');
  });

  it('auto-sends only for consented high or urgent results with a valid guardian email', () => {
    expect(canAutoSendGuardianAlert(profile, highRiskCheckIn)).toBe(true);
    expect(
      canAutoSendGuardianAlert(
        { ...profile, guardianConsentEnabled: false },
        highRiskCheckIn
      )
    ).toBe(false);
    expect(
      canAutoSendGuardianAlert(
        profile,
        { ...highRiskCheckIn, riskLevel: 'moderate', result: { ...highRiskCheckIn.result!, riskLevel: 'moderate' } }
      )
    ).toBe(false);
    expect(
      canAutoSendGuardianAlert(
        { ...profile, guardianEmail: 'bad-email' },
        highRiskCheckIn
      )
    ).toBe(false);
  });

  it('creates a stable idempotency key for one alert per check-in', () => {
    expect(getGuardianAlertIdempotencyKey('user-1', highRiskCheckIn)).toBe(
      'guardian-alert-user-1-2026-06-13T00-00-00.000Z-high'
    );
  });
});
