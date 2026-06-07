import { Mail, Phone, MapPin, Globe, Link2, Terminal } from 'lucide-react';
import { getTranslations } from '../../../utils/resumeTranslations';

const DEFAULT_ACCENT = '#0f172a';

const sName = (s) => (typeof s === 'string' ? s : s?.name ?? '');
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const langPct = (level = '') => {
  const map = { 'Superior/Native': 95, 'Highly Proficient': 80, 'Very Good': 70, 'Good Working': 55, 'Working Knowledge': 40 };
  return map[level] ?? 65;
};

const skillLvlPct = (level = '') => {
  const map = { 'Expert': 95, 'Experienced': 78, 'Skillful': 62, 'Beginner': 40, 'Novice': 25 };
  return map[level] ?? 70;
};

export default function TechTemplate({ resume }) {
  const {
    personalInfo: p = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    certifications = [],
    languages = [],
  } = resume;

  const accent = resume.accentColor || DEFAULT_ACCENT;
  const t = getTranslations(resume.language || 'en');
  const green = '#10b981';
  const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();

  return (
    <div className="bg-white w-full min-h-full flex" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '9px', lineHeight: '1.5', color: '#1a1a1a' }}>
      {/* Left Sidebar */}
      <div className="w-[220px] flex-shrink-0 py-8 px-5" style={{ backgroundColor: accent, color: 'white' }}>
        {/* Name */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-1">
            <Terminal className="w-3 h-3 opacity-60" />
            <span className="text-[7px] opacity-50 tracking-widest">whoami</span>
          </div>
          <h1 className="text-[16px] font-bold leading-tight text-white mb-0.5">
            {fullName || 'Your Name'}
          </h1>
          {p.jobTitle && (
            <p className="text-[9px] opacity-70" style={{ color: green }}>{p.jobTitle}</p>
          )}
        </div>

        {/* Contact */}
        <div className="mb-6 space-y-1.5">
          <p className="text-[7px] opacity-50 tracking-widest mb-2">// contact</p>
          {p.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-2.5 h-2.5 opacity-50" />
              <span className="text-[8px] opacity-80 break-all">{p.email}</span>
            </div>
          )}
          {p.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-2.5 h-2.5 opacity-50" />
              <span className="text-[8px] opacity-80">{p.phone}</span>
            </div>
          )}
          {(p.city || p.country) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-2.5 h-2.5 opacity-50" />
              <span className="text-[8px] opacity-80">{[p.city, p.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          {p.linkedin && (
            <div className="flex items-center gap-1.5">
              <Link2 className="w-2.5 h-2.5 opacity-50" />
              <span className="text-[8px] opacity-80 break-all">{p.linkedin}</span>
            </div>
          )}
          {p.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-2.5 h-2.5 opacity-50" />
              <span className="text-[8px] opacity-80 break-all">{p.website}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <p className="text-[7px] opacity-50 tracking-widest mb-3">// skills</p>
            <div className="space-y-2">
              {skills.slice(0, 10).map((skill, i) => {
                const name = sName(skill);
                const level = typeof skill === 'object' ? skill?.level : '';
                const pct = skillLvlPct(level);
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[8px] opacity-80">{name}</span>
                      {level && <span className="text-[7px] opacity-40">{level}</span>}
                    </div>
                    <div className="h-1 bg-white opacity-10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: green }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mb-6">
            <p className="text-[7px] opacity-50 tracking-widest mb-3">// languages</p>
            {languages.map((lang, i) => {
              const name = typeof lang === 'string' ? lang : lang?.name || '';
              const level = typeof lang === 'object' ? lang?.level || '' : '';
              const pct = langPct(level);
              return (
                <div key={i} className="mb-2">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[8px] opacity-80">{name}</span>
                    <span className="text-[7px] opacity-40">{level}</span>
                  </div>
                  <div className="h-1 bg-white opacity-10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: green }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Education sidebar */}
        {education.length > 0 && (
          <div>
            <p className="text-[7px] opacity-50 tracking-widest mb-3">// education</p>
            {education.map((edu, i) => {
              const dates = [edu.startDate, edu.current ? t.present : edu.endDate].filter(Boolean).join('–');
              return (
                <div key={i} className="mb-3">
                  <p className="text-[8.5px] font-bold text-white opacity-90">{edu.degree}</p>
                  <p className="text-[8px] opacity-60">{edu.school}</p>
                  {dates && <p className="text-[7px] opacity-40">{dates}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Main */}
      <div className="flex-1 py-8 px-7">
        {/* Summary */}
        {summary && (
          <div className="mb-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: accent }}>About</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <p className="text-[9px] text-gray-600 leading-relaxed">{stripHtml(summary)}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: accent }}>{t.experience}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="space-y-5">
              {experience.map((exp, i) => {
                const dates = [exp.startDate, exp.current ? t.present : exp.endDate].filter(Boolean).join(' → ');
                const desc = stripHtml(exp.description || '');
                return (
                  <div key={i} className="relative pl-3 border-l-2" style={{ borderColor: `${accent}20` }}>
                    <div
                      className="absolute -left-[5px] top-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="font-bold text-[10px]" style={{ color: accent }}>{exp.position}</p>
                      {dates && <span className="text-[7.5px] text-gray-400 ml-2 whitespace-nowrap">{dates}</span>}
                    </div>
                    <p className="text-[8.5px] text-gray-500 mb-1.5">{exp.company}</p>
                    {desc && (
                      <ul className="space-y-0.5">
                        {desc.split('\n').filter(l => l.trim()).map((line, j) => (
                          <li key={j} className="text-[8.5px] text-gray-600 flex gap-1.5">
                            <span style={{ color: '#10b981' }} className="flex-shrink-0 mt-0.5">›</span>
                            {line}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: accent }}>{t.certifications}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="space-y-1.5">
              {certifications.map((cert, i) => {
                const name = typeof cert === 'string' ? cert : cert?.name || '';
                const issuer = typeof cert === 'object' ? cert?.issuer || '' : '';
                const date = typeof cert === 'object' ? cert?.date || '' : '';
                return (
                  <div key={i} className="flex justify-between text-[8.5px]">
                    <div>
                      <span className="font-medium text-gray-800">{name}</span>
                      {issuer && <span className="text-gray-400"> — {issuer}</span>}
                    </div>
                    {date && <span className="text-gray-400 text-[8px]">{date}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
