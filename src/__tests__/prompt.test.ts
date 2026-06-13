import { describe, it, expect } from 'vitest';
import { buildGeminiPrompt } from '@/lib/gemini-prompt';
import { CheckInInput } from '@/lib/validation';

describe('Gemini Prompt Builder', () => {
  it('includes safety rules in the prompt', () => {
    const data: CheckInInput = {
      examType: 'NEET',
      mood: 'anxious',
      stressLevel: 7,
      sleepHours: 6,
      studyHours: 8,
      energyLevel: 'low',
      biggestPressure: 'Mock test scores',
      journalText: 'I feel very overwhelmed today because my mock scores are not improving. I have no hope.',
      language: 'en'
    };
    
    const prompt = buildGeminiPrompt(data);
    
    expect(prompt).toContain('CRITICAL SAFETY RULES');
    expect(prompt).toContain('DO NOT diagnose any mental illness');
    expect(prompt).toContain('crisisSupportRequired');
    expect(prompt).toContain('riskLevel');
    expect(prompt).toContain('guardianSafeSummary');
    expect(prompt).toContain('NEVER include raw journal text');
    expect(prompt).toContain('No medical, therapy, or treatment claims');
    expect(prompt).toContain('studyRecoveryPlan');
    expect(prompt).toContain('low-pressure');
    expect(prompt).toContain('panicModePlan');
    expect(prompt).toContain('Parent-safe summary must be high-level');
    expect(prompt).toContain('I feel very overwhelmed today');
  });
});
