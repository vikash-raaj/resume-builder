import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import { Save, Loader2, ArrowLeft, CheckCircle, AlertCircle, Download, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { generateCoverLetter, getStoredAIKey } from "../utils/aiService";
import AIKeySetup from "../components/builder/AIKeySetup";

const BLANK = {
  title: "",
  senderName: "", senderJobTitle: "", senderEmail: "",
  recipientName: "", recipientJobTitle: "", recipientCompany: "",
  date: "", subject: "", content: "",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-white"
    />
  );
}

function PreviewPanel({ data }) {
  const today = data.date
    ? new Date(data.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="bg-white border border-gray-200 shadow-sm h-full overflow-auto">
      {/* Letter paper */}
      <div className="max-w-2xl mx-auto py-14 px-16 font-serif text-[14px] leading-7 text-gray-800 min-h-full">
        {/* Sender block */}
        <div className="mb-8">
          <p className="text-base font-bold text-gray-900">{data.senderName || "Your Name"}</p>
          {data.senderJobTitle && <p className="text-gray-500 text-sm">{data.senderJobTitle}</p>}
          {data.senderEmail && <p className="text-gray-500 text-sm">{data.senderEmail}</p>}
        </div>

        <p className="mb-8 text-gray-500 text-sm">{today}</p>

        {/* Recipient block */}
        <div className="mb-8">
          <p className="font-semibold text-gray-900">{data.recipientName || "Hiring Manager"}</p>
          {data.recipientJobTitle && <p className="text-gray-600 text-sm">{data.recipientJobTitle}</p>}
          {data.recipientCompany && <p className="text-gray-600 text-sm">{data.recipientCompany}</p>}
        </div>

        {data.subject && (
          <p className="font-semibold mb-6 text-sm">Re: {data.subject}</p>
        )}

        <p className="mb-5">
          Dear {data.recipientName ? `${data.recipientName},` : "Hiring Manager,"}
        </p>

        <div className="space-y-4">
          {data.content
            ? data.content.split("\n").map((line, i) =>
                line.trim() ? <p key={i}>{line}</p> : <div key={i} className="h-2" />
              )
            : <p className="text-gray-300 italic">Your cover letter content will appear here as you type…</p>
          }
        </div>

        <div className="mt-8">
          <p>Sincerely,</p>
          <p className="mt-5 font-semibold">{data.senderName || "Your Name"}</p>
        </div>
      </div>
    </div>
  );
}

