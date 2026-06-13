import { describe, it, expect } from 'vitest';
import { calculateBurnoutRadar, getBurnoutStatus } from '../lib/burnout';
import { CheckIn } from '../lib/types';

describe('Burnout Radar', () => {
  describe('getBurnoutStatus', () => {
    it('returns high for extreme stress and low sleep', () => {
      expect(getBurnoutStatus(8.5, 5.5, 6, 0, 'stable', 'stable')).toBe('high');
    });

    it('returns high for multiple urgent signs', () => {
      expect(getBurnoutStatus(5, 8, 4, 2, 'stable', 'stable')).toBe('high');
    });

    it('returns rising for high stress and long study hours', () => {
      expect(getBurnoutStatus(7.5, 7, 9, 0, 'stable', 'stable')).toBe('rising');
    });

    it('returns rising for worsening trends', () => {
      expect(getBurnoutStatus(5, 7, 5, 0, 'increasing', 'declining')).toBe('rising');
    });

    it('returns watch for mild concerning signs', () => {
      expect(getBurnoutStatus(6.5, 7.5, 5, 0, 'stable', 'stable')).toBe('watch');
      expect(getBurnoutStatus(5, 6.5, 5, 0, 'stable', 'stable')).toBe('watch');
      expect(getBurnoutStatus(5, 8, 11, 0, 'stable', 'stable')).toBe('watch');
    });

    it('returns stable otherwise', () => {
      expect(getBurnoutStatus(4, 8, 5, 0, 'stable', 'stable')).toBe('stable');
    });
  });

  describe('calculateBurnoutRadar', () => {
    it('returns null if less than 3 checkins', () => {
      expect(calculateBurnoutRadar([])).toBeNull();
      expect(calculateBurnoutRadar([{ id: '1' } as CheckIn])).toBeNull();
    });

    it('calculates averages and trends correctly', () => {
      const checkins: Partial<CheckIn>[] = [
        { stressLevel: 5, sleepHours: 8, studyHours: 5, riskLevel: 'low', createdAt: '2023-01-01' },
        { stressLevel: 6, sleepHours: 7, studyHours: 6, riskLevel: 'moderate', createdAt: '2023-01-02' },
        { stressLevel: 8, sleepHours: 6, studyHours: 9, riskLevel: 'high', createdAt: '2023-01-03' },
        { stressLevel: 9, sleepHours: 5, studyHours: 10, riskLevel: 'urgent', createdAt: '2023-01-04' },
      ];

      const radar = calculateBurnoutRadar(checkins as CheckIn[]);
      expect(radar).not.toBeNull();
      expect(radar?.stressAvg).toBe(7);
      expect(radar?.sleepAvg).toBe(6.5);
      expect(radar?.studyHoursAvg).toBe(7.5);
      expect(radar?.urgentCount).toBe(2);
      expect(radar?.stressTrend).toBe('increasing');
      expect(radar?.sleepTrend).toBe('declining');
      expect(radar?.status).toBe('high');
    });
  });
});
