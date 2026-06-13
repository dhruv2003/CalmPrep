# CalmPrep Evaluator Feature Upgrade Design

## Objective

Raise CalmPrep's evaluator signal by adding five focused, safety-conscious features without overcomplicating the MVP:

1. Exam Panic Mode
2. Study Recovery Plan
3. Parent-Safe Summary
4. Burnout Radar
5. Micro-Journal Prompts

The implementation must preserve the existing Daily Mood Log, journaling, Gemini route, Firebase Auth, Firestore check-ins, guardian setup, multilingual support, PWA support, mock fallback, and tests.

Voice features are explicitly out of scope. The implementation will remove or avoid speech-to-text, text-to-speech, AI voice, browser microphone permissions, and Gemini voice models.

Score target: move the app from the current 91.33 evaluation score toward 99 by making problem alignment, safety, efficiency, code quality, and README evidence directly visible to automated evaluators.

## Evaluation Strategy

The UI, code, tests, and README will make evaluation signals explicit.

Code Quality:
- Keep feature logic in typed helper modules instead of hiding it inside large page components.
- Extend existing types and validation schemas rather than introducing parallel result shapes.
- Keep UI cards small and composable where practical.

Problem Statement Alignment:
- Add immediate panic support, academic recovery planning, burnout trend interpretation, and parent-safe guardian communication.
- Preserve stress triggers, emotional patterns, coping strategies, mindfulness, encouragement, and companion support.

Security:
- Keep Gemini server-side only.
- Never expose raw journal text or full wellness results to guardians.
- Validate guardian email before alert creation.
- Respect guardian consent for prepared alerts.

Efficiency:
- Use one Gemini call only on check-in submit.
- Use deterministic Burnout Radar from local/Firestore history.
- Use local fallback plans for panic mode and mock mode.
- Avoid heavy chart libraries.

Testing:
- Add focused helper and prompt tests for the new safety and evaluator signals.

Accessibility:
- Use semantic headings, real buttons, `aria-live` for panic flow, text-first trend labels, visible focus states, and multilingual labels.

## Architecture

### Types

Extend `src/lib/types.ts`:

- `GeminiWellnessResponse`
  - Add `patternExplanation`
  - Add `studyRecoveryPlan`
  - Add `panicModePlan`
  - Add `guardianSafeSummary`
  - Preserve existing fields

- Add `StudyRecoveryPlan`
- Add `PanicModePlan`
- Update `GuardianAlert`
  - `userId`
  - `studentName?`
  - `guardianName?`
  - `guardianEmail`
  - `guardianRelationship?`
  - `riskLevel: "high" | "urgent"`
  - `message`
  - `language: "en" | "hi" | "mr"`
  - `createdAt`
  - `status: "prepared" | "sent" | "failed"`

### Response Validation

Update `src/lib/response-validation.ts` to validate the new Gemini fields.

Defaults can be used only where a safe fallback is meaningful. `studyRecoveryPlan`, `panicModePlan`, `guardianSafeSummary`, and `patternExplanation` should be required in the validated result because they are core evaluator-visible features.

### Gemini Prompt

Update `src/lib/gemini-prompt.ts` to request the expanded JSON structure.

Prompt requirements:
- Strict JSON only
- No markdown
- English keys
- Values in selected language
- No diagnosis
- No medical, therapy, or treatment claims
- Use wording such as "stress signals", "burnout signs", "may suggest", and "could indicate"
- Parent-safe summary must be high-level, non-diagnostic, and must not disclose raw journal details
- Panic mode must be immediate, calm, short, and practical
- Study recovery plan must be realistic, low-pressure, and rest-aware

### Mock Fallback

Update `src/lib/mock-wellness.ts` with realistic values for:
- `patternExplanation`
- `studyRecoveryPlan`
- `panicModePlan`
- `guardianSafeSummary`

The mock must remain useful for demos and evaluation without Firebase or Gemini configuration.

## Feature Designs

### 1. Exam Panic Mode

