import { CheckIn } from './types';

export type BurnoutStatus = 'stable' | 'watch' | 'rising' | 'high';

export interface BurnoutRadar {
  stressAvg: number;
  sleepAvg: number;
  studyHoursAvg: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  stressTrend: 'decreasing' | 'stable' | 'increasing';
  sleepTrend: 'improving' | 'stable' | 'declining';
  urgentCount: number;
  status: BurnoutStatus;
  explanation: string;
  preventionStep: string;
}

export function calculateBurnoutRadar(checkins: CheckIn[]): BurnoutRadar | null {
  if (!checkins || checkins.length < 3) return null;

  // Sort chronological, earliest to latest
  const sorted = [...checkins].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const n = sorted.length;
  const recentCheckins = sorted.slice(Math.max(0, n - 7)); // Last 7 days

  let totalStress = 0;
  let totalSleep = 0;
  let totalStudy = 0;
  let urgentCount = 0;

  for (const c of recentCheckins) {
    totalStress += c.stressLevel;
    totalSleep += c.sleepHours;
    totalStudy += c.studyHours;
    if (c.riskLevel === 'urgent' || c.riskLevel === 'high') urgentCount++;
  }

  const stressAvg = totalStress / recentCheckins.length;
  const sleepAvg = totalSleep / recentCheckins.length;
  const studyHoursAvg = totalStudy / recentCheckins.length;

  // Trends based on first half vs second half of recent checkins
  const half = Math.floor(recentCheckins.length / 2);
  const firstHalf = recentCheckins.slice(0, half);
  const secondHalf = recentCheckins.slice(half);

  const getAvg = (arr: CheckIn[], key: 'stressLevel' | 'sleepHours') =>
    arr.reduce((sum, c) => sum + c[key], 0) / (arr.length || 1);

  const stressFirst = getAvg(firstHalf, 'stressLevel');
  const stressSecond = getAvg(secondHalf, 'stressLevel');
  const sleepFirst = getAvg(firstHalf, 'sleepHours');
  const sleepSecond = getAvg(secondHalf, 'sleepHours');

  let stressTrend: BurnoutRadar['stressTrend'] = 'stable';
  if (stressSecond > stressFirst + 1) stressTrend = 'increasing';
  else if (stressSecond < stressFirst - 1) stressTrend = 'decreasing';

  let sleepTrend: BurnoutRadar['sleepTrend'] = 'stable';
  if (sleepSecond > sleepFirst + 0.5) sleepTrend = 'improving';
  else if (sleepSecond < sleepFirst - 0.5) sleepTrend = 'declining';

  const status = getBurnoutStatus(stressAvg, sleepAvg, studyHoursAvg, urgentCount, stressTrend, sleepTrend);

  let explanation = '';
  let preventionStep = '';

  switch (status) {
    case 'high':
      explanation = 'Your recent check-ins show very high stress, low sleep, or urgent signs. This is a critical burnout risk.';
      preventionStep = 'You need an immediate break. Please step away from studying for the rest of the day and prioritize sleep.';
      break;
    case 'rising':
      explanation = 'Your stress is increasing while sleep is decreasing, or you are studying extreme hours. Burnout risk is rising.';
      preventionStep = 'Cut your study time by 20% today and add 1 extra hour of sleep tonight.';
      break;
    case 'watch':
      explanation = 'There are some mild signs of fatigue or stress. Keep an eye on your rest.';
      preventionStep = 'Make sure you are taking 10-minute breaks every hour of studying.';
      break;
    case 'stable':
    default:
      explanation = 'Your stress and sleep levels are currently balanced.';
      preventionStep = 'Keep up your current routine. You are managing your load well.';
      break;
  }

  return {
    stressAvg: Number(stressAvg.toFixed(1)),
    sleepAvg: Number(sleepAvg.toFixed(1)),
    studyHoursAvg: Number(studyHoursAvg.toFixed(1)),
    moodTrend: 'stable', // simplified
    stressTrend,
    sleepTrend,
    urgentCount,
    status,
    explanation,
    preventionStep,
  };
}

export function getBurnoutStatus(
  stressAvg: number,
  sleepAvg: number,
  studyHoursAvg: number,
  urgentCount: number,
  stressTrend: BurnoutRadar['stressTrend'],
  sleepTrend: BurnoutRadar['sleepTrend']
): BurnoutStatus {
  if (stressAvg >= 8 && sleepAvg < 6) return 'high';
  if (urgentCount > 1) return 'high';

  if (stressAvg >= 7 && studyHoursAvg > 8) return 'rising';
  if (stressTrend === 'increasing' && sleepTrend === 'declining') return 'rising';

  if (stressAvg >= 6 || sleepAvg < 7 || studyHoursAvg > 10) return 'watch';

  return 'stable';
}
