import { MapPin, Phone, Mail } from 'lucide-react';
import { getTranslations } from '../../../utils/resumeTranslations';
import { DEFAULT_SECTION_ORDER } from '../../../utils/sectionOrder';

const DEFAULT_ACCENT = '#1e3a6e';

const sName = (s) => (typeof s === 'string' ? s : s?.name ?? '');

const langPct = (level = '') => {
  const map = {
    'Superior/Native': 95, 'Highly Proficient': 80, 'Very Good': 70,
    'Good Working': 55, 'Working Knowledge': 40,
    'C2': 95, 'C1': 80, 'B2': 65, 'B1': 50, 'A2': 35, 'A1': 20,
  };
  return map[level] ?? 60;
};

function SectionTitle({ title, accent }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="font-bold text-[10px]" style={{ color: accent }}>+</span>
        <h2 className="text-[9px] font-black uppercase tracking-widest" style={{ color: accent }}>
          {title}
        </h2>
      </div>
      <div className="h-[1.5px]" style={{ backgroundColor: accent }} />
    </div>
  );
}

function Dot({ accent }) {
  return (
    <div
      className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0"
      style={{ backgroundColor: accent }}
    />
  );
}

export default function RigaTemplate({ resume }) {
  const {
    personalInfo: p = {},
    summary = '',
    experience = [],
    education = [],
    skills = [],
    certifications = [],
    languages = [],
    personalDetails = {},
    projects = [], volunteer = [], awards = [], hobbies = '', courses = [],
    references = [], internships = [], publications = [], customSection,
  } = resume;

  const accent = resume.accentColor || DEFAULT_ACCENT;
  const t = getTranslations(resume.language || 'en');
  const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
  const address = [p.address, p.city, p.country].filter(Boolean).join(', ');
  const order = resume.sectionOrder || DEFAULT_SECTION_ORDER;

  return (
    <div className="bg-white w-full min-h-full" style={{ fontFamily: 'Georgia, serif', fontSize: '9.5px', lineHeight: '1.45' }}>

      {/* ── HEADER ── */}
      <div className="px-8 pt-7 pb-5" style={{ borderBottom: `3px solid ${accent}` }}>
        <div className="flex justify-between items-start gap-4">
          {/* Name + title */}
          <div>
            <h1
              className="font-black uppercase leading-none tracking-wide"
              style={{ color: accent, fontSize: '28px', letterSpacing: '0.02em' }}
            >
              {fullName || 'Your Name'}
            </h1>
            {p.jobTitle && (
              <p className="text-gray-500 mt-1" style={{ fontSize: '11px' }}>
                {p.jobTitle}
              </p>
            )}
          </div>

          {/* Contact */}
          <div className="text-right space-y-1.5 flex-shrink-0" style={{ fontSize: '8.5px' }}>
            {address && (
              <div className="flex items-center justify-end gap-1.5 text-gray-600">
                <span>{address}</span>
                <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
              </div>
            )}
            {p.phone && (
              <div className="flex items-center justify-end gap-1.5 text-gray-600">
                <span>{p.phone}</span>
                <Phone className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
              </div>
            )}
            {p.email && (
              <div className="flex items-center justify-end gap-1.5 text-gray-600">
                <span>{p.email}</span>
                <Mail className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex">

        {/* ── LEFT COLUMN ── */}
        <div
          className="flex-shrink-0 px-5 py-5 space-y-5"
          style={{ width: '37%', borderRight: `1.5px solid ${accent}30` }}
        >
          {/* Photo */}
          {p.photo && (
            <div className="flex justify-center mb-1">
              <img
                src={p.photo}
                alt="Profile"
                className="rounded-full object-cover"
                style={{
                  width: '108px', height: '108px',
                  border: `2.5px solid ${accent}`,
                }}
              />
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <SectionTitle title={t.education} accent={accent} />
              <div className="space-y-3">
                {education.map((edu, i) => (
                  <div key={i} className="flex gap-2">
                    <Dot accent={accent} />
                    <div>
                      <p className="font-bold uppercase" style={{ color: accent, fontSize: '8px', letterSpacing: '0.04em' }}>
                        {edu.degree}{edu.gradYear ? ` | ${edu.gradYear}` : ''}
                      </p>
                      <p className="text-gray-600" style={{ fontSize: '8px' }}>
                        {[edu.field, edu.school, edu.city].filter(Boolean).join(' | ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <SectionTitle title={t.skills} accent={accent} />
              <div className="space-y-0.5">
                {skills.map((s, i) => (
                  <p key={i} className="text-gray-700" style={{ fontSize: '8.5px' }}>
                    {sName(s)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(p.linkedin || p.website) && (
            <div>
              <SectionTitle title="Links" accent={accent} />
              <div className="space-y-2">
                {p.linkedin && (
                  <div>
                    <p className="font-bold" style={{ fontSize: '8.5px' }}>LinkedIn</p>
                    <p className="text-gray-500 break-all" style={{ fontSize: '7.5px' }}>{p.linkedin}</p>
                  </div>
                )}
                {p.website && (
                  <div>
                    <p className="font-bold" style={{ fontSize: '8.5px' }}>Website</p>
                    <p className="text-gray-500 break-all" style={{ fontSize: '7.5px' }}>{p.website}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <SectionTitle title={t.languages} accent={accent} />
              <div className="space-y-2">
                {languages.map((lang, i) => (
                  <div key={i}>
                    <p className="font-medium text-gray-800" style={{ fontSize: '8.5px' }}>
                      {lang.name}
                    </p>
                    <div className="mt-0.5 h-1 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${langPct(lang.level)}%`, backgroundColor: accent }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <SectionTitle title={t.certifications} accent={accent} />
              <div className="space-y-2">
                {certifications.map((cert, i) => (
                  <div key={i} className="flex gap-2">
                    <Dot accent={accent} />
                    <p className="font-bold uppercase leading-snug" style={{ color: accent, fontSize: '8px', letterSpacing: '0.03em' }}>
                      {cert.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Details */}
          {Object.values(personalDetails || {}).some(Boolean) && (
            <div>
              <SectionTitle title="Personal Details" accent={accent} />
              <div className="space-y-1.5">
                {personalDetails.visaStatus && (
                  <div>
                    <p className="font-bold text-gray-800" style={{ fontSize: '8.5px' }}>Visa Status</p>
                    <p className="text-gray-500" style={{ fontSize: '8px' }}>{personalDetails.visaStatus}</p>
                  </div>
                )}
                {personalDetails.nationality && (
                  <div>
                    <p className="font-bold text-gray-800" style={{ fontSize: '8.5px' }}>Nationality</p>
                    <p className="text-gray-500" style={{ fontSize: '8px' }}>{personalDetails.nationality}</p>
                  </div>
                )}
                {personalDetails.dob && (
                  <div>
                    <p className="font-bold text-gray-800" style={{ fontSize: '8.5px' }}>Date of Birth</p>
                    <p className="text-gray-500" style={{ fontSize: '8px' }}>{personalDetails.dob}</p>
                  </div>
                )}
                {personalDetails.maritalStatus && (
                  <div>
                    <p className="font-bold text-gray-800" style={{ fontSize: '8.5px' }}>Marital Status</p>
                    <p className="text-gray-500" style={{ fontSize: '8px' }}>{personalDetails.maritalStatus}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex-1 px-6 py-5 space-y-5">

          {(() => {
            const mainFlowSections = {
              summary: summary && (
                <div key="summary">
                  <SectionTitle title="About Me" accent={accent} />
                  <div
                    className="text-gray-700 leading-relaxed"
                    style={{ fontSize: '8.5px', textAlign: 'justify' }}
                    dangerouslySetInnerHTML={{ __html: summary }}
                  />
                </div>
              ),
              experience: experience.length > 0 && (
                <div key="experience">
                  <SectionTitle title={t.experience} accent={accent} />
                  <div className="space-y-4">
                    {experience.map((job, i) => (
                      <div key={i} className="flex gap-2">
                        <Dot accent={accent} />
                        <div className="flex-1 min-w-0">
                          {/* Company + date row */}
                          <div className="flex justify-between items-baseline gap-2">
                            <p className="text-gray-600" style={{ fontSize: '8.5px' }}>
                              {[job.company, job.city].filter(Boolean).join(' | ')}
                            </p>
                            <p className="text-gray-500 uppercase whitespace-nowrap flex-shrink-0" style={{ fontSize: '7.5px' }}>
                              {job.startDate}
                              {(job.startDate && (job.current || job.endDate)) ? ' - ' : ''}
                              {job.current ? 'Present' : job.endDate}
                            </p>
                          </div>

                          {/* Job title */}
                          {job.title && (
                            <p className="font-black uppercase tracking-wide mt-0.5" style={{ color: accent, fontSize: '8.5px' }}>
                              {job.title}
                            </p>
                          )}

                          {/* Description */}
                          {job.description && (
                            <div
                              className="text-gray-700 mt-1 leading-relaxed
                                [&_ul]:list-none [&_ul]:pl-0 [&_ul]:mt-1 [&_ul]:space-y-0.5
                                [&_ol]:list-none [&_ol]:pl-0 [&_ol]:mt-1 [&_ol]:space-y-0.5
                                [&_li]:flex [&_li]:gap-1.5
                                [&_li]:before:content-['•'] [&_li]:before:text-gray-400 [&_li]:before:flex-shrink-0"
                              style={{ fontSize: '8.5px' }}
                              dangerouslySetInnerHTML={{ __html: job.description }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            };
            // Education/skills/languages/certifications/personal details live
            // in the fixed left column — only summary/experience share this
            // right-column flow and are reorderable relative to each other.
            return order.filter((k) => mainFlowSections[k]).map((k) => mainFlowSections[k]);
          })()}

          {projects.length > 0 && (
            <div>
              <SectionTitle title={t.projects} accent={accent} />
              <div className="space-y-3">
                {projects.map((proj, i) => (
                  <div key={i} className="flex gap-2">
                    <Dot accent={accent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="font-black uppercase tracking-wide" style={{ color: accent, fontSize: '8.5px' }}>{proj.name}</p>
                        {proj.year && <p className="text-gray-500 whitespace-nowrap flex-shrink-0" style={{ fontSize: '7.5px' }}>{proj.year}</p>}
                      </div>
                      {proj.url && <p className="text-gray-500" style={{ fontSize: '8px' }}>{proj.url}</p>}
                      {proj.description && <p className="text-gray-700 mt-0.5 leading-relaxed" style={{ fontSize: '8.5px' }}>{proj.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {volunteer.length > 0 && (
            <div>
              <SectionTitle title={t.volunteer} accent={accent} />
              <div className="space-y-3">
                {volunteer.map((v, i) => (
                  <div key={i} className="flex gap-2">
                    <Dot accent={accent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="font-black uppercase tracking-wide" style={{ color: accent, fontSize: '8.5px' }}>
                          {[v.role, v.organization].filter(Boolean).join(' · ')}
                        </p>
                        <p className="text-gray-500 whitespace-nowrap flex-shrink-0" style={{ fontSize: '7.5px' }}>
                          {[v.startDate, v.endDate].filter(Boolean).join(' – ')}
                        </p>
                      </div>
                      {v.description && <p className="text-gray-700 mt-0.5 leading-relaxed" style={{ fontSize: '8.5px' }}>{v.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {awards.length > 0 && (
            <div>
              <SectionTitle title={t.awards} accent={accent} />
              <div className="space-y-2">
                {awards.map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <Dot accent={accent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="font-black uppercase tracking-wide" style={{ color: accent, fontSize: '8.5px' }}>{a.title}</p>
                        {a.year && <p className="text-gray-500 whitespace-nowrap flex-shrink-0" style={{ fontSize: '7.5px' }}>{a.year}</p>}
                      </div>
                      {a.issuer && <p className="text-gray-500" style={{ fontSize: '8px' }}>{a.issuer}</p>}
                      {a.description && <p className="text-gray-700 mt-0.5 leading-relaxed" style={{ fontSize: '8.5px' }}>{a.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {internships.length > 0 && (
            <div>
              <SectionTitle title={t.internships} accent={accent} />
              <div className="space-y-3">
                {internships.map((it, i) => (
                  <div key={i} className="flex gap-2">
                    <Dot accent={accent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="text-gray-600" style={{ fontSize: '8.5px' }}>{it.company}</p>
                        <p className="text-gray-500 whitespace-nowrap flex-shrink-0" style={{ fontSize: '7.5px' }}>
                          {[it.startDate, it.endDate].filter(Boolean).join(' – ')}
                        </p>
                      </div>
                      <p className="font-black uppercase tracking-wide mt-0.5" style={{ color: accent, fontSize: '8.5px' }}>{it.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {publications.length > 0 && (
            <div>
              <SectionTitle title={t.publications} accent={accent} />
              <div className="space-y-2">
                {publications.map((pub, i) => (
                  <div key={i} className="flex gap-2">
                    <Dot accent={accent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="font-black uppercase tracking-wide" style={{ color: accent, fontSize: '8.5px' }}>{pub.title}</p>
                        {pub.year && <p className="text-gray-500 whitespace-nowrap flex-shrink-0" style={{ fontSize: '7.5px' }}>{pub.year}</p>}
                      </div>
                      {pub.publisher && <p className="text-gray-500" style={{ fontSize: '8px' }}>{pub.publisher}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {courses.length > 0 && (
            <div>
              <SectionTitle title={t.courses} accent={accent} />
              <div className="space-y-2">
                {courses.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Dot accent={accent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="font-black uppercase tracking-wide" style={{ color: accent, fontSize: '8.5px' }}>{c.name}</p>
                        {c.year && <p className="text-gray-500 whitespace-nowrap flex-shrink-0" style={{ fontSize: '7.5px' }}>{c.year}</p>}
                      </div>
                      {c.institution && <p className="text-gray-500" style={{ fontSize: '8px' }}>{c.institution}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {references.length > 0 && (
            <div>
              <SectionTitle title={t.references} accent={accent} />
              <div className="space-y-2">
                {references.map((ref, i) => (
                  <div key={i} className="flex gap-2">
                    <Dot accent={accent} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="font-black uppercase tracking-wide" style={{ color: accent, fontSize: '8.5px' }}>{ref.name}</p>
                        {ref.contact && <p className="text-gray-500 whitespace-nowrap flex-shrink-0" style={{ fontSize: '7.5px' }}>{ref.contact}</p>}
                      </div>
                      {ref.company && <p className="text-gray-500" style={{ fontSize: '8px' }}>{ref.company}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hobbies && (
            <div>
              <SectionTitle title={t.hobbies} accent={accent} />
              <p className="text-gray-700 leading-relaxed" style={{ fontSize: '8.5px' }}>{hobbies}</p>
            </div>
          )}

          {customSection?.content && (
            <div>
              <SectionTitle title={customSection.title || t.custom} accent={accent} />
              <p className="text-gray-700 leading-relaxed whitespace-pre-line" style={{ fontSize: '8.5px' }}>{customSection.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
