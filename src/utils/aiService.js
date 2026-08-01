import { auth } from '../firebase/config';

const AI_KEY_STORAGE = 'resume_builder_ai_key';
const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_FUNCTION_URL;

export function getStoredAIKey() {
  return localStorage.getItem(AI_KEY_STORAGE) || '';
}

export function saveAIKey(key) {
  localStorage.setItem(AI_KEY_STORAGE, key);
}

export function clearAIKey() {
  localStorage.removeItem(AI_KEY_STORAGE);
}

// Bring-your-own-key path — unchanged, still supported for anyone who has
// pasted in their own Anthropic key (unlimited use, at their own cost).
async function callClaudeDirect(key, prompt, systemPrompt, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: systemPrompt || 'You are an expert resume writer. Write concise, impactful, professional content. Return only the requested text — no preamble, no quotes, no extra explanation.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text?.trim() || '';
}

// Backend-proxied path — used for any signed-in user without their own key,
// so AI features work without requiring an Anthropic account. Server enforces
// a free-tier monthly quota and calls Anthropic with a server-side key.
async function callClaudeViaProxy(prompt, systemPrompt, maxTokens) {
  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemPrompt, maxTokens }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (err?.code === 'QUOTA_EXCEEDED') throw new Error(err.error);
    throw new Error(err?.error || `AI request failed (${res.status})`);
  }

  const data = await res.json();
  return data.text || '';
}

async function callClaude(prompt, systemPrompt = '', maxTokens = 600) {
  const key = getStoredAIKey();
  if (key) return callClaudeDirect(key, prompt, systemPrompt, maxTokens);
  if (auth.currentUser && AI_PROXY_URL) return callClaudeViaProxy(prompt, systemPrompt, maxTokens);
  throw new Error('NO_KEY');
}

export async function generateBulletPoints({ jobTitle, company, description }) {
  const context = [jobTitle && `Job title: ${jobTitle}`, company && `Company: ${company}`, description && `Context: ${description}`].filter(Boolean).join('\n');
  return callClaude(
    `Write 4 strong resume bullet points for a ${jobTitle || 'professional'} role${company ? ` at ${company}` : ''}.\n${context}\n\nRequirements:\n- Start each with a strong action verb (Led, Built, Achieved, Reduced, etc.)\n- Include quantified results where possible\n- Use present tense for current roles, past for previous\n- One bullet per line, no dashes or asterisks`,
  );
}

export async function generateSummary({ firstName, lastName, jobTitle, experience, skills }) {
  const expStr = experience?.slice(0, 2).map(e => `${e.position} at ${e.company}`).join(', ') || '';
  const skillStr = skills?.slice(0, 5).map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join(', ') || '';
  return callClaude(
    `Write a professional resume summary for ${firstName || 'a professional'} ${lastName || ''}, a ${jobTitle || 'professional'}.\nRecent experience: ${expStr || 'not specified'}\nKey skills: ${skillStr || 'not specified'}\n\nWrite 3 sentences maximum. Be specific and results-focused. Do not use first person (I/my).`,
  );
}

export async function improveBulletPoint(bulletText) {
  return callClaude(
    `Rewrite this resume bullet point to be stronger, more achievement-focused, and include measurable impact where reasonable:\n\n"${bulletText}"\n\nReturn only the improved bullet point text. Start with a strong action verb.`,
  );
}

export async function tailorResumeToJob({ resumeText, jobDescription }) {
  return callClaude(
    `I have this resume summary:\n${resumeText}\n\nAnd this job description:\n${jobDescription}\n\nIdentify:\n1. TOP 5 keywords from the job description missing in my resume\n2. 3 specific improvements to make my resume match this job better\n3. A tailored 3-sentence professional summary for this job\n\nFormat your response clearly with these 3 sections.`,
    'You are an expert ATS optimization specialist and resume coach.',
  );
}

export async function getSuggestionsByJobTitle(jobTitle) {
  return callClaude(
    `List 6 strong resume bullet points for a ${jobTitle} role. These should be templates with placeholders like [X%] or [team size].\n\nReturn only the 6 bullet points, one per line, starting with action verbs. No numbers, no dashes at the start.`,
  );
}

export async function evaluateInterviewAnswer({ question, answer, category }) {
  return callClaude(
    `You are an expert interview coach. Evaluate this interview answer using the STAR method.

Question: "${question}"
Category: ${category}
Answer: "${answer}"

Give feedback in exactly this format:
SCORE: [X/10]
STRENGTHS: [1-2 specific things done well]
IMPROVE: [1-2 specific, actionable improvements]
STAR_CHECK: [Which STAR elements are present and which are missing]
REWRITE_TIP: [One sentence showing how to open the answer more powerfully]

Be direct and specific. Keep each section to 1-2 sentences.`,
    'You are a senior interview coach who gives honest, actionable feedback.',
  );
}

export async function generateCoverLetter({ senderName, senderJobTitle, recipientName, recipientCompany, recipientJobTitle, subject }) {
  return callClaude(
    `Write a professional cover letter body for:
Applicant: ${senderName || 'the applicant'}, ${senderJobTitle || 'professional'}
Applying to: ${recipientJobTitle || subject || 'the position'} at ${recipientCompany || 'the company'}
Hiring contact: ${recipientName || 'the Hiring Manager'}

Requirements:
- 3 paragraphs: opening (enthusiasm + fit), middle (2-3 key strengths/achievements), closing (call to action)
- Professional yet warm tone
- No placeholder brackets — write complete, convincing sentences
- Do NOT include salutation/greeting or sign-off — only the body paragraphs
- 200-280 words`,
    'You are an expert cover letter writer. Write compelling, human cover letters that stand out.',
  );
}

export async function parseResumeFromText(rawText) {
  const text = await callClaude(
    `Extract structured resume data from the raw text below (pulled from an uploaded PDF/DOCX resume) and return ONLY a single JSON object — no markdown fences, no commentary.

Raw resume text:
"""
${rawText.slice(0, 12000)}
"""

Return JSON with exactly this shape (omit a field or leave it as an empty string/array if not found — never invent data):
{
  "personalInfo": { "firstName": "", "lastName": "", "jobTitle": "", "email": "", "phone": "", "city": "", "country": "", "linkedin": "", "website": "" },
  "summary": "",
  "experience": [{ "title": "", "company": "", "city": "", "startDate": "", "endDate": "", "current": false, "description": "" }],
  "education": [{ "school": "", "degree": "", "field": "", "gradYear": "", "city": "" }],
  "skills": [{ "name": "" }],
  "certifications": [""],
  "languages": [""]
}`,
    'You are a precise resume-parsing engine. Extract only what is actually present in the text. Output strict, valid JSON only.',
    2000,
  );
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI did not return JSON');
  return JSON.parse(jsonMatch[0]);
}
