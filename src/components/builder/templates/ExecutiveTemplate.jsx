import { Mail, Phone, MapPin, Globe, Link2 } from 'lucide-react';
import { getTranslations } from '../../../utils/resumeTranslations';

const DEFAULT_ACCENT = '#1a1a2e';

const sName = (s) => (typeof s === 'string' ? s : s?.name ?? '');
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function SectionTitle({ title, accent }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1" style={{ backgroundColor: accent, opacity: 0.3 }} />
      <h2 className="text-[8.5px] font-black uppercase tracking-[3px]" style={{ color: accent }}>
        {title}
      </h2>
      <div className="h-px flex-1" style={{ backgroundColor: accent, opacity: 0.3 }} />
    </div>
  );
}

export default function ExecutiveTemplate({ resume }) {
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
  const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
  const contactItems = [
    p.email && { icon: Mail, label: p.email },
    p.phone && { icon: Phone, label: p.phone },
    (p.city || p.country) && { icon: MapPin, label: [p.city, p.country].filter(Boolean).join(', ') },
    p.website && { icon: Globe, label: p.website },
    p.linkedin && { icon: Link2, label: p.linkedin },
  ].filter(Boolean);

  return (
    <div className="bg-white w-full min-h-full" style={{ fontFamily: 'Georgia, serif', fontSize: '9.5px', lineHeight: '1.5', color: '#1a1a1a' }}>
      {/* Header */}
      <div className="px-12 pt-10 pb-6 text-center" style={{ backgroundColor: accent }}>
        <h1 className="text-[30px] font-bold tracking-[2px] text-white uppercase mb-1">
          {fullName || 'Your Name'}
        </h1>
        {p.jobTitle && (
          <p className="text-[11px] tracking-[4px] uppercase text-white opacity-80 mb-5">{p.jobTitle}</p>
        )}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            {contactItems.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-1 text-[8px] text-white opacity-75">
                <Icon className="w-2.5 h-2.5" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-12 py-8">
        {/* Summary */}
        {summary && (
          <div className="mb-7">
            <SectionTitle title={t.summary} accent={accent} />
            <p className="text-[9.5px] leading-relaxed text-gray-700 text-center italic px-4">
              {stripHtml(summary)}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-7">
            <SectionTitle title={t.experience} accent={accent} />
            <div className="space-y-5">
              {experience.map((exp, i) => {
                const dates = [exp.startDate, exp.current ? t.present : exp.endDate].filter(Boolean).join(' – ');
                const desc = stripHtml(exp.description || '');
                return (
                  <div key={i}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-bold text-[10px] uppercase tracking-wide" style={{ color: accent }}>
                          {exp.position}
                        </p>
                        <p className="text-[9px] text-gray-600 font-semibold">{exp.company}</p>
                      </div>
                      {dates && (
                        <span className="text-[8px] text-gray-500 italic whitespace-nowrap ml-4">{dates}</span>
                      )}
                    </div>
                    {desc && (
                      <div className="mt-1.5 text-[9px] text-gray-700 leading-relaxed">
                        {desc.split(/\n/).map((line, j) => (
                          <p key={j} className="flex gap-2">
                            {line.trim() && <span style={{ color: accent }} className="mt-1 flex-shrink-0">▸</span>}
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Two-column bottom */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left: Education + Certifications */}
          <div>
            {education.length > 0 && (
              <div className="mb-6">
                <SectionTitle title={t.education} accent={accent} />
                {education.map((edu, i) => {
                  const dates = [edu.startDate, edu.current ? t.present : edu.endDate].filter(Boolean).join(' – ');
                  return (
                    <div key={i} className="mb-3">
                      <p className="font-bold text-[9.5px]" style={{ color: accent }}>{edu.degree}</p>
                      <p className="text-[9px] text-gray-600">{edu.school}</p>
                      {edu.field && <p className="text-[8.5px] text-gray-500 italic">{edu.field}</p>}
                      {dates && <p className="text-[8px] text-gray-400">{dates}</p>}
                    </div>
                  );
                })}
              </div>
            )}
            {certifications.length > 0 && (
              <div>
                <SectionTitle title={t.certifications} accent={accent} />
                {certifications.map((cert, i) => {
                  const name = typeof cert === 'string' ? cert : cert?.name || '';
                  const issuer = typeof cert === 'object' ? cert?.issuer || '' : '';
                  return (
                    <div key={i} className="mb-2">
                      <p className="text-[9px] font-semibold text-gray-800">{name}</p>
                      {issuer && <p className="text-[8px] text-gray-500">{issuer}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Skills + Languages */}
          <div>
            {skills.length > 0 && (
              <div className="mb-6">
                <SectionTitle title="Core Competencies" accent={accent} />
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[8px] px-2 py-0.5 rounded-sm font-medium"
                      style={{ backgroundColor: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
                    >
                      {sName(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <SectionTitle title={t.languages} accent={accent} />
                {languages.map((lang, i) => {
                  const name = typeof lang === 'string' ? lang : lang?.name || '';
                  const level = typeof lang === 'object' ? lang?.level || '' : '';
                  return (
                    <div key={i} className="flex justify-between text-[9px] mb-1">
                      <span className="text-gray-700 font-medium">{name}</span>
                      {level && <span className="text-gray-400 italic">{level}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
