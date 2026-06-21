import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  User, GraduationCap, Star, Languages, FileText,
  Briefcase, ChevronDown, ChevronUp, Plus, X, Settings2, GripVertical,
  Heart, BookOpen, Users, Building2, Library, Check, Code2, HandHeart, Award, ShieldCheck,
} from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import FormField from '../FormField';
import RichTextEditor from '../RichTextEditor';
import SkillLevelSlider from '../SkillLevelSlider';
import { tailorResumeToJob, getStoredAIKey } from '../../../utils/aiService';
import AIKeySetup from '../AIKeySetup';
import { RESUME_LANGUAGES } from '../../../utils/resumeTranslations';

const TEMPLATES = [
  { label: 'Riga', value: 'riga', tag: 'Classic' },
  { label: 'Modern', value: 'modern', tag: 'Popular' },
  { label: 'Classic', value: 'classic', tag: 'Timeless' },
  { label: 'Minimal', value: 'minimal', tag: 'Clean' },
  { label: 'Executive', value: 'executive', tag: 'Leadership' },
  { label: 'Tech', value: 'tech', tag: 'Developer' },
];
const FONTS = ['Montserrat (default)', 'Inter', 'Roboto', 'Lato', 'Open Sans'];
const BODY_FONTS = ['Crimson Text (default)', 'Georgia', 'Merriweather', 'Libre Baskerville'];
const ACCENT_COLORS = [
  '#C8A84B', '#1e3a6e', '#2563EB', '#DC2626', '#059669', '#7C3AED',
  '#0f172a', '#b45309', '#0891b2', '#be185d', '#4f46e5', '#000000',
];
const LANG_LEVELS = ['Superior/Native', 'Highly Proficient', 'Very Good', 'Good Working', 'Working Knowledge'];
const LEVELS = ['Novice', 'Beginner', 'Skillful', 'Experienced', 'Expert'];

const DEFAULT_SECTION_ORDER = [
  'personalInfo', 'experience', 'education', 'skills', 'summary', 'languages', 'personalDetails',
];

const BLOCKS = [
  { key: 'projects', label: 'Projects', icon: Code2 },
  { key: 'certifications', label: 'Certifications', icon: ShieldCheck },
  { key: 'volunteer', label: 'Volunteer Work', icon: HandHeart },
  { key: 'awards', label: 'Awards & Honors', icon: Award },
  { key: 'hobbies', label: 'Hobbies', icon: Heart },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'references', label: 'References', icon: Users },
  { key: 'internships', label: 'Internships', icon: Building2 },
  { key: 'publications', label: 'Publications', icon: Library },
  { key: 'custom', label: 'Custom Section', icon: Plus },
];

function SectionHeader({ icon: Icon, title, dragHandleProps }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-300 hover:text-gray-500 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
    </div>
  );
}

function AccordionItem({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 transition-colors px-1"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm text-gray-600">{label}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-1 pb-4">{children}</div>}
    </div>
  );
}

function SortableSection({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
}

function PersonalInfoSection({ dragHandleProps }) {
  const { resume, updatePersonalInfo } = useResume();
  const p = resume.personalInfo;
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <SectionHeader icon={User} title="Personal Information" dragHandleProps={dragHandleProps} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Job Title" value={p.jobTitle} onChange={(v) => updatePersonalInfo({ jobTitle: v })} className="col-span-2" />
        <FormField label="First Name" value={p.firstName} onChange={(v) => updatePersonalInfo({ firstName: v })} />
        <FormField label="Last Name" value={p.lastName} onChange={(v) => updatePersonalInfo({ lastName: v })} />
        <FormField label="Email" value={p.email} onChange={(v) => updatePersonalInfo({ email: v })} />
        <FormField label="Phone" value={p.phone} onChange={(v) => updatePersonalInfo({ phone: v })} />
        <FormField label="Address" value={p.address} onChange={(v) => updatePersonalInfo({ address: v })} className="col-span-2" />
        <FormField label="City" value={p.city} onChange={(v) => updatePersonalInfo({ city: v })} />
        <FormField label="Postal Code" value={p.postalCode} onChange={(v) => updatePersonalInfo({ postalCode: v })} />
        <FormField label="Country" value={p.country} onChange={(v) => updatePersonalInfo({ country: v })} />
      </div>
    </div>
  );
}

