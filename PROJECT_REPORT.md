# Resume Builder — Audit Report
**Date:** 2026-06-21  
**Scope:** Feature gaps, UX issues, technical debt, and improvement opportunities

---

## Latest Changes — Release Notes (2026-06-21)

### 1. Security: Firebase credentials moved to environment variables
**File:** `src/firebase/config.js`, `.gitignore`, `.env.example`  
**Purpose:** Firebase API keys were previously hardcoded in source code and committed to git, which is a security risk. All values are now read from `VITE_FIREBASE_*` environment variables. `.env`, `.env.local`, and `.env.production` are added to `.gitignore` so credentials are never accidentally committed. A `.env.example` template documents the required variables for new developers.

### 2. Bug fix: Password reset "Failed to send" error
**File:** `src/context/AuthContext.jsx`  
**Purpose:** The password reset flow was broken because `ACTION_CODE_SETTINGS.url` was hardcoded to `https://theresumeio.com/reset-password` — a domain not authorized in Firebase. Firebase rejects `sendPasswordResetEmail` calls when the redirect URL domain is not in the project's authorized domains list. Fixed by using `window.location.origin` dynamically, which resolves to the correct domain in both local dev (`localhost:5173`) and production.

### 3. Feature: New resume sections — Projects, Certifications, Volunteer Work, Awards & Honors
**File:** `src/components/builder/forms/FinishStep.jsx`  
**Purpose:** The "Finish It" step previously only offered supplementary sections like Hobbies, Courses, References, Languages, and Custom. Four high-demand sections were missing — particularly **Projects** (critical for developers and students) and **Certifications** (important for technical and compliance roles). Four new accordion-based form blocks were added, each with full add/edit/remove capability and integrated into the existing drag-to-reorder system.

### 4. Feature: ATS score issues now link directly to the relevant form step
**Files:** `src/components/builder/forms/DownloadStep.jsx`, `src/components/builder/BuilderLayout.jsx`  
**Purpose:** Previously, the ATS Score modal listed issues but gave the user no way to act on them — they had to manually navigate back through the builder to find the right section. Now each issue row shows a **"Fix in [Section] →"** button that closes the modal and jumps directly to the correct step (Contact, Experience, Education, Skills, or Summary). `issueToStep()` maps issue text keywords to step indices. `onGoToStep` is threaded from `BuilderLayout` → `DownloadStep` → `ATSModal`.

### 5. Feature: Job Tracker empty state
**File:** `src/pages/JobTrackerPage.jsx`  
**Purpose:** When a user opened the Job Tracker for the first time with no applications, the page showed a blank Kanban grid with no guidance. Added a styled empty state with a Kanban icon, explanatory copy, and an "Add First Application" CTA button that opens the add-job modal directly.

### 6. Reliability: Global React ErrorBoundary
**Files:** `src/components/ErrorBoundary.jsx` (new), `src/main.jsx`  
**Purpose:** Unhandled render errors caused a blank white screen with no feedback for the user. Added a class-based `ErrorBoundary` component wrapping the entire app. In development it shows the error stack; in production it shows a friendly "Something went wrong — try refreshing" message. The user's resume data is preserved in Firestore and is not lost on a crash.

---

## Executive Summary

The project is a well-structured, feature-rich resume builder SaaS with AI writing assistance, 6 templates, career tools (job tracker, interview prep, salary insights), and a subscription tier system. The core builder works end-to-end. However, several promised Pro features are unimplemented, the payment flow is incomplete, the AI integration has a security gap, and export quality needs improvement before this is truly production-ready.

---

## 1. Critical Missing Features

