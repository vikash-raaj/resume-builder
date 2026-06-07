# Competitive Analysis & Improvement Roadmap
**Resume Builder App vs. Top Industry Players**
*Research Date: June 2026*

---

## 1. What This App Currently Has

| Section | Features Present |
|---------|-----------------|
| **Auth** | Email/password sign-up, login, custom password reset flow |
| **Builder** | 7-step wizard (Personal Info → Experience → Education → Skills → Summary → Finish → Download) |
| **Personal Info** | Photo, name, job title, email, phone, address, city, postal code, country, website, LinkedIn |
| **Content Sections** | Work Experience, Education, Skills (with level slider), Summary, Certifications, Languages, Hobbies, Courses, References, Internships, Publications, Custom Section |
| **Design** | 4 templates (Riga, Modern, Classic, Minimal), 6 accent colors, font picker |
| **Section Control** | Drag-and-drop section reordering |
| **Saving** | Auto-save to Firebase + localStorage fallback, Cmd+S shortcut |
| **Export** | PDF download via browser print |
| **Dashboard** | Multiple resumes, duplicate, delete, rename |
| **Other Pages** | Cover Letter builder, Recommendation Letter, Resignation Letter |
| **Preview** | Real-time live preview while editing |

---

## 2. Competitors Analyzed

1. **Resume.io** — 40+ templates, AI writer, ATS checker, job board aggregation
2. **Zety** — GPT-powered suggestions, ATS optimization, LinkedIn import
3. **Enhancv** — AI tailoring, multi-language (30+), ATS match score, job tracker
4. **Novoresume** — 74 color themes, ATS checker, 16+ templates, Kanban job tracker
5. **Kickresume** — GPT-4.1 full AI suite, personal website builder, mobile app, 40+ templates
6. **VisualCV** — Resume analytics (unique), portfolio embedding, LinkedIn import, version control

---

## 3. Feature Gap Analysis — What Competitors Have That This App Is Missing

### CRITICAL GAPS (Features present in ALL or most competitors)

| Missing Feature | Who Has It | Why It Matters |
|----------------|-----------|----------------|
| **AI Writing Assistant** | All 6 competitors | #1 reason users choose a resume builder in 2025–26. Users expect AI to generate bullet points, summaries, and suggest improvements. Without it, the app feels outdated. |
| **ATS Score / Resume Checker** | All 6 competitors | Recruiters use ATS software to filter resumes. Users need confidence their resume will pass. This is a top-conversion feature. |
| **LinkedIn Import** | Resume.io, Zety, Kickresume, VisualCV | Eliminates the #1 friction point: re-typing everything. Dramatically improves onboarding. |
| **Word (.docx) Export** | Resume.io, Kickresume, Enhancv | Many job applications require Word format. PDF-only blocks a large segment of users. |
| **Shareable Link** | All 6 (the button exists in this app but is not implemented) | Users want to share a link instead of a file. Essential for digital-first job searching. |
| **More Templates (10+)** | All 6 (15–40+ each) | Template variety is a primary decision factor. 4 templates is below the minimum expectation. |
| **Grammar / Spell Check** | Resume.io, Zety, Enhancv, Kickresume | Resume errors cost people jobs. An in-app checker prevents this and adds trust. |

---

### HIGH-PRIORITY GAPS (Present in 3–4 competitors)

| Missing Feature | Who Has It | Why It Matters |
|----------------|-----------|----------------|
| **Job Description Tailoring** | Enhancv, Zety, Resume.io, Kickresume | Paste a job posting → AI rewrites/highlights your resume to match keywords. Top requested feature. |
| **Resume Analytics** | VisualCV (unique differentiator) | Know when and how often your resume is viewed. Creates engagement loop and retention. |
| **ATS-Keyword Highlights** | Enhancv, Resume.io, Kickresume | Show users which keywords from a job description are missing in their resume. |
| **Job Application Tracker** | Enhancv, Novoresume | Kanban board to track where each resume was sent, interview status, notes. High retention value. |
| **Pre-written Content / Phrases** | Zety, Kickresume (20,000+) | Users don't know what to write. Suggesting bullet points per job title removes biggest blocker. |
| **More Color Themes** | Novoresume (74), Kickresume (extensive) | Currently only 6 preset colors. Full color picker + font size control needed. |
| **Multi-Language Resume Output** | Enhancv (30+), Kickresume, VisualCV (9) | Non-English job markets are huge. Translating resumes opens global user base. |

