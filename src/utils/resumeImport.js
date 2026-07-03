import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { getStoredAIKey, parseResumeFromText } from './aiService';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // pdf.js gives one item per text run, not per line — rebuild line breaks from
    // each item's layout position so downstream line-based parsing (name, sections) works.
    let lastY = null;
    for (const item of content.items) {
      const y = item.transform?.[5];
      if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 1) text += '\n';
      else if (text && !text.endsWith('\n') && !text.endsWith(' ')) text += ' ';
      text += item.str;
      if (y !== undefined) lastY = y;
    }
    text += '\n';
  }
  return text.trim();
}

async function extractTextFromDocx(file) {
  const buffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
  return value.trim();
}

export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  let text = '';
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    text = await extractTextFromPdf(file);
  } else if (name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
    text = await extractTextFromDocx(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }
  if (!text || text.length < 20) {
    throw new Error('Could not find readable text in this file. It may be a scanned image — try a text-based PDF or DOCX instead.');
  }
  return text;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?/i;
// Requires an explicit protocol or "www." — a bare "word.word" pattern (e.g. "B.Tech", "Inc.")
// is far more often an abbreviation or sentence fragment than a real personal website.
const WEBSITE_RE = /(?:https?:\/\/[^\s]+|www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g;
const YEAR_LINE_RE = /^(19|20)\d{2}$/;
const MONTH = '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?';
const DATE_RANGE_RE = new RegExp(`^(${MONTH}\\s+\\d{4}|\\d{4})\\s*[-–—]\\s*(Present|Current|${MONTH}\\s+\\d{4}|\\d{4})\\s*$`, 'i');
const LOCATION_LINE_RE = /^[A-Za-z .]+,\s*[A-Za-z .]+,?\s*\d{4,6}?,?\s*[A-Za-z ]*$/;

// Section header keywords, mapped to a canonical bucket. Real resume PDFs (especially
// multi-column/template ones) almost always render these as their own standalone line.
const SECTION_HEADERS = {
  summary: ['about me', 'about', 'summary', 'professional summary', 'profile', 'objective'],
  education: ['education'],
  skills: ['skills', 'technical skills', 'core competencies', 'key skills'],
  experience: ['work experience', 'experience', 'professional experience', 'employment history'],
  certifications: ['certifications', 'certificates'],
  languages: ['languages'],
  ignore: ['links', 'contact', 'contact me', 'references', 'hobbies', 'interests'],
};
const ALL_HEADER_KEYWORDS = new Set(Object.values(SECTION_HEADERS).flat());

function matchSectionHeader(line) {
  const norm = line.trim().toLowerCase().replace(/[:.]+$/, '');
  if (norm.length > 30) return null;
  for (const [bucket, keywords] of Object.entries(SECTION_HEADERS)) {
    if (keywords.includes(norm)) return bucket;
  }
  return null;
}

function deriveNameFromLinkedin(linkedin) {
  const m = linkedin.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
  if (!m) return null;
  let parts = m[1].replace(/\/$/, '').split('-').filter(Boolean);
  // Drop a trailing auto-generated id token (e.g. "a12489119") that LinkedIn appends to slugs.
  if (parts.length > 1 && /\d/.test(parts[parts.length - 1]) && parts[parts.length - 1].length >= 5) {
    parts = parts.slice(0, -1);
  }
  if (!parts.length) return null;
  const cased = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
  return { firstName: cased[0] || '', lastName: cased.slice(1).join(' ') || '' };
}

// Multi-line format: a school/city header (lines ending in "/") followed by a standalone
// year line, then description lines — what multi-column template PDFs tend to produce.
function parseEducationMultiLine(lines) {
  const entries = [];
  let headerBuffer = [];
  let current = null;
  const flush = () => { if (current) entries.push(current); current = null; };
  for (const line of lines) {
    const yearMatch = line.match(YEAR_LINE_RE);
    if (yearMatch) {
      flush();
      current = {
        school: (headerBuffer[0] || '').replace(/\/$/, '').trim(),
        city: (headerBuffer[1] || '').replace(/\/$/, '').trim(),
        gradYear: yearMatch[0],
        field: '',
        description: '',
      };
      headerBuffer = [];
    } else if (line.endsWith('/')) {
      if (current) { flush(); }
      headerBuffer.push(line);
    } else if (current) {
      current.description = current.description ? `${current.description} ${line}` : line;
    }
  }
  flush();
  return entries;
}

// Single-line format: "School — Degree — Year" all on one line, one entry per line — the
// more common format for simpler single-column resumes.
function parseEducationSingleLine(lines) {
  return lines.filter(Boolean).map((line) => {
    const yearMatch = line.match(/(19|20)\d{2}/);
    const parts = line.split(/\s*[—–-]\s*|,\s*/).map((s) => s.trim()).filter(Boolean);
    return {
      school: parts[0] || line,
      city: '',
      gradYear: yearMatch ? yearMatch[0] : '',
      field: '',
      description: parts.slice(1).filter((p) => !/^(19|20)\d{2}$/.test(p)).join(', '),
    };
  });
}

function parseEducationSection(lines) {
  if (!lines.length) return [];
  const hasStandaloneYear = lines.some((l) => YEAR_LINE_RE.test(l));
  return hasStandaloneYear ? parseEducationMultiLine(lines) : parseEducationSingleLine(lines);
}

// Multi-entry format: a standalone date-range line (e.g. "Aug 2025 - Present") marks the
// start of each job — common in multi-column template PDFs where dates get their own line.
function parseExperienceMultiLine(lines) {
  const entries = [];
  let current = null;
  const flush = () => { if (current) entries.push(current); current = null; };
  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_RE);
    if (dateMatch) {
      flush();
      const parts = line.split(/[-–—]/).map((s) => s.trim());
      current = {
        title: '',
        company: '',
        startDate: parts[0] || '',
        endDate: /present|current/i.test(parts[1] || '') ? '' : (parts[1] || ''),
        current: /present|current/i.test(parts[1] || ''),
        description: '',
      };
      continue;
    }
    if (!current) continue; // skip stray lines before the first recognized entry
    const clientMatch = line.match(/^Client:\s*(.+)/i);
    if (clientMatch && !current.company) {
      current.company = clientMatch[1].replace(/\(.*\)$/, '').trim();
    }
    current.description = current.description ? `${current.description}\n${line}` : line;
  }
  flush();
  return entries;
}