### 1.1 Payment / Stripe Integration — NOT WIRED
- `PaymentSuccessPage.jsx` exists, but there is no Stripe checkout session creation anywhere in the codebase.
- The Pricing page has CTA buttons that almost certainly do nothing (no `stripe.redirectToCheckout` or similar call).
- The subscription tier in Firestore appears to be set manually or never actually toggled.
- **Impact:** The entire monetization layer is non-functional.
- **Fix:** Integrate Stripe Checkout (or Stripe Payment Links as a quick win). A Firebase Cloud Function should create the checkout session and update `subscriptionTier` in Firestore on webhook confirmation.

### 1.2 Version History — Promised but Not Built
- Listed as a Pro feature in the Pricing section.
- No version history UI exists anywhere (`/versions`, or within the builder).
- No Firestore collection or schema for storing resume snapshots over time.
- **Impact:** Users pay for a feature that doesn't exist.
- **Fix:** Store a `versions` subcollection under each resume document (max 10 snapshots). Add a "History" button in the builder that opens a slide-over with timestamped restore points.

### 1.3 No Backend / API Proxy
- Claude API calls are made directly from the browser using the user's personal API key stored in `localStorage`.
- This means: (1) the app cannot offer Claude AI without requiring every user to have their own Anthropic account, (2) there is no rate limiting or cost control, (3) CORS headers on Anthropic's API may cause issues in some browser environments.
- **Impact:** Blocks most non-technical users from using the AI features. The whole AI value proposition is gated behind "get your own API key."
- **Fix:** Add a lightweight backend (Firebase Cloud Functions or a Next.js API route) that proxies Claude calls using a single server-side key. Gate this behind the subscription tier (free users get N AI requests/month, Pro gets unlimited).

### 1.4 Resume Import (PDF / DOCX)
- The app can export to PDF and DOCX, but there is no way to import an existing resume.
- LinkedIn JSON import exists but requires a manual LinkedIn data export — not a one-click flow.
- **Impact:** New users with existing resumes face a full manual re-entry. This is a major friction point in onboarding.
- **Fix:** Add PDF text extraction (via `pdf.js`) or a paste-your-resume field fed into an AI parser that pre-fills the builder form fields.

### 1.5 `ComingSoonPage` Shipped in Production
- A placeholder `ComingSoonPage.jsx` exists and is routed in production.
- Users who hit this page see no content.
- **Fix:** Either complete those features or remove the routes from the live navigation entirely.

---

## 2. Core Builder Gaps

### 2.1 Section Reordering
- `@dnd-kit/core` and `@dnd-kit/sortable` are installed as dependencies but there is no evidence they are used for reordering resume sections (e.g., moving Skills above Experience).
- **Fix:** Wire dnd-kit to the section list in the builder so users can drag sections into any order, with that order reflected in the template output.

### 2.2 Template Customization is Too Limited
- Color picker exists in `FinishStep.jsx`, but there are no controls for:
  - Font size / line spacing
  - Margin / padding adjustments
  - Font family selection
  - Section visibility toggles (hide certifications, hide photo, etc.)
- **Fix:** Add a right-side "Customize" panel with sliders for spacing and a font selector (4–5 options). Section toggle checkboxes are a high-value, low-effort addition.

### 2.3 PDF Export Quality
- Current PDF export uses `html2canvas` → `jsPDF`. This approach renders the DOM as an image — text in the PDF is not selectable/searchable, quality degrades at non-standard zoom levels, and page breaks are unreliable.
- ATS systems often fail to parse image-based PDFs.
- **Fix:** Switch to a proper vector PDF renderer. Options: `react-pdf/renderer` to define PDF layouts natively, or server-side Puppeteer/Chromium (via a Cloud Function) for a pixel-perfect, text-layer PDF.

### 2.4 No Undo / Redo in Builder
- If a user deletes a section or accidentally clears a field, there is no undo.
- Auto-save to localStorage captures only the latest state.
- **Fix:** Implement a simple undo stack (array of the last 20 states) using `useReducer` in `ResumeContext`.