export default function CoverLetterBuilder() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({ ...BLANK, title: location.state?.newTitle || "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [toast, setToast] = useState(null);
  const [aiState, setAiState] = useState('idle'); // idle | loading | done | error
  const [aiResult, setAiResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [mobileTab, setMobileTab] = useState('form'); // 'form' | 'preview'
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: form.title || "Cover Letter",
  });

  useEffect(() => {
    if (!user) { navigate("/cover-letters"); return; }
    if (id) {
      getDoc(doc(db, "users", user.uid, "coverLetters", id))
        .then((snap) => { if (snap.exists()) setForm({ ...BLANK, ...snap.data() }); })
        .catch(() => showToast("Failed to load letter.", "error"))
        .finally(() => setLoading(false));
    }
  }, [user, id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleGenerateAI = async () => {
    if (!getStoredAIKey()) { setShowKeySetup(true); return; }
    setAiState('loading');
    setAiResult('');
    try {
      const text = await generateCoverLetter({
        senderName: form.senderName,
        senderJobTitle: form.senderJobTitle,
        recipientName: form.recipientName,
        recipientCompany: form.recipientCompany,
        recipientJobTitle: form.recipientJobTitle,
        subject: form.subject,
      });
      setAiResult(text);
      setAiState('done');
    } catch (e) {
      if (e.message === 'NO_KEY') { setShowKeySetup(true); setAiState('idle'); }
      else { setAiState('error'); }
    }
  };

  const handleCopyAI = () => {
    navigator.clipboard.writeText(aiResult).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertAI = () => {
    setForm(f => ({ ...f, content: aiResult }));
    setAiState('idle');
    setAiResult('');
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docId = id || `cl_${Date.now()}`;
      await setDoc(doc(db, "users", user.uid, "coverLetters", docId), {
        ...form,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      showToast("Cover letter saved!");
      if (!id) navigate(`/cover-letter-builder/${docId}`, { replace: true });
    } catch (e) {
      console.error(e);
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    </AppLayout>
  );

  if (showKeySetup) return <AIKeySetup onClose={() => setShowKeySetup(false)} onSaved={() => { setShowKeySetup(false); handleGenerateAI(); }} />;

  return (
    <AppLayout>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-900 text-white"
          }`}>
            {toast.type === "error"
              ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
              : <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
            {toast.msg}
          </div>
        )}

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-3 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate("/cover-letters")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <input
              value={form.title}
              onChange={set("title")}
              placeholder="Untitled Cover Letter"
              className="text-sm sm:text-base font-semibold text-gray-900 bg-transparent outline-none border-b-2 border-transparent focus:border-blue-400 px-1 py-0.5 transition-colors min-w-0 w-full max-w-[160px] sm:max-w-xs"
            />
          </div>
          {/* Mobile tab toggle */}
          <div className="flex md:hidden items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <button
              onClick={() => setMobileTab('form')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${mobileTab === 'form' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >Edit</button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${mobileTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >Preview</button>
          </div>
          <span className="hidden md:block text-xs text-gray-400 flex-shrink-0">Auto-saved on Save</span>
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: form panel — full-width on mobile when tab=form, hidden when tab=preview */}
          <div className={`${mobileTab === 'form' ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-shrink-0 flex-col bg-gray-50 border-r border-gray-200 overflow-hidden`}>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* Your Details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Your Details</h3>
                <div className="space-y-3.5">
                  <Field label="Full Name">
                    <TextInput value={form.senderName} onChange={set("senderName")} placeholder="Jane Smith" />
                  </Field>
                  <Field label="Job Title">
                    <TextInput value={form.senderJobTitle} onChange={set("senderJobTitle")} placeholder="Software Engineer" />
                  </Field>
                  <Field label="Email">
                    <TextInput value={form.senderEmail} onChange={set("senderEmail")} placeholder="jane@email.com" type="email" />
                  </Field>
                </div>
              </div>

              {/* Recipient */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Recipient</h3>
                <div className="space-y-3.5">
                  <Field label="Name">
                    <TextInput value={form.recipientName} onChange={set("recipientName")} placeholder="John Doe" />
                  </Field>
                  <Field label="Job Title">
                    <TextInput value={form.recipientJobTitle} onChange={set("recipientJobTitle")} placeholder="Hiring Manager" />
                  </Field>
                  <Field label="Company">
                    <TextInput value={form.recipientCompany} onChange={set("recipientCompany")} placeholder="Google" />
                  </Field>
                </div>
              </div>

              {/* Letter Details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Letter Details</h3>
                <div className="space-y-3.5">
                  <Field label="Date">
                    <TextInput value={form.date} onChange={set("date")} type="date" />
                  </Field>
                  <Field label="Subject / Position">
                    <TextInput value={form.subject} onChange={set("subject")} placeholder="Senior Software Engineer" />
                  </Field>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Letter Content</h3>

                {/* AI Generator */}
                <div className="mb-3 border border-purple-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-purple-50">
                    <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-purple-800 flex-1">AI Cover Letter Writer</span>
                  </div>
                  <div className="p-3 space-y-2">
                    {aiState === 'idle' || aiState === 'error' ? (
                      <>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Fill in your details and recipient above, then let AI draft the body of your cover letter.
                        </p>
                        {aiState === 'error' && (
                          <p className="text-[11px] text-red-500">Generation failed. Check your API key and try again.</p>
                        )}
                        <button
                          onClick={handleGenerateAI}
                          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Generate with AI
                        </button>
                      </>
                    ) : aiState === 'loading' ? (
                      <div className="flex items-center justify-center gap-2 py-3 text-purple-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-medium">Writing your cover letter…</span>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                          {aiResult}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleInsertAI}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Insert into Letter
                          </button>
                          <button
                            onClick={handleCopyAI}
                            className="flex items-center gap-1 border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={handleGenerateAI}
                            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-purple-600 hover:border-purple-200 transition-colors"
                            title="Regenerate"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <textarea
                  value={form.content}
                  onChange={set("content")}
                  placeholder="Write your cover letter body here…"
                  rows={10}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Sticky action buttons at bottom of form */}
            <div className="flex-shrink-0 px-5 py-4 bg-white border-t border-gray-100 space-y-2">
              <button
                onClick={() => handlePrint()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-blue-100"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>

          {/* Right: letter preview (also used as print target) */}
          <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 overflow-y-auto flex-col`} ref={printRef}>
            <PreviewPanel data={form} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
