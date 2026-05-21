const LEVELS = ['Novice', 'Beginner', 'Skillful', 'Experienced', 'Expert'];

export default function SkillLevelSlider({ level = 3, onChange }) {
  const label = LEVELS[(level ?? 3) - 1] ?? 'Expert';

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-end gap-1.5 mb-1">
        <span className="text-xs text-gray-500">Level –</span>
        <span className="text-sm font-semibold text-emerald-600">{label}</span>
      </div>
      <div className="relative flex items-center">
        {/* Tick marks */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-yellow-400/70 z-10 pointer-events-none"
            style={{ left: `${(i / 4) * 100}%` }}
          />
        ))}
        <input
          type="range"
          min={1}
          max={5}
          value={level ?? 3}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="skill-slider"
        />
      </div>
    </div>
  );
}