---

### MEDIUM-PRIORITY GAPS (Present in 1–2 competitors)

| Missing Feature | Who Has It | Why It Matters |
|----------------|-----------|----------------|
| **Mobile App (iOS / Android)** | Kickresume, VisualCV | Large portion of global users only have phones. No mobile app = excluded market. |
| **Portfolio / Media Embedding** | VisualCV | Designers, developers, and creatives need to attach work samples to resumes. |
| **Personal Website Builder** | Kickresume | One-click turn resume into a personal webpage. Powerful differentiator. |
| **Interview Prep Tools** | Resume.io, Enhancv, Kickresume | Generate likely interview questions based on the resume. High engagement and retention. |
| **Resume Versioning** | VisualCV | Save multiple tailored versions of the same resume for different jobs with unique shareable links. |
| **Pricing / Subscription System** | All 6 competitors | The Pricing page UI exists but no actual payment processing is wired up. No monetization = no sustainability. |
| **QR Code for Resume** | Not standard yet (emerging trend) | Embed a QR code on the printed resume linking to a shareable/digital version. Innovative differentiator. |
| **Career Coaching / Blog** | Resume.io, Kickresume | Resume tips, career advice, salary guides. Drives organic SEO traffic and trust. |

---

### LOW-PRIORITY GAPS (Niche or emerging)

| Missing Feature | Notes |
|----------------|-------|
| **Video Resume** | No major competitor supports this yet — a true gap in the whole market |
| **Collaboration (Team Plans)** | Useful for career coaches and HR teams; overkill for early-stage product |
| **Human Proofreading Service** | Kickresume offers this as a premium upsell |
| **AI Career Map / Path Recommender** | Kickresume unique — scans resume and suggests career pivot options |
| **Salary Analyzer** | Resume.io — shows estimated salary based on resume data |
| **Auto-Apply to Jobs** | Resume.io — too complex for early stage, but a strong long-term play |

---

## 4. Full Improvement Roadmap (Prioritized)

### PHASE 1 — Fix Critical Gaps (Weeks 1–6)
*These are table-stakes features. Without them, the app cannot compete.*

1. **Implement Shareable Link** — The Share button already exists in the UI. Wire it up to generate a unique public URL (`/r/[resumeId]`) that renders a read-only resume preview. No auth required to view.

2. **Add More Templates** — Design or integrate at least 6 more templates (bringing total to 10+). Include categories: Creative, ATS-Strict, Executive, Academic, Entry-Level.

3. **Word (.docx) Export** — Use `docx` or `html-docx-js` npm package to export resume as a Word document. Many job applications require this.

4. **Full Color Picker + Font Size Control** — Replace the 6 hardcoded accent colors with a full color picker. Add font size slider for body text.

5. **Grammar/Spell Check** — Integrate `typo-js` (free, no API key) or hook into the browser's built-in `spellcheck` attribute on all text inputs/textareas.

---

### PHASE 2 — Add High-Value AI Features (Weeks 6–12)
*AI is the #1 differentiator in the modern resume builder market.*

6. **AI Bullet Point Generator** — Integrate Claude API (or OpenAI). User enters job title + company → AI generates 3–5 strong, achievement-focused bullet points. Add a "Generate with AI" button in the Experience form.

7. **AI Professional Summary Writer** — In the Summary form, add a "Write with AI" button. AI generates a tailored 3-sentence summary based on the user's entered experience and skills.

8. **AI Resume Rewriter / Improver** — User pastes a weak bullet point → AI rewrites it to be stronger with action verbs and metrics.

9. **ATS Score Checker** — Analyze the resume content against a checklist: keyword density, section completeness, formatting rules, bullet point structure. Show a score (0–100) with actionable tips.

10. **Job Description Tailoring** — Let user paste a job description. App highlights which keywords are present/missing in their resume and suggests additions.

---

### PHASE 3 — Grow Engagement & Retention (Weeks 12–20)

