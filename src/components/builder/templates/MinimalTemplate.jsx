const DEFAULT_ACCENT = "#059669";
import { getTranslations } from '../../../utils/resumeTranslations';
import { DEFAULT_SECTION_ORDER } from '../../../utils/sectionOrder';
const LEVEL_COLORS = { beginner: "#94a3b8", intermediate: "#f59e0b", expert: "#10b981" };

const skillName = (s) => (typeof s === "string" ? s : s.name);
const skillLevel = (s) => (typeof s === "string" ? "" : s.level || "");

function SectionHeader({ accent, children }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-6 h-0.5 flex-shrink-0" style={{ backgroundColor: accent }} />
      <h2 className="text-[11px] font-semibold text-gray-800 uppercase tracking-widest">
        {children}
      </h2>
    </div>
  );
}

export default function MinimalTemplate({ resume }) {
  const {
    personalInfo: p, summary, experience, education, skills, certifications,
    projects = [], volunteer = [], awards = [], hobbies = '', courses = [],
    references = [], internships = [], publications = [], customSection,
  } = resume;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  const accent = resume.accentColor || DEFAULT_ACCENT;
  const t = getTranslations(resume.language || 'en');
  const order = resume.sectionOrder || DEFAULT_SECTION_ORDER;

  return (
    <div className="bg-white w-full min-h-full font-sans text-[10px] leading-tight">
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">
            {fullName || "Your Name"}
          </h1>
          {p.jobTitle && (
            <p className="font-medium mt-0.5" style={{ color: accent }}>
              {p.jobTitle}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 mt-2 text-gray-400 text-[9px]">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
          </div>
        </div>

        {(() => {
          const coreSections = {
            summary: summary && (
              <section key="summary" className="mb-5">
                <SectionHeader accent={accent}>{t.summary}</SectionHeader>
                <div className="text-gray-600 leading-relaxed ml-9 text-[13px]" dangerouslySetInnerHTML={{ __html: summary }} />
              </section>
            ),
            experience: (experience || []).length > 0 && (
              <section key="experience" className="mb-5">
                <SectionHeader accent={accent}>{t.experience}</SectionHeader>
                <div className="ml-9 space-y-3">
                  {experience.map((job, i) => (
                    <div key={i}>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900 text-[11px]">{job.title}</span>
                        <span className="text-gray-400">
                          {job.startDate}
                          {job.endDate ? ` – ${job.endDate}` : job.current ? " – " + t.present : ""}
                        </span>
                      </div>
                      <p className="font-medium" style={{ color: accent }}>
                        {job.company}
                      </p>
                      {job.description && (
                        <div className="text-gray-600 mt-0.5 leading-relaxed text-[12px] [&_div]:mt-0.5"
                          dangerouslySetInnerHTML={{ __html: job.description }} />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ),
            education: (education || []).length > 0 && (
              <section key="education" className="mb-5">
                <SectionHeader accent={accent}>{t.education}</SectionHeader>
                <div className="ml-9 space-y-2">
                  {education.map((edu, i) => (
                    <div key={i} className="flex justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-[11px]">
                          {edu.degree}
                          {edu.field ? ` · ${edu.field}` : ""}
                        </p>
                        <p className="text-gray-500">{edu.school}</p>
                      </div>
                      <span className="text-gray-400">{edu.gradYear}</span>
                    </div>
                  ))}
                </div>
              </section>
            ),
            skills: (skills || []).length > 0 && (
              <section key="skills" className="mb-5">
                <SectionHeader accent={accent}>{t.skills}</SectionHeader>
                <div className="ml-9 flex flex-wrap gap-2">
                  {skills.map((skill, i) => {
                    const name = skillName(skill);
                    const level = skillLevel(skill);
                    return (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-medium border"
                        style={{ borderColor: accent + "50", color: accent }}
                      >
                        {level && (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: LEVEL_COLORS[level] }}
                          />
                        )}
                        {name}
                      </span>
                    );
                  })}
                </div>
              </section>
            ),
          };
          return order.map((key) => coreSections[key] || null);
        })()}

        {(certifications || []).length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>{t.certifications}</SectionHeader>
            <div className="ml-9 space-y-2">
              {certifications.map((cert, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{cert.name}</p>
                    {cert.issuer && <p className="text-gray-500">{cert.issuer}</p>}
                  </div>
                  {cert.year && <span className="text-gray-400">{cert.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>{t.projects}</SectionHeader>
            <div className="ml-9 space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <p className="font-semibold text-gray-900 text-[11px]">{proj.name}</p>
                    {proj.year && <span className="text-gray-400">{proj.year}</span>}
                  </div>
                  {proj.url && <p className="text-gray-500">{proj.url}</p>}
                  {proj.description && <p className="text-gray-600 mt-0.5 text-[12px] leading-relaxed">{proj.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {volunteer.length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>{t.volunteer}</SectionHeader>
            <div className="ml-9 space-y-2">
              {volunteer.map((v, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <p className="font-semibold text-gray-900 text-[11px]">{[v.role, v.organization].filter(Boolean).join(' · ')}</p>
                    <span className="text-gray-400">{[v.startDate, v.endDate].filter(Boolean).join(' – ')}</span>
                  </div>
                  {v.description && <p className="text-gray-600 mt-0.5 text-[12px] leading-relaxed">{v.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {awards.length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>{t.awards}</SectionHeader>
            <div className="ml-9 space-y-2">
              {awards.map((a, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <p className="font-semibold text-gray-900 text-[11px]">{a.title}</p>
                    {a.year && <span className="text-gray-400">{a.year}</span>}
                  </div>
                  {a.issuer && <p className="text-gray-500">{a.issuer}</p>}
                  {a.description && <p className="text-gray-600 mt-0.5 text-[12px] leading-relaxed">{a.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {internships.length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>{t.internships}</SectionHeader>
            <div className="ml-9 space-y-2">
              {internships.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{it.title}</p>
                    <p className="text-gray-500">{it.company}</p>
                  </div>
                  <span className="text-gray-400">{[it.startDate, it.endDate].filter(Boolean).join(' – ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {publications.length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>{t.publications}</SectionHeader>
            <div className="ml-9 space-y-2">
              {publications.map((pub, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{pub.title}</p>
                    {pub.publisher && <p className="text-gray-500">{pub.publisher}</p>}
                  </div>
                  {pub.year && <span className="text-gray-400">{pub.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {courses.length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>{t.courses}</SectionHeader>
            <div className="ml-9 space-y-2">
              {courses.map((c, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{c.name}</p>
                    {c.institution && <p className="text-gray-500">{c.institution}</p>}
                  </div>
                  {c.year && <span className="text-gray-400">{c.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {references.length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>{t.references}</SectionHeader>
            <div className="ml-9 space-y-2">
              {references.map((ref, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{ref.name}</p>
                    {ref.company && <p className="text-gray-500">{ref.company}</p>}
                  </div>
                  {ref.contact && <span className="text-gray-400">{ref.contact}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {hobbies && (
          <section className="mb-5">
            <SectionHeader accent={accent}>{t.hobbies}</SectionHeader>
            <p className="ml-9 text-gray-600 text-[12px] leading-relaxed">{hobbies}</p>
          </section>
        )}

        {customSection?.content && (
          <section>
            <SectionHeader accent={accent}>{customSection.title || t.custom}</SectionHeader>
            <p className="ml-9 text-gray-600 text-[12px] leading-relaxed whitespace-pre-line">{customSection.content}</p>
          </section>
        )}
      </div>
    </div>
  );
}
