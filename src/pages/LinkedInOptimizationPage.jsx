import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, ChevronDown, ChevronUp, TrendingUp, Zap } from 'lucide-react';
import AppLayout from '../components/AppLayout';

const SECTIONS = [
  {
    id: 'photo',
    title: 'Profile Photo',
    weight: 14,
    icon: '📸',
    tips: [
      'Use a high-resolution headshot (minimum 400×400 px)',
      'Professional attire appropriate for your industry',
      'Look directly at the camera with a genuine smile',
      'Plain or simple background — no vacation photos',
      'Up-to-date photo (within the last 3 years)',
    ],
    doNots: ['Group photos', 'Sunglasses or hats', 'Low-quality or cropped photos', 'Logo or cartoon avatar'],
  },
  {
    id: 'headline',
    title: 'Headline',
    weight: 18,
    icon: '✍️',
    tips: [
      'Default is your job title — change it to something more compelling',
      'Include your specialization and 1–2 key skills: "Senior React Engineer | Building Products Used by 1M+ Users"',
      'Use keywords recruiters search for (use LinkedIn job search to find them)',
      'Max 220 characters — make every word count',
      'Avoid vague words like "guru", "ninja", "expert" — be specific',
    ],
    doNots: ['Just your job title and company name', 'Buzzwords with no substance', '"Looking for new opportunities" as your whole headline'],
    example: '"Product Manager | 0→1 SaaS Products | Growth Strategy | Ex-Google | B2B & Consumer"',
  },
  {
    id: 'about',
    title: 'About / Summary',
    weight: 20,
    icon: '📝',
    tips: [
      'First 2–3 lines are visible before "see more" — make them hook the reader',
      'Structure: Who you are → What you do → What makes you different → CTA',
      'Write in first person — it\'s more human and engaging',
      'Include your top 3–5 achievements with numbers',
      'End with a call to action: "Open to…" or "Reach me at…"',
      '300–500 words is the sweet spot for most professionals',
    ],
    doNots: ['Copying your resume verbatim', 'Third person narration ("John is a passionate…")', 'Only listing skills with no narrative'],
  },
  {
    id: 'experience',
    title: 'Experience',
    weight: 22,
    icon: '💼',
    tips: [
      'Every role should have bullet points — not just a title',
      'Lead with results: "Grew revenue by 40%" beats "Responsible for growing revenue"',
      'Use numbers, percentages, and dollar amounts wherever possible',
      'Include the company\'s description (LinkedIn pulls it automatically, but verify it)',
      'Add media: presentations, articles, demos — LinkedIn loves rich media',
      'Match wording from job descriptions in your target roles',
    ],
    doNots: ['Duties-only descriptions ("Managed a team")', 'Leaving roles with no description', 'Dates that don\'t add up'],
  },
  {
    id: 'skills',
    title: 'Skills',
    weight: 14,
    icon: '⚡',
    tips: [
      'Add at least 10 skills — LinkedIn profiles with 5+ skills get 17x more profile views',
      'Pin your top 3 skills to appear first on your profile',
      'Get endorsed for your top skills — reach out to colleagues',
      'Add skills from your target job descriptions to appear in recruiter searches',
      'LinkedIn limits you to 50 skills — use them wisely',
    ],
    doNots: ['Generic skills everyone has (Microsoft Office)', 'Skills unrelated to your target role', 'Leaving this section empty'],
  },
  {
    id: 'recommendations',
    title: 'Recommendations',
    weight: 12,
    icon: '⭐',
    tips: [
      'Aim for at least 3 recommendations (ideally from managers)',
      'Request recommendations from people you worked closely with',
      'Make it easy for them: tell them what you want highlighted',
      'Give recommendations too — it encourages reciprocity',
      'A well-written recommendation beats 10 generic endorsements',
    ],
    doNots: ['Generic recommendations ("Great to work with!")', 'Only recommendations from peers — aim for at least 1 manager'],
  },
];

