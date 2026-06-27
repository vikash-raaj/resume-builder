import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  collection, getDocs, deleteDoc, doc, setDoc,
  orderBy, query, serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import AppLayout from "../components/AppLayout";
import AuthPrompt from "../components/AuthPrompt";
import RigaTemplate from "../components/builder/templates/RigaTemplate";
import ModernTemplate from "../components/builder/templates/ModernTemplate";
import ClassicTemplate from "../components/builder/templates/ClassicTemplate";
import MinimalTemplate from "../components/builder/templates/MinimalTemplate";
import ExecutiveTemplate from "../components/builder/templates/ExecutiveTemplate";
import TechTemplate from "../components/builder/templates/TechTemplate";
import {
  Plus, FileText, Trash2, Edit3, Loader2,
  Copy, X, AlertCircle, Sparkles, CheckCircle, Download, Kanban, ChevronDown, Zap,
} from "lucide-react";
import { getCompletenessScore } from "../utils/completenessScore";

const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  riga: RigaTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
};

const DRAFT_KEY = "resume_builder_draft";

function ResumeThumbnail({ resume }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / 794);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ResumeTemplate = TEMPLATE_MAP[resume.template] || RigaTemplate;

  return (
    <div ref={containerRef} className="relative h-40 overflow-hidden bg-gray-100 border-b border-gray-200">
      {scale > 0 && (
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '794px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <ResumeTemplate resume={resume} />
        </div>
      )}
    </div>
  );
}

