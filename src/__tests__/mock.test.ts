import { describe, it, expect } from 'vitest';
import { getMockWellnessResponse } from '@/lib/mock-wellness';

describe('Mock Wellness Response', () => {
  it('has all required fields', () => {
    const mock = getMockWellnessResponse();
    
    expect(mock).toHaveProperty('summary');
    expect(mock).toHaveProperty('moodLabel');
    expect(mock).toHaveProperty('riskLevel');
    expect(mock).toHaveProperty('crisisSupportRequired');
    expect(mock).toHaveProperty('stressTriggers');
    expect(mock).toHaveProperty('emotionalPatterns');
    expect(mock).toHaveProperty('copingStrategies');
    expect(mock.copingStrategies.length).toBeGreaterThan(0);
    expect(mock).toHaveProperty('mindfulnessExercise');
    expect(mock.mindfulnessExercise).toHaveProperty('title');
    expect(mock).toHaveProperty('companionResponse');
    expect(mock.companionResponse).toHaveProperty('message');
    expect(mock.companionResponse).toHaveProperty('followUpQuestion');
  });
});
