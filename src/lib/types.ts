export type ExamType = 'Board Exams' | 'NEET' | 'JEE' | 'CUET' | 'CAT' | 'GATE' | 'UPSC' | 'Other';
export type Mood = 'calm' | 'okay' | 'anxious' | 'overwhelmed' | 'low' | 'confident';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'urgent';

export interface UserProfile {
  name: string;
  email: string;
  guardianEmail?: string;
  guardianConsentEnabled: boolean;
  preferredLanguage: string;
  createdAt: string;
}

export interface CheckIn {
  id?: string;
  examType: ExamType;
  mood: Mood;
  stressLevel: number;
  sleepHours: number;
  studyHours: number;
  energyLevel: EnergyLevel;
  biggestPressure: string;
  journalText: string;
  language: string;
  result?: GeminiWellnessResponse;
  riskLevel?: RiskLevel;
  crisisSupportRequired?: boolean;
  createdAt: string;
}

export interface CopingStrategy {
  title: string;
  whyItHelps: string;
  steps: string[];
  durationMinutes: number;
}

export interface MindfulnessExercise {
  title: string;
  durationMinutes: number;
  steps: string[];
  breathingPattern?: string;
}

export interface CompanionResponse {
  message: string;
  followUpQuestion: string;
}

export interface GeminiWellnessResponse {
  summary: string;
  moodLabel: string;
  riskLevel: RiskLevel;
  crisisSupportRequired: boolean;
  guardianAlertRecommended: boolean;
  stressTriggers: string[];
  emotionalPatterns: string[];
  selfDoubtSignals: string[];
  burnoutSignals: string[];
  copingStrategies: CopingStrategy[];
  mindfulnessExercise: MindfulnessExercise;
  motivationalEncouragement: string;
  companionResponse: CompanionResponse;
  nextSmallAction: string;
  safetyNote: string;
}

export interface GuardianAlert {
  id?: string;
  userId: string;
  guardianEmail: string;
  riskLevel: RiskLevel;
  message: string;
  createdAt: string;
  status: 'pending' | 'sent' | 'failed';
}
