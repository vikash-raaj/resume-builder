const DEFAULT_ACCENT = "#2563eb";
const LEVEL_COLORS = { beginner: "#94a3b8", intermediate: "#f59e0b", expert: "#10b981" };

const skillName = (s) => (typeof s === "string" ? s : s.name);
const skillLevel = (s) => (typeof s === "string" ? "" : s.level || "");

export default function ModernTemplate({ resume }) {
  const { personalInfo: p, summary, experience, education, skills, certifications } = resume;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  const accent = resume.accentColor || DEFAULT_ACCENT;
  const accentLight = accent + "18"; // ~10% opacity tint for borders/bg

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
        {/* Summary */}
        {summary && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2 border-b"
              style={{ color: accent, borderColor: accentLight }}
            >
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {(experience || []).length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-3 border-b"
              style={{ color: accent, borderColor: accentLight }}
            >
              Work Experience
            </h2>
            <div className="space-y-4">
              {experience.map((job, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-[11px]">{job.title}</h3>
                      <p className="font-medium" style={{ color: accent }}>
                        {job.company}
                        {job.location ? ` · ${job.location}` : ""}
                      </p>
                    </div>
                    <span className="text-gray-400 whitespace-nowrap ml-4">
                      {job.startDate}
                      {job.endDate ? ` – ${job.endDate}` : job.current ? " – Present" : ""}
                    </span>
                  </div>
                  {job.description && (
                    <p className="text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {(education || []).length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-3 border-b"
              style={{ color: accent, borderColor: accentLight }}
            >
              Education
            </h2>
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
        )}

        {/* Certifications */}
        {(certifications || []).length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-3 border-b"
              style={{ color: accent, borderColor: accentLight }}
            >
              Certifications
            </h2>
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

        {/* Skills */}
        {(skills || []).length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2 border-b"
              style={{ color: accent, borderColor: accentLight }}
            >
              Skills
            </h2>
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
        )}
      </div>
    </div>
  );
}
