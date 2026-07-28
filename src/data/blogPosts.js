// Blog content, stored as structured data (same convention as PRINCIPLES in
// AboutPage.jsx / SECTIONS in HelpCenterPage.jsx) rather than markdown/MDX,
// since no markdown renderer is set up in this project.

export const BLOG_POSTS = [
  {
    slug: 'ats-friendly-resume-guide',
    title: 'How to Write an ATS-Friendly Resume That Actually Gets Read',
    excerpt:
      'Most resumes are read by software before a human ever sees them. Here is exactly how applicant tracking systems parse your resume, the formatting choices that quietly break parsing, and how to write one that survives the filter.',
    publishedAt: '2026-06-15',
    readMinutes: 9,
    cta: {
      text: 'Build an ATS-checked resume',
      to: '/builder',
    },
    sections: [
      {
        heading: 'What an ATS actually does',
        paragraphs: [
          'An applicant tracking system (ATS) is software companies use to collect, sort, and search job applications before a recruiter looks at any of them. When you submit a resume through a company\'s careers page, it almost never lands directly in a human\'s inbox — it goes into the ATS first, gets parsed into structured fields (name, job titles, dates, skills), and gets indexed so a recruiter can search or filter the pile.',
          'The problem is that "parsing" is really just automated guessing. The software is trying to reconstruct your work history from the visual layout of a document, and it gets that wrong far more often than most job seekers realize — especially with resumes designed to look good rather than to be read by a machine first.',
        ],
      },
      {
        heading: 'The formatting choices that quietly break parsing',
        paragraphs: [
          'Multi-column layouts are the single biggest cause of parsing failures. A human reads a two-column resume left-to-right within each column; many ATS engines read straight across the page, left to right, ignoring column boundaries — which means your 2022 job title can end up stitched to a skill from an entirely different section.',
          'Text inside images, icons, or text boxes is usually invisible to an ATS. If your contact info or a skills list is rendered as a graphic element rather than real, selectable text, it may simply not get read at all.',
          'Tables have similar issues — some ATS engines flatten them correctly, many don\'t. Headers and footers are unreliable too: some systems skip them entirely, which is a bad place to put your phone number or email.',
          'Unusual section headings can also cost you. An ATS is often looking for recognizable headers like "Experience," "Education," and "Skills" to know where to file information. A heading like "Where I\'ve Made an Impact" might look creative to a person and mean nothing to the parser.',
        ],
      },
      {
        heading: 'What to do instead',
        paragraphs: [
          'Use a single-column layout, or if you use a sidebar, keep only truly supplementary content there (like a skills list) — never your work history or dates, which are the fields recruiters search on most.',
          'Stick to standard section headings: Experience, Education, Skills, Summary. You can still be specific in the content underneath — the heading itself is what the parser is scanning for.',
          'Keep your contact information as plain text in the main body of the document, not in a header/footer, and not as an image.',
          'Use standard fonts and avoid special characters, symbols, or decorative bullet icons for anything you need parsed correctly — a plain "•" is safer than a custom glyph from an icon font.',
          'Save as a Word document (.docx) when a company accepts it, and PDF otherwise — modern ATS software generally parses both fine as long as the underlying document has real, selectable text rather than a scanned image.',
        ],
      },
      {
        heading: 'Matching keywords without keyword-stuffing',
        paragraphs: [
          'Beyond parsing correctly, many ATS platforms also rank or filter candidates by keyword match against the job description. This does not mean pasting a wall of skills at the bottom of your resume in white text (some candidates genuinely try this — it\'s easily detected and looks dishonest to any human who does see the resume).',
          'The better approach: read the job description closely, note the specific tools, methodologies, and skill names it uses, and reflect the ones that genuinely apply to you using that same terminology naturally inside your bullet points. If a posting says "cross-functional stakeholder management" and that\'s a real part of what you did, use that phrase rather than a vaguer synonym — the ATS is matching on the words actually used, and the recruiter reading your resume afterward will recognize the fit immediately too.',
        ],
      },
      {
        heading: 'Checking your own resume',
        paragraphs: [
          'Before you submit anywhere, it\'s worth checking how your resume actually holds up structurally — not just how it looks to your own eye. TheResume.io\'s builder includes a built-in ATS score checker on the Download step that flags common parsing risks (multi-column sections, missing standard headings, images used where text should be) directly on your resume, so you can fix them before you apply rather than finding out after weeks of silence.',
        ],
      },
    ],
  },
  {
    slug: 'cover-letter-writing-guide',
    title: "The Cover Letter Guide: What to Say When You Don't Know What to Say",
    excerpt:
      'A good cover letter is not a summary of your resume in paragraph form. Here is a structure that works for almost any job, plus exactly what to write in each part — including the opening line most people get wrong.',
    publishedAt: '2026-06-22',
    readMinutes: 8,
    cta: {
      text: 'Generate a tailored cover letter',
      to: '/cover-letters',
    },
    sections: [
      {
        heading: 'What a cover letter is actually for',
        paragraphs: [
          'Your resume answers "what have you done." A cover letter answers a different question entirely: "why this role, and why you, specifically." It\'s the one part of your application where you get to make a direct case in your own voice, instead of a list of bullet points a recruiter has to interpret on their own.',
          'That means the biggest mistake in cover letter writing is turning it into a second resume — restating your job titles and responsibilities in sentence form. If a recruiter can get the same information faster from your resume, the cover letter added nothing.',
        ],
      },
      {
        heading: 'The opening line most people get wrong',
        paragraphs: [
          '"I am writing to apply for the [Job Title] position at [Company]" is the single most common opening line in cover letters, and it\'s also the least useful one — the recruiter already knows what job you\'re applying for; it\'s the one they posted, and you\'re in that file.',
          'A stronger opening does one of two things: leads with a specific, relevant result ("In my last role, I cut onboarding time for new hires from six weeks to two — the kind of process problem I\'d love to help [Company] solve as you scale the team"), or leads with a genuine, specific reason you want this role at this company, not a generic one that could be pasted into any application.',
        ],
      },
      {
        heading: 'A structure that works for almost any role',
        paragraphs: [
          'Opening (1-2 sentences): a specific hook — a result, or a genuine reason for this specific role/company — not a restatement of the job title.',
          'Middle (2-3 short paragraphs): pick two or three things from the job description that matter most, and for each one, give a real, specific example from your own experience that shows you can do it. Numbers and outcomes are more convincing than adjectives — "led a team of six through a product launch that grew signups 40%" says more than "strong leadership skills."',
          'Close (2-3 sentences): a brief, confident statement connecting your background to what the company is trying to do next, plus a simple call to action — that you\'d welcome the chance to talk further. No need to beg or over-apologize for taking their time; a direct, professional close reads as more confident.',
        ],
      },
      {
        heading: 'Tailoring without starting from scratch every time',
        paragraphs: [
          'You don\'t need a completely unique cover letter for every single application, but reusing one word-for-word is easy to spot and reads as low effort. A practical middle ground: keep the overall structure and one or two of your strongest examples consistent, but swap in the specific detail from the job description you\'re responding to, and adjust the opening hook to be genuinely relevant to that company.',
          'If you\'re short on time, generating a first draft based on your actual experience and then editing it into your own voice is far faster than staring at a blank page — the editing pass is what makes it sound like you and not like a template. TheResume.io\'s cover letter builder does exactly this: it drafts a full letter from your details and the job you\'re applying to, which you then adjust rather than write from zero.',
        ],
      },
      {
        heading: 'Length and formatting',
        paragraphs: [
          'One page, ideally 250-400 words. A cover letter that runs longer than the resume it accompanies is a sign it needs editing, not more detail. Keep formatting simple — no need for a matching visual template to your resume, just a clean, readable letter that a human can get through in under a minute.',
        ],
      },
    ],
  },
  {
    slug: 'professional-resignation-letter',
    title: 'How to Write a Professional Resignation Letter (With Examples)',
    excerpt:
      "Resigning well matters more than most people think — references, rehire eligibility, and your professional reputation all run through it. Here's exactly what to include, what to leave out, and two example letters for different situations.",
    publishedAt: '2026-06-29',
    readMinutes: 7,
    cta: {
      text: 'Generate your resignation letter',
      to: '/resignation-letters',
    },
    sections: [
      {
        heading: 'Why the letter matters more than it seems',
        paragraphs: [
          'A resignation letter feels like a formality, but it\'s often the last written record your employer keeps of you — and it can resurface years later during a reference check, a rehire application, or simply as the thing your old manager remembers you by. A short, professional, unemotional letter costs you nothing and closes the door well. A messy or overly emotional one can follow you.',
          'It\'s worth separating the letter from the conversation. The verbal conversation with your manager is where nuance, feedback, or an honest explanation belongs, if you choose to share it. The letter itself should stay simple, neutral, and purely functional — it exists to create a clear, dated record that you resigned and when your last day is.',
        ],
      },
      {
        heading: 'What to include',
        paragraphs: [
          "A clear statement that you're resigning, and from what position — no ambiguity about your intent.",
          'Your last working day, calculated from your notice period (typically two weeks in many countries, though check your contract or company policy — some roles or regions expect longer).',
          "A brief, genuine note of thanks — even a single sentence. This costs nothing and it's simply good practice.",
          'An offer to help with the transition (documenting your work, training a replacement, etc.) if that\'s realistic for your notice period.',
          'Your signature and the date.',
        ],
      },
      {
        heading: 'What to leave out',
        paragraphs: [
          'Reasons for leaving, unless you genuinely want them on record — and most people don\'t. "I\'m leaving because I found a better opportunity" is fine to say out loud if asked; it rarely needs to be in writing.',
          'Complaints, criticism of management, or anything you wouldn\'t want read back to you in a reference check five years from now. Even if entirely justified, a resignation letter is not the venue — an exit interview, if your company offers one, is a more appropriate and often more effective place for real feedback.',
          'Over-explaining or over-apologizing. A short, professional letter reads as more confident than a long one trying to soften the news.',
        ],
      },
      {
        heading: 'Example: standard two-weeks notice',
        paragraphs: [
          'Dear [Manager\'s Name],\n\nPlease accept this letter as formal notice of my resignation from my position as [Job Title] at [Company Name], effective [Last Working Day, typically two weeks from the letter date].\n\nI\'m grateful for the opportunities I\'ve had here over the past [length of time], and I\'ll do everything I can over the next two weeks to ensure a smooth handover of my responsibilities.\n\nThank you again for the experience.\n\nSincerely,\n[Your Name]',
        ],
      },
      {
        heading: 'Example: immediate/short-notice resignation',
        paragraphs: [
          'Dear [Manager\'s Name],\n\nI am writing to resign from my position as [Job Title], effective [date]. I understand this is shorter notice than standard, and I\'m happy to discuss how I can support a handover in the time available.\n\nThank you for the opportunity to be part of the team.\n\nSincerely,\n[Your Name]',
          'If you\'re giving less than the typical notice period, a short verbal explanation to your manager alongside the letter is generally appreciated, even if it\'s not required — but again, that belongs in the conversation, not necessarily in the letter itself.',
        ],
      },
      {
        heading: 'Generating one quickly',
        paragraphs: [
          'If you\'d rather not draft this from a blank page, TheResume.io\'s resignation letter tool fills a professional template with your name, role, company, and last working day in a few clicks, ready to review, adjust, and download.',
        ],
      },
    ],
  },
  {
    slug: 'interview-preparation-guide',
    title: 'Interview Preparation: How to Actually Walk In Ready',
    excerpt:
      "Most interview prep advice stops at \"practice common questions.\" Here's a more complete approach: the STAR method explained properly, how to prepare for the questions you can't predict, and what to actually research about the company beforehand.",
    publishedAt: '2026-07-06',
    readMinutes: 8,
    cta: {
      text: 'Practice with our interview prep tool',
      to: '/interview-practice',
    },
    sections: [
      {
        heading: 'The STAR method, explained properly',
        paragraphs: [
          'STAR stands for Situation, Task, Action, Result, and it\'s the most reliable structure for answering behavioral questions ("Tell me about a time you...") — but most people apply it too loosely and end up rambling anyway.',
          'Situation: one or two sentences of real context — where, when, what was going on. Don\'t over-explain the backstory.',
          'Task: what specifically you were responsible for or trying to achieve — the goal, not just the situation.',
          'Action: the largest part of your answer. What did you specifically do — not your team, you. Be concrete about the actual steps or decisions, not a vague summary like "I worked hard to fix it."',
          'Result: what happened, ideally with a number or a concrete outcome. "The project succeeded" says little. "We cut processing time by 30% and it shipped two weeks ahead of schedule" says a lot.',
          'A common failure mode is spending 80% of the answer on Situation and Task and rushing through Action and Result — which is backwards. The interviewer is trying to learn what you personally did and what happened because of it; that\'s where most of your answer should live.',
        ],
      },
      {
        heading: 'Preparing for the questions you can\'t predict',
        paragraphs: [
          'You can\'t script every possible question, but you can prepare a small set of strong stories in advance and adapt them on the fly. Before an interview, write out 4-6 specific work situations that showcase different strengths: a time you solved a hard problem, a time you led or influenced without authority, a time you handled conflict or disagreement, a time you failed and what you learned, a time you managed competing priorities.',
          'Most behavioral questions, however they\'re phrased, are trying to get at one of these underlying situations. If you know your 4-6 stories cold — situation, task, action, result, for each — you can adapt one to almost any question you\'re actually asked, rather than trying to invent a fresh answer on the spot.',
        ],
      },
      {
        heading: 'What to actually research about the company',
        paragraphs: [
          'Generic research ("I read your About page") rarely impresses anyone. More useful preparation: read the company\'s most recent public news or product launches, understand what the team you\'re interviewing for is specifically responsible for (not just what the whole company does), and — if possible — identify a real product or business challenge the role would plausibly need to help with.',
          'This lets you ask better questions at the end of the interview, and it lets you connect your own answers to the company\'s actual situation instead of generic strengths. "I noticed you recently expanded into [market] — that kind of rapid scaling is exactly the kind of onboarding challenge I solved at my last company" lands very differently than a rehearsed answer with no connection to the role.',
        ],
      },
      {
        heading: 'Questions to ask them',
        paragraphs: [
          'Always have 2-3 genuine questions ready — not asking anything reads as disengaged. Strong options: what does success look like in this role in the first 6 months, what\'s the biggest challenge the team is currently facing, or a specific question about the product/strategy you researched beforehand. Avoid questions you could have answered yourself with two minutes on their website.',
        ],
      },
      {
        heading: 'Practicing out loud',
        paragraphs: [
          'Preparing stories mentally is not the same as saying them out loud under mild pressure — most people discover their "clear" answer is actually rambly the first time they try to say it in under two minutes. Practicing out loud, even alone, is what actually builds the fluency that shows up as confidence in the room.',
          'TheResume.io\'s interview practice tool organizes common questions by category — Behavioral, Situational, Strengths & Weaknesses, and General/Role Fit — with a hint on structuring each answer, so you can work through a realistic set before your actual interview instead of guessing what might come up.',
        ],
      },
    ],
  },
];

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
