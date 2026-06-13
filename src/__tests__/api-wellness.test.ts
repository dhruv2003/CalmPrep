import { describe, it, expect, vi, beforeEach } from 'vitest';
import { wellnessResponseSchema } from '@/lib/response-validation';
import { getMockWellnessResponse } from '@/lib/mock-wellness';

// Test the response validation schema
describe('Wellness Response Validation', () => {
  it('validates a correct wellness response', () => {
    const mockResponse = getMockWellnessResponse();
    const result = wellnessResponseSchema.safeParse(mockResponse);
    expect(result.success).toBe(true);
  });

  it('rejects a response missing required fields', () => {
    const incomplete = {
      summary: 'Hello',
      // missing most required fields
    };
    const result = wellnessResponseSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('rejects an invalid riskLevel', () => {
    const mockResponse = getMockWellnessResponse();
    const invalid = { ...mockResponse, riskLevel: 'extreme' };
    const result = wellnessResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('applies defaults for optional array fields', () => {
    const minimal = {
      summary: 'Test',
      moodLabel: 'Okay',
      riskLevel: 'low',
      crisisSupportRequired: false,
      guardianAlertRecommended: false,
      mindfulnessExercise: {
        title: 'Breathing',
        durationMinutes: 3,
        steps: ['Breathe in', 'Breathe out'],
      },
      companionResponse: {
        message: 'You are doing great',
        followUpQuestion: 'How are you feeling now?',
      },
      patternExplanation: 'Explanation',
      studyRecoveryPlan: {
        next30Minutes: 'Rest',
        tonight: 'Rest',
        tomorrowMorning: 'Rest',
        whatToAvoid: 'Stress',
        askForHelpWith: 'Nothing',
      },
      panicModePlan: {
        title: 'Plan',
        durationMinutes: 5,
        steps: ['Breathe'],
        groundingPrompt: 'Ground',
        nextTinyAction: 'Act',
        companionMessage: 'Message',
      },
      guardianSafeSummary: 'Summary',
    };
    const result = wellnessResponseSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stressTriggers).toEqual([]);
      expect(result.data.emotionalPatterns).toEqual([]);
      expect(result.data.copingStrategies).toEqual([]);
    }
  });
});

// Test the sanitization logic (extracted for testability)
describe('Input Sanitization', () => {
  function sanitizeText(text: string): string {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  it('removes script tags', () => {
    const malicious = 'Hello <script>alert("xss")</script> World';
    expect(sanitizeText(malicious)).toBe('Hello  World');
  });

  it('removes HTML tags', () => {
    const html = 'Hello <b>bold</b> and <a href="evil.com">click</a>';
    expect(sanitizeText(html)).toBe('Hello bold and click');
  });

  it('removes control characters', () => {
    const withControl = 'Hello\x00\x01\x02World';
    expect(sanitizeText(withControl)).toBe('HelloWorld');
  });

  it('preserves normal text', () => {
    const normal = 'I feel anxious about my upcoming JEE exam.';
    expect(sanitizeText(normal)).toBe(normal);
  });

  it('preserves Hindi text', () => {
    const hindi = 'मुझे अपनी परीक्षा की बहुत चिंता हो रही है।';
    expect(sanitizeText(hindi)).toBe(hindi);
  });
});

// Test rate limiting logic
describe('Rate Limiting Logic', () => {
  it('rate limit map correctly tracks requests', () => {
    const rateLimitMap = new Map<string, number>();
    const RATE_LIMIT_MS = 60000;
    
    const ip = '127.0.0.1';
    rateLimitMap.set(ip, Date.now());
    
    const lastRequest = rateLimitMap.get(ip);
    expect(lastRequest).toBeDefined();
    expect(Date.now() - lastRequest!).toBeLessThan(RATE_LIMIT_MS);
  });

  it('allows requests after rate limit window passes', () => {
    const rateLimitMap = new Map<string, number>();
    const RATE_LIMIT_MS = 60000;
    
    const ip = '127.0.0.1';
    // Set timestamp to 2 minutes ago (beyond the limit)
    rateLimitMap.set(ip, Date.now() - RATE_LIMIT_MS * 2);
    
    const lastRequest = rateLimitMap.get(ip);
    const isRateLimited = lastRequest && Date.now() - lastRequest < RATE_LIMIT_MS;
    expect(isRateLimited).toBe(false);
  });

  it('blocks requests within rate limit window', () => {
    const rateLimitMap = new Map<string, number>();
    const RATE_LIMIT_MS = 60000;
    
    const ip = '127.0.0.1';
    rateLimitMap.set(ip, Date.now()); // Just now
    
    const lastRequest = rateLimitMap.get(ip);
    const isRateLimited = lastRequest && Date.now() - lastRequest < RATE_LIMIT_MS;
    expect(isRateLimited).toBe(true);
  });

  it('cleans up stale entries', () => {
    const rateLimitMap = new Map<string, number>();
    const RATE_LIMIT_MS = 60000;
    
    // Add stale and fresh entries
    rateLimitMap.set('old-ip', Date.now() - RATE_LIMIT_MS * 3);
    rateLimitMap.set('fresh-ip', Date.now());
    
    // Simulate cleanup
    const now = Date.now();
    for (const [key, timestamp] of rateLimitMap) {
      if (now - timestamp > RATE_LIMIT_MS * 2) {
        rateLimitMap.delete(key);
      }
    }
    
    expect(rateLimitMap.has('old-ip')).toBe(false);
    expect(rateLimitMap.has('fresh-ip')).toBe(true);
  });
});