11. **LinkedIn Import** — Use LinkedIn's public profile URL or file export (`.json`) to auto-fill resume fields. Eliminates the biggest onboarding friction.

12. **Resume Analytics** — Track views of shared resume links: how many times opened, from what location, at what time. Show this in the Dashboard. This is VisualCV's biggest differentiator and currently unique in the market.

13. **Job Application Tracker** — Add a Kanban board where users track: "Applied", "Phone Screen", "Interview", "Offer", "Rejected". Each card links to the resume version used.

14. **Resume Versioning** — Allow users to save multiple tailored versions of a resume under one master. Each version gets its own shareable link. Critical for people applying to multiple job types.

15. **QR Code Generation** — Add a QR code to the downloaded PDF that links to the shareable online version. A simple but impressive differentiator.

---

### PHASE 4 — Monetization & Scale (Weeks 20–30)

16. **Implement Payment / Subscription** — Wire up Stripe to the existing Pricing page UI. Suggested free vs. paid tier split:
    - **Free:** 1 resume, 4 templates, PDF export, no AI
    - **Pro ($9/mo):** Unlimited resumes, all templates, AI features, Word export, shareable link, analytics

17. **Multi-Language Support** — Add UI language switching (at minimum: English, Spanish, French, German, Portuguese). Also allow AI-powered resume translation.

18. **Personal Website Builder** — One-click publish resume as a hosted webpage at `theresume.io/u/username`. This is a powerful viral loop — the webpage links back to the builder.

19. **Mobile App (PWA first)** — Convert the app to a Progressive Web App (PWA) with an offline-capable manifest. This gives an "install" experience on mobile without building native apps.

20. **Interview Prep** — Based on the resume's experience and job titles, generate 10 likely interview questions with suggested answers. Powered by AI.

---

### PHASE 5 — Market Differentiation (Ongoing)

21. **Portfolio Embedding** — Let users embed links, images, or videos (YouTube, GitHub, Behance) directly into the resume template. Unique value for designers, developers, photographers.

22. **Career Blog / SEO Content** — Publish resume writing guides, job search tips, and template examples. Drives organic Google traffic and builds authority. Every top competitor does this.

23. **Resume Score on Dashboard** — Show a completeness score for each resume on the dashboard card (e.g., "78% complete — add a summary to reach 90%").

24. **Collaboration for Career Coaches** — Allow a career coach to be invited to view and comment on a client's resume. Team/business plan upsell opportunity.

25. **AI Career Map** — Scan the resume and suggest 3 potential career paths the user is qualified for, with skill gap analysis for each.

---

## 5. Summary: Top 10 Things to Build First

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Fix Shareable Link | Low | High |
| 2 | 6+ More Templates | Medium | Very High |
| 3 | Word (.docx) Export | Low | High |
| 4 | AI Bullet Point Generator | Medium | Very High |
| 5 | ATS Score Checker | Medium | Very High |
| 6 | Grammar/Spell Check | Low | Medium |
| 7 | AI Summary Writer | Low | High |
| 8 | Full Color Picker | Low | Medium |
| 9 | Resume Analytics | Medium | High |
| 10 | Stripe Payment Integration | High | Very High |

---

## 6. Unique Opportunities — Things No Competitor Does Well

These are gaps in the ENTIRE market that this app could own:

| Opportunity | Details |
|-------------|---------|
| **QR Code on PDF** | No major builder offers this. A QR code on the printed resume linking to the live digital version is a modern, impressive touch. |
| **Video Resume Section** | No major player supports video resumes. A YouTube/Loom embed in the resume or a separate video cover letter tool would be genuinely unique. |
| **Real-time Collaboration** | Google Docs-style collaborative editing on a resume (e.g., with a career coach). No competitor does this well. |
| **Resume Insight Email** | Email the user when their shared resume link is viewed. High-value notification with zero competition. |
| **AI Career Coach Chat** | A chat interface where users can ask "how do I improve my resume for a product manager role?" — trained on resume best practices. |

---

*This report was generated by analyzing the current codebase and researching Resume.io, Zety, Enhancv, Novoresume, Kickresume, and VisualCV in June 2026.*
