# Resend Guardian Alerts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send one parent-safe Resend email when a consented high or urgent wellness result needs guardian support.

**Architecture:** Keep privacy boundaries in `guardian-alerts.ts`, add a server-only `guardian-email.ts` Resend client helper, expose `POST /api/guardian-alert`, and update the report page to auto-send once per high/urgent check-in. Firestore remains the audit record with `sent` or `failed` status.

**Tech Stack:** Next.js App Router route handlers, Resend HTTP API, Firestore, Vitest.

---

### Task 1: Email Helper

**Files:**
- Create: `src/lib/guardian-email.ts`
- Test: `src/__tests__/guardian-email.test.ts`

- [ ] Write tests proving the helper posts to Resend with parent-safe content and an idempotency key.
- [ ] Implement `sendGuardianEmail` with injected `fetcher` for tests.

### Task 2: API Route

**Files:**
- Create: `src/app/api/guardian-alert/route.ts`
- Test: `src/__tests__/guardian-alert-route.test.ts`

- [ ] Write tests proving invalid risk/email/config fails and a valid alert sends.
- [ ] Implement route validation and call the helper.

### Task 3: Report Integration

**Files:**
- Modify: `src/app/report/page.tsx`
- Modify: `src/lib/i18n.ts`

- [ ] Auto-send once when `riskLevel` is high/urgent and consent/email are present.
- [ ] Keep manual Notify Guardian as a fallback/retry path.
- [ ] Disable duplicate sends per check-in.

### Task 4: Docs and Env

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

- [ ] Document `RESEND_API_KEY` and `GUARDIAN_EMAIL_FROM`.
- [ ] Explain auto-alert behavior and parent-safe privacy limits.