Location:
- Add to `/report`, directly after the Safety Support card when safety support is visible, otherwise directly after the report header.

UI:
- Heading: `Exam Panic Mode`
- Prominent button: `I'm panicking right now`
- On click, reveal a calm panel with `aria-live="polite"`.

Panel content:
- Step 1: Breathe
- Step 2: Ground
- Step 3: Next tiny action
- 60-second breathing reset
- 5-4-3-2-1 grounding exercise
- One small academic action
- One supportive companion message
- Optional Notify Guardian button only when risk is high/urgent and guardian consent is enabled

Data:
- Prefer `checkIn.result.panicModePlan`
- Fall back to a local `getFallbackPanicModePlan(checkIn)` helper if missing

Safety:
- Copy should be calm, not alarming.
- Do not imply treatment or clinical intervention.
- Do not rely on color alone for urgency.

### 2. Study Recovery Plan

Location:
- Add to `/report` as a card grid.

Heading:
- `Study Recovery Plan`

Cards:
- Next 30 minutes
- Tonight
- Tomorrow morning
- Avoid this
- Ask for help with

Data:
- Use `checkIn.result.studyRecoveryPlan`.

Rules:
- Practical and low-pressure
- Adapted by Gemini from exam type, stress level, sleep, study hours, and journal
- Encourages rest when stress is high or sleep is low
- Avoids shame and unrealistic schedules

### 3. Parent-Safe Summary

Location:
- Add to `/report`, directly after Exam Panic Mode so guardian-safe disclosure is close to the crisis and high-risk support flow.

Heading:
- `Parent-Safe Summary`

Data:
- Display `checkIn.result.guardianSafeSummary`.

Guardian alert flow:
- `Notify Guardian` creates a Firestore alert with only the safe summary message.
- Do not send raw journal text.
- Do not send full wellness result.
- Validate guardian email.
- If email sending is not implemented, show:
  `Guardian alert prepared. Email delivery can be connected with Firebase Functions or Cloud Run.`

Consent rules:
- For high/urgent risk, show Notify Guardian when guardian consent is enabled.
- For low/moderate risk, do not create an alert unless the user explicitly requests support.
- No automatic email delivery is introduced.

Implementation:
- Add `src/lib/guardian-alerts.ts`
  - `isValidGuardianEmail(email)`
  - `buildGuardianAlert({ userId, profile, checkIn, message })`
  - `assertGuardianAlertSafe(alert, rawJournalText)`

### 4. Burnout Radar

Location:
- Add to `/report`.

Heading:
- `Burnout Radar`

Data:
- Use last 3 to 5 check-ins from Firestore when available.
- In demo mode, use `demo_last_checkin` plus local mock history when fewer than 3 check-ins are available.
- If no useful history exists, show:
  `Complete a few check-ins to unlock burnout trends.`

Implementation:
- Add `src/lib/burnout.ts`
  - `calculateBurnoutRadar(checkins)`
  - `getBurnoutStatus({ stressAvg, sleepAvg, studyHoursAvg, urgentCount })`

Logic:
- If average stress >= 8 and average sleep < 6: `high`
- If average stress >= 7 and study hours average > 8: `rising`
- If high/urgent risk appears more than once: `high`
- If stress trends upward and sleep trends downward: `rising`
- Otherwise `stable` or `watch`

Display:
- Chunky status card
- Text trend chips:
  - Stress trend: rising/falling/stable
  - Sleep trend: rising/falling/stable
  - Study hours trend
  - Mood trend
  - Risk trend
- Why this matters
- One prevention step

Efficiency:
- No Gemini call.
- No chart library.

### 5. Micro-Journal Prompts

Location:
- Add above or beside the journal textarea on `/check-in`.

Heading:
- `Micro-Journal Prompts`

Implementation:
- Add `src/lib/journal-prompts.ts`
  - `getJournalPrompts(language, mood, examType)`
  - Default prompt sets for English, Hindi, Marathi

