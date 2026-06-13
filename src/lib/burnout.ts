import { CheckIn } from './types';

export type BurnoutStatus = 'stable' | 'watch' | 'rising' | 'high';

export interface BurnoutRadar {
  stressAvg: number;
  sleepAvg: number;
  studyHoursAvg: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  stressTrend: 'decreasing' | 'stable' | 'increasing';
  sleepTrend: 'improving' | 'stable' | 'declining';
  studyHoursTrend: 'decreasing' | 'stable' | 'increasing';
  riskTrend: 'decreasing' | 'stable' | 'increasing';
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
  const recentCheckins = sorted.slice(Math.max(0, n - 5));

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

  const getAvg = (arr: CheckIn[], key: 'stressLevel' | 'sleepHours' | 'studyHours') =>
    arr.reduce((sum, c) => sum + c[key], 0) / (arr.length || 1);

  const riskScore = (riskLevel?: CheckIn['riskLevel']) => {
    if (riskLevel === 'urgent') return 3;
    if (riskLevel === 'high') return 2;
    if (riskLevel === 'moderate') return 1;
    return 0;
  };

  const getRiskAvg = (arr: CheckIn[]) =>
    arr.reduce((sum, c) => sum + riskScore(c.riskLevel), 0) / (arr.length || 1);

  const stressFirst = getAvg(firstHalf, 'stressLevel');
  const stressSecond = getAvg(secondHalf, 'stressLevel');
  const sleepFirst = getAvg(firstHalf, 'sleepHours');
  const sleepSecond = getAvg(secondHalf, 'sleepHours');
  const studyFirst = getAvg(firstHalf, 'studyHours');
  const studySecond = getAvg(secondHalf, 'studyHours');
  const riskFirst = getRiskAvg(firstHalf);
  const riskSecond = getRiskAvg(secondHalf);

  let stressTrend: BurnoutRadar['stressTrend'] = 'stable';
  if (stressSecond > stressFirst + 1) stressTrend = 'increasing';
  else if (stressSecond < stressFirst - 1) stressTrend = 'decreasing';

  let sleepTrend: BurnoutRadar['sleepTrend'] = 'stable';
  if (sleepSecond > sleepFirst + 0.5) sleepTrend = 'improving';
  else if (sleepSecond < sleepFirst - 0.5) sleepTrend = 'declining';

  let studyHoursTrend: BurnoutRadar['studyHoursTrend'] = 'stable';
  if (studySecond > studyFirst + 1) studyHoursTrend = 'increasing';
  else if (studySecond < studyFirst - 1) studyHoursTrend = 'decreasing';

  let riskTrend: BurnoutRadar['riskTrend'] = 'stable';
  if (riskSecond > riskFirst + 0.5) riskTrend = 'increasing';
  else if (riskSecond < riskFirst - 0.5) riskTrend = 'decreasing';

  const status = getBurnoutStatus(stressAvg, sleepAvg, studyHoursAvg, urgentCount, stressTrend, sleepTrend);

  let explanation = '';
  let preventionStep = '';

  switch (status) {
    case 'high':
      explanation = 'Recent check-ins show high stress signals, lower sleep, or repeated high-risk signs that may suggest elevated burnout risk.';
      preventionStep = 'Pause heavy study blocks today, choose one light review task, and protect sleep tonight.';
      break;
    case 'rising':
      explanation = 'Stress appears to be rising while rest is decreasing, or study hours are stretching high.';
      preventionStep = 'Reduce the next study block, add a real break, and choose one small topic instead of a full mock.';
      break;
    case 'watch':
      explanation = 'There are mild stress or fatigue signs worth watching.';
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
    studyHoursTrend,
    riskTrend,
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
