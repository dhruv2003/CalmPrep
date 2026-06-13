import { z } from 'zod';

export const checkInSchema = z.object({
  examType: z.enum(['Board Exams', 'NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC', 'Other']),
  mood: z.enum(['calm', 'okay', 'anxious', 'overwhelmed', 'low', 'confident']),
  stressLevel: z.number().min(1).max(10),
  sleepHours: z.number().min(0).max(24),
  studyHours: z.number().min(0).max(24),
  energyLevel: z.enum(['low', 'medium', 'high']),
  biggestPressure: z.string().min(1, 'Please tell us what is pressuring you today').max(200),
  journalText: z.string()
    .min(10, 'Your journal entry is too short to analyze. Please write a bit more.')
    .max(2000, 'Your journal entry is a bit too long. Please summarize it.'),
  language: z.enum(['en', 'hi', 'mr']).default('en')
});

export type CheckInInput = z.infer<typeof checkInSchema>;
