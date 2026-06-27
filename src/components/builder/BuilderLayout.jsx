import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Check, Save, ArrowLeft, CloudOff, GitBranch, X } from 'lucide-react';

import RigaTemplate from './templates/RigaTemplate';
import StepProgressBar from './StepProgressBar';
import PersonalInfoForm from './forms/PersonalInfoForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import SkillsForm from './forms/SkillsForm';
import SummaryForm from './forms/SummaryForm';
import FinishStep from './forms/FinishStep';
import DownloadStep from './forms/DownloadStep';

const STEP_COUNT = 7;
const SAVE_TIMEOUT_MS = 10000; // treat Firebase as failed after 10s

function SaveVersionModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Save Version</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Give this version a name so you can find it later (e.g. "Google Application", "v2 - Shorter").</p>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim())}
          placeholder="Version name…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Save Version
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuilderLayout({ resumeId }) {
  const { resume } = useResume();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(location.state?.openTailor ? 5 : 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionSaved, setVersionSaved] = useState(false);

  const currentResumeId = useRef(resumeId || null);
  const saveRef = useRef(null);
  const autoSaveTimer = useRef(null);
  const isFirstRender = useRef(true);

  saveRef.current = async (silent = false) => {
    setSaveError(false);

    // Always persisted to localStorage already (via context).
    // If no Firebase user, show "Saved" (localStorage only).
    if (!user) {
      if (!silent) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      return;
    }

    // Don't create a new Firestore doc for a completely empty resume
    const hasContent =
      resume.title ||
      resume.personalInfo?.firstName ||
      resume.personalInfo?.lastName ||
      resume.experience?.length > 0 ||
      resume.education?.length > 0;
    if (!currentResumeId.current && !hasContent) {
      if (!silent) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      return;
    }

    if (!silent) setSaving(true);

    // Race Firebase against a timeout so the button never freezes.
    const id = currentResumeId.current || `resume_${Date.now()}`;
    const autoTitle =
      `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`.trim() ||
      'Untitled Resume';

    try {
      await Promise.race([
        setDoc(doc(db, 'users', user.uid, 'resumes', id), {
          ...resume,
          updatedAt: serverTimestamp(),
          title: resume.title || autoTitle,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), SAVE_TIMEOUT_MS)
        ),
      ]);

      currentResumeId.current = id;

      // Update URL to include ID so the resume loads correctly on next visit
      if (!resumeId) {
        navigate(`/builder/${id}`, { replace: true });
      }

      if (!silent) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.warn('Firebase save failed, data is in localStorage:', e.message);
      if (!silent) setSaveError(true);
    } finally {
      if (!silent) setSaving(false);
    }
  };

  // Auto-save debounce (2s after any change)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveRef.current(true), 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [resume]);

  // Cmd+S / Ctrl+S
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveRef.current(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSaveVersion = async (versionName) => {
    setShowVersionModal(false);
    if (!user) return;
    const baseId = currentResumeId.current;
    if (!baseId) {
      await saveRef.current(true);
    }
    const id = currentResumeId.current;
    if (!id) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'resumes', id, 'versions'), {
        ...resume,
        versionName,
        savedAt: serverTimestamp(),
      });
      setVersionSaved(true);
      setTimeout(() => setVersionSaved(false), 2500);
    } catch (e) {
      console.error('Version save failed', e);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const displayTitle =
    resume.title ||
    `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`.trim() ||
    'Untitled Resume';

  const renderStep = () => {
    switch (step) {
      case 0: return <PersonalInfoForm onNext={next} />;
      case 1: return <ExperienceForm onNext={next} onBack={back} />;
      case 2: return <EducationForm onNext={next} onBack={back} />;
      case 3: return <SkillsForm onNext={next} onBack={back} />;
      case 4: return <SummaryForm onNext={next} onBack={back} />;
      case 5: return <FinishStep onNext={next} onBack={back} />;
      case 6: return <DownloadStep onBack={back} resumeId={currentResumeId.current} onGoToStep={setStep} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EEF2F8' }}>
      {showVersionModal && (
        <SaveVersionModal
          onSave={handleSaveVersion}
          onClose={() => setShowVersionModal(false)}
        />
      )}

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-5 py-3 flex items-center justify-between flex-shrink-0 no-print z-20 sticky top-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm max-w-[120px] sm:max-w-[200px] truncate">{displayTitle}</p>
            <p className="text-xs text-gray-400 capitalize hidden sm:block">{resume.template} template</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {user && (
            <button
              onClick={() => setShowVersionModal(true)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                versionSaved
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
              title="Save a named version of this resume"
            >
              <GitBranch className="w-4 h-4" />
              <span className="hidden sm:inline">{versionSaved ? 'Version saved!' : 'Save Version'}</span>
            </button>
          )}
          <button
            onClick={() => saveRef.current(false)}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              saveError
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : saved
                ? 'bg-emerald-100 text-emerald-700'
                : 'border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {saveError
              ? <><CloudOff className="w-4 h-4" /><span className="hidden sm:inline ml-1">Saved locally</span></>
              : saved
              ? <><Check className="w-4 h-4" /><span className="hidden sm:inline ml-1">Saved!</span></>
              : <><Save className="w-4 h-4" /><span className="hidden sm:inline ml-1">{saving ? 'Saving…' : 'Save'}</span></>
            }
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <StepProgressBar current={step} onStepClick={setStep} />

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {renderStep()}
      </div>
    </div>
  );
}
