import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import {
  FileText, Upload, LayoutGrid, Kanban, Mail, MailOpen, Send, Briefcase,
  MessageCircle, TrendingUp, DollarSign, Sparkles, HelpCircle, ChevronDown, PlayCircle,
} from 'lucide-react';

const SECTIONS = [
  {
    id: 'builder',
    icon: FileText,
    color: 'blue',
    title: 'Resume Builder',
    blurb: 'Build a professional resume in a guided, step-by-step wizard, then export or share it.',
    steps: [
      'From the Dashboard, click "New Resume" and give it a name — this starts the builder.',
      'Fill in each step in order: Contact → Experience → Education → Skills → About/Summary. You can jump between steps using the tabs at the top at any time.',
      'In Experience and Summary, use the "AI Writing Assistant" panel to generate bullet points or a summary from what you\'ve already entered — see the "AI Writing Assistant" section below for how to enable it.',
      'On the "Finish It" step, pick a template (6 available), an accent color, and a font, then drag sections up/down to reorder them or add extra sections (Projects, Certifications, Volunteer Work, Awards, Languages, References, Custom).',
      'On the "Download" step: export as PDF or Word (.docx), generate a shareable public link, show a QR code linking to it, check your ATS score, or save/restore named versions.',
      'Your work auto-saves as you go (and with Cmd/Ctrl+S) — you can safely close the tab and resume later from the Dashboard.',
    ],
    tips: ['Your resume is saved as a draft in your browser even if you\'re not signed in — sign in before you\'re done to keep it permanently in your account.'],
  },
  {
    id: 'import',
    icon: Upload,
    color: 'indigo',
    title: 'Import Resume (PDF / Word)',
    blurb: 'Already have a resume? Upload it and skip retyping everything from scratch.',
    steps: [
      'On the Dashboard, click "Import Resume" in the top bar — or "Import from PDF/Word" in the empty state if you have no resumes yet.',
      'Choose a PDF or DOCX file. It must be a real text-based document — scanned/image-only resumes can\'t be read automatically.',
      'The app extracts your contact info, work experience, education, and skills automatically and opens the builder pre-filled.',
      'Review every section carefully — automatic extraction is a strong starting point but isn\'t always perfect, especially for resumes with unusual multi-column layouts.',
    ],
    tips: ['Add your AI key first (see "AI Writing Assistant" below) for meaningfully better parsing — without it, the import falls back to a simpler pattern-matching method.'],
  },
  {
    id: 'dashboard',
    icon: LayoutGrid,
    color: 'sky',
    title: 'Dashboard — Managing Your Resumes',
    blurb: 'Your home base for every resume you\'ve created.',
    steps: [
      'Each resume shows as a card with a live thumbnail preview, completeness score, and quick actions.',
      'Use the card menu to Duplicate (great for tailoring one resume to multiple jobs), Edit, or Delete a resume.',
      'The free plan allows up to 3 resumes — upgrade to Pro from the banner for unlimited resumes, all templates, DOCX export, and version history.',
    ],
  },
  {
    id: 'job-tracker',
    icon: Kanban,
    color: 'amber',
    title: 'Job Tracker',
    blurb: 'A Kanban board to track every application from first click to offer.',
    steps: [
      'Click "Add Application" to log a company, role, and the resume/cover letter you used for it.',
      'Drag a card between columns — Applied, Interview, Offer, Rejected — as your application progresses.',
      'Open a card to add notes, interview dates, or update details at any time.',
    ],
  },
  {
    id: 'cover-letters',
    icon: Mail,
    color: 'purple',
    title: 'Cover Letter Builder',
    blurb: 'Generate a tailored cover letter to go with any resume.',
    steps: [
      'From "Cover Letter" in the sidebar, click to create a new one and fill in the recipient/company details.',
      'Use "Generate with AI" to draft the full letter body from your details, then edit freely.',
      'Download as PDF when you\'re happy with it, or pair it with a resume in the Application Kit.',
    ],
  },
  {
    id: 'resignation-letter',
    icon: MailOpen,
    color: 'rose',
    title: 'Resignation Letter Generator',
    blurb: 'Create a clean, professional resignation letter in minutes.',
    steps: [
      'Open "Resignation Letter" from the sidebar and fill in your name, role, company, and last working day.',
      'Click "Generate Letter" — it fills a professional resignation template with your details, ready to review and tweak.',
      'Download the finished letter, or duplicate it later if you need a slightly different version.',
    ],
  },
  {
    id: 'recommendation-letter',
    icon: Send,
    color: 'teal',
    title: 'Recommendation Letter Generator',
    blurb: 'Draft a recommendation letter for a colleague, employee, or student.',
    steps: [
      'Open "Recommendation Letter" from the sidebar and enter details about the person and your relationship to them.',
      'Pick a tone — Warm, Professional, or Short — then generate a draft.',
      'Edit in specific, personal examples — the more specific, the more credible — then download the final letter.',
    ],
  },
  {
    id: 'application-kit',
    icon: Briefcase,
    color: 'emerald',
    title: 'Application Kit',
    blurb: 'Bundle a matching resume and cover letter for one specific job application.',
    steps: [
      'Open "Application Kit" from the sidebar.',
      'Step 1: select the resume you want to use for this application.',
      'Step 2: select the matching cover letter.',
      'Step 3: export both as PDF, ready to attach to the job application.',
    ],
  },
  {
    id: 'resume-examples',
    icon: LayoutGrid,
    color: 'cyan',
    title: 'Resume Examples',
    blurb: 'Browse real example resumes by industry for inspiration and formatting ideas.',
    steps: [
      'Open "Resume Examples" from the sidebar.',
      'Use the search box or industry filter chips to find examples relevant to your target role.',
      'Use an example as a reference for structure and wording — don\'t copy it verbatim.',
    ],
  },
  {
    id: 'interview-prep',
    icon: MessageCircle,
    color: 'violet',
    title: 'Interview Prep',
    blurb: 'Practice common interview questions organized by category, using the STAR method.',
    steps: [
      'Open "Interview Prep" from the sidebar and pick a category: Behavioral, Situational, Strengths & Weaknesses, or General / Role Fit.',
      'Expand a question to see a hint on how to structure a strong answer.',
      'Use the STAR method — Situation, Task, Action, Result — to structure your practice answers.',
    ],
  },
  {
    id: 'linkedin-optimizer',
    icon: TrendingUp,
    color: 'blue',
    title: 'LinkedIn Optimizer',
    blurb: 'A checklist-style audit to strengthen your LinkedIn profile.',
    steps: [
      'Open "LinkedIn Optimizer" from the sidebar.',
      'Work through each section — Profile Photo, Headline, About/Summary, Experience, Skills, Recommendations — checking off items as you complete them on your actual LinkedIn profile.',
      'Watch your overall score climb as you complete more of the checklist.',
    ],
  },
  {
    id: 'salary-insights',
    icon: DollarSign,
    color: 'green',
    title: 'Salary Insights',
    blurb: 'Look up estimated salary ranges by role and market.',
    steps: [
      'Open "Salary Insights" from the sidebar.',
      'Pick a market — United States, United Kingdom, India, or Remote (Global).',
      'Pick a category (Engineering, Data & AI, Product & Design, Business, and more) and then a specific role to see its estimated low/mid/high salary range.',
    ],
    tips: ['Figures are reference estimates for general guidance, not a guarantee — always confirm against current listings for your exact role and location.'],
  },
  {
    id: 'ai-features',
    icon: Sparkles,
    color: 'purple',
    title: 'AI Writing Assistant',
    blurb: 'Optional AI-powered writing help used throughout the builder — bullet points, summaries, and resume-to-job tailoring.',
    steps: [
      'Get a free API key at console.anthropic.com (an Anthropic account).',
      'Click any "Generate with AI" prompt in the app — you\'ll be asked to paste your key the first time. It\'s stored only in your browser, never on our servers.',
      'Use it inside the builder to generate Experience bullet points and a professional Summary from what you\'ve already entered.',
      'On the "Finish It" step (or from a resume\'s menu on the Dashboard), use "Job Description Tailoring" — paste a job posting and get suggestions for matching your resume to it.',
      'The same key also powers smarter, more accurate parsing when you use Import Resume.',
    ],
    tips: ['AI features are entirely optional — every core tool (builder, templates, export, job tracker, etc.) works without a key.'],
  },
];

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  rose: 'bg-rose-50 text-rose-600',
  teal: 'bg-teal-50 text-teal-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  violet: 'bg-violet-50 text-violet-600',
  green: 'bg-green-50 text-green-600',
};