function EducationSection({ dragHandleProps }) {
  const { resume, updateEducation } = useResume();
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <SectionHeader icon={GraduationCap} title="Education" dragHandleProps={dragHandleProps} />
      <p className="text-sm text-blue-500 mb-3">Write your schools or courses you finished.</p>
      {resume.education.map((edu) => (
        <AccordionItem
          key={edu.id}
          label={[edu.degree, edu.school, edu.gradYear].filter(Boolean).join(' at ').trim() || 'Education entry'}
        >
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="School" value={edu.school} onChange={(v) => updateEducation(resume.education.map((e) => e.id === edu.id ? { ...e, school: v } : e))} className="col-span-2" />
            <FormField label="Degree" value={edu.degree} onChange={(v) => updateEducation(resume.education.map((e) => e.id === edu.id ? { ...e, degree: v } : e))} />
            <FormField label="City" value={edu.city} onChange={(v) => updateEducation(resume.education.map((e) => e.id === edu.id ? { ...e, city: v } : e))} />
          </div>
        </AccordionItem>
      ))}
    </div>
  );
}

function SkillsSection({ dragHandleProps }) {
  const { resume, updateSkills } = useResume();
  const normSkills = (resume.skills || []).map((s) =>
    typeof s === 'string' ? { id: s, name: s, level: 3 } : { ...s, level: typeof s.level === 'string' ? 3 : (s.level ?? 3) }
  );
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <SectionHeader icon={Star} title="Skills" dragHandleProps={dragHandleProps} />
      <p className="text-sm text-blue-500 mb-3">Pick 6 skills that match the job ad.</p>
      {normSkills.map((skill) => (
        <AccordionItem key={skill.id} label={`${skill.name || 'Skill'}, ${LEVELS[(skill.level ?? 3) - 1]}`}>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-52">
              <FormField label="Skill" value={skill.name} onChange={(v) => updateSkills(normSkills.map((s) => s.id === skill.id ? { ...s, name: v } : s))} />
            </div>
            <SkillLevelSlider level={skill.level} onChange={(v) => updateSkills(normSkills.map((s) => s.id === skill.id ? { ...s, level: v } : s))} />
          </div>
        </AccordionItem>
      ))}
    </div>
  );
}

function LanguagesSection({ dragHandleProps }) {
  const { resume, updateLanguages } = useResume();
  const langs = resume.languages || [];
  const addLang = () => updateLanguages([...langs, { id: Date.now(), name: '', level: 'Superior/Native' }]);
  const removeLang = (id) => updateLanguages(langs.filter((l) => l.id !== id));
  const updateLang = (id, field, val) => updateLanguages(langs.map((l) => (l.id === id ? { ...l, [field]: val } : l)));
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <SectionHeader icon={Languages} title="Languages" dragHandleProps={dragHandleProps} />
      <div className="space-y-2 mb-3">
        {langs.map((lang) => (
          <AccordionItem key={lang.id} label={`${lang.name || 'Language'}, ${lang.level}`}>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <FormField label="Language" value={lang.name} onChange={(v) => updateLang(lang.id, 'name', v)} />
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <div className="flex-1 px-3 py-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">Level</label>
                  <select value={lang.level} onChange={(e) => updateLang(lang.id, 'level', e.target.value)} className="w-full outline-none text-gray-800 text-sm bg-transparent">
                    {LANG_LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => removeLang(lang.id)} className="text-red-400 text-sm mt-2 hover:text-red-600">Remove</button>
          </AccordionItem>
        ))}
      </div>
      <button type="button" onClick={addLang} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700">
        <Plus className="w-4 h-4" /> Add Language
      </button>
    </div>
  );
}

function PersonalDetailsSection({ dragHandleProps }) {
  const { resume, updatePersonalDetails } = useResume();
  const pd = resume.personalDetails || {};
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <SectionHeader icon={User} title="Personal Details" dragHandleProps={dragHandleProps} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nationality" value={pd.nationality} onChange={(v) => updatePersonalDetails({ nationality: v })} placeholder="Indian" />
        <FormField label="Date of Birth" value={pd.dob} onChange={(v) => updatePersonalDetails({ dob: v })} placeholder="DD/MM/YYYY" />
        <FormField label="Visa Status" value={pd.visaStatus} onChange={(v) => updatePersonalDetails({ visaStatus: v })} placeholder="Approved" />
        <FormField label="Marital Status" value={pd.maritalStatus} onChange={(v) => updatePersonalDetails({ maritalStatus: v })} placeholder="Single" />
      </div>
    </div>
  );
}

