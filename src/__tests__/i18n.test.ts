import { describe, it, expect } from 'vitest';
import { i18n } from '@/lib/i18n';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('i18n Dictionary', () => {
  it('has all required languages', () => {
    expect(i18n).toHaveProperty('en');
    expect(i18n).toHaveProperty('hi');
    expect(i18n).toHaveProperty('mr');
  });

  it('contains critical keys across languages', () => {
    const keys = [
      'appTitle',
      'tagline',
      'heroHeadline',
      'heroBody',
      'profileTitle',
      'profileSubtitle',
      'stressTriggers',
      'emotionalPatterns',
      'examPanicModeTitle',
      'panicButtonLabel',
      'panicStepBreathe',
      'panicStepGround',
      'panicStepNextAction',
      'studyRecoveryPlanTitle',
      'parentSafeSummaryTitle',
      'burnoutRadarTitle',
      'microJournalPromptsTitle',
      'recoveryNext30Minutes',
      'recoveryTonight',
      'recoveryTomorrowMorning',
      'recoveryWhatToAvoid',
      'recoveryAskForHelpWith',
      'burnoutNeedMoreData',
      'whyThisMatters',
      'onePreventionStep',
      'stressTrendLabel',
      'sleepTrendLabel',
      'studyHoursTrendLabel',
      'moodTrendLabel',
      'riskTrendLabel',
      'guardianPreparedStatus',
    ];
    
    for (const key of keys) {
      expect(i18n.en).toHaveProperty(key);
      expect(i18n.hi).toHaveProperty(key);
      expect(i18n.mr).toHaveProperty(key);
    }
  });

  it('does not leave common visible app copy hardcoded in UI files', () => {
    const uiFiles = [
      'src/components/Navigation.tsx',
      'src/app/check-in/page.tsx',
      'src/app/onboarding/page.tsx',
      'src/app/profile/page.tsx',
      'src/app/report/page.tsx',
    ];
    const hardcodedCopy = [
      'Safety First',
      'Trusted Guardian Email',
      'Continue to Check-in',
      'Quick Stats',
      'Analyzing...',
      'Voice Input',
      'Loading profile',
      'Student account',
      'Safety setup',
      'Daily check-in',
      'Latest insight',
      'Update safety setup',
      'Wellness Report',
      'Export PDF',
      'A Note from Your Companion',
      'Daily Insight',
      'Identified Triggers',
      'Attention',
      'No major triggers identified today.',
      'Overall Trajectory',
      'Personalized Action Plan',
      'AI Generated for You',
      'Audio Settings',
      'Logout',
      'Check-in',
      'Exam Panic Mode',
      'Study Recovery Plan',
      'Parent-Safe Summary',
      'Burnout Radar',
      'Micro-Journal Prompts',
      'webkitSpeechRecognition',
      'SpeechRecognition',
      'Voice input state',
    ];

    const combinedSource = uiFiles
      .map((file) => readFileSync(resolve(process.cwd(), file), 'utf8'))
      .join('\n');

    for (const text of hardcodedCopy) {
      expect(combinedSource).not.toContain(text);
    }
  });
});
