import { MapPin, Phone, Mail } from 'lucide-react';
import { getTranslations } from '../../../utils/resumeTranslations';

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
  } = resume;

  const accent = resume.accentColor || DEFAULT_ACCENT;
  const t = getTranslations(resume.language || 'en');
  const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();
  const address = [p.address, p.city, p.country].filter(Boolean).join(', ');

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

          {/* About / Summary */}
          {summary && (
            <div>
              <SectionTitle title="About Me" accent={accent} />
              <div
                className="text-gray-700 leading-relaxed"
                style={{ fontSize: '8.5px', textAlign: 'justify' }}
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>
          )}

          {/* Work Experience */}
          {experience.length > 0 && (
            <div>
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
          )}

          {/* Certifications — also shown in right col if no left data */}
        </div>
      </div>
    </div>
  );
}
