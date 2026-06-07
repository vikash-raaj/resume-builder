const DEFAULT_ACCENT = "#1f2937";
import { getTranslations } from '../../../utils/resumeTranslations';
const LEVEL_LABELS = { beginner: "Beginner", intermediate: "Intermediate", expert: "Expert" };

const skillName = (s) => (typeof s === "string" ? s : s.name);
const skillLevel = (s) => (typeof s === "string" ? "" : s.level || "");

export default function ClassicTemplate({ resume }) {
  const { personalInfo: p, summary, experience, education, skills, certifications } = resume;
  const fullName = `${p.firstName} ${p.lastName}`.trim();
  const accent = resume.accentColor || DEFAULT_ACCENT;
  const t = getTranslations(resume.language || 'en');

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
        </div>
      </div>

      <div className="px-8 py-5 space-y-4">
        {summary && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-1 pb-0.5"
              style={{ color: accent, borderBottom: `1px solid ${accent}40` }}
            >
              {t.summary}
            </h2>
            <p className="text-gray-700 leading-relaxed mt-1.5">{summary}</p>
          </section>
        )}

        {(experience || []).length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-2 pb-0.5"
              style={{ color: accent, borderBottom: `1px solid ${accent}40` }}
            >
              {t.experience}
            </h2>
            <div className="space-y-3 mt-1.5">
              {experience.map((job, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <strong className="text-gray-900 text-[11px]">{job.title}</strong>
                    <span className="text-gray-500 text-[9px]">
                      {job.startDate}
                      {job.endDate ? ` – ${job.endDate}` : job.current ? " – " + t.present : ""}
                    </span>
                  </div>
                  <p className="text-gray-600 italic">
                    {job.company}
                    {job.location ? `, ${job.location}` : ""}
                  </p>
                  {job.description && (
                    <p className="text-gray-700 mt-0.5 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {(education || []).length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-2 pb-0.5"
              style={{ color: accent, borderBottom: `1px solid ${accent}40` }}
            >
              {t.education}
            </h2>
            <div className="space-y-2 mt-1.5">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <strong className="text-gray-900 text-[11px]">
                      {edu.degree}
                      {edu.field ? `, ${edu.field}` : ""}
                    </strong>
                    <p className="text-gray-600 italic">{edu.school}</p>
                  </div>
                  <span className="text-gray-500 text-[9px] ml-4">{edu.gradYear}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(certifications || []).length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-2 pb-0.5"
              style={{ color: accent, borderBottom: `1px solid ${accent}40` }}
            >
              {t.certifications}
            </h2>
            <div className="space-y-1.5 mt-1.5">
              {certifications.map((cert, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <strong className="text-gray-900 text-[11px]">{cert.name}</strong>
                    {cert.issuer && <p className="text-gray-600 italic">{cert.issuer}</p>}
                  </div>
                  {cert.year && <span className="text-gray-500 text-[9px] ml-4">{cert.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {(skills || []).length > 0 && (
          <section>
            <h2
              className="text-sm font-bold uppercase tracking-widest mb-2 pb-0.5"
              style={{ color: accent, borderBottom: `1px solid ${accent}40` }}
            >
              {t.skills}
            </h2>
            <p className="text-gray-700 mt-1">
              {skills.map((s) => {
                const name = skillName(s);
                const level = skillLevel(s);
                return level ? `${name} (${LEVEL_LABELS[level]})` : name;
              }).join(" · ")}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
