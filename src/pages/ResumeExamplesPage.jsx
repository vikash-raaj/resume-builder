import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const EXAMPLES = [
  { industry: 'Technology', role: 'Software Engineer', template: 'tech', accent: '#0f172a', tags: ['Entry Level', 'Tech', 'ATS-Friendly'], preview: '🖥️', highlights: ['Monospace terminal aesthetic', 'Skills progress bars', 'Tech-forward layout'] },
  { industry: 'Technology', role: 'Product Manager', template: 'modern', accent: '#2563EB', tags: ['Mid-Level', 'Business', 'Modern'], preview: '📱', highlights: ['Bold color header', 'Achievement-focused', 'Clean two-column'] },
  { industry: 'Finance', role: 'Financial Analyst', template: 'classic', accent: '#1f2937', tags: ['Professional', 'Finance', 'Traditional'], preview: '📊', highlights: ['Timeless serif style', 'Clear hierarchy', 'Conservative and polished'] },
  { industry: 'Design', role: 'UX Designer', template: 'minimal', accent: '#059669', tags: ['Creative', 'Design', 'Minimal'], preview: '🎨', highlights: ['Clean minimalist style', 'Typography-focused', 'Whitespace-led design'] },
  { industry: 'Executive', role: 'C-Suite / Director', template: 'executive', accent: '#1a1a2e', tags: ['Senior', 'Leadership', 'Executive'], preview: '👔', highlights: ['Dark authoritative header', 'Leadership-focused', 'Multi-column layout'] },
  { industry: 'Engineering', role: 'DevOps Engineer', template: 'riga', accent: '#1e3a6e', tags: ['Technical', 'Engineering', 'Structured'], preview: '⚙️', highlights: ['Classic structured layout', 'Skills sidebar', 'Traditional two-column'] },
  { industry: 'Marketing', role: 'Marketing Manager', template: 'modern', accent: '#dc2626', tags: ['Creative', 'Marketing', 'Bold'], preview: '📢', highlights: ['Bold accent color', 'Results-oriented', 'Modern and eye-catching'] },
  { industry: 'Healthcare', role: 'Nurse / Healthcare', template: 'classic', accent: '#0891b2', tags: ['Healthcare', 'Clinical', 'Professional'], preview: '🏥', highlights: ['Medical-appropriate design', 'Traditional format', 'Clear and readable'] },
  { industry: 'Education', role: 'Teacher / Educator', template: 'riga', accent: '#7c3aed', tags: ['Education', 'Academia', 'Structured'], preview: '🎓', highlights: ['Academic structure', 'Skills highlighted', 'Professional and warm'] },
  { industry: 'Sales', role: 'Sales Representative', template: 'modern', accent: '#059669', tags: ['Sales', 'Business', 'Results-Focused'], preview: '💼', highlights: ['Achievement-first layout', 'Bold numbers', 'High-energy design'] },
  { industry: 'Data Science', role: 'Data Scientist', template: 'tech', accent: '#7c3aed', tags: ['Technical', 'Analytics', 'Modern'], preview: '📈', highlights: ['Technical sidebar', 'Skills visualization', 'Data-forward layout'] },
  { industry: 'General', role: 'Fresh Graduate', template: 'minimal', accent: '#1e3a6e', tags: ['Entry Level', 'Clean', 'All Industries'], preview: '🎯', highlights: ['Clean and simple', 'Education prominent', 'Easy to read'] },
];

const INDUSTRIES = ['All', ...Array.from(new Set(EXAMPLES.map(e => e.industry)))];

function ExampleCard({ example, onUse }) {
  const accentStyle = { backgroundColor: example.accent };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all group flex flex-col">
      <div className="h-36 flex items-center justify-center relative" style={{ backgroundColor: example.accent + '18' }}>
        <div className="text-5xl">{example.preview}</div>
        <div className="absolute top-3 left-3">
          <div className="h-1.5 w-14 rounded-full" style={accentStyle} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1" style={accentStyle} />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{example.industry}</p>
        <h3 className="font-bold text-gray-900 text-sm mt-0.5 mb-2">{example.role}</h3>
        <div className="flex flex-wrap gap-1 mb-3">
          {example.tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{tag}</span>
          ))}
        </div>
        <ul className="space-y-1 mb-4 flex-1">
          {example.highlights.map(h => (
            <li key={h} className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={accentStyle} />
              {h}
            </li>
          ))}
        </ul>
        <button
          onClick={() => onUse(example)}
          className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
          style={accentStyle}
        >
          Use Template <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ResumeExamplesPage() {
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = EXAMPLES.filter(e => {
    const matchInd = selectedIndustry === 'All' || e.industry === selectedIndustry;
    const matchSearch = !search || e.role.toLowerCase().includes(search.toLowerCase()) || e.industry.toLowerCase().includes(search.toLowerCase());
    return matchInd && matchSearch;
  });

  const handleUse = (example) => {
    navigate('/builder', {
      state: { newTitle: `${example.role} Resume`, template: example.template, accentColor: example.accent },
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Examples</h1>
            <p className="text-sm text-gray-500">Browse by industry — click any to start with that template</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap mb-6 items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by role…"
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400 w-52"
          />
          <div className="flex gap-2 flex-wrap">
            {INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                  selectedIndustry === ind ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((example, i) => (
            <ExampleCard key={i} example={example} onUse={handleUse} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-16 text-gray-400">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>No examples match your search.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
