import { describe, it, expect } from 'vitest';
import { checkInSchema } from '@/lib/validation';

describe('CheckIn Validation Schema', () => {
  it('accepts a valid check-in', () => {
    const validData = {
      examType: 'NEET',
      mood: 'anxious',
      stressLevel: 7,
      sleepHours: 6,
      studyHours: 8,
      energyLevel: 'low',
      biggestPressure: 'Mock test scores',
      journalText: 'I feel very overwhelmed today because my mock scores are not improving.',
      language: 'en'
    };
    
    const result = checkInSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects an empty journal entry or one that is too short', () => {
    const invalidData = {
      examType: 'NEET',
      mood: 'anxious',
      stressLevel: 7,
      sleepHours: 6,
      studyHours: 8,
      energyLevel: 'low',
      biggestPressure: 'Scores',
      journalText: 'Bad.', // Less than 10 characters
      language: 'en'
    };
    
    const result = checkInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Your journal entry is too short');
    }
  });

  it('rejects an oversized journal', () => {
    const invalidData = {
      examType: 'NEET',
      mood: 'anxious',
      stressLevel: 7,
      sleepHours: 6,
      studyHours: 8,
      energyLevel: 'low',
      biggestPressure: 'Scores',
      journalText: 'a'.repeat(2001), // Oversized
      language: 'en'
    };
    
    const result = checkInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
