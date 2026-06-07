import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, Briefcase, Check, ExternalLink, Download, Package } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import AuthPrompt from '../components/AuthPrompt';

function ItemCard({ icon: Icon, label, name, color, onOpen }) {
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${color} hover:shadow-sm transition-all cursor-pointer group`} onClick={onOpen}>
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
        <p className="text-[10px] text-gray-400">{label}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </div>
  );
}

export default function ApplicationKitPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedCL, setSelectedCL] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      getDocs(query(collection(db, 'users', user.uid, 'resumes'), orderBy('updatedAt', 'desc'))).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, 'users', user.uid, 'coverLetters'), orderBy('updatedAt', 'desc'))).catch(() => ({ docs: [] })),
    ]).then(([rSnap, clSnap]) => {
      setResumes(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCoverLetters(clSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return <AppLayout><AuthPrompt title="Application Kit" /></AppLayout>;

  const steps = [
    { n: 1, label: 'Select your resume', done: !!selectedResume, color: 'bg-blue-50 text-blue-700' },
    { n: 2, label: 'Select your cover letter', done: !!selectedCL, color: 'bg-purple-50 text-purple-700' },
    { n: 3, label: 'Export both as PDF', done: false, color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Kit</h1>
            <p className="text-sm text-gray-500">Bundle your resume + cover letter for a specific job application</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl flex-1 border ${s.done ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {s.done ? <Check className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span className="text-xs font-medium text-gray-700">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className="w-4 h-px bg-gray-200 flex-shrink-0" />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resume */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-gray-900">Your Resumes</h2>
            </div>
            {loading ? <div className="text-sm text-gray-400">Loading…</div> : resumes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 mb-3">No resumes yet</p>
                <button onClick={() => navigate('/builder')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">Create your first resume →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {resumes.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResume(selectedResume?.id === r.id ? null : r)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedResume?.id === r.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedResume?.id === r.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                      {selectedResume?.id === r.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{r.title || 'Untitled Resume'}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{r.template} template</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/builder')} className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-300 text-gray-500 py-2 rounded-xl text-sm hover:border-blue-400 hover:text-blue-600 transition-colors">
              + New Resume
            </button>
          </div>

          {/* Cover Letter */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-purple-600" />
              <h2 className="font-bold text-gray-900">Your Cover Letters</h2>
            </div>
            {loading ? <div className="text-sm text-gray-400">Loading…</div> : coverLetters.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 mb-3">No cover letters yet</p>
                <button onClick={() => navigate('/cover-letter-builder')} className="text-sm font-semibold text-purple-600 hover:text-purple-700">Create a cover letter →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {coverLetters.map(cl => (
                  <div
                    key={cl.id}
                    onClick={() => setSelectedCL(selectedCL?.id === cl.id ? null : cl)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedCL?.id === cl.id ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedCL?.id === cl.id ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                      {selectedCL?.id === cl.id && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{cl.title || 'Untitled Cover Letter'}</p>
                      {cl.recipientCompany && <p className="text-[10px] text-gray-400">For: {cl.recipientCompany}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/cover-letter-builder')} className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-300 text-gray-500 py-2 rounded-xl text-sm hover:border-purple-400 hover:text-purple-600 transition-colors">
              + New Cover Letter
            </button>
          </div>
        </div>

        {/* Export section */}
        {(selectedResume || selectedCL) && (
          <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 opacity-80" />
                  <h2 className="font-bold">Your Application Kit</h2>
                </div>
                <div className="space-y-1 text-sm opacity-90">
                  {selectedResume && <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5" /> {selectedResume.title || 'Resume'}</div>}
                  {selectedCL && <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5" /> {selectedCL.title || 'Cover Letter'}</div>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {selectedResume && (
                  <button
                    onClick={() => navigate(`/builder/${selectedResume.id}`)}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Resume PDF
                  </button>
                )}
                {selectedCL && (
                  <button
                    onClick={() => navigate(`/cover-letter-builder/${selectedCL.id}`)}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Cover Letter PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-gray-600" />
            <h2 className="font-bold text-gray-900">Application Checklist</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              'Tailored resume to the specific job posting',
              'Customized cover letter with company name and role',
              'Resume passes ATS check (check score in builder)',
              'LinkedIn profile matches your resume',
              'Proofread both documents for typos',
              'Saved a copy of the job description for reference',
              'Noted the application deadline',
              'Identified 2–3 people to follow up with',
            ].map((item, i) => (
              <ChecklistItem key={i} text={item} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ChecklistItem({ text }) {
  const [done, setDone] = useState(false);
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div
        onClick={() => setDone(d => !d)}
        className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${
          done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-emerald-400'
        }`}
      >
        {done && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm leading-relaxed ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{text}</span>
    </label>
  );
}
