import { Mail, Phone, MapPin, Globe, Link2 } from 'lucide-react';
import { getTranslations } from '../../../utils/resumeTranslations';
import { DEFAULT_SECTION_ORDER } from '../../../utils/sectionOrder';

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
    projects = [], volunteer = [], awards = [], hobbies = '', courses = [],
    references = [], internships = [], publications = [], customSection,
  } = resume;

  const accent = resume.accentColor || DEFAULT_ACCENT;
  const t = getTranslations(resume.language || 'en');
  const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
  const order = resume.sectionOrder || DEFAULT_SECTION_ORDER;
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
        {(() => {
          const mainFlowSections = {
            summary: summary && (
              <div key="summary" className="mb-7">
                <SectionTitle title={t.summary} accent={accent} />
                <p className="text-[9.5px] leading-relaxed text-gray-700 text-center italic px-4">
                  {stripHtml(summary)}
                </p>
              </div>
            ),
            experience: experience.length > 0 && (
              <div key="experience" className="mb-7">
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
                              {exp.title}
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
            ),
          };
          // Only summary/experience share this full-width flow — education,
          // skills, languages etc. live in the fixed two-column grid below
          // and aren't part of the reorderable list for this template.
          return order.filter((k) => mainFlowSections[k]).map((k) => mainFlowSections[k]);
        })()}

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

        {projects.length > 0 && (
          <div className="mt-7">
            <SectionTitle title={t.projects} accent={accent} />
            <div className="space-y-3">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-[9.5px]" style={{ color: accent }}>{proj.name}</p>
                    {proj.year && <span className="text-[8px] text-gray-500 italic whitespace-nowrap ml-4">{proj.year}</span>}
                  </div>
                  {proj.url && <p className="text-[8.5px] text-gray-500">{proj.url}</p>}
                  {proj.description && <p className="text-[9px] text-gray-700 leading-relaxed mt-0.5">{proj.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {volunteer.length > 0 && (
          <div className="mt-7">
            <SectionTitle title={t.volunteer} accent={accent} />
            <div className="space-y-3">
              {volunteer.map((v, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-[9.5px]" style={{ color: accent }}>{[v.role, v.organization].filter(Boolean).join(' · ')}</p>
                    <span className="text-[8px] text-gray-500 italic whitespace-nowrap ml-4">{[v.startDate, v.endDate].filter(Boolean).join(' – ')}</span>
                  </div>
                  {v.description && <p className="text-[9px] text-gray-700 leading-relaxed mt-0.5">{v.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {awards.length > 0 && (
          <div className="mt-7">
            <SectionTitle title={t.awards} accent={accent} />
            <div className="space-y-2">
              {awards.map((a, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-[9.5px]" style={{ color: accent }}>{a.title}</p>
                    {a.year && <span className="text-[8px] text-gray-500 italic whitespace-nowrap ml-4">{a.year}</span>}
                  </div>
                  {a.issuer && <p className="text-[8.5px] text-gray-500">{a.issuer}</p>}
                  {a.description && <p className="text-[9px] text-gray-700 leading-relaxed mt-0.5">{a.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {internships.length > 0 && (
          <div className="mt-7">
            <SectionTitle title={t.internships} accent={accent} />
            <div className="space-y-2">
              {internships.map((it, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[9.5px]" style={{ color: accent }}>{it.title}</p>
                    <p className="text-[9px] text-gray-600 font-semibold">{it.company}</p>
                  </div>
                  <span className="text-[8px] text-gray-500 italic whitespace-nowrap ml-4">{[it.startDate, it.endDate].filter(Boolean).join(' – ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {publications.length > 0 && (
          <div className="mt-7">
            <SectionTitle title={t.publications} accent={accent} />
            <div className="space-y-2">
              {publications.map((pub, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[9.5px]" style={{ color: accent }}>{pub.title}</p>
                    {pub.publisher && <p className="text-[8.5px] text-gray-500">{pub.publisher}</p>}
                  </div>
                  {pub.year && <span className="text-[8px] text-gray-500 italic whitespace-nowrap ml-4">{pub.year}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {courses.length > 0 && (
          <div className="mt-7">
            <SectionTitle title={t.courses} accent={accent} />
            <div className="space-y-2">
              {courses.map((c, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[9.5px]" style={{ color: accent }}>{c.name}</p>
                    {c.institution && <p className="text-[8.5px] text-gray-500">{c.institution}</p>}
                  </div>
                  {c.year && <span className="text-[8px] text-gray-500 italic whitespace-nowrap ml-4">{c.year}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {references.length > 0 && (
          <div className="mt-7">
            <SectionTitle title={t.references} accent={accent} />
            <div className="space-y-2">
              {references.map((ref, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[9.5px]" style={{ color: accent }}>{ref.name}</p>
                    {ref.company && <p className="text-[8.5px] text-gray-500">{ref.company}</p>}
                  </div>
                  {ref.contact && <span className="text-[8px] text-gray-500 italic whitespace-nowrap ml-4">{ref.contact}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {hobbies && (
          <div className="mt-7">
            <SectionTitle title={t.hobbies} accent={accent} />
            <p className="text-[9px] text-gray-700 leading-relaxed">{hobbies}</p>
          </div>
        )}

        {customSection?.content && (
          <div className="mt-7">
            <SectionTitle title={customSection.title || t.custom} accent={accent} />
            <p className="text-[9px] text-gray-700 leading-relaxed whitespace-pre-line">{customSection.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}
