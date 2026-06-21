import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronDown, ChevronUp, Star, Lightbulb, Check, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { evaluateInterviewAnswer, getStoredAIKey } from '../utils/aiService';

const CATEGORIES = [
  {
    id: 'behavioral',
    label: 'Behavioral',
    color: 'purple',
    icon: '🧠',
    tip: 'Use the STAR method: Situation, Task, Action, Result',
    questions: [
      { q: 'Tell me about a time you handled a conflict at work.', hint: 'Describe a specific conflict, your role in resolving it, and the outcome. Focus on collaboration.' },
      { q: 'Describe a situation where you had to meet a tight deadline.', hint: 'Show planning, prioritization, and delivery. Quantify the impact if possible.' },
      { q: 'Give an example of when you showed leadership.', hint: 'Even without a title, you can show leadership through initiative, mentoring, or driving a project.' },
      { q: 'Tell me about a time you failed. What did you learn?', hint: 'Be honest. Interviewers want to see self-awareness and growth, not perfection.' },
      { q: 'Describe a time you had to work with someone difficult.', hint: 'Focus on empathy, communication, and finding common ground — not criticizing the other person.' },
      { q: 'Tell me about a project you\'re most proud of.', hint: 'Pick something meaningful where you made a clear impact. Structure: problem → your role → outcome.' },
      { q: 'How have you handled receiving critical feedback?', hint: 'Show you welcome feedback, acted on it, and improved as a result.' },
      { q: 'Describe a time you went above and beyond for a customer or colleague.', hint: 'Concrete actions matter more than vague claims. What specifically did you do?' },
    ],
  },
  {
    id: 'situational',
    label: 'Situational',
    color: 'blue',
    icon: '🎯',
    tip: 'These are hypothetical. Answer as: "I would…" and walk through your thinking.',
    questions: [
      { q: 'How would you handle being assigned to a project with unclear requirements?', hint: 'Show that you ask clarifying questions, document assumptions, and loop in stakeholders early.' },
      { q: 'What would you do if you disagreed with your manager\'s decision?', hint: 'Demonstrate that you speak up respectfully, back your position with data, but also know when to commit to the team decision.' },
      { q: 'How would you prioritize if you had three urgent tasks due at the same time?', hint: 'Show a framework: impact vs effort, deadlines, stakeholder communication, delegation.' },
      { q: 'What would you do if a key team member quit mid-project?', hint: 'Show adaptability: redistribute work, escalate if needed, communicate proactively.' },
      { q: 'How would you approach joining a new team where processes are broken?', hint: 'Listen first, understand the root causes, build trust before driving change.' },
      { q: 'What would you do if you discovered a teammate was taking credit for your work?', hint: 'Address it directly and professionally, document your contributions, and involve a manager only if needed.' },
    ],
  },
  {
    id: 'strengths',
    label: 'Strengths & Weaknesses',
    color: 'emerald',
    icon: '💪',
    tip: 'Be specific and genuine. Vague answers feel rehearsed.',
    questions: [
      { q: 'What is your greatest strength?', hint: 'Pick one strength relevant to the role. Prove it with a quick example, not just a claim.' },
      { q: 'What is your greatest weakness?', hint: 'Pick a real weakness, explain what you\'re doing to improve it, and show progress made.' },
      { q: 'What makes you stand out from other candidates?', hint: 'Combine your unique background, skills, and experience. Tie it back to what the role needs.' },
      { q: 'How do you handle stress and pressure?', hint: 'Give a specific strategy (prioritization, exercise, breaks) and back it with a real example.' },
      { q: 'Where do you see yourself in 5 years?', hint: 'Show ambition but connect it to growth within this company. Avoid saying you want their job.' },
    ],
  },
  {
    id: 'general',
    label: 'General / Role Fit',
    color: 'orange',
    icon: '🎤',
    tip: 'Do your research on the company before answering these.',
    questions: [
      { q: 'Tell me about yourself.', hint: 'Keep it under 2 minutes. Structure: Present (current role) → Past (relevant background) → Future (why this role).' },
      { q: 'Why do you want to work here?', hint: 'Research the company. Mention specific products, culture, values, or mission that genuinely excite you.' },
      { q: 'Why are you leaving your current job?', hint: 'Stay positive. Focus on growth opportunities, not frustrations. Never badmouth a past employer.' },
      { q: 'What do you know about our company?', hint: 'Mention recent news, their product, mission, or culture. Show genuine interest.' },
      { q: 'Do you have any questions for us?', hint: 'Always have 3 questions ready. Ask about the team, what success looks like in 90 days, or current challenges.' },
      { q: 'What salary are you expecting?', hint: 'Research market rates first. Give a range based on data. "Based on my research and experience, I\'m targeting X–Y."' },
    ],
  },
];

