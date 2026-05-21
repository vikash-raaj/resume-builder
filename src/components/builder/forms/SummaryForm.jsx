import { useResume } from '../../../context/ResumeContext';
import RichTextEditor from '../RichTextEditor';

export default function SummaryForm({ onNext, onBack }) {
  const { resume, updateSummary } = useResume();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        <span className="text-blue-500">Write down</span> your professional summary
      </h1>
      <p className="text-gray-500 mb-8">
        Write 2–4 short lines about your work, wins, and skills.
      </p>

      <RichTextEditor
        value={resume.summary}
        onChange={updateSummary}
        label="SUMMARY"
        placeholder="Advocate enrolled with the Bar Council, practicing before the High Court since…"
      />

      <div className="flex justify-between items-center mt-8">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          Next to Finish it →
        </button>
      </div>
    </div>
  );
}
