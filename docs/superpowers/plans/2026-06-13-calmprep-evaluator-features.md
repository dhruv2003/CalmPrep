# CalmPrep Evaluator Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Exam Panic Mode, Study Recovery Plan, Parent-Safe Summary, Burnout Radar, and Micro-Journal Prompts while preserving existing CalmPrep features and explicitly improving evaluator signals.

**Architecture:** Extend the existing typed Gemini result and mock fallback, add deterministic helper modules for burnout, journal prompts, and guardian alerts, then integrate lightweight cards into the existing check-in and report pages. Burnout Radar stays local-only; panic mode uses existing result data or fallback; guardian alerts save only parent-safe summaries.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Zod, Firebase Firestore, Vitest, Tailwind/neobrutalist styling.

---

### Task 1: Data Model, Prompt, Mock, and Validation

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/gemini-prompt.ts`
- Modify: `src/lib/response-validation.ts`
- Modify: `src/lib/mock-wellness.ts`
- Test: `src/__tests__/mock.test.ts`
- Test: `src/__tests__/prompt.test.ts`

- [ ] **Step 1: Write failing tests**

Add expectations that mock output includes `studyRecoveryPlan`, `panicModePlan`, `guardianSafeSummary`, and `patternExplanation`. Add prompt expectations for parent-safe summary, no diagnosis, no therapy/treatment claims, strict JSON, and no raw guardian disclosure.

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/__tests__/mock.test.ts src/__tests__/prompt.test.ts`

Expected: tests fail on missing fields or missing prompt phrases before implementation.

- [ ] **Step 3: Implement minimal typed fields**

Extend `GeminiWellnessResponse`, `StudyRecoveryPlan`, `PanicModePlan`, and `GuardianAlert`. Update the Zod response schema and Gemini prompt JSON shape. Update mock fallback with realistic evaluator-visible values.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/__tests__/mock.test.ts src/__tests__/prompt.test.ts`

Expected: PASS.

### Task 2: Burnout Radar Helper

**Files:**
- Create/modify: `src/lib/burnout.ts`
- Test: `src/__tests__/burnout.test.ts`

- [ ] **Step 1: Write failing tests**

Cover:
- `calculateBurnoutRadar` returns `high` when average stress is at least 8 and sleep is below 6.
- It returns `rising` when stress increases and sleep decreases.
- It returns `null` for fewer than 3 check-ins.

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/__tests__/burnout.test.ts`

Expected: FAIL before helper is complete.

- [ ] **Step 3: Implement deterministic helper**

Keep logic small and dependency-free. Use last 3 to 5 check-ins. Return text-first status, trend labels, explanation, and prevention step.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/__tests__/burnout.test.ts`

Expected: PASS.

### Task 3: Journal Prompts Helper and Check-In UI

**Files:**
- Create/modify: `src/lib/journal-prompts.ts`
- Modify: `src/app/check-in/page.tsx`
- Modify: `src/lib/i18n.ts`
- Test: `src/__tests__/journal-prompts.test.ts`
- Test: `src/__tests__/check-in-prompts.test.tsx`

- [ ] **Step 1: Write failing tests**

Cover:
- English, Hindi, Marathi prompt sets return 3 to 5 prompts.
- Prompt chip click inserts/appends text into journal textarea.
- Prompt chip click does not submit the form.

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/__tests__/journal-prompts.test.ts src/__tests__/check-in-prompts.test.tsx`

Expected: FAIL before UI integration.

- [ ] **Step 3: Implement prompt chips**

Remove voice/speech recognition code and mic UI. Add `Micro-Journal Prompts` heading and keyboard-accessible button chips above the textarea. Insert prompt text into `journalText` without submit.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/__tests__/journal-prompts.test.ts src/__tests__/check-in-prompts.test.tsx`

Expected: PASS.

### Task 4: Guardian Alert Safety Helper

**Files:**
- Create: `src/lib/guardian-alerts.ts`
- Modify: `src/lib/firebase/firestore.ts`
- Test: `src/__tests__/guardian-alerts.test.ts`

- [ ] **Step 1: Write failing tests**

Cover:
- Valid guardian email passes and invalid email fails.
- Built alert uses `guardianSafeSummary`.
- Built alert excludes raw `journalText`.
- Low/moderate risk is rejected unless explicit support is requested.

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/__tests__/guardian-alerts.test.ts`

Expected: FAIL before helper exists.

- [ ] **Step 3: Implement helper**

Create typed helpers that return a `GuardianAlert` with status `prepared`, risk `high | urgent`, selected language, and safe message only.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/__tests__/guardian-alerts.test.ts`

Expected: PASS.

### Task 5: Report Page Feature Cards

**Files:**
- Modify: `src/app/report/page.tsx`
- Modify: `src/lib/i18n.ts`
- Test: `src/__tests__/i18n.test.ts`

- [ ] **Step 1: Write failing/static tests**

Add i18n required keys for all new headings and labels in English, Hindi, Marathi.

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/__tests__/i18n.test.ts`

Expected: FAIL until i18n is complete.

- [ ] **Step 3: Implement cards**

Add:
- Exam Panic Mode card with `aria-live="polite"` panel.
- Study Recovery Plan grid.
- Parent-Safe Summary card with safe Notify Guardian behavior.
- Burnout Radar status/trend card using deterministic helper and recent check-ins.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/__tests__/i18n.test.ts`

Expected: PASS.

### Task 6: README Evaluation Alignment

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Add sections for all five features and update Evaluation Alignment for problem alignment, accessibility, security, efficiency, testing, and code quality.

- [ ] **Step 2: Review README for evaluator keywords**

Search README for: `Exam Panic Mode`, `Study Recovery Plan`, `Parent-Safe Summary`, `Burnout Radar`, `Micro-Journal Prompts`, `consent`, `deterministic`, `one Gemini call`.

### Task 7: Full Verification

**Files:**
- Project-wide

- [ ] **Step 1: Run focused tests**

Run all new/changed tests.

- [ ] **Step 2: Run full suite**

Run: `npm run test:run`

Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: no errors. Existing generated PWA warnings are acceptable if still present.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: PASS.
