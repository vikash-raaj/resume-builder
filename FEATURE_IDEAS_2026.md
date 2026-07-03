# Feature Ideas — What's Left to Build
**Date:** 2026-07-03
**Scope:** Fresh gap analysis after verifying current codebase state + 2026 market research (Rezi, Wobo, Kickresume, Teal, gitconnected, RenderCV)

This supersedes the "still missing" parts of `COMPETITIVE_ANALYSIS.md` (June 2026) and `PROJECT_REPORT.md` (2026-06-21) — a lot has shipped since those were written. Verified against the current codebase before listing anything as "missing."

---

## 1. Already shipped since the last reports (don't re-build these)

Checked the actual code — these were flagged as gaps before but are now done:

| Feature | Evidence |
|---|---|
| DOCX export | [docxExport.js](src/utils/docxExport.js) |
| LinkedIn import | [PersonalInfoForm.jsx](src/components/builder/forms/PersonalInfoForm.jsx) |
| Shareable resume link | [SharedResumePage.jsx](src/pages/SharedResumePage.jsx) |
| Resume version history | [BuilderLayout.jsx:161](src/components/builder/BuilderLayout.jsx#L161) — saves named versions to a Firestore subcollection |
| Dashboard thumbnails | [Dashboard.jsx](src/pages/Dashboard.jsx) |
| ATS score checker (clickable fixes) | [atsChecker.js](src/utils/atsChecker.js) |
| Spellcheck on inputs | [FormField.jsx](src/components/builder/FormField.jsx) |
| 6 templates incl. a dev-focused one | `RigaTemplate`, `ModernTemplate`, `MinimalTemplate`, `TechTemplate`, `ClassicTemplate`, `ExecutiveTemplate` |
| Job tracker, interview prep, salary insights, LinkedIn optimization, cover letter builder | all present as full pages |

## 2. Genuinely still missing (confirmed by grep, not assumption)

- **Stripe/payment processing** — Pricing page and `PaymentSuccessPage` exist, but no `stripe` package in `package.json` and no checkout session code anywhere. Pro gating currently has nothing real behind it.
- **AI calls run client-side with a user-supplied key** ([AIKeySetup.jsx](src/components/builder/AIKeySetup.jsx)) — no backend proxy, so non-technical users can't use AI features without getting their own Anthropic key.
- **No resume import from an existing PDF/DOCX** — only LinkedIn JSON import exists; someone with an existing resume file still has to retype everything.
- **PDF export is image-based** (`html2canvas` → `jsPDF`), so exported text isn't selectable and can fail ATS parsers that expect a real text layer.
- **No full section-visibility / spacing / margin controls** — only accent color and font exist in the customize panel.

---

## 3. New feature ideas, from what's winning in the market right now

### High impact, matches what top 2026 tools do
1. **Live ATS score that updates on every keystroke** (not just on the Download step) — Rezi's headline feature; recruiters cite it as the #1 reason users trust a builder over a blank Word doc.
2. **One tailored resume per job posting, linked from a job-tracker card** — Teal's core loop: paste a job description on a tracker card → "Generate tailored resume" → new version auto-saved and linked back to that application. This app already has both a job tracker *and* version history; wiring them together is mostly UI work, not new infrastructure.
3. **Server-side AI proxy with a monthly free quota** — unblocks AI for users without their own API key, and is a prerequisite for real Pro-tier monetization once Stripe is wired up.
4. **Native vector PDF export** (e.g. `@react-pdf/renderer` or a Cloud Function running headless Chromium) instead of the current image-based export — fixes ATS parsing and text-selection complaints, which show up repeatedly in resume-builder reviews.

### Developer-specific features (since this app already has "developer" as a named audience — Projects section, Tech template)
5. **GitHub import** — pull public repos, pinned repos, languages, and contribution stats to pre-fill a "Projects" section and suggest skill tags. This is gitconnected's core differentiator for the dev segment and is a good wedge feature vs. the generalist builders (Resume.io, Zety) that don't do this at all.
6. **Tech-stack skill chips instead of a generic slider** — let devs tag skills with a language/framework icon set (React, Python, AWS, etc.) rather than the current 1–5 level slider, which reads oddly for hard technical skills.
7. **Markdown/YAML export** for developers who keep their resume in version control (à la RenderCV) — export the resume data as a plain YAML/Markdown file a dev could commit to a repo, in addition to PDF/DOCX.
8. **Portfolio/repo links per project entry** — small addition to the existing Projects form: a "Live demo" and "Source" URL field per project, rendered as icons in the Tech template.

### Lower priority / differentiation plays
9. **AI mock-interview practice with feedback**, building on the existing static Interview Prep page — let users answer a question in text and get AI feedback on STAR structure (already called out in `PROJECT_REPORT.md`, still not built).
10. **QR code on the PDF** linking to the shareable resume URL — cheap to build (already have `qrcode.react` as a dependency), and effectively no major competitor does this well yet.

---

## 4. Suggested build order

1. Wire the job tracker to version history (tailored-resume-per-application) — highest leverage, reuses existing features.
2. Live/incremental ATS scoring in the builder itself, not just at Download.
3. GitHub import + tech skill chips — strengthens the "built for developers" positioning this app already has.
4. Backend AI proxy — unblocks AI for non-technical users and is a monetization prerequisite.
5. Stripe integration — only worth doing once #4 gives Pro something real to gate.
6. Vector PDF export — fixes ATS/text-selection complaints.

---

## Sources consulted
- [8 Best AI Resume Builders in 2026 — Rezi](https://www.rezi.ai/posts/best-ai-resume-builders)
- [7 Best AI Resume Builders 2026 — Wobo](https://www.wobo.ai/blog/best-ai-resume-builders/)
- [7 Best AI Resume Builders for 2026 — Resume.io](https://resume.io/blog/what-is-the-best-ai-resume-builder)
- [Best AI Resume Builders 2026 — Zapier](https://zapier.com/blog/best-resume-builder/)
- [Resume Builder for Developers — gitconnected](https://gitconnected.com/resume-builder)
- [RenderCV — Resume builder for academics and engineers](https://github.com/rendercv/rendercv)
- [How to Turn Your GitHub Into a Professional Portfolio](https://www.resumly.ai/blog/how-to-turn-your-github-into-a-professional-portfolio)