function NewResumeModal({ existingTitles, onConfirm, onClose }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) { setError("Please enter a name for your resume."); return; }
    if (existingTitles.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setError(`A resume named "${trimmed}" already exists. Please choose a different name.`);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Name your resume</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
              Resume Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="e.g. Software Engineer — Google 2025"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                error ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-blue-400"
              }`}
            />
            {error && (
              <div className="flex items-start gap-1.5 mt-2 text-red-600 text-xs">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Create Resume
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ resume, onConfirm, onClose, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Delete resume?</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-[200px]">
              "{resume.title || "Untitled Resume"}"
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:border-gray-400 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingModal({ onClose, onCreateResume }) {
  const STEPS = [
    { icon: FileText, title: 'Fill your details', desc: 'Add your work history, education, and skills in our guided step-by-step form.' },
    { icon: Sparkles, title: 'Pick a template', desc: 'Choose from 6 professionally designed templates and customize colors and fonts.' },
    { icon: Download, title: 'Download & share', desc: 'Export a pixel-perfect PDF or get a shareable public link in one click.' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
        <div className="text-center mb-7">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to TheResume.io 👋</h2>
          <p className="text-gray-500 text-sm">Build a resume that gets you hired in 3 easy steps.</p>
        </div>
        <div className="space-y-4 mb-7">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{i + 1}. {s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onCreateResume}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-blue-100"
        >
          Create My First Resume →
        </button>
        <button onClick={onClose} className="mt-3 w-full text-gray-400 text-xs hover:text-gray-600 transition-colors">
          I'll look around first
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [duplicating, setDuplicating] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const [toast, setToast] = useState(null);
  const [printResume, setPrintResume] = useState(null);
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printResume?.title || "Resume",
    onAfterPrint: () => setPrintResume(null),
  });
  const triggerDownload = useCallback((res) => {
    setPrintResume(res);
    setTimeout(() => handlePrint(), 100);
  }, [handlePrint]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadResumes();
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadResumes = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "resumes"),
        orderBy("updatedAt", "desc")
      );
      const snap = await getDocs(q);
      const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setResumes(loaded);
      // Show onboarding if user has no resumes and joined in the last 10 minutes
      if (loaded.length === 0 && user.metadata?.creationTime) {
        const ageMs = Date.now() - new Date(user.metadata.creationTime).getTime();
        if (ageMs < 10 * 60 * 1000) setShowOnboarding(true);
      }
    } catch (e) {
      console.error("loadResumes failed:", e);
      showToast("Failed to load resumes. Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const FREE_RESUME_LIMIT = 3;
  const atFreeLimit = !isPro && resumes.length >= FREE_RESUME_LIMIT;

  const handleCreateNew = (title) => {
    if (atFreeLimit) { navigate('/#pricing'); return; }
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setShowNewModal(false);
    navigate("/builder", { state: { newTitle: title } });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "users", user.uid, "resumes", id));
      setResumes((r) => r.filter((res) => res.id !== id));
      showToast("Resume deleted.");
    } catch (e) {
      console.error("Delete failed:", e);
      showToast("Failed to delete. Please try again.", "error");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (res) => {
    const baseName = `Copy of ${res.title || res.personalInfo?.firstName || "Resume"}`.trim();
    const existingLower = resumes.map((r) => (r.title || "").toLowerCase());
    let uniqueName = baseName;
    let counter = 2;
    while (existingLower.includes(uniqueName.toLowerCase())) {
      uniqueName = `${baseName} (${counter++})`;
    }

    setDuplicating(res.id);
    try {
      const newId = `resume_${Date.now()}`;
      // Strip Firestore-only fields before writing
      const { id: _id, updatedAt: _ts, ...data } = res;
      await setDoc(doc(db, "users", user.uid, "resumes", newId), {
        ...data,
        title: uniqueName,
        updatedAt: serverTimestamp(),
      });
      await loadResumes();
      showToast(`Duplicated as "${uniqueName}".`);
    } catch (e) {
      console.error("Duplicate failed:", e);
      showToast("Failed to duplicate. Please try again.", "error");
    } finally {
      setDuplicating(null);
    }
  };

  const cleanupDuplicates = async () => {
    setCleaning(true);
    try {
      const groups = {};
      for (const res of resumes) {
        const key = (
          res.title ||
          `${res.personalInfo?.firstName || ""} ${res.personalInfo?.lastName || ""}`.trim() ||
          "untitled"
        ).toLowerCase();
        if (!groups[key]) groups[key] = [];
        groups[key].push(res);
      }

      const toDelete = [];
      for (const group of Object.values(groups)) {
        if (group.length <= 1) continue;
        const sorted = [...group].sort((a, b) => {
          const ta = a.updatedAt?.toMillis?.() ?? 0;
          const tb = b.updatedAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
        toDelete.push(...sorted.slice(1).map((r) => r.id));
      }

      if (toDelete.length === 0) { showToast("No duplicates found."); return; }

      for (let i = 0; i < toDelete.length; i += 500) {
        const batch = writeBatch(db);
        toDelete.slice(i, i + 500).forEach((id) =>
          batch.delete(doc(db, "users", user.uid, "resumes", id))
        );
        await batch.commit();
      }

      setResumes((prev) => prev.filter((r) => !toDelete.includes(r.id)));
      showToast(`Removed ${toDelete.length} duplicate${toDelete.length > 1 ? "s" : ""}.`);
    } catch (e) {
      console.error("Cleanup failed:", e);
      showToast("Cleanup failed. Please try again.", "error");
    } finally {
      setCleaning(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };


  const existingTitles = resumes.map((r) => r.title || "");

  const duplicateCount = (() => {
    const groups = {};
    for (const res of resumes) {
      const key = (
        res.title ||
        `${res.personalInfo?.firstName || ""} ${res.personalInfo?.lastName || ""}`.trim() ||
        "untitled"
      ).toLowerCase();
      groups[key] = (groups[key] || 0) + 1;
    }
    return Object.values(groups).reduce((sum, n) => sum + (n > 1 ? n - 1 : 0), 0);
  })();

  if (!user) return <AuthPrompt title="My Resumes" />;

  return (
    <AppLayout>
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-900 text-white"
        }`}>
          {toast.type === "error"
            ? <AlertCircle className="w-4 h-4" />
            : <CheckCircle className="w-4 h-4 text-green-400" />}
          {toast.msg}
        </div>
      )}

      {showNewModal && (
        <NewResumeModal
          existingTitles={existingTitles}
          onConfirm={handleCreateNew}
          onClose={() => setShowNewModal(false)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          resume={deleteTarget}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={!!deleting}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          onClose={() => setShowOnboarding(false)}
          onCreateResume={() => { setShowOnboarding(false); setShowNewModal(true); }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base truncate max-w-xs sm:max-w-none">
              Welcome back, {user?.displayName || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/job-tracker')}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden xs:inline">Job Tracker</span>
              <span className="xs:hidden">Tracker</span>
            </button>
            <button
              onClick={() => atFreeLimit ? navigate('/#pricing') : setShowNewModal(true)}
              className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors shadow-md text-sm ${
                atFreeLimit
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">{atFreeLimit ? 'Upgrade to Add More' : 'New Resume'}</span>
              <span className="sm:hidden">{atFreeLimit ? 'Upgrade' : 'New'}</span>
            </button>
          </div>
        </div>

        {/* Duplicate cleanup banner */}
        {!loading && duplicateCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">{duplicateCount} duplicate resume{duplicateCount > 1 ? "s" : ""} found.</span>{" "}
                Keep only the newest version of each?
              </p>
            </div>
            <button
              onClick={cleanupDuplicates}
              disabled={cleaning}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0 self-start sm:self-auto"
            >
              {cleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {cleaning ? "Cleaning…" : "Clean up"}
            </button>
          </div>
        )}

        {/* Free tier upgrade banner */}
        {!loading && !isPro && resumes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-5 py-3.5 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <Zap className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Free plan: {resumes.length}/{FREE_RESUME_LIMIT} resumes used.</span>{" "}
                Upgrade to Pro for unlimited resumes, all 6 templates, DOCX export and version history.
              </p>
            </div>
            <button
              onClick={() => navigate('/#pricing')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0 self-start sm:self-auto"
            >
              <Zap className="w-3.5 h-3.5" /> Upgrade — $9/mo
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-blue-50 inline-flex p-4 rounded-2xl mb-4">
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No resumes yet</h2>
            <p className="text-gray-500 mb-6">Create your first professional resume in minutes.</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Create My First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create new card */}
            <button
              onClick={() => atFreeLimit ? navigate('/#pricing') : setShowNewModal(true)}
              className={`group border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all min-h-[200px] ${
                atFreeLimit
                  ? 'border-amber-300 hover:bg-amber-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div className={`p-4 rounded-full transition-colors ${atFreeLimit ? 'bg-amber-100' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
                <Plus className={`w-8 h-8 transition-colors ${atFreeLimit ? 'text-amber-500' : 'text-gray-400 group-hover:text-blue-600'}`} />
              </div>
              <div className="text-center">
                <span className={`font-semibold block transition-colors ${atFreeLimit ? 'text-amber-600' : 'text-gray-500 group-hover:text-blue-600'}`}>
                  {atFreeLimit ? 'Upgrade to Pro' : 'Create New Resume'}
                </span>
                {atFreeLimit && (
                  <span className="text-xs text-amber-500 mt-1 block">Free plan: 3 resume limit</span>
                )}
              </div>
            </button>

            {/* Resume cards */}
            {resumes.map((res) => {
              const { score, label, color, missing } = getCompletenessScore(res);
              const barColor = color === 'emerald' ? 'bg-emerald-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-400';
              const textColor = color === 'emerald' ? 'text-emerald-600' : color === 'yellow' ? 'text-yellow-600' : 'text-red-500';
              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all flex flex-col"
                >
                  <ResumeThumbnail resume={res} />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                          {res.title || "Untitled Resume"}
                        </h3>
                        <span className="text-xs text-gray-400 capitalize mt-0.5 block">
                          {res.template || "riga"} template · {formatDate(res.updatedAt)}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 capitalize">{res.template || "riga"}</span>
                    </div>

                    {res.personalInfo?.jobTitle && (
                      <p className="text-sm text-gray-500 mb-2 truncate">{res.personalInfo.jobTitle}</p>
                    )}

                    {/* Completeness score */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Completeness</span>
                        <span className={`text-xs font-bold ${textColor}`}>{score}% · {label}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      {missing.length > 0 && score < 100 && (
                        <details className="mt-1.5 group">
                          <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 list-none flex items-center gap-1">
                            <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                            {missing.length} thing{missing.length > 1 ? 's' : ''} to improve
                          </summary>
                          <ul className="mt-1.5 space-y-0.5">
                            {missing.slice(0, 4).map((m, i) => (
                              <li key={i} className="text-[10px] text-gray-400 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                {m}
                              </li>
                            ))}
                            {missing.length > 4 && (
                              <li className="text-[10px] text-gray-300">+{missing.length - 4} more…</li>
                            )}
                          </ul>
                        </details>
                      )}
                    </div>


                    <div className="space-y-1.5 mt-auto">
                      <button
                        onClick={() => triggerDownload(res)}
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-100"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                      <button
                        onClick={() => navigate(`/builder/${res.id}`, { state: { openTailor: true } })}
                        className="w-full flex items-center justify-center gap-1.5 border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Sparkles className="w-4 h-4" /> Tailor to Job Description
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/builder/${res.id}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(res)}
                          disabled={duplicating === res.id}
                          title="Duplicate"
                          className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors disabled:opacity-50"
                        >
                          {duplicating === res.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(res)}
                          disabled={deleting === res.id}
                          title="Delete"
                          className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deleting === res.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="hidden print:block">
        <div ref={printRef}>
          {printResume && (() => {
            const ResumeTemplate = TEMPLATE_MAP[printResume.template] || RigaTemplate;
            return <ResumeTemplate resume={printResume} />;
          })()}
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
