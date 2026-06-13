import { GeminiWellnessResponse } from './types';

export const getMockWellnessResponse = (): GeminiWellnessResponse => ({
  summary: "It sounds like you're carrying a heavy load right now with the exams approaching. It's completely natural to feel this way.",
  moodLabel: "Overwhelmed but trying",
  riskLevel: "moderate",
  crisisSupportRequired: false,
  guardianAlertRecommended: false,
  stressTriggers: ["Upcoming mock exams", "Feeling behind on syllabus", "Pressure to perform"],
  emotionalPatterns: ["Persistent anxiety", "Guilt about taking breaks"],
  selfDoubtSignals: ["Worrying about not being good enough compared to peers"],
  burnoutSignals: ["Low energy", "Difficulty sleeping"],
  copingStrategies: [
    {
      title: "The 5-4-3-2-1 Grounding Technique",
      whyItHelps: "Helps pull your mind away from anxious thoughts and anchors you in the present.",
      steps: [
        "Acknowledge 5 things you can see around you.",
        "Acknowledge 4 things you can touch.",
        "Acknowledge 3 things you can hear.",
        "Acknowledge 2 things you can smell.",
        "Acknowledge 1 thing you can taste."
      ],
      durationMinutes: 5
    },
    {
      title: "Micro-Breaks with Movement",
      whyItHelps: "Resets your focus and releases physical tension from sitting.",
      steps: [
        "Stand up every 45 minutes.",
        "Do a gentle stretch or walk around the room for 2 minutes.",
        "Drink a glass of water."
      ],
      durationMinutes: 2
    }
  ],
  mindfulnessExercise: {
    title: "Box Breathing",
    durationMinutes: 3,
    steps: [
      "Inhale slowly for 4 seconds.",
      "Hold your breath for 4 seconds.",
      "Exhale slowly for 4 seconds.",
      "Hold your breath empty for 4 seconds.",
      "Repeat 4 times."
    ],
    breathingPattern: "4-4-4-4"
  },
  motivationalEncouragement: "You have been working incredibly hard. Remember that your worth is not defined by a single exam. One step at a time.",
  companionResponse: {
    message: "I hear how stressed you are about the mock exams. It's a lot to handle all at once. I'm here to support you through this.",
    followUpQuestion: "What is one small, manageable thing you could do today that would make you feel just a little bit better?"
  },
  nextSmallAction: "Take a 10-minute break away from your desk right now.",
  safetyNote: "If you ever feel completely overwhelmed or unsafe, please reach out to a trusted friend, family member, or a local helpline. You don't have to go through this alone."
});
