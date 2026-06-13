import { describe, it, expect } from 'vitest';
import { i18n } from '@/lib/i18n';

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
      'emotionalPatterns'
    ];
    
    for (const key of keys) {
      expect(i18n.en).toHaveProperty(key);
      expect(i18n.hi).toHaveProperty(key);
      expect(i18n.mr).toHaveProperty(key);
    }
  });
});