const STAR_STEPS = [
  { letter: 'S', word: 'Situation', desc: 'Set the scene. Where were you, what was happening?', color: 'bg-blue-100 text-blue-700' },
  { letter: 'T', word: 'Task', desc: 'What was your responsibility in that situation?', color: 'bg-purple-100 text-purple-700' },
  { letter: 'A', word: 'Action', desc: 'What specific steps did YOU take? (use "I", not "we")', color: 'bg-orange-100 text-orange-700' },
  { letter: 'R', word: 'Result', desc: 'What was the outcome? Quantify it if possible.', color: 'bg-emerald-100 text-emerald-700' },
];

const colorMap = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
};

function QuestionCard({ q, hint, color, category }) {
  const [open, setOpen] = useState(false);
  const [practiced, setPracticed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const c = colorMap[color];

  const hasKey = !!getStoredAIKey();

  const handleGetFeedback = async () => {
    if (!answer.trim()) return;
    setLoadingFeedback(true);
    setFeedback('');
    setFeedbackError('');
    try {
      const result = await evaluateInterviewAnswer({ question: q, answer, category });
      setFeedback(result);
    } catch (err) {
      setFeedbackError(err.message === 'NO_KEY'
        ? 'Add your Claude API key in the Resume Builder to use AI feedback.'
        : 'Failed to get feedback. Please try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${practiced ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1">
          {practiced && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />}
          <span className="text-sm font-medium text-gray-800">{q}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className={`flex items-start gap-2.5 mt-3 p-3 rounded-xl ${c.bg} ${c.border} border`}>
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
            <p className="text-sm text-gray-700 leading-relaxed">{hint}</p>
          </div>
          <div className="mt-3">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Your Practice Answer</label>
            <textarea
              rows={4}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here to practice and review…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <button
              onClick={() => setPracticed(p => !p)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                practiced ? 'bg-emerald-100 text-emerald-700' : 'border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              <Check className="w-3.5 h-3.5" /> {practiced ? 'Practiced ✓' : 'Mark as practiced'}
            </button>
            {answer.trim().length > 20 && (
              <button
                onClick={handleGetFeedback}
                disabled={loadingFeedback}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-60"
              >
                {loadingFeedback
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</>
                  : <><Sparkles className="w-3.5 h-3.5" /> Get AI Feedback</>}
              </button>
            )}
          </div>

          {feedbackError && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{feedbackError}</div>
          )}

          {feedback && (
            <div className="mt-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">AI Coach Feedback</span>
              </div>
              <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{feedback}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewPrepPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('behavioral');

  const category = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview Prep</h1>
            <p className="text-sm text-gray-500">Practice common interview questions with tips and the STAR method</p>
          </div>
        </div>

        {/* STAR method explainer */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-gray-900">The STAR Method</h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">For behavioral questions</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STAR_STEPS.map(s => (
              <div key={s.letter} className={`rounded-xl p-3 ${s.color.split(' ')[0]}`}>
                <div className={`text-2xl font-black mb-1 ${s.color.split(' ')[1]}`}>{s.letter}</div>
                <div className={`font-bold text-sm mb-1 ${s.color.split(' ')[1]}`}>{s.word}</div>
                <div className="text-xs text-gray-600 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => {
            const c = colorMap[cat.color];
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  activeCategory === cat.id
                    ? `${c.bg} ${c.border} ${c.badge}`
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            );
          })}
        </div>

        {/* Questions */}
        {category && (
          <div>
            <div className={`flex items-center gap-2.5 mb-4 px-4 py-3 rounded-xl ${colorMap[category.color].bg} border ${colorMap[category.color].border}`}>
              <Lightbulb className="w-4 h-4 opacity-70 flex-shrink-0" />
              <p className="text-sm text-gray-700">{category.tip}</p>
            </div>
            <div className="space-y-2">
              {category.questions.map((item, i) => (
                <QuestionCard key={i} {...item} color={category.color} category={category.label} />
              ))}
            </div>
          </div>
        )}

        {/* Tips section */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">General Interview Tips</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Research the company deeply before the interview — products, recent news, culture',
              'Prepare 5–7 STAR stories that you can adapt to different behavioral questions',
              'Always have 3 thoughtful questions ready to ask the interviewer',
              'Arrive or log in 10 minutes early. Test your camera and mic for video calls',
              'Send a thank-you email within 24 hours of the interview',
              'Practice out loud — answering in your head is very different from speaking',
              'Bring copies of your resume (in-person) or have it open on screen (virtual)',
              'Salary negotiation: always research ranges first. Never give a number first if you can help it',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
