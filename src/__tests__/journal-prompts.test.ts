import { describe, it, expect } from 'vitest';
import { getJournalPrompts } from '../lib/journal-prompts';

describe('Journal Prompts', () => {
  it('returns exactly 5 prompts for English default', () => {
    const prompts = getJournalPrompts('en', 'okay', 'Board Exams');
    expect(prompts).toHaveLength(5);
    expect(prompts.every(p => p.length > 0)).toBe(true);
  });

  it('returns exactly 5 prompts for Hindi', () => {
    const prompts = getJournalPrompts('hi', 'okay', 'Board Exams');
    expect(prompts).toHaveLength(5);
    expect(prompts.every(p => p.length > 0)).toBe(true);
  });

  it('returns exactly 5 prompts for Marathi', () => {
    const prompts = getJournalPrompts('mr', 'okay', 'Board Exams');
    expect(prompts).toHaveLength(5);
    expect(prompts.every(p => p.length > 0)).toBe(true);
  });

  it('adjusts prompts when overwhelmed', () => {
    const normalPrompts = getJournalPrompts('en', 'calm');
    const overwhelmedPrompts = getJournalPrompts('en', 'overwhelmed');
    
    expect(normalPrompts).not.toEqual(overwhelmedPrompts);
    expect(overwhelmedPrompts[2]).toContain('breath');
  });
});