### 2.5 Missing Resume Sections
- Currently supported: Personal Info, Experience, Education, Skills, Summary, Certifications, Languages.
- Common sections not present:
  - Projects (especially critical for developers, students)
  - Volunteer Work
  - Publications / Patents
  - Awards & Honors
  - Custom / Free-form section
- **Fix:** Add Projects and Volunteer forms (high demand). A "Custom Section" feature (user-defined heading + rich text) covers everything else.

---

## 3. AI Features — Improvements

### 3.1 AI Tailoring UX is Buried
- "Tailor to Job Description" is a powerful feature, but it lives deep in the AI panel. Most users will miss it.
- **Fix:** Add a dedicated "Tailor Resume" step or a prominent CTA on the Dashboard ("Tailor this resume to a job").

### 3.2 Cover Letter Builder Lacks AI Tailoring
- `CoverLetterBuilder.jsx` exists, but it is unclear if AI tailoring (to a specific job description) is wired in.
- The `aiService.js` has a `generateCoverLetter` function, but it may not be fully connected to the cover letter builder UI.
- **Fix:** Add a job description input + "Generate with AI" button to the cover letter builder that calls `aiService.generateCoverLetter`.

### 3.3 ATS Score Shows Score, Not Fix
- `atsChecker.js` gives a score and identifies missing items, but does not link to the specific form field where the user needs to make a change.
- **Fix:** Make ATS findings clickable — clicking "Missing: Quantified Metrics in Experience" should jump the user to the Experience step.

### 3.4 Salary Insights Data is Hardcoded
- `SalaryInsightsPage.jsx` has static salary data for 18 roles × 4 markets baked into the component.
- This data will go stale and is not comprehensive.
- **Fix:** Either move the data to a Firestore collection (so it can be updated without a deploy) or integrate a free public API (e.g., BLS API or Glassdoor affiliate).

### 3.5 Interview Prep is Static
- 20+ hardcoded Q&A pairs per category. No personalization, no AI-generated answers.
- **Fix:** Add an "AI Practice" mode where the user picks a question, types an answer, and gets AI feedback on their STAR structure. This would be a major differentiator.

---

## 4. UX & Design Issues

### 4.1 No Onboarding Flow
- After sign-up, users land on the Dashboard with no guidance on what to do next.
- **Fix:** Add a 3-step onboarding modal: "Choose a template → Fill your info → Download". A progress checklist ("Your resume is 60% complete") on the Dashboard would also help retention.

### 4.2 Dashboard Lacks Resume Preview Thumbnails
- The Dashboard lists resumes by name but (likely) shows no visual preview thumbnail.
- **Fix:** Capture and store a PNG thumbnail of the resume on save (can use the existing `html-to-image` library) and display it as a card preview on the Dashboard.

### 4.3 Mobile Experience is Untested / Incomplete
- The builder has a split-pane layout (form left, preview right) that almost certainly breaks on mobile screens.
- PWA manifest exists, so users can install the app — but if the builder doesn't work on mobile it's a dead feature.
- **Fix:** On mobile, show the form full-screen with a "Preview" FAB button that slides in the template view. The preview should be read-only on mobile.

### 4.4 Empty States on Career Tools Pages
- Job Tracker, Cover Letter Dashboard, and Application Kit likely show blank screens on first use with no guidance.
- **Fix:** Add illustrated empty states with a primary CTA ("Add your first job", "Create a cover letter").

### 4.5 No Real Testimonials
- `Testimonials.jsx` almost certainly contains hardcoded placeholder content. This is a trust signal that will hurt conversion.
- **Fix:** Add real user feedback once you have beta users, or replace with a metrics section ("X resumes created", "X job offers received") that you can actually back up.

---

## 5. Technical Debt & Security

### 5.1 Firebase Config Committed to Git
- The Firebase API key, project ID, and app ID are hardcoded in `src/firebase/config.js` and committed to the repository.
- Firebase public keys are somewhat safe by design, but it is best practice to move them to `.env` / Vite environment variables.
- **Fix:** Move all Firebase config values to `VITE_FIREBASE_*` env vars. Add `.env` to `.gitignore`. Document required variables in `.env.example`.

