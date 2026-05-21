import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import FormField from '../FormField';
import RichTextEditor from '../RichTextEditor';

const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() + 2 - i));

const blank = () => ({
  id: Date.now() + Math.random(),
  school: '',
  degree: '',
  gradYear: '',
  city: '',
  field: '',
  gpa: '',
  description: '',
});

function headerLabel(edu) {
  if (!edu.school && !edu.degree) return 'New Education';
  const parts = [edu.degree, edu.school].filter(Boolean).join(' at ');
  return edu.gradYear ? `${parts}, ${edu.gradYear}` : parts;
}

export default function EducationForm({ onNext, onBack }) {
  const { resume, updateEducation } = useResume();
  const [open, setOpen] = useState(null);
  const items = resume.education;

  const add = () => {
    const e = blank();
    updateEducation([...items, e]);
    setOpen(e.id);
  };

  const remove = (id) => {
    updateEducation(items.filter((e) => e.id !== id));
    if (open === id) setOpen(null);
  };

  const update = (id, field, value) =>
    updateEducation(items.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        <span className="text-blue-500">Please enter</span> your education information
      </h1>
      <p className="text-gray-500 mb-8">Write your schools or courses you finished.</p>

      <div className="space-y-2 mb-4">
        {items.map((edu) => (
          <div key={edu.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(open === edu.id ? null : edu.id)}
            >
              <span className="text-sm text-gray-700 font-medium truncate pr-4">
                {headerLabel(edu)}
              </span>
              {open === edu.id ? (
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {open === edu.id && (
              <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="School"
                    value={edu.school}
                    onChange={(v) => update(edu.id, 'school', v)}
                    placeholder="e.g. Amity University, Patna"
                    className="col-span-2"
                  />
                  <FormField
                    label="Degree"
                    value={edu.degree}
                    onChange={(v) => update(edu.id, 'degree', v)}
                    placeholder="e.g. LL.M"
                  />
                  <FormField
                    label="City"
                    value={edu.city}
                    onChange={(v) => update(edu.id, 'city', v)}
                    placeholder="Patna"
                  />

                  {/* Graduation year dropdown */}
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <div className="flex-1 px-3 py-2">
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 leading-none mb-1">
                        Graduation Date
                      </label>
                      <select
                        value={edu.gradYear}
                        onChange={(e) => update(edu.id, 'gradYear', e.target.value)}
                        className="w-full outline-none text-gray-800 text-sm bg-transparent"
                      >
                        <option value="">Select year</option>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <FormField
                    label="Field of Study"
                    value={edu.field}
                    onChange={(v) => update(edu.id, 'field', v)}
                    placeholder="e.g. Constitutional Law"
                  />
                </div>

                <RichTextEditor
                  key={edu.id}
                  value={edu.description}
                  onChange={(v) => update(edu.id, 'description', v)}
                  placeholder="Write about this degree, achievements, relevant coursework…"
                />

                <button
                  onClick={() => remove(edu.id)}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mb-8"
      >
        <Plus className="w-4 h-4" /> Add Education
      </button>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          Next to Skills →
        </button>
      </div>
    </div>
  );
}
