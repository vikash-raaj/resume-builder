const STEPS = ['CONTACT', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'ABOUT', 'FINISH IT', 'DOWNLOAD'];
const STEPS_SHORT = ['INFO', 'EXP', 'EDU', 'SKILLS', 'BIO', 'FINISH', 'GET'];

export default function StepProgressBar({ current, onStepClick }) {
  const pct = current === 0 ? 0 : (current / (STEPS.length - 1)) * 100;

  return (
    <div className="bg-white border-b border-gray-200 no-print">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 pb-4">
        {/* Labels — full on sm+, short on mobile */}
        <div className="flex justify-between mb-2">
          {STEPS.map((step, i) => (
            <button
              key={step}
              onClick={() => onStepClick?.(i)}
              className={`flex-1 text-center font-bold tracking-widest transition-colors ${
                i === current
                  ? 'text-blue-600'
                  : i < current
                  ? 'text-blue-400'
                  : 'text-gray-400'
              }`}
            >
              <span className="hidden sm:inline text-[10px]">{step}</span>
              <span className="sm:hidden text-[8px]">{STEPS_SHORT[i]}</span>
            </button>
          ))}
        </div>

        {/* Line + circles */}
        <div className="relative flex justify-between items-center">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
          {STEPS.map((step, i) => (
            <button
              key={step}
              onClick={() => onStepClick?.(i)}
              className={`relative z-10 w-3 h-3 rounded-full border-2 transition-all ${
                i < current
                  ? 'bg-blue-500 border-blue-500'
                  : i === current
                  ? 'bg-white border-blue-500'
                  : 'bg-white border-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
