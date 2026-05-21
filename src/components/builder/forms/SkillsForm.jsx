import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import FormField from '../FormField';
import SkillLevelSlider from '../SkillLevelSlider';

const blank = () => ({ id: Date.now() + Math.random(), name: '', level: 3 });

const LEVELS = ['Novice', 'Beginner', 'Skillful', 'Experienced', 'Expert'];

function headerLabel(skill) {
  if (!skill.name) return 'New Skill';
  return `${skill.name}, ${LEVELS[(skill.level ?? 3) - 1]}`;
}

export default function SkillsForm({ onNext, onBack }) {
  const { resume, updateSkills } = useResume();
  const [open, setOpen] = useState(null);
  const [viewAsTags, setViewAsTags] = useState(false);
  const [hideLevel, setHideLevel] = useState(false);
  const skills = resume.skills;

  const normalise = (s) =>
    typeof s === 'string'
      ? { id: s + Math.random(), name: s, level: 3 }
      : { ...s, level: typeof s.level === 'string' ? 3 : (s.level ?? 3) };

  const normSkills = skills.map(normalise);

  const add = () => {
    const s = blank();
    updateSkills([...normSkills, s]);
    setOpen(s.id);
  };

  const remove = (id) => {
    updateSkills(normSkills.filter((s) => s.id !== id));
    if (open === id) setOpen(null);
  };

  const update = (id, field, value) =>
    updateSkills(normSkills.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        <span className="text-blue-500">Tell us</span> about your skills
      </h1>
      <p className="text-gray-500 mb-8">Pick 6 skills that match the job ad.</p>

      <div className="space-y-2 mb-4">
        {normSkills.map((skill) => (
          <div key={skill.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(open === skill.id ? null : skill.id)}
            >
              <span className="text-sm text-gray-700 font-medium truncate pr-4">
                {headerLabel(skill)}
              </span>
              {open === skill.id ? (
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {open === skill.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-52 flex-shrink-0">
                    <FormField
                      label="Skill"
                      value={skill.name}
                      onChange={(v) => update(skill.id, 'name', v)}
                      placeholder="e.g. Legal Research"
                    />
                  </div>
                  {!hideLevel && (
                    <SkillLevelSlider
                      level={skill.level}
                      onChange={(v) => update(skill.id, 'level', v)}
                    />
                  )}
                </div>
                <button
                  onClick={() => remove(skill.id)}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-sm transition-colors mt-3"
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
        className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 mb-6"
      >
        <Plus className="w-4 h-4" /> Add Skill
      </button>

      {/* Toggles */}
      <div className="flex items-center justify-between py-3 border-t border-dashed border-gray-200 mb-6">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setViewAsTags(!viewAsTags)}
            className={`w-10 h-5 rounded-full relative transition-colors ${viewAsTags ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${viewAsTags ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-sm text-gray-600">View skills as tags</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setHideLevel(!hideLevel)}
            className={`w-10 h-5 rounded-full relative transition-colors ${hideLevel ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hideLevel ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-sm text-gray-600">Hide experience level</span>
        </label>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          Next to About →
        </button>
      </div>
    </div>
  );
}
