const DEFAULT_ACCENT = "#059669";
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
  const { personalInfo: p, summary, experience, education, skills, certifications } = resume;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  const accent = resume.accentColor || DEFAULT_ACCENT;

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

        {summary && (
          <section className="mb-5">
            <SectionHeader accent={accent}>Profile</SectionHeader>
            <p className="text-gray-600 leading-relaxed ml-9">{summary}</p>
          </section>
        )}

        {(experience || []).length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>Experience</SectionHeader>
            <div className="ml-9 space-y-3">
              {experience.map((job, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 text-[11px]">{job.title}</span>
                    <span className="text-gray-400">
                      {job.startDate}
                      {job.endDate ? ` – ${job.endDate}` : job.current ? " – Present" : ""}
                    </span>
                  </div>
                  <p className="font-medium" style={{ color: accent }}>
                    {job.company}
                  </p>
                  {job.description && (
                    <p className="text-gray-600 mt-0.5 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {(education || []).length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>Education</SectionHeader>
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
        )}

        {(certifications || []).length > 0 && (
          <section className="mb-5">
            <SectionHeader accent={accent}>Certifications</SectionHeader>
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

        {(skills || []).length > 0 && (
          <section>
            <SectionHeader accent={accent}>Skills</SectionHeader>
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
        )}
      </div>
    </div>
  );
}
