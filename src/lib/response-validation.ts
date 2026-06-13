import { z } from 'zod';

/**
 * Zod schema to validate the shape of Gemini's wellness response.
 * This ensures the AI doesn't return malformed data to the client.
 */
export const wellnessResponseSchema = z.object({
  summary: z.string().min(1),
  moodLabel: z.string().min(1),
  riskLevel: z.enum(['low', 'moderate', 'high', 'urgent']),
  crisisSupportRequired: z.boolean(),
  guardianAlertRecommended: z.boolean(),
  stressTriggers: z.array(z.string()).default([]),
  emotionalPatterns: z.array(z.string()).default([]),
  selfDoubtSignals: z.array(z.string()).default([]),
  burnoutSignals: z.array(z.string()).default([]),
  copingStrategies: z.array(
    z.object({
      title: z.string(),
      whyItHelps: z.string(),
      steps: z.array(z.string()),
      durationMinutes: z.number(),
    })
  ).default([]),
  mindfulnessExercise: z.object({
    title: z.string(),
    durationMinutes: z.number(),
    steps: z.array(z.string()),
    breathingPattern: z.string().optional(),
  }),
  motivationalEncouragement: z.string().default(''),
  companionResponse: z.object({
    message: z.string(),
    followUpQuestion: z.string(),
  }),
  nextSmallAction: z.string().default(''),
  safetyNote: z.string().default(''),
  patternExplanation: z.string().default(''),
  studyRecoveryPlan: z.object({
    next30Minutes: z.string(),
    tonight: z.string(),
    tomorrowMorning: z.string(),
    whatToAvoid: z.string(),
    askForHelpWith: z.string(),
  }),
  panicModePlan: z.object({
    title: z.string(),
    durationMinutes: z.number(),
    steps: z.array(z.string()),
    groundingPrompt: z.string(),
    nextTinyAction: z.string(),
    companionMessage: z.string(),
  }),
  guardianSafeSummary: z.string().default(''),
});

export type ValidatedWellnessResponse = z.infer<typeof wellnessResponseSchema>;
