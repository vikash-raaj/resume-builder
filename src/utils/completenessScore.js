export function getCompletenessScore(resume) {
  let score = 0;
  const missing = [];

  const p = resume.personalInfo || {};

  // Personal info — 30 pts
  if (p.firstName) score += 4; else missing.push('First name');
  if (p.lastName) score += 4; else missing.push('Last name');
  if (p.email) score += 5; else missing.push('Email');
  if (p.phone) score += 4; else missing.push('Phone number');
  if (p.jobTitle) score += 5; else missing.push('Job title');
  if (p.city || p.address) score += 4; else missing.push('City / location');
  if (p.linkedin) score += 4; else missing.push('LinkedIn URL');

  // Summary — 15 pts
  const summaryText = (resume.summary || '').replace(/<[^>]*>/g, '').trim();
  const wordCount = summaryText ? summaryText.split(/\s+/).length : 0;
  if (wordCount >= 30) score += 15;
  else if (wordCount >= 10) score += 8;
  else missing.push('Professional summary (30+ words)');

  // Experience — 30 pts
  const exp = resume.experience || [];
  if (exp.length >= 1) score += 10; else missing.push('At least 1 work experience');
  if (exp.length >= 2) score += 5;
  const hasDesc = exp.some(e => (e.description || '').replace(/<[^>]*>/g, '').trim().length > 30);
  if (hasDesc) score += 10; else if (exp.length > 0) missing.push('Job descriptions with bullet points');
  if (exp.length >= 3) score += 5;

  // Education — 10 pts
  const edu = resume.education || [];
  if (edu.length >= 1) score += 10; else missing.push('Education entry');

  // Skills — 10 pts
  const skills = resume.skills || [];
  if (skills.length >= 5) score += 10;
  else if (skills.length >= 2) score += 5;
  else missing.push('At least 5 skills');

  // Photo — 5 pts
  if (p.photo) score += 5; else missing.push('Profile photo');

  const total = Math.min(score, 100);

  const label =
    total >= 90 ? 'Excellent' :
    total >= 75 ? 'Good' :
    total >= 50 ? 'Fair' :
    'Needs work';

  const color =
    total >= 75 ? 'emerald' :
    total >= 50 ? 'yellow' :
    'red';

  return { score: total, label, missing, color };
}