// Single-entry fallback: no standalone date-range line found, meaning dates are most likely
// inline with the title/company (e.g. "Principal Engineer, Acme — 2015 to Present"). Rather
// than dropping the section, keep everything visible as one editable entry.
function parseExperienceSingleEntry(lines) {
  if (!lines.length) return [];
  const inlineDateRe = new RegExp(`(${MONTH}\\s+\\d{4}|\\d{4})\\s*(?:to|[-–—])\\s*(Present|Current|${MONTH}\\s+\\d{4}|\\d{4})`, 'i');
  const dateMatch = lines.join(' ').match(inlineDateRe);
  const firstLine = lines[0];
  const [titlePart = '', companyPart = ''] = firstLine.split(/\s*[—–-]\s*/)[0].split(/,\s*/);
  return [{
    title: titlePart.trim(),
    company: companyPart.trim(),
    startDate: dateMatch ? dateMatch[1] : '',
    endDate: dateMatch && !/present|current/i.test(dateMatch[2]) ? dateMatch[2] : '',
    current: dateMatch ? /present|current/i.test(dateMatch[2]) : false,
    description: lines.join('\n'),
  }];
}

function parseExperienceSection(lines) {
  if (!lines.length) return [];
  const hasStandaloneDate = lines.some((l) => DATE_RANGE_RE.test(l));
  return hasStandaloneDate ? parseExperienceMultiLine(lines) : parseExperienceSingleEntry(lines);
}

// Some designed resume templates (Canva/Zety-style, multi-column) render the name/title/contact
// banner as a late layer in the PDF's content stream, so pdf.js extracts it *after* the body
// text instead of before. Detect that by checking whether the email/phone we already found sit
// near the very end of the document; if so, treat that tail as a separate header block instead
// of letting it pollute whichever section happens to run last.
function extractTrailingHeaderBlock(lines, email) {
  if (!email) return { headerLines: [], bodyLines: lines };
  const emailIdx = lines.findIndex((l) => l.includes(email));
  // Only treat this as a misplaced header if the doc is long enough that "near the end" is
  // actually unusual, and the email isn't already near the top (the normal, common case).
  const nearEnd = emailIdx !== -1 && lines.length - emailIdx <= 15;
  const notNearStart = emailIdx > 10;
  const longEnoughDoc = lines.length > 25;
  if (!nearEnd || !notNearStart || !longEnoughDoc) return { headerLines: [], bodyLines: lines };
  const start = Math.max(0, emailIdx - 6);
  return { headerLines: lines.slice(start), bodyLines: lines.slice(0, start) };
}

