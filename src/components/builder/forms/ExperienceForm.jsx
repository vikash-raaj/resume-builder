import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import FormField from '../FormField';
import RichTextEditor from '../RichTextEditor';

const blank = () => ({
  id: Date.now() + Math.random(),
  title: '',
  company: '',
  startDate: '',
  endDate: '',
  city: '',
  current: false,
  hideMonth: false,
  showDuration: false,
  description: '',
});

function headerLabel(job) {
  if (!job.title && !job.company) return 'New Position';
  const parts = [job.title, job.company].filter(Boolean).join(' from ');
  const dateRange = [job.startDate, job.current ? 'Present' : job.endDate].filter(Boolean).join(' - ');
  return dateRange ? `${parts}, ${dateRange}` : parts;
}

export default function ExperienceForm({ onNext, onBack }) {
  const { resume, updateExperience } = useResume();
  const [open, setOpen] = useState(null);
  const jobs = resume.experience;

  const add = () => {
    const j = blank();
    updateExperience([...jobs, j]);
    setOpen(j.id);
  };

  const remove = (id) => {
    updateExperience(jobs.filter((j) => j.id !== id));
    if (open === id) setOpen(null);
  };

  const update = (id, field, value) =>
    updateExperience(jobs.map((j) => (j.id === id ? { ...j, [field]: value } : j)));

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        <span className="text-blue-500">Tell us</span> about your experience
      </h1>
      <p className="text-gray-500 mb-8">
        Write your jobs (recent ones) with short points of what you did.
      </p>

      <div className="space-y-2 mb-4">
        {jobs.map((job) => (
          <div key={job.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            {/* Accordion header */}
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(open === job.id ? null : job.id)}
            >
              <span className="text-sm text-gray-700 font-medium truncate pr-4">
                {headerLabel(job)}
              </span>
              {open === job.id ? (
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {/* Accordion body */}
            {open === job.id && (
              <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="Job Title"
                    value={job.title}
                    onChange={(v) => update(job.id, 'title', v)}
                    placeholder="e.g. Independent Practice"
                  />
                  <FormField
                    label="Employer"
                    value={job.company}
                    onChange={(v) => update(job.id, 'company', v)}
                    placeholder="e.g. High Court"
                  />
                  <FormField
                    label="Start Date"
                    value={job.startDate}
                    onChange={(v) => update(job.id, 'startDate', v)}
                    placeholder="Sep 2024"
                  />
                  <FormField
                    label="End Date"
                    value={job.current ? '' : job.endDate}
                    onChange={(v) => update(job.id, 'endDate', v)}
                    placeholder={job.current ? 'Present' : 'Dec 2024'}
                    readOnly={job.current}
                  />
                  <FormField
                    label="City"
                    value={job.city}
                    onChange={(v) => update(job.id, 'city', v)}
                    placeholder="Patna"
                    className="col-span-2"
                  />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={job.current}
                      onChange={(e) => update(job.id, 'current', e.target.checked)}
                      className="rounded accent-blue-600"
                    />
                    I currently work here
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={job.hideMonth}
                      onChange={(e) => update(job.id, 'hideMonth', e.target.checked)}
                      className="rounded accent-blue-600"
                    />
                    Hide month
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={job.showDuration}
                    onChange={(e) => update(job.id, 'showDuration', e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  Show duration
                </label>

                <RichTextEditor
                  key={job.id}
                  value={job.description}
                  onChange={(v) => update(job.id, 'description', v)}
                  placeholder="• Represented clients in civil, criminal, and constitutional matters…"
                />

                <button
                  onClick={() => remove(job.id)}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-sm transition-colors mt-2"
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
        <Plus className="w-4 h-4" />
        Add Employment
      </button>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          Next to Education →
        </button>
      </div>
    </div>
  );
}
