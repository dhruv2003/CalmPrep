import { describe, it, expect } from 'vitest';
import { checkInSchema } from '@/lib/validation';
import { buildGeminiPrompt } from '@/lib/gemini-prompt';
import { CheckInInput } from '@/lib/validation';

describe('Edge Cases and Error Paths', () => {
  
  describe('Validation Edge Cases', () => {
    it('rejects stress level below 1', () => {
      const data = {
        examType: 'NEET',
        mood: 'calm',
        stressLevel: 0,
        sleepHours: 7,
        studyHours: 6,
        energyLevel: 'medium',
        biggestPressure: 'Nothing major',
        journalText: 'Today was actually quite peaceful and calm.',
        language: 'en'
      };
      const result = checkInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects stress level above 10', () => {
      const data = {
        examType: 'NEET',
        mood: 'overwhelmed',
        stressLevel: 11,
        sleepHours: 4,
        studyHours: 14,
        energyLevel: 'low',
        biggestPressure: 'Everything',
        journalText: 'I am completely stressed out and cannot handle anything.',
        language: 'en'
      };
      const result = checkInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects negative sleep hours', () => {
      const data = {
        examType: 'JEE',
        mood: 'okay',
        stressLevel: 5,
        sleepHours: -1,
        studyHours: 6,
        energyLevel: 'medium',
        biggestPressure: 'Physics formulas',
        journalText: 'Studying physics today was alright overall.',
        language: 'en'
      };
      const result = checkInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects sleep hours above 24', () => {
      const data = {
        examType: 'JEE',
        mood: 'okay',
        stressLevel: 5,
        sleepHours: 25,
        studyHours: 6,
        energyLevel: 'medium',
        biggestPressure: 'Chemistry',
        journalText: 'Studying chemistry today was pretty manageable.',
        language: 'en'
      };
      const result = checkInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects an invalid exam type', () => {
      const data = {
        examType: 'InvalidExam',
        mood: 'okay',
        stressLevel: 5,
        sleepHours: 7,
        studyHours: 6,
        energyLevel: 'medium',
        biggestPressure: 'Nothing',
        journalText: 'Just a normal day of studying for my exam.',
        language: 'en'
      };
      const result = checkInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects an invalid mood', () => {
      const data = {
        examType: 'NEET',
        mood: 'ecstatic',
        stressLevel: 5,
        sleepHours: 7,
        studyHours: 6,
        energyLevel: 'medium',
        biggestPressure: 'Nothing',
        journalText: 'Just a normal day of studying and revising notes.',
        language: 'en'
      };
      const result = checkInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects an empty biggestPressure field', () => {
      const data = {
        examType: 'NEET',
        mood: 'anxious',
        stressLevel: 7,
        sleepHours: 6,
        studyHours: 8,
        energyLevel: 'low',
        biggestPressure: '',
        journalText: 'I feel very overwhelmed today by everything.',
        language: 'en'
      };
      const result = checkInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts all valid exam types', () => {
      const examTypes = ['Board Exams', 'NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC', 'Other'];
      for (const examType of examTypes) {
        const data = {
          examType,
          mood: 'calm',
          stressLevel: 3,
          sleepHours: 8,
          studyHours: 5,
          energyLevel: 'high',
          biggestPressure: 'Nothing specific',
          journalText: 'Today was a good productive study day overall.',
          language: 'en'
        };
        const result = checkInSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it('accepts all valid languages', () => {
      const languages = ['en', 'hi', 'mr'];
      for (const language of languages) {
        const data = {
          examType: 'NEET',
          mood: 'calm',
          stressLevel: 3,
          sleepHours: 8,
          studyHours: 5,
          energyLevel: 'high',
          biggestPressure: 'Nothing specific',
          journalText: 'Today was a good day and I studied well overall.',
          language,
        };
        const result = checkInSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it('defaults language to en when not provided', () => {
      const data = {
        examType: 'NEET',
        mood: 'calm',
        stressLevel: 3,
        sleepHours: 8,
        studyHours: 5,
        energyLevel: 'high',
        biggestPressure: 'Nothing specific',
        journalText: 'Today was a good day and I studied productively.',
      };
      const result = checkInSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.language).toBe('en');
      }
    });
  });

  describe('Prompt Builder Edge Cases', () => {
    it('handles special characters in journal text', () => {
      const data: CheckInInput = {
        examType: 'NEET',
        mood: 'anxious',
        stressLevel: 8,
        sleepHours: 4,
        studyHours: 12,
        energyLevel: 'low',
        biggestPressure: 'Mock tests & expectations',
        journalText: 'I\'m feeling "very" stressed. My parents said <go study more>. Score: 45/100.',
        language: 'en'
      };
      const prompt = buildGeminiPrompt(data);
      expect(prompt).toContain('Mock tests & expectations');
      expect(prompt).toContain('45/100');
    });

    it('includes the correct language in the prompt', () => {
      const data: CheckInInput = {
        examType: 'NEET',
        mood: 'calm',
        stressLevel: 3,
        sleepHours: 8,
        studyHours: 6,
        energyLevel: 'high',
        biggestPressure: 'Nothing',
        journalText: 'मुझे आज अच्छा लग रहा है। पढ़ाई अच्छी चल रही है।',
        language: 'hi'
      };
      const prompt = buildGeminiPrompt(data);
      expect(prompt).toContain('hi');
    });

    it('includes all check-in data fields in the prompt', () => {
      const data: CheckInInput = {
        examType: 'JEE',
        mood: 'overwhelmed',
        stressLevel: 9,
        sleepHours: 3,
        studyHours: 15,
        energyLevel: 'low',
        biggestPressure: 'Physics formulas',
        journalText: 'I cannot remember any formulas today and I feel terrible about it.',
        language: 'en'
      };
      const prompt = buildGeminiPrompt(data);
      expect(prompt).toContain('JEE');
      expect(prompt).toContain('overwhelmed');
      expect(prompt).toContain('9');
      expect(prompt).toContain('3');
      expect(prompt).toContain('15');
      expect(prompt).toContain('low');
      expect(prompt).toContain('Physics formulas');
      expect(prompt).toContain('cannot remember any formulas');
    });
  });
});