function SummarySection({ dragHandleProps }) {
  const { resume, updateSummary } = useResume();
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <SectionHeader icon={FileText} title="Professional Summary" dragHandleProps={dragHandleProps} />
      <p className="text-sm text-blue-500 mb-3">Write 2–4 short lines about your work, wins, and skills.</p>
      <RichTextEditor value={resume.summary} onChange={updateSummary} label="SUMMARY" placeholder="Write your professional summary here…" />
    </div>
  );
}

function ExperienceSection({ dragHandleProps }) {
  const { resume, updateExperience } = useResume();
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <SectionHeader icon={Briefcase} title="Employment History" dragHandleProps={dragHandleProps} />
      <p className="text-sm text-blue-500 mb-3">Write your jobs (recent ones) with short points of what you did.</p>
      {resume.experience.map((job) => (
        <AccordionItem
          key={job.id}
          label={[job.title, job.company, job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(', ')}
        >
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="Job Title" value={job.title} onChange={(v) => updateExperience(resume.experience.map((j) => j.id === job.id ? { ...j, title: v } : j))} />
            <FormField label="Employer" value={job.company} onChange={(v) => updateExperience(resume.experience.map((j) => j.id === job.id ? { ...j, company: v } : j))} />
          </div>
        </AccordionItem>
      ))}
      <button type="button" className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-3">
        <Plus className="w-4 h-4" /> Add Employment
      </button>
    </div>
  );
}

// Extra block sections
function HobbiesBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const hobbies = resume.hobbies || '';
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Heart className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">Hobbies</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <FormField label="Hobbies" value={hobbies} onChange={(v) => setResume((r) => ({ ...r, hobbies: v }))} placeholder="e.g. Reading, Hiking, Photography" className="col-span-2" />
    </div>
  );
}

function CoursesBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const courses = resume.courses || [];
  const addCourse = () => setResume((r) => ({ ...r, courses: [...(r.courses || []), { id: Date.now(), name: '', institution: '', year: '' }] }));
  const updateCourse = (id, field, val) => setResume((r) => ({ ...r, courses: (r.courses || []).map((c) => c.id === id ? { ...c, [field]: val } : c) }));
  const removeCourse = (id) => setResume((r) => ({ ...r, courses: (r.courses || []).filter((c) => c.id !== id) }));
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">Courses</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      {courses.map((c) => (
        <AccordionItem key={c.id} label={c.name || 'Course'}>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="Course Name" value={c.name} onChange={(v) => updateCourse(c.id, 'name', v)} className="col-span-2" />
            <FormField label="Institution" value={c.institution} onChange={(v) => updateCourse(c.id, 'institution', v)} />
            <FormField label="Year" value={c.year} onChange={(v) => updateCourse(c.id, 'year', v)} />
          </div>
          <button type="button" onClick={() => removeCourse(c.id)} className="text-red-400 text-sm mt-2 hover:text-red-600">Remove</button>
        </AccordionItem>
      ))}
      <button type="button" onClick={addCourse} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-2">
        <Plus className="w-4 h-4" /> Add Course
      </button>
    </div>
  );
}

function ReferencesBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const refs = resume.references || [];
  const addRef = () => setResume((r) => ({ ...r, references: [...(r.references || []), { id: Date.now(), name: '', company: '', contact: '' }] }));
  const updateRef = (id, field, val) => setResume((r) => ({ ...r, references: (r.references || []).map((ref) => ref.id === id ? { ...ref, [field]: val } : ref) }));
  const removeRef = (id) => setResume((r) => ({ ...r, references: (r.references || []).filter((ref) => ref.id !== id) }));
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">References</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      {refs.map((ref) => (
        <AccordionItem key={ref.id} label={ref.name || 'Reference'}>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="Name" value={ref.name} onChange={(v) => updateRef(ref.id, 'name', v)} />
            <FormField label="Company" value={ref.company} onChange={(v) => updateRef(ref.id, 'company', v)} />
            <FormField label="Contact / Email" value={ref.contact} onChange={(v) => updateRef(ref.id, 'contact', v)} className="col-span-2" />
          </div>
          <button type="button" onClick={() => removeRef(ref.id)} className="text-red-400 text-sm mt-2 hover:text-red-600">Remove</button>
        </AccordionItem>
      ))}
      <button type="button" onClick={addRef} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-2">
        <Plus className="w-4 h-4" /> Add Reference
      </button>
    </div>
  );
}

function InternshipsBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const internships = resume.internships || [];
  const add = () => setResume((r) => ({ ...r, internships: [...(r.internships || []), { id: Date.now(), title: '', company: '', startDate: '', endDate: '' }] }));
  const update = (id, field, val) => setResume((r) => ({ ...r, internships: (r.internships || []).map((i) => i.id === id ? { ...i, [field]: val } : i) }));
  const remove = (id) => setResume((r) => ({ ...r, internships: (r.internships || []).filter((i) => i.id !== id) }));
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">Internships</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      {internships.map((i) => (
        <AccordionItem key={i.id} label={[i.title, i.company].filter(Boolean).join(' at ') || 'Internship'}>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="Job Title" value={i.title} onChange={(v) => update(i.id, 'title', v)} />
            <FormField label="Company" value={i.company} onChange={(v) => update(i.id, 'company', v)} />
            <FormField label="Start Date" value={i.startDate} onChange={(v) => update(i.id, 'startDate', v)} placeholder="MM/YYYY" />
            <FormField label="End Date" value={i.endDate} onChange={(v) => update(i.id, 'endDate', v)} placeholder="MM/YYYY" />
          </div>
          <button type="button" onClick={() => remove(i.id)} className="text-red-400 text-sm mt-2 hover:text-red-600">Remove</button>
        </AccordionItem>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-2">
        <Plus className="w-4 h-4" /> Add Internship
      </button>
    </div>
  );
}

function PublicationsBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const pubs = resume.publications || [];
  const add = () => setResume((r) => ({ ...r, publications: [...(r.publications || []), { id: Date.now(), title: '', publisher: '', year: '' }] }));
  const update = (id, field, val) => setResume((r) => ({ ...r, publications: (r.publications || []).map((p) => p.id === id ? { ...p, [field]: val } : p) }));
  const remove = (id) => setResume((r) => ({ ...r, publications: (r.publications || []).filter((p) => p.id !== id) }));
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Library className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">Publications</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      {pubs.map((p) => (
        <AccordionItem key={p.id} label={p.title || 'Publication'}>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="Title" value={p.title} onChange={(v) => update(p.id, 'title', v)} className="col-span-2" />
            <FormField label="Publisher" value={p.publisher} onChange={(v) => update(p.id, 'publisher', v)} />
            <FormField label="Year" value={p.year} onChange={(v) => update(p.id, 'year', v)} />
          </div>
          <button type="button" onClick={() => remove(p.id)} className="text-red-400 text-sm mt-2 hover:text-red-600">Remove</button>
        </AccordionItem>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-2">
        <Plus className="w-4 h-4" /> Add Publication
      </button>
    </div>
  );
}

function CustomBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const custom = resume.customSection || { title: '', content: '' };
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Plus className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">Custom Section</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3">
        <FormField label="Section Title" value={custom.title} onChange={(v) => setResume((r) => ({ ...r, customSection: { ...r.customSection, title: v } }))} placeholder="e.g. Volunteer Work" className="col-span-2" />
        <FormField label="Content" value={custom.content} onChange={(v) => setResume((r) => ({ ...r, customSection: { ...r.customSection, content: v } }))} placeholder="Describe this section…" className="col-span-2" />
      </div>
    </div>
  );
}

function ProjectsBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const projects = resume.projects || [];
  const add = () => setResume((r) => ({ ...r, projects: [...(r.projects || []), { id: Date.now(), name: '', description: '', url: '', year: '' }] }));
  const update = (id, field, val) => setResume((r) => ({ ...r, projects: (r.projects || []).map((p) => p.id === id ? { ...p, [field]: val } : p) }));
  const remove = (id) => setResume((r) => ({ ...r, projects: (r.projects || []).filter((p) => p.id !== id) }));
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Code2 className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">Projects</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      {projects.map((p) => (
        <AccordionItem key={p.id} label={p.name || 'Project'}>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="Project Name" value={p.name} onChange={(v) => update(p.id, 'name', v)} className="col-span-2" />
            <FormField label="Year" value={p.year} onChange={(v) => update(p.id, 'year', v)} placeholder="2024" />
            <FormField label="URL / Link" value={p.url} onChange={(v) => update(p.id, 'url', v)} placeholder="https://github.com/..." />
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={p.description}
                onChange={(e) => update(p.id, 'description', e.target.value)}
                rows={3}
                placeholder="Describe what you built, the tech stack, and impact…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>
          </div>
          <button type="button" onClick={() => remove(p.id)} className="text-red-400 text-sm mt-2 hover:text-red-600">Remove</button>
        </AccordionItem>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-2">
        <Plus className="w-4 h-4" /> Add Project
      </button>
    </div>
  );
}

function CertificationsBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const certs = resume.certifications || [];
  const add = () => setResume((r) => ({ ...r, certifications: [...(r.certifications || []), { id: Date.now(), name: '', issuer: '', year: '', url: '' }] }));
  const update = (id, field, val) => setResume((r) => ({ ...r, certifications: (r.certifications || []).map((c) => c.id === id ? { ...c, [field]: val } : c) }));
  const remove = (id) => setResume((r) => ({ ...r, certifications: (r.certifications || []).filter((c) => c.id !== id) }));
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">Certifications</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      {certs.map((c) => (
        <AccordionItem key={c.id} label={c.name || 'Certification'}>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="Certification Name" value={c.name} onChange={(v) => update(c.id, 'name', v)} className="col-span-2" />
            <FormField label="Issuing Organization" value={c.issuer} onChange={(v) => update(c.id, 'issuer', v)} />
            <FormField label="Year" value={c.year} onChange={(v) => update(c.id, 'year', v)} placeholder="2024" />
            <FormField label="Credential URL" value={c.url} onChange={(v) => update(c.id, 'url', v)} placeholder="https://..." className="col-span-2" />
          </div>
          <button type="button" onClick={() => remove(c.id)} className="text-red-400 text-sm mt-2 hover:text-red-600">Remove</button>
        </AccordionItem>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-2">
        <Plus className="w-4 h-4" /> Add Certification
      </button>
    </div>
  );
}

function VolunteerBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const vol = resume.volunteer || [];
  const add = () => setResume((r) => ({ ...r, volunteer: [...(r.volunteer || []), { id: Date.now(), role: '', organization: '', startDate: '', endDate: '', description: '' }] }));
  const update = (id, field, val) => setResume((r) => ({ ...r, volunteer: (r.volunteer || []).map((v) => v.id === id ? { ...v, [field]: val } : v) }));
  const remove = (id) => setResume((r) => ({ ...r, volunteer: (r.volunteer || []).filter((v) => v.id !== id) }));
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><HandHeart className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">Volunteer Work</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      {vol.map((v) => (
        <AccordionItem key={v.id} label={[v.role, v.organization].filter(Boolean).join(' at ') || 'Volunteer Role'}>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="Role / Position" value={v.role} onChange={(val) => update(v.id, 'role', val)} />
            <FormField label="Organization" value={v.organization} onChange={(val) => update(v.id, 'organization', val)} />
            <FormField label="Start Date" value={v.startDate} onChange={(val) => update(v.id, 'startDate', val)} placeholder="Jan 2022" />
            <FormField label="End Date" value={v.endDate} onChange={(val) => update(v.id, 'endDate', val)} placeholder="Dec 2022" />
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={v.description}
                onChange={(e) => update(v.id, 'description', e.target.value)}
                rows={2}
                placeholder="What did you do and what was the impact?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>
          </div>
          <button type="button" onClick={() => remove(v.id)} className="text-red-400 text-sm mt-2 hover:text-red-600">Remove</button>
        </AccordionItem>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-2">
        <Plus className="w-4 h-4" /> Add Volunteer Role
      </button>
    </div>
  );
}