### 5.2 No TypeScript
- The entire codebase is JSX with no type safety.
- Context values, resume data shape, and API response structures are all untyped.
- **Impact:** Refactoring is risky; component prop bugs are caught only at runtime.
- **Fix:** Migrate to TypeScript incrementally. Start with the context files and shared types (the resume data schema) as they have the most surface area.

### 5.3 Test Coverage is Minimal
- `qa_test.js` is a single Playwright script — not a test suite. It has no assertions about specific UI states, no data-driven tests, and no CI integration.
- **Fix:** Write Playwright tests for the 3 critical paths: (1) sign up → create resume → download PDF, (2) ATS score changes when experience is added, (3) subscription gate blocks DOCX export on free tier.

### 5.4 No Error Boundary or Global Error Handling
- If a Firebase call fails or the AI API times out, there is likely no graceful degradation — the component just crashes.
- **Fix:** Wrap the app in a React `ErrorBoundary`. Add `try/catch` with user-facing toast notifications in all async operations (AI calls, Firestore reads/writes, export functions).

### 5.5 `console.log` / Debug Code in Production
- Production bundles likely include leftover debug logs from development. These expose internal data structures and slow performance.
- **Fix:** Run `grep -r "console.log" src/` and remove all non-essential logs. Use a logger utility that is silenced in production.

### 5.6 No Content Security Policy
- The app makes direct cross-origin API calls to `api.anthropic.com` from the browser. Without a proper CSP header, this is a potential XSS vector.
- **Fix:** Add CSP headers in `firebase.json` under `hosting.headers`. Whitelist only the required origins.

---

## 6. Feature Opportunities (Growth)

| Feature | Effort | Impact |
|---|---|---|
| Stripe payment integration | Medium | Critical — enables monetization |
| Backend AI proxy (Cloud Function) | Medium | Removes biggest onboarding barrier |
| Projects section in builder | Low | High demand, especially for developers |
| Resume thumbnail on Dashboard | Low | Major UX improvement |
| Section drag-to-reorder | Low | Already have dnd-kit installed |
| AI mock interview practice | High | Strong differentiator |
| PDF import / AI parsing | High | Solves biggest onboarding friction |
| Version history (Pro) | Medium | Fulfills existing Pro promise |
| Mobile-responsive builder | Medium | Required for PWA to be meaningful |
| Email drip / onboarding flow | Medium | Retention improvement |
| Real salary API integration | Low | Data freshness, trust |
| TypeScript migration | High | Long-term code health |

---

## 7. Quick Wins (Can Be Done This Week)

1. **Remove `ComingSoonPage` routes** from navigation — takes 10 minutes, stops dead ends.
2. **Add `.env` for Firebase config** — 30 minutes, good security hygiene.
3. **Add empty states** to Job Tracker and Cover Letter Dashboard — 2 hours, big UX improvement.
4. **Make ATS findings clickable** — link each finding to the correct builder step — 3 hours.
5. **Strip `console.log` from production** — 1 hour, run the grep and delete.
6. **Add a Projects section form** — 4–6 hours, highest requested resume section missing.
7. **Wire dnd-kit to section reordering** — 1 day, dependency is already installed.

---

## Summary Score

| Area | Status |
|---|---|
| Core builder | Good — works end-to-end |
| Templates & export | Needs improvement (PDF quality) |
| AI features | Partial — blocked by API key requirement |
| Payment / monetization | Not functional |
| Career tools | Present but mostly static/hardcoded |
| Test coverage | Minimal |
| Mobile UX | Likely broken on small screens |
| Security | Several gaps (committed config, no CSP, no backend proxy) |
| TypeScript / type safety | Not present |
| Onboarding / retention | Missing entirely |
