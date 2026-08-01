const DEFAULT_ACCENT = "#2563eb";
import { getTranslations } from '../../../utils/resumeTranslations';
import { DEFAULT_SECTION_ORDER } from '../../../utils/sectionOrder';
const LEVEL_COLORS = { beginner: "#94a3b8", intermediate: "#f59e0b", expert: "#10b981" };

const skillName = (s) => (typeof s === "string" ? s : s.name);
const skillLevel = (s) => (typeof s === "string" ? "" : s.level || "");

export default function ModernTemplate({ resume }) {
  const {
    personalInfo: p, summary, experience, education, skills, certifications,
    projects = [], volunteer = [], awards = [], hobbies = '', courses = [],
    references = [], internships = [], publications = [], customSection,
  } = resume;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  const accent = resume.accentColor || DEFAULT_ACCENT;
  const t = getTranslations(resume.language || 'en');
  const accentLight = accent + "18"; // ~10% opacity tint for borders/bg
  const order = resume.sectionOrder || DEFAULT_SECTION_ORDER;

  const heading = (label) => (
    <h2
      className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2 border-b"
      style={{ color: accent, borderColor: accentLight }}
    >
      {label}
    </h2>
  );

  return (
    <div className="bg-white w-full min-h-full font-sans text-[10px] leading-tight">
      {/* Header */}
      <div className="px-8 py-7 text-white" style={{ backgroundColor: accent }}>
        <h1 className="text-2xl font-bold tracking-tight">{fullName || "Your Name"}</h1>
        {p.jobTitle && (
          <p className="mt-0.5 text-sm font-medium" style={{ color: "#ffffff99" }}>
            {p.jobTitle}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[9px]" style={{ color: "#ffffffbb" }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.website && <span>{p.website}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {(() => {
          const coreSections = {
            summary: summary && (
              <section key="summary">
                {heading(t.summary)}
                <div className="text-gray-700 leading-relaxed text-[13px]" dangerouslySetInnerHTML={{ __html: summary }} />
              </section>
            ),
            experience: (experience || []).length > 0 && (
              <section key="experience">
                {heading(t.experience)}
                <div className="space-y-4">
                  {experience.map((job, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 text-[11px]">{job.title}</h3>
                          <p className="font-medium" style={{ color: accent }}>
                            {job.company}
                            {job.city ? ` · ${job.city}` : ""}
                          </p>
                        </div>
                        <span className="text-gray-400 whitespace-nowrap ml-4">
                          {job.startDate}
                          {job.endDate ? ` – ${job.endDate}` : job.current ? " – " + t.present : ""}
                        </span>
                      </div>
                      {job.description && (
                        <div className="text-gray-600 mt-1 leading-relaxed text-[12px] prose-sm [&_div]:mt-0.5"
                          dangerouslySetInnerHTML={{ __html: job.description }} />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ),
            education: (education || []).length > 0 && (
              <section key="education">
                {heading(t.education)}
                <div className="space-y-3">
                  {education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-[11px]">
                          {edu.degree}
                          {edu.field ? ` in ${edu.field}` : ""}
                        </h3>
                        <p className="text-gray-600">{edu.school}</p>
                        {edu.gpa && <p className="text-gray-400">GPA: {edu.gpa}</p>}
                      </div>
                      <span className="text-gray-400 ml-4">{edu.gradYear}</span>
                    </div>
                  ))}
                </div>
              </section>
            ),
            skills: (skills || []).length > 0 && (
              <section key="skills">
                {heading(t.skills)}
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => {
                    const name = skillName(skill);
                    const level = skillLevel(skill);
                    return (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-[9px]"
                        style={{ backgroundColor: accentLight, color: accent }}
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

        {/* Certifications */}
        {(certifications || []).length > 0 && (
          <section>
            {heading(t.certifications)}
            <div className="space-y-2">
              {certifications.map((cert, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{cert.name}</p>
                    {cert.issuer && <p className="text-gray-500">{cert.issuer}</p>}
                  </div>
                  {cert.year && <span className="text-gray-400 ml-4">{cert.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            {heading(t.projects)}
            <div className="space-y-2">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-900 text-[11px]">{proj.name}</p>
                    {proj.year && <span className="text-gray-400 ml-4">{proj.year}</span>}
                  </div>
                  {proj.url && <p className="text-gray-500">{proj.url}</p>}
                  {proj.description && <p className="text-gray-600 mt-0.5 text-[12px] leading-relaxed">{proj.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {volunteer.length > 0 && (
          <section>
            {heading(t.volunteer)}
            <div className="space-y-2">
              {volunteer.map((v, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-900 text-[11px]">{[v.role, v.organization].filter(Boolean).join(' · ')}</p>
                    <span className="text-gray-400 ml-4 whitespace-nowrap">{[v.startDate, v.endDate].filter(Boolean).join(' – ')}</span>
                  </div>
                  {v.description && <p className="text-gray-600 mt-0.5 text-[12px] leading-relaxed">{v.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {awards.length > 0 && (
          <section>
            {heading(t.awards)}
            <div className="space-y-2">
              {awards.map((a, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-900 text-[11px]">{a.title}</p>
                    {a.year && <span className="text-gray-400 ml-4">{a.year}</span>}
                  </div>
                  {a.issuer && <p className="text-gray-500">{a.issuer}</p>}
                  {a.description && <p className="text-gray-600 mt-0.5 text-[12px] leading-relaxed">{a.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {internships.length > 0 && (
          <section>
            {heading(t.internships)}
            <div className="space-y-2">
              {internships.map((it, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{it.title}</p>
                    <p className="text-gray-600">{it.company}</p>
                  </div>
                  <span className="text-gray-400 ml-4 whitespace-nowrap">{[it.startDate, it.endDate].filter(Boolean).join(' – ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {publications.length > 0 && (
          <section>
            {heading(t.publications)}
            <div className="space-y-2">
              {publications.map((pub, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{pub.title}</p>
                    {pub.publisher && <p className="text-gray-500">{pub.publisher}</p>}
                  </div>
                  {pub.year && <span className="text-gray-400 ml-4">{pub.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {courses.length > 0 && (
          <section>
            {heading(t.courses)}
            <div className="space-y-2">
              {courses.map((c, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{c.name}</p>
                    {c.institution && <p className="text-gray-500">{c.institution}</p>}
                  </div>
                  {c.year && <span className="text-gray-400 ml-4">{c.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {references.length > 0 && (
          <section>
            {heading(t.references)}
            <div className="space-y-2">
              {references.map((ref, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-[11px]">{ref.name}</p>
                    {ref.company && <p className="text-gray-500">{ref.company}</p>}
                  </div>
                  {ref.contact && <span className="text-gray-400 ml-4">{ref.contact}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {hobbies && (
          <section>
            {heading(t.hobbies)}
            <p className="text-gray-700 text-[12px] leading-relaxed">{hobbies}</p>
          </section>
        )}

        {customSection?.content && (
          <section>
            {heading(customSection.title || t.custom)}
            <p className="text-gray-700 text-[12px] leading-relaxed whitespace-pre-line">{customSection.content}</p>
          </section>
        )}
      </div>
    </div>
  );
}