export function regexParseResume(rawText) {
  const allLines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  // Long URLs/emails often wrap mid-word at a hyphen in narrow sidebar columns
  // (e.g. "vikash-\nraj-12345/"). Rejoin those before matching so regexes don't truncate.
  const dehyphenated = rawText.replace(/-\n/g, '-');
  const email = dehyphenated.match(EMAIL_RE)?.[0] || '';
  const phone = dehyphenated.match(PHONE_RE)?.[0]?.trim() || '';
  const linkedin = dehyphenated.match(LINKEDIN_RE)?.[0] || '';

  let website = '';
  const urls = dehyphenated.match(WEBSITE_RE) || [];
  for (const url of urls) {
    if (!url.includes('linkedin.com') && !url.includes('trailblazer.me') && !(email && url.includes(email.split('@')[1]))) {
      website = url;
      break;
    }
  }

  const { headerLines, bodyLines: lines } = extractTrailingHeaderBlock(allLines, email);

  // Name: for a normal, simply-laid-out resume, an actual "First Last"-shaped line near the
  // top is the most reliable source. But once the layout was already unusual enough to need
  // the trailing-header-block heuristic above, a "name-shaped" line there is as likely to be
  // a wrapped job title as an actual name (and a real name can end up split across two
  // single-word lines, which this shape check can't recombine) — so trust the LinkedIn slug
  // first in that case and only fall back to line-guessing if there's no LinkedIn URL at all.
  let firstName = '', lastName = '';
  const linkedinName = linkedin ? deriveNameFromLinkedin(linkedin) : null;
  const findNameLine = (candidates) => candidates.find((l) => {
    const norm = l.toLowerCase().replace(/[:.]+$/, '');
    return /^[A-Za-z][A-Za-z.'-]*(\s+[A-Za-z][A-Za-z.'-]*){1,3}$/.test(l) && l.length < 60 && !ALL_HEADER_KEYWORDS.has(norm);
  });

  if (headerLines.length) {
    const source = linkedinName || (() => {
      const nl = findNameLine(headerLines);
      const [f = '', ...rest] = (nl || '').split(/\s+/);
      return nl ? { firstName: f, lastName: rest.join(' ') } : null;
    })();
    if (source) ({ firstName, lastName } = source);
  } else {
    const nameLine = findNameLine(lines.slice(0, 8));
    if (nameLine) {
      const [f = '', ...rest] = nameLine.split(/\s+/);
      firstName = f;
      lastName = rest.join(' ');
    } else if (linkedinName) ({ firstName, lastName } = linkedinName);
  }

  let city = '';
  const locationLine = headerLines.find((l) => LOCATION_LINE_RE.test(l) && /\d{4,6}/.test(l));
  if (locationLine) {
    const segments = locationLine.split(',').map((s) => s.trim()).filter(Boolean);
    city = segments.length >= 3 ? segments[1] : segments[0] || '';
  }

  // Section-aware split of the body so summary/skills/education/experience aren't all
  // dumped into one field — each recognized header starts a new bucket of lines.
  const buckets = { summary: [], education: [], skills: [], experience: [], certifications: [], languages: [] };
  let activeBucket = null;
  for (const line of lines) {
    const header = matchSectionHeader(line);
    if (header) { activeBucket = header === 'ignore' ? null : header; continue; }
    if (activeBucket) buckets[activeBucket].push(line);
  }

  const summary = buckets.summary.join(' ').replace(/\s+/g, ' ').trim().slice(0, 3000);

  const skills = [];
  for (const line of buckets.skills) {
    for (const part of line.split(/\s{2,}/)) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('(') && skills.length) {
        skills[skills.length - 1] += ` ${trimmed}`;
      } else {
        skills.push(trimmed);
      }
    }
  }

  return {
    personalInfo: { firstName, lastName, email, phone, city, linkedin, website },
    summary,
    education: parseEducationSection(buckets.education),
    experience: parseExperienceSection(buckets.experience),
    skills,
    certifications: buckets.certifications.slice(0, 20),
    languages: buckets.languages.slice(0, 10),
  };
}

export async function buildImportedResume(rawText) {
  const baseline = regexParseResume(rawText);
  const result = {
    personalInfo: { ...baseline.personalInfo },
    summary: baseline.summary,
    experience: baseline.experience.map((e, i) => ({ id: Date.now() + i, city: '', hideMonth: false, showDuration: false, ...e })),
    education: baseline.education.map((e, i) => ({ id: Date.now() + 1000 + i, gpa: '', ...e })),
    skills: baseline.skills.map((name, i) => ({ id: Date.now() + 2000 + i, name, level: 3 })),
    certifications: baseline.certifications,
    languages: baseline.languages,
  };

  if (!getStoredAIKey()) {
    return { resume: result, aiEnhanced: false };
  }

  try {
    const ai = await parseResumeFromText(rawText);
    return {
      resume: {
        personalInfo: { ...baseline.personalInfo, ...Object.fromEntries(Object.entries(ai.personalInfo || {}).filter(([, v]) => v)) },
        summary: ai.summary || baseline.summary,
        experience: (ai.experience || []).map((e, i) => ({ id: Date.now() + i, city: '', hideMonth: false, showDuration: false, ...e })),
        education: (ai.education || []).map((e, i) => ({ id: Date.now() + 1000 + i, city: '', gpa: '', description: '', ...e })),
        skills: (ai.skills || []).map((s, i) => ({ id: Date.now() + 2000 + i, level: 3, name: typeof s === 'string' ? s : s.name })),
        certifications: ai.certifications || [],
        languages: ai.languages || [],
      },
      aiEnhanced: true,
    };
  } catch {
    return { resume: result, aiEnhanced: false };
  }
}
