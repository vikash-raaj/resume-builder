import { getTranslations } from '../../../utils/resumeTranslations';
import { DEFAULT_SECTION_ORDER } from '../../../utils/sectionOrder';

const DEFAULT_ACCENT = "#1f2937";
const LEVEL_COLORS = { beginner: "#94a3b8", intermediate: "#f59e0b", expert: "#10b981" };

const skillName = (s) => (typeof s === "string" ? s : s.name);
const skillLevel = (s) => (typeof s === "string" ? "" : s.level || "");

export default function ClassicTemplate({ resume }) {
  const {
    personalInfo: p, summary, experience, education, skills, certifications,
    projects = [], volunteer = [], awards = [], hobbies = '', courses = [],
    references = [], internships = [], publications = [], customSection,
  } = resume;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  const accent = resume.accentColor || DEFAULT_ACCENT;
  const t = getTranslations(resume.language || 'en');
  const order = resume.sectionOrder || DEFAULT_SECTION_ORDER;

  const heading = (label) => (
    <h2
      className="text-sm font-bold uppercase tracking-widest mb-1 pb-0.5"
      style={{ color: accent, borderBottom: `1px solid ${accent}40` }}
    >
      {label}
    </h2>
  );

  return (
    <div className="bg-white w-full min-h-full font-serif text-[10px] leading-tight">
      {/* Header */}
      <div className="text-center pb-4 px-8 pt-6" style={{ borderBottom: `2px solid ${accent}` }}>
        <h1
          className="text-3xl font-bold text-gray-900 tracking-wide uppercase"
          style={{ color: accent }}
        >
          {fullName || "Your Name"}
        </h1>
        {p.jobTitle && <p className="text-gray-600 mt-1 text-sm italic">{p.jobTitle}</p>}
        <div className="flex justify-center flex-wrap gap-x-3 mt-2 text-gray-500 text-[9px]">
          {p.email && <span>{p.email}</span>}
          {p.phone && <><span>|</span><span>{p.phone}</span></>}
          {p.location && <><span>|</span><span>{p.location}</span></>}
          {p.linkedin && <><span>|</span><span>{p.linkedin}</span></>}
          {p.website && <><span>|</span><span>{p.website}</span></>}
        </div>
      </div>

      <div className="px-8 py-5 space-y-4">
        {(() => {
          const coreSections = {
            summary: summary && (
              <section key="summary">
                {heading(t.summary)}
                <div className="text-gray-700 leading-relaxed mt-1.5 text-[13px]" dangerouslySetInnerHTML={{ __html: summary }} />
              </section>
            ),
            experience: (experience || []).length > 0 && (
              <section key="experience">
                {heading(t.experience)}
                <div className="space-y-3 mt-1.5">
                  {experience.map((job, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 text-[11px]">{job.title}</h3>
                        <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">
                          {job.startDate}
                          {job.endDate ? ` – ${job.endDate}` : job.current ? " – " + t.present : ""}
                        </span>
                      </div>
                      <p className="text-gray-600 italic">
                        {job.company}
                        {job.city ? `, ${job.city}` : ""}
                      </p>
                      {job.description && (
                        <div className="text-gray-700 mt-0.5 leading-relaxed text-[12px] [&_div]:mt-0.5"
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
                <div className="space-y-2 mt-1.5">
                  {education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <strong className="text-gray-900 text-[11px]">
                          {edu.degree}
                          {edu.field ? ` in ${edu.field}` : ""}
                        </strong>
                        <p className="text-gray-600 italic">{edu.school}</p>
                        {edu.gpa && <p className="text-gray-400 text-[9px]">GPA: {edu.gpa}</p>}
                      </div>
                      <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">{edu.gradYear}</span>
                    </div>
                  ))}
                </div>
              </section>
            ),
            skills: (skills || []).length > 0 && (
              <section key="skills">
                {heading(t.skills)}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {skills.map((skill, i) => {
                    const name = skillName(skill);
                    const level = skillLevel(skill);
                    return (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-2.5 py-1 rounded font-medium text-[9px] border"
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
          <section>
            {heading(t.certifications)}
            <div className="space-y-1.5 mt-1.5">
              {certifications.map((cert, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <strong className="text-gray-900 text-[11px]">{cert.name}</strong>
                    {cert.issuer && (
                      <p className="text-gray-500 text-[9px] italic">Issued by {cert.issuer}</p>
                    )}
                  </div>
                  {cert.year && <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">{cert.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            {heading(t.projects)}
            <div className="space-y-2 mt-1.5">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <strong className="text-gray-900 text-[11px]">{proj.name}</strong>
                    {proj.year && <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">{proj.year}</span>}
                  </div>
                  {proj.url && <p className="text-gray-500 text-[9px] italic">{proj.url}</p>}
                  {proj.description && <p className="text-gray-700 mt-0.5 text-[12px] leading-relaxed">{proj.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {volunteer.length > 0 && (
          <section>
            {heading(t.volunteer)}
            <div className="space-y-2 mt-1.5">
              {volunteer.map((v, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <strong className="text-gray-900 text-[11px]">{[v.role, v.organization].filter(Boolean).join(' · ')}</strong>
                    <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">
                      {[v.startDate, v.endDate].filter(Boolean).join(' – ')}
                    </span>
                  </div>
                  {v.description && <p className="text-gray-700 mt-0.5 text-[12px] leading-relaxed">{v.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {awards.length > 0 && (
          <section>
            {heading(t.awards)}
            <div className="space-y-1.5 mt-1.5">
              {awards.map((a, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <strong className="text-gray-900 text-[11px]">{a.title}</strong>
                    {a.year && <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">{a.year}</span>}
                  </div>
                  {a.issuer && <p className="text-gray-500 text-[9px] italic">{a.issuer}</p>}
                  {a.description && <p className="text-gray-700 mt-0.5 text-[12px] leading-relaxed">{a.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {internships.length > 0 && (
          <section>
            {heading(t.internships)}
            <div className="space-y-2 mt-1.5">
              {internships.map((it, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <strong className="text-gray-900 text-[11px]">{it.title}</strong>
                    <p className="text-gray-600 italic">{it.company}</p>
                  </div>
                  <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">
                    {[it.startDate, it.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {publications.length > 0 && (
          <section>
            {heading(t.publications)}
            <div className="space-y-1.5 mt-1.5">
              {publications.map((pub, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <strong className="text-gray-900 text-[11px]">{pub.title}</strong>
                    {pub.publisher && <p className="text-gray-500 text-[9px] italic">{pub.publisher}</p>}
                  </div>
                  {pub.year && <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">{pub.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {courses.length > 0 && (
          <section>
            {heading(t.courses)}
            <div className="space-y-1.5 mt-1.5">
              {courses.map((c, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <strong className="text-gray-900 text-[11px]">{c.name}</strong>
                    {c.institution && <p className="text-gray-500 text-[9px] italic">{c.institution}</p>}
                  </div>
                  {c.year && <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">{c.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {references.length > 0 && (
          <section>
            {heading(t.references)}
            <div className="space-y-1.5 mt-1.5">
              {references.map((ref, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <strong className="text-gray-900 text-[11px]">{ref.name}</strong>
                    {ref.company && <p className="text-gray-500 text-[9px] italic">{ref.company}</p>}
                  </div>
                  {ref.contact && <span className="text-gray-500 text-[9px] ml-4 whitespace-nowrap">{ref.contact}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {hobbies && (
          <section>
            {heading(t.hobbies)}
            <p className="text-gray-700 mt-1.5 text-[12px] leading-relaxed">{hobbies}</p>
          </section>
        )}

        {customSection?.content && (
          <section>
            {heading(customSection.title || t.custom)}
            <p className="text-gray-700 mt-1.5 text-[12px] leading-relaxed whitespace-pre-line">{customSection.content}</p>
          </section>
        )}
      </div>
    </div>
  );
}
