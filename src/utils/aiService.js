const AI_KEY_STORAGE = 'resume_builder_ai_key';

export function getStoredAIKey() {
  return localStorage.getItem(AI_KEY_STORAGE) || '';
}

export function saveAIKey(key) {
  localStorage.setItem(AI_KEY_STORAGE, key);
}

export function clearAIKey() {
  localStorage.removeItem(AI_KEY_STORAGE);
}

async function callClaude(prompt, systemPrompt = '') {
  const key = getStoredAIKey();
  if (!key) throw new Error('NO_KEY');

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
      max_tokens: 600,
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
