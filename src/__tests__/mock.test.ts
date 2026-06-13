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
    expect(mock).toHaveProperty('patternExplanation');
    expect(mock).toHaveProperty('studyRecoveryPlan');
    expect(mock.studyRecoveryPlan).toHaveProperty('next30Minutes');
    expect(mock).toHaveProperty('panicModePlan');
    expect(mock.panicModePlan).toHaveProperty('title');
    expect(mock.panicModePlan.steps.length).toBeGreaterThan(0);
    expect(mock).toHaveProperty('guardianSafeSummary');
  });
});
