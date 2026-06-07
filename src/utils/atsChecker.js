const sName = (s) => (typeof s === 'string' ? s : s?.name ?? '');
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const ACTION_VERBS = [
  'achieved', 'led', 'managed', 'developed', 'created', 'built', 'designed', 'implemented',
  'launched', 'improved', 'increased', 'reduced', 'delivered', 'collaborated', 'optimized',
  'automated', 'streamlined', 'coordinated', 'analyzed', 'executed', 'spearheaded', 'drove',
  'generated', 'established', 'transformed', 'deployed', 'scaled', 'migrated', 'mentored',
];

const METRIC_PATTERN = /\b\d+[%x]|\$\d+|\d+\+|\d+k|\d+ (users|clients|team|employees|projects|hours|days|months|million|billion)/i;

export function getATSScore(resume) {
  const issues = [];
  const passing = [];
  let score = 0;

  const p = resume.personalInfo || {};

  // 1. Contact info (15 pts)
  if (p.email) { score += 5; passing.push('Email address included'); }
  else issues.push('Missing email address — required by all ATS systems');

  if (p.phone) { score += 5; passing.push('Phone number included'); }
  else issues.push('Missing phone number');

  if (p.city || p.country) { score += 5; passing.push('Location included'); }
  else issues.push('Missing location (city/country)');

  // 2. Job title (5 pts)
  if (p.jobTitle) { score += 5; passing.push('Professional title is set'); }
  else issues.push('Missing professional title/job title in personal info');

  // 3. Professional summary (10 pts)
  const summary = stripHtml(resume.summary || '');
  if (summary.length > 100) { score += 10; passing.push('Professional summary is present and detailed'); }
  else if (summary.length > 0) { score += 5; issues.push('Professional summary is too short — aim for 2–4 sentences'); }
  else issues.push('Missing professional summary — ATS systems rank resumes without summaries lower');

  // 4. Work experience (20 pts)
  const exp = resume.experience || [];
  if (exp.length >= 2) { score += 10; passing.push('Multiple work experience entries'); }
  else if (exp.length === 1) { score += 5; issues.push('Only one work experience entry — add more if applicable'); }
  else issues.push('No work experience added');

  // Check bullet points / descriptions
  const expWithDesc = exp.filter(e => stripHtml(e.description || '').length > 30);
  if (expWithDesc.length === exp.length && exp.length > 0) {
    score += 10;
    passing.push('All experience entries have detailed descriptions');
  } else if (expWithDesc.length > 0) {
    score += 5;
    issues.push(`${exp.length - expWithDesc.length} experience entry/entries have no description`);
  } else if (exp.length > 0) {
    issues.push('Add descriptions to your work experience entries');
  }

  // 5. Action verbs (10 pts)
  const allText = exp.map(e => stripHtml(e.description || '')).join(' ').toLowerCase();
  const foundVerbs = ACTION_VERBS.filter(v => allText.includes(v));
  if (foundVerbs.length >= 5) { score += 10; passing.push(`Strong action verbs used (${foundVerbs.slice(0, 3).join(', ')}...)`); }
  else if (foundVerbs.length >= 2) { score += 5; issues.push('Use more action verbs: achieved, led, implemented, reduced, etc.'); }
  else issues.push('No action verbs detected — start bullet points with power verbs (achieved, built, led...)');

  // 6. Quantified achievements (10 pts)
  const hasMetrics = METRIC_PATTERN.test(allText);
  if (hasMetrics) { score += 10; passing.push('Quantified achievements detected (numbers/percentages)'); }
  else issues.push('Add measurable results — e.g., "increased sales by 25%" or "managed team of 8"');

  // 7. Skills section (10 pts)
  const skills = resume.skills || [];
  if (skills.length >= 6) { score += 10; passing.push(`${skills.length} skills listed`); }
  else if (skills.length >= 3) { score += 5; issues.push('Add more skills — aim for at least 6–10 relevant skills'); }
  else issues.push('Skills section is empty or has very few entries — ATS matches on keyword skills');

  // 8. Education (10 pts)
  const edu = resume.education || [];
  if (edu.length > 0 && edu[0].degree) { score += 10; passing.push('Education section is complete'); }
  else if (edu.length > 0) { score += 5; issues.push('Add degree/field of study to your education entry'); }
  else issues.push('Education section is empty');

  // 9. LinkedIn (5 pts)
  if (p.linkedin) { score += 5; passing.push('LinkedIn profile URL included'); }
  else issues.push('Add your LinkedIn URL — recruiters always check');

  // 10. Name is present (5 pts)
  if (p.firstName && p.lastName) { score += 5; passing.push('Full name present'); }
  else issues.push('Add your full name in personal info');

  // Clamp
  score = Math.min(100, Math.max(0, score));
  const label =
    score >= 85 ? 'Excellent — ATS Ready' :
    score >= 70 ? 'Good — Minor improvements needed' :
    score >= 50 ? 'Fair — Several issues to fix' :
    'Needs Work — Major gaps found';

  return { score, label, issues, passing };
}
