import { useState } from 'react';
import { BookOpen, Search, Plus, Check } from 'lucide-react';
import { getBulletsForTitle, JOB_TITLE_LIST, BULLET_LIBRARY } from '../../utils/bulletLibrary';

export default function BulletLibraryPanel({ jobTitle, onInsert }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inserted, setInserted] = useState({});
  const [selectedTitle, setSelectedTitle] = useState('');

  const matchedTitle = selectedTitle || jobTitle || '';
  const bullets = matchedTitle ? getBulletsForTitle(matchedTitle) : [];

  const filteredBullets = search
    ? bullets.filter(b => b.toLowerCase().includes(search.toLowerCase()))
    : bullets;

  const filteredTitles = search && !bullets.length
    ? JOB_TITLE_LIST.filter(t => t.toLowerCase().includes(search.toLowerCase()))
    : JOB_TITLE_LIST;

  const handleInsert = (bullet) => {
    onInsert(bullet);
    setInserted(prev => ({ ...prev, [bullet]: true }));
    setTimeout(() => setInserted(prev => ({ ...prev, [bullet]: false })), 2000);
  };

  return (
    <div className="mt-3 border border-emerald-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
      >
        <BookOpen className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span className="text-sm font-semibold text-emerald-800 flex-1">Pre-written Bullet Library</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-200 text-emerald-700 rounded-full">
          {Object.values(BULLET_LIBRARY).flat().length}+ bullets
        </span>
        <svg className={`w-4 h-4 text-emerald-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="p-4 bg-white space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={bullets.length ? "Filter bullets…" : "Search job titles…"}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          {/* Job title selector — show if no bullets matched or no title set */}
          {(!matchedTitle || !bullets.length) && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Select a job title</p>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {filteredTitles.slice(0, 20).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setSelectedTitle(t); setSearch(''); }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedTitle === t
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bullets list */}
          {filteredBullets.length > 0 && (
            <div>
              {matchedTitle && (
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {matchedTitle} · {filteredBullets.length} bullets
                  </p>
                  {selectedTitle && (
                    <button
                      type="button"
                      onClick={() => { setSelectedTitle(''); setSearch(''); }}
                      className="text-[10px] text-gray-400 hover:text-gray-600"
                    >
                      Change title
                    </button>
                  )}
                </div>
              )}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {filteredBullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group">
                    <p className="text-xs text-gray-700 flex-1 leading-relaxed">{bullet}</p>
                    <button
                      type="button"
                      onClick={() => handleInsert(bullet)}
                      className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        inserted[bullet]
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-white border border-gray-200 text-gray-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 group-hover:border-emerald-300'
                      }`}
                      title="Add to description"
                    >
                      {inserted[bullet] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedTitle && filteredBullets.length === 0 && search && (
            <p className="text-xs text-gray-400 text-center py-2">No bullets match "{search}"</p>
          )}
        </div>
      )}
    </div>
  );
}