function AwardsBlock({ onRemove }) {
  const { resume, setResume } = useResume();
  const awards = resume.awards || [];
  const add = () => setResume((r) => ({ ...r, awards: [...(r.awards || []), { id: Date.now(), title: '', issuer: '', year: '', description: '' }] }));
  const update = (id, field, val) => setResume((r) => ({ ...r, awards: (r.awards || []).map((a) => a.id === id ? { ...a, [field]: val } : a) }));
  const remove = (id) => setResume((r) => ({ ...r, awards: (r.awards || []).filter((a) => a.id !== id) }));
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Award className="w-4 h-4 text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-800">Awards &amp; Honors</h2>
        </div>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>
      {awards.map((a) => (
        <AccordionItem key={a.id} label={a.title || 'Award'}>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <FormField label="Award / Honor Title" value={a.title} onChange={(v) => update(a.id, 'title', v)} className="col-span-2" />
            <FormField label="Issuing Body" value={a.issuer} onChange={(v) => update(a.id, 'issuer', v)} />
            <FormField label="Year" value={a.year} onChange={(v) => update(a.id, 'year', v)} placeholder="2024" />
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
              <textarea
                value={a.description}
                onChange={(e) => update(a.id, 'description', e.target.value)}
                rows={2}
                placeholder="Brief description of this award…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>
          </div>
          <button type="button" onClick={() => remove(a.id)} className="text-red-400 text-sm mt-2 hover:text-red-600">Remove</button>
        </AccordionItem>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mt-2">
        <Plus className="w-4 h-4" /> Add Award
      </button>
    </div>
  );
}

const BLOCK_COMPONENTS = {
  projects: ProjectsBlock,
  certifications: CertificationsBlock,
  volunteer: VolunteerBlock,
  awards: AwardsBlock,
  hobbies: HobbiesBlock,
  courses: CoursesBlock,
  references: ReferencesBlock,
  internships: InternshipsBlock,
  publications: PublicationsBlock,
  custom: CustomBlock,
};

const SECTION_COMPONENTS = {
  personalInfo: PersonalInfoSection,
  education: EducationSection,
  skills: SkillsSection,
  languages: LanguagesSection,
  personalDetails: PersonalDetailsSection,
  summary: SummarySection,
  experience: ExperienceSection,
};

function JDTailoringPanel({ resume }) {
  const [jd, setJd] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [open, setOpen] = useState(false);

  const stripHtml = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  const analyze = async () => {
    if (!getStoredAIKey()) { setShowKeySetup(true); return; }
    if (!jd.trim()) { setError('Paste a job description first.'); return; }
    setLoading(true); setError(''); setResult('');
    const resumeText = [
      resume.personalInfo?.jobTitle,
      stripHtml(resume.summary),
      resume.experience?.map(e => `${e.position} at ${e.company}: ${stripHtml(e.description)}`).join('\n'),
      resume.skills?.map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join(', '),
    ].filter(Boolean).join('\n');
    try {
      const text = await tailorResumeToJob({ resumeText, jobDescription: jd });
      setResult(text);
    } catch (e) {
      if (e.message === 'NO_KEY') { setShowKeySetup(true); return; }
      setError(e.message || 'Analysis failed.');
    } finally { setLoading(false); }
  };

  const { Loader2, FileSearch, ChevronDown: CD, ChevronUp: CU, Sparkles } = {
    Loader2: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    FileSearch: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    ChevronDown: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>,
    ChevronUp: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="18 15 12 9 6 15"/></svg>,
    Sparkles: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z"/><path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z"/></svg>,
  };

  return (
    <div className="border border-orange-200 rounded-xl overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 hover:bg-orange-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <div className="text-left">
            <p className="text-sm font-bold text-orange-800">Job Description Tailoring</p>
            <p className="text-xs text-orange-600">Paste a job posting and get AI-powered optimization tips</p>
          </div>
        </div>
        {open ? <CU className="w-4 h-4 text-orange-500" /> : <CD className="w-4 h-4 text-orange-500" />}
      </button>
      {open && (
        <div className="p-4 bg-white space-y-3">
          <textarea
            value={jd}
            onChange={e => { setJd(e.target.value); setError(''); }}
            rows={5}
            placeholder="Paste the full job description here…"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="button"
            onClick={analyze}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyzing…' : 'Analyze & Optimize'}
          </button>
          {result && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mt-2">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
            </div>
          )}
        </div>
      )}
      {showKeySetup && <AIKeySetup onClose={() => setShowKeySetup(false)} onSaved={() => { setShowKeySetup(false); analyze(); }} />}
    </div>
  );
}

export default function FinishStep({ onNext, onBack }) {
  const { resume, setTemplate, setAccentColor, setTitle, setLanguage } = useResume();
  const p = resume.personalInfo;

  const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER);
  const [activeId, setActiveId] = useState(null);
  const [enabledBlocks, setEnabledBlocks] = useState([]);

  const displayTitle =
    resume.title || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'My Resume';

  // Use MouseSensor + TouchSensor instead of PointerSensor to avoid click interference
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragStart = ({ active }) => setActiveId(active.id);
  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setSectionOrder((prev) => arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id)));
  };

  const toggleBlock = (key) => {
    setEnabledBlocks((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const ActiveSectionComponent = activeId ? SECTION_COMPONENTS[activeId] : null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">

      {/* Cover letter banner */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4">
        <span className="text-sm text-gray-700 flex-1">✨ Create a job-specific cover letter based on this CV.</span>
        <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Create</button>
        <button type="button" className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>

      {/* Resume name */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 space-y-4">
        <FormField label="Resume Title" value={displayTitle} onChange={(v) => setTitle(v)} />
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <Plus className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-xs text-gray-500 flex-1">Duplicate your CV and tailor it to a specific job title with AI-optimized keywords.</p>
          <button type="button" className="text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
            Duplicate &amp; optimize for role
          </button>
        </div>
      </div>

      {/* Resume Formatting */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-800">Resume Formatting</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Template</label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTemplate(t.value)}
                  className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                    resume.template === t.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {resume.template === t.value && (
                    <Check className="w-3 h-3 absolute top-1.5 right-1.5 text-blue-500" />
                  )}
                  <span className="text-xs font-bold">{t.label}</span>
                  <span className="text-[9px] opacity-60 mt-0.5">{t.tag}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Accent Color</label>
            <div className="flex gap-2 flex-wrap items-center">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: c, boxShadow: resume.accentColor === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : undefined }}
                  title={c}
                >
                  {resume.accentColor === c && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              ))}
              {/* Custom color picker */}
              <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-400 transition-colors" title="Custom color">
                <input
                  type="color"
                  value={resume.accentColor || '#2563EB'}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-[9px] text-gray-400 pointer-events-none">+</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">Title Font</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-blue-400">
              {FONTS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">Body Font</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-blue-400">
              {BODY_FONTS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5">Resume Language</label>
            <select
              value={resume.language || 'en'}
              onChange={e => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-blue-400"
            >
              {RESUME_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drag-and-drop sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sectionOrder.map((sectionId) => {
              const SectionComp = SECTION_COMPONENTS[sectionId];
              return (
                <SortableSection key={sectionId} id={sectionId}>
                  {({ dragHandleProps }) => <SectionComp dragHandleProps={dragHandleProps} />}
                </SortableSection>
              );
            })}
          </div>
        </SortableContext>
        <DragOverlay>
          {ActiveSectionComponent && (
            <div className="opacity-90 shadow-2xl rotate-1">
              <ActiveSectionComponent dragHandleProps={{}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Active extra blocks */}
      {enabledBlocks.length > 0 && (
        <div className="space-y-4">
          {enabledBlocks.map((key) => {
            const BlockComp = BLOCK_COMPONENTS[key];
            return BlockComp ? (
              <BlockComp key={key} onRemove={() => toggleBlock(key)} />
            ) : null;
          })}
        </div>
      )}

      {/* Add Blocks */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
        <h2 className="font-bold text-gray-800 text-base mb-4">Add Blocks</h2>
        <div className="grid grid-cols-2 gap-3">
          {BLOCKS.map(({ key, label, icon: Icon }) => {
            const active = enabledBlocks.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleBlock(key)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all border ${
                  active
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
                {active ? <Check className="w-4 h-4 text-blue-500" /> : <Plus className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Job Description Tailoring */}
      <JDTailoringPanel resume={resume} />

      {/* Navigation */}
      <div className="flex justify-between items-center pb-4">
        <button type="button" onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          Next to Download →
        </button>
      </div>
    </div>
  );
}