const KEYWORD_SUGGESTIONS = {
  'Software Engineer': ['React', 'Node.js', 'Python', 'AWS', 'Microservices', 'CI/CD', 'Agile', 'REST APIs', 'Docker', 'TypeScript'],
  'Product Manager': ['Product Roadmap', 'Agile', 'Scrum', 'KPIs', 'OKRs', 'User Research', 'Data Analysis', 'Go-to-Market', 'Stakeholder Management'],
  'Data Scientist': ['Machine Learning', 'Python', 'SQL', 'TensorFlow', 'Deep Learning', 'Statistical Modeling', 'NLP', 'A/B Testing', 'Tableau'],
  'Marketing Manager': ['SEO', 'Content Strategy', 'Google Ads', 'Email Marketing', 'Brand Strategy', 'Lead Generation', 'Analytics', 'Campaign Management'],
  'UX Designer': ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing', 'Wireframing', 'Interaction Design', 'Information Architecture'],
  'DevOps Engineer': ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD', 'Jenkins', 'Ansible', 'Site Reliability', 'Infrastructure as Code'],
};

export default function LinkedInOptimizationPage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState({});
  const [openSection, setOpenSection] = useState('headline');
  const [selectedRole, setSelectedRole] = useState('Software Engineer');

  const toggle = (sectionId, tipIdx) => {
    const key = `${sectionId}_${tipIdx}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const score = SECTIONS.reduce((sum, s) => {
    const totalTips = s.tips.length;
    const done = s.tips.filter((_, i) => checked[`${s.id}_${i}`]).length;
    return sum + Math.round((done / totalTips) * s.weight);
  }, 0);

  const scoreLabel = score >= 80 ? 'All-Star' : score >= 60 ? 'Good' : score >= 40 ? 'Intermediate' : 'Beginner';
  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-yellow-600' : 'text-red-500';
  const barColor = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LinkedIn Optimization</h1>
            <p className="text-sm text-gray-500">Optimize your profile to get found by more recruiters</p>
          </div>
        </div>

        {/* Score card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Your LinkedIn Score</p>
              <p className={`text-4xl font-black ${scoreColor}`}>{score}<span className="text-lg font-bold text-gray-300">/100</span></p>
              <p className={`text-sm font-semibold ${scoreColor} mt-0.5`}>{scoreLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-2">Check off tips as you complete them</p>
              <div className="text-sm text-gray-500">
                {SECTIONS.reduce((n, s) => n + s.tips.filter((_, i) => checked[`${s.id}_${i}`]).length, 0)}
                / {SECTIONS.reduce((n, s) => n + s.tips.length, 0)} tips done
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className={`h-3 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${score}%` }} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main sections */}
          <div className="lg:col-span-2 space-y-3">
            {SECTIONS.map(section => {
              const isOpen = openSection === section.id;
              const doneTips = section.tips.filter((_, i) => checked[`${section.id}_${i}`]).length;
              return (
                <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{section.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">{section.title}</p>
                        <p className="text-[10px] text-gray-400">{doneTips}/{section.tips.length} tips · {section.weight} pts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {doneTips === section.tips.length && <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Done</span>}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                      {section.example && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-500 mb-1">Example</p>
                          <p className="text-xs text-blue-800 italic">{section.example}</p>
                        </div>
                      )}
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Do This:</p>
                      {section.tips.map((tip, i) => (
                        <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                          <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${
                            checked[`${section.id}_${i}`] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-emerald-400'
                          }`}
                            onClick={() => toggle(section.id, i)}
                          >
                            {checked[`${section.id}_${i}`] && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm leading-relaxed ${checked[`${section.id}_${i}`] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{tip}</span>
                        </label>
                      ))}
                      {section.doNots && (
                        <>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-3 mb-2">Avoid:</p>
                          {section.doNots.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {d}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Keywords sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-yellow-500" />
                <h3 className="font-bold text-gray-900 text-sm">Power Keywords</h3>
              </div>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 mb-3"
              >
                {Object.keys(KEYWORD_SUGGESTIONS).map(r => <option key={r}>{r}</option>)}
              </select>
              <p className="text-[10px] text-gray-400 mb-3">Add these to your headline, about, and skills sections:</p>
              <div className="flex flex-wrap gap-1.5">
                {(KEYWORD_SUGGESTIONS[selectedRole] || []).map(kw => (
                  <span key={kw} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-medium">{kw}</span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
              <TrendingUp className="w-5 h-5 mb-3 opacity-80" />
              <h3 className="font-bold text-sm mb-2">Did you know?</h3>
              <ul className="space-y-2 text-xs opacity-90 leading-relaxed">
                <li>• Profiles with photos get <strong>21x</strong> more views</li>
                <li>• 5+ skills = <strong>17x</strong> more profile views</li>
                <li>• All-Star profiles get <strong>40x</strong> more opportunities</li>
                <li>• Recruiters use keywords to find candidates — match their language</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