function HelpSection({ section, open, onToggle }) {
  const Icon = section.icon;
  return (
    <div id={section.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden scroll-mt-24">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[section.color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-gray-900">{section.title}</h2>
          <p className="text-sm text-gray-500">{section.blurb}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pl-[4.75rem]">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">How to use it</p>
          <ol className="space-y-2 mb-3">
            {section.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {section.tips?.map((tip, i) => (
            <div key={i} className="flex gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 text-xs text-blue-800">
              <span className="font-semibold flex-shrink-0">Tip:</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HelpCenterPage() {
  const [openId, setOpenId] = useState('builder');

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
            <p className="text-sm text-gray-500">How to use every tool, one by one</p>
          </div>
        </div>

        {/* Quick jump */}
        <div className="flex flex-wrap gap-2 my-6">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setOpenId(s.id)}
              className="text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
            >
              {s.title}
            </a>
          ))}
          <a
            href="#demo-video"
            className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
          >
            Demo Video
          </a>
        </div>

        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <HelpSection
              key={section.id}
              section={section}
              open={openId === section.id}
              onToggle={() => setOpenId(openId === section.id ? null : section.id)}
            />
          ))}
        </div>

        {/* Demo video — full real-life walkthrough of every tool */}
        <div id="demo-video" className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden scroll-mt-24">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Full Demo Walkthrough</h2>
              <p className="text-sm text-gray-500">See every tool used end-to-end, the way you'd actually use it in real life.</p>
            </div>
          </div>
          <div className="p-5">
            <video
              controls
              preload="metadata"
              className="w-full rounded-xl border border-gray-200 bg-black"
            >
              <source src="/demo/help-center-walkthrough.webm" type="video/webm" />
              Your browser doesn't support embedded video — you can still follow the written steps above.
            </video>
            <p className="text-xs text-gray-400 mt-3">
              Signing up → building a resume → templates → exporting/sharing → Job Tracker → Cover Letter Builder →
              Resignation &amp; Recommendation Letters → Application Kit → Resume Examples → Interview Prep →
              LinkedIn Optimizer → Salary Insights — captioned, no audio.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Still stuck? Reach out from the "Contact" link in the sidebar.
        </p>
      </div>
    </AppLayout>
  );
}