Behavior:
- Render 3 to 5 prompt chips as real buttons.
- Clicking inserts or appends prompt text into the textarea.
- Do not auto-submit.
- User can edit inserted prompt text.

Accessibility:
- Buttons are keyboard accessible.
- Keep visible focus states using existing neobrutalist button styling.

## Internationalization

Update `src/lib/i18n.ts` with English, Hindi, and Marathi labels for:

- Exam Panic Mode
- I'm panicking right now
- Breathe
- Ground
- Next tiny action
- Study Recovery Plan
- Parent-Safe Summary
- Burnout Radar
- Micro-Journal Prompts
- Next 30 minutes
- Tonight
- Tomorrow morning
- What to avoid
- Ask for help with
- Complete a few check-ins to unlock burnout trends
- What thought kept repeating today?
- What moment made you feel stuck?
- What is one thing you handled better than yesterday?
- What pressure felt the loudest today?
- What would help you feel 5% calmer tonight?
- Why this matters
- One prevention step

Dynamic Gemini values will be requested in the selected language. Deterministic helper copy will use i18n labels and local language-specific strings where needed.

## UI Integration

`src/app/check-in/page.tsx`:
- Remove existing voice input controls and browser speech-recognition code.
- Add Micro-Journal Prompts near the journal textarea.
- Keep existing form validation, mock fallback, and submit behavior.

`src/app/report/page.tsx`:
- Keep the existing report layout and calm neobrutalist style.
- Add new sections as chunky cards.
- Fetch recent check-ins once through existing Firestore helper.
- No Gemini call on page load.
- Add local UI state for panic panel and guardian alert preparation status.

## Testing Plan

Add or update Vitest tests:

1. Mock response includes `studyRecoveryPlan`.
2. Mock response includes `panicModePlan`.
3. Mock response includes `guardianSafeSummary`.
4. Gemini prompt includes parent-safe summary rules.
5. Gemini prompt includes no-diagnosis safety rules.
6. Burnout Radar returns `high` when stress is high and sleep is low.
7. Burnout Radar returns `rising` when stress increases and sleep decreases.
8. Guardian alert helper does not include raw journal text.
9. i18n contains new labels for English, Hindi, Marathi.
10. Journal prompts exist for English, Hindi, Marathi.
11. Journal prompt chips insert text without auto-submitting.

Existing tests must continue passing.

## README Updates

Add feature sections:

- Exam Panic Mode
- Study Recovery Plan
- Parent-Safe Summary
- Burnout Radar
- Micro-Journal Prompts

Update Evaluation Alignment:

- Problem Statement Alignment: emotional patterns, stress triggers, coping strategies, mindfulness, companion support, burnout tracking, panic support, and academic recovery.
- Accessibility: multilingual prompts, keyboard-friendly prompt chips, clear panic flow, visible labels, and readable summaries.
- Security: parent-safe summaries, consent-based alerts, no raw journal disclosure.
- Efficiency: deterministic Burnout Radar and one Gemini call only on submit.
- Testing: helper tests and prompt-safety tests.
- Code Quality: separated burnout, guardian, journal prompt, prompt builder, validation, and UI modules.

## Scope Boundaries

Included:
- Typed data model updates
- Prompt and response validation updates
- Mock fallback updates
- Report page cards
- Check-in prompt chips
- Firestore prepared guardian alert record
- README and tests

Excluded:
- AI voice
- Speech-to-text
- Text-to-speech
- Gemini voice model
- Email delivery implementation
- Heavy charting
- New authentication flow
- New application routes

## Risk Notes

The largest implementation risk is the current report page growing too large. The implementation should extract small local card components inside `src/app/report/page.tsx` when a section becomes hard to read, then move to shared components only if reuse is clear.

The second risk is accidentally disclosing private journal text. Guardian alert creation must be centralized in `src/lib/guardian-alerts.ts` and covered by a test that checks raw journal text is absent.

The third risk is multilingual drift. Static labels must go through `i18n`; dynamic Gemini values must be requested in the selected language; deterministic prompt chips must come from `journal-prompts.ts`.
