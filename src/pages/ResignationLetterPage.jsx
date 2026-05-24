import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  collection, getDocs, orderBy, query,
  doc, getDoc, setDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import AuthPrompt from "../components/AuthPrompt";
import {
  Plus, Trash2, Edit3, Clock, Loader2, Copy, X,
  AlertCircle, CheckCircle, Sparkles, Pencil, ArrowLeft, Save, Download,
} from "lucide-react";

// ─── Print Template ──────────────────────────────────────────────────────────

function ResignationPrintTemplate({ data }) {
  const letterDate = data.letterDate
    ? new Date(data.letterDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const lastDay = data.lastDayOfWork
    ? new Date(data.lastDayOfWork).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "two weeks from today";

  return (
    <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: "1.8", color: "#111", padding: "60px 72px", maxWidth: "794px" }}>
      <div style={{ marginBottom: "32px" }}>
        {(data.firstName || data.lastName) && (
          <p style={{ fontWeight: "bold", fontSize: "16px", margin: 0 }}>{data.firstName} {data.lastName}</p>
        )}
        {data.email && <p style={{ color: "#555", margin: "2px 0 0" }}>{data.email}</p>}
        {data.address && <p style={{ color: "#555", margin: "2px 0 0" }}>{data.address}{data.city ? `, ${data.city}` : ""}{data.postalCode ? ` ${data.postalCode}` : ""}</p>}
      </div>

      <p style={{ color: "#777", marginBottom: "32px" }}>{letterDate}</p>

      <div style={{ marginBottom: "32px" }}>
        {data.recipientName && <p style={{ fontWeight: "600", margin: 0 }}>{data.recipientName}</p>}
        {data.recipientJobTitle && <p style={{ margin: "2px 0 0" }}>{data.recipientJobTitle}</p>}
        {data.resigningCompany && <p style={{ margin: "2px 0 0" }}>{data.resigningCompany}</p>}
      </div>

      <p style={{ marginBottom: "20px" }}>Dear {data.recipientName || "Hiring Manager"},</p>

      {data.content
        ? data.content.split("\n").map((line, i) =>
            line.trim()
              ? <p key={i} style={{ marginBottom: "16px" }}>{line}</p>
              : <div key={i} style={{ height: "8px" }} />
          )
        : (
          <>
            <p style={{ marginBottom: "16px" }}>I am writing to formally notify you of my resignation from my position as {data.jobTitle || "my current role"} at {data.resigningCompany || "the company"}, effective {lastDay}.</p>
            <p style={{ marginBottom: "16px" }}>I am grateful for the opportunities I have had during my time here and will ensure a smooth handover of my responsibilities.</p>
          </>
        )
      }

      <div style={{ marginTop: "32px" }}>
        <p>Sincerely,</p>
        <p style={{ marginTop: "40px", fontWeight: "bold" }}>{data.firstName} {data.lastName}</p>
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

function ResignationDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [duplicating, setDuplicating] = useState(null);
  const [printItem, setPrintItem] = useState(null);
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printItem?.title || "Resignation Letter",
    onAfterPrint: () => setPrintItem(null),
  });
  const triggerDownload = useCallback((item) => {
    setPrintItem(item);
    setTimeout(() => handlePrint(), 100);
  }, [handlePrint]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    load();
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "resignationLetters"), orderBy("updatedAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch { showToast("Failed to load.", "error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await deleteDoc(doc(db, "users", user.uid, "resignationLetters", deleteTarget.id));
      setItems((p) => p.filter((i) => i.id !== deleteTarget.id));
      showToast("Deleted.");
    } catch { showToast("Failed to delete.", "error"); }
    finally { setDeleting(null); setDeleteTarget(null); }
  };

  const handleDuplicate = async (item) => {
    const base = `Copy of ${item.title || "Resignation Letter"}`;
    const existing = items.map((i) => (i.title || "").toLowerCase());
    let name = base; let n = 2;
    while (existing.includes(name.toLowerCase())) name = `${base} (${n++})`;
    setDuplicating(item.id);
    try {
      const { id: _id, updatedAt: _ts, ...data } = item;
      await setDoc(doc(db, "users", user.uid, "resignationLetters", `rl_${Date.now()}`),
        { ...data, title: name, updatedAt: serverTimestamp() });
      await load();
      showToast(`Duplicated as "${name}".`);
    } catch { showToast("Failed to duplicate.", "error"); }
    finally { setDuplicating(null); }
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (!user) return <AuthPrompt title="Resignation Letters" />;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-900 text-white"
          }`}>
            {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
            {toast.msg}
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Delete letter?</h2>
                  <p className="text-sm text-gray-500 truncate max-w-[220px]">"{deleteTarget.title || "Untitled"}"</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-5">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={handleDelete} disabled={!!deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resignation Letters</h1>
              <p className="text-gray-500 mt-1 text-sm">Leave professionally with a clear, well-written letter.</p>
            </div>
            <button
              onClick={() => navigate("/resignation-letters/new")}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
            >
              <Plus className="w-4 h-4" /> New Letter
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-orange-50 inline-flex p-4 rounded-2xl mb-4">
                <Edit3 className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No resignation letters yet</h2>
              <p className="text-gray-500 mb-6">Draft a professional resignation letter in minutes.</p>
              <button onClick={() => navigate("/resignation-letters/new")}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Create My First Letter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <button onClick={() => navigate("/resignation-letters/new")}
                className="group border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[180px]">
                <div className="bg-gray-100 group-hover:bg-blue-100 p-4 rounded-full transition-colors">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                </div>
                <span className="font-semibold text-gray-500 group-hover:text-blue-600">+ Create New Letter</span>
              </button>

              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all">
                  <div className="h-36 bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center px-4">
                      {item.firstName && <p className="text-sm font-semibold text-gray-600">{item.firstName} {item.lastName}</p>}
                      {item.resigningCompany && <p className="text-xs text-gray-400 mt-1">Resigning from: {item.resigningCompany}</p>}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base truncate mb-0.5">{item.title || "Untitled"}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                      <Clock className="w-3.5 h-3.5" />Updated {formatDate(item.updatedAt)}
                    </div>
                    <div className="space-y-1.5">
                      <button onClick={() => triggerDownload(item)}
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-100">
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>
                      <button onClick={() => navigate(`/resignation-letters/${item.id}`)}
                        className="w-full flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 py-1.5 rounded-lg text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleDuplicate(item)} disabled={duplicating === item.id}
                          className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:border-blue-300 hover:text-blue-500 transition-colors disabled:opacity-50">
                          {duplicating === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                          Duplicate
                        </button>
                        <button onClick={() => setDeleteTarget(item)}
                          className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:border-red-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden print:block">
          <div ref={printRef}>
            {printItem && <ResignationPrintTemplate data={printItem} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Builder Form ────────────────────────────────────────────────────────────

const LANGUAGES = ["English", "German", "French", "Spanish", "Italian", "Portuguese", "Dutch"];

const BLANK_FORM = {
  title: "Untitled",
  firstName: "", lastName: "", email: "", address: "", city: "", postalCode: "",
  resigningCompany: "", jobTitle: "",
  recipientName: "", recipientJobTitle: "",
  lastDayOfWork: "", language: "English", letterDate: "",
  contentMode: "manual", content: "",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors bg-white ${className}`}
    />
  );
}

function CheckIcon() {
  return (
    <span className="ml-auto w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="1.5,6 4.5,9 10.5,3" />
      </svg>
    </span>
  );
}

function ResignationForm({ id }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: form.title || "Resignation Letter",
  });

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (id && id !== "new") {
      getDoc(doc(db, "users", user.uid, "resignationLetters", id))
        .then((snap) => { if (snap.exists()) setForm({ ...BLANK_FORM, ...snap.data() }); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docId = (!id || id === "new") ? `rl_${Date.now()}` : id;
      await setDoc(doc(db, "users", user.uid, "resignationLetters", docId),
        { ...form, updatedAt: serverTimestamp() }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (!id || id === "new") navigate(`/resignation-letters/${docId}`, { replace: true });
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    </AppLayout>
  );

  const filled = (v) => v && v.trim();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/resignation-letters")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <input
              value={form.title}
              onChange={set("title")}
              className="text-base font-semibold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-gray-300 px-1"
            />
          </div>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? "✓" : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <p className="text-sm text-gray-500">Complete the form below to generate a clear and professional resignation letter.</p>

          {/* Personal Information */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Your First Name">
                  <div className="flex items-center gap-2">
                    <Input value={form.firstName} onChange={set("firstName")} placeholder="Jane" />
                    {filled(form.firstName) && <CheckIcon />}
                  </div>
                </Field>
                <Field label="Your Last Name">
                  <div className="flex items-center gap-2">
                    <Input value={form.lastName} onChange={set("lastName")} placeholder="Smith" />
                    {filled(form.lastName) && <CheckIcon />}
                  </div>
                </Field>
              </div>
              <Field label="Your Email">
                <div className="flex items-center gap-2">
                  <Input value={form.email} onChange={set("email")} placeholder="jane@email.com" type="email" />
                  {filled(form.email) && <CheckIcon />}
                </div>
              </Field>
              <Field label="Your Address">
                <div className="flex items-center gap-2">
                  <Input value={form.address} onChange={set("address")} placeholder="123 Main Street" />
                  {filled(form.address) && <CheckIcon />}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <div className="flex items-center gap-2">
                    <Input value={form.city} onChange={set("city")} placeholder="New York" />
                    {filled(form.city) && <CheckIcon />}
                  </div>
                </Field>
                <Field label="Postal Code">
                  <div className="flex items-center gap-2">
                    <Input value={form.postalCode} onChange={set("postalCode")} placeholder="10001" />
                    {filled(form.postalCode) && <CheckIcon />}
                  </div>
                </Field>
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Professional Information</h2>
            <div className="space-y-4">
              <Field label="Resigning Company Name">
                <Input value={form.resigningCompany} onChange={set("resigningCompany")} placeholder="Google" />
              </Field>
              <Field label="Your Job Title">
                <Input value={form.jobTitle} onChange={set("jobTitle")} placeholder="Software Engineer" />
              </Field>
            </div>
          </section>

          {/* Resignation Letter Details */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Resignation Letter Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Recipient of Resignation Letter Name">
                  <Input value={form.recipientName} onChange={set("recipientName")} placeholder="John Smith" />
                </Field>
                <Field label="Recipient Job Title">
                  <Input value={form.recipientJobTitle} onChange={set("recipientJobTitle")} placeholder="Manager" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Last Day of Work">
                  <div className="relative">
                    <Input value={form.lastDayOfWork} onChange={set("lastDayOfWork")} placeholder="01-01-2025" type="date" />
                  </div>
                </Field>
                <Field label="Language of the Letter">
                  <select
                    value={form.language}
                    onChange={set("language")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white appearance-none"
                  >
                    {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Date of the Letter">
                <Input value={form.letterDate} onChange={set("letterDate")} type="date" placeholder="Select Date" />
              </Field>
            </div>
          </section>

          {/* Content */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Content of the Letter</h2>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <button
                onClick={() => setForm((f) => ({ ...f, contentMode: "ai" }))}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-colors ${
                  form.contentMode === "ai" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Sparkles className="w-7 h-7 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Generate with AI</span>
              </button>
              <button
                onClick={() => setForm((f) => ({ ...f, contentMode: "manual" }))}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-colors ${
                  form.contentMode === "manual" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Pencil className="w-7 h-7 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Write Manually</span>
              </button>
            </div>

            {form.contentMode === "ai" ? (
              <div className="text-center py-8">
                <button
                  onClick={() => {
                    const generated = `Dear ${form.recipientName || "Hiring Manager"},\n\nI am writing to formally notify you of my resignation from my position as ${form.jobTitle || "my current role"} at ${form.resigningCompany || "the company"}, effective ${form.lastDayOfWork || "two weeks from today"}.\n\nThis was not an easy decision, and I am grateful for the opportunities I have had to grow professionally during my time here. I appreciate the support and guidance I have received from the team.\n\nI am committed to ensuring a smooth transition and will do my best to wrap up my responsibilities and assist in the handover process.\n\nThank you for the opportunity to be part of this organization.\n\nSincerely,\n${form.firstName} ${form.lastName}`;
                    setForm((f) => ({ ...f, content: generated, contentMode: "manual" }));
                  }}
                  className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> Generate Letter
                </button>
              </div>
            ) : (
              <textarea
                value={form.content}
                onChange={set("content")}
                placeholder="Write your resignation letter content here…"
                rows={10}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors resize-none leading-relaxed"
              />
            )}
          </section>

          {/* Action buttons */}
          <button onClick={() => handlePrint()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-md shadow-blue-100">
            <Download className="w-5 h-5" /> Download PDF
          </button>
          <button onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 py-3 rounded-xl font-medium transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Letter"}
          </button>
        </div>

        <div className="hidden print:block">
          <div ref={printRef}>
            <ResignationPrintTemplate data={form} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Route dispatcher ────────────────────────────────────────────────────────

export default function ResignationLetterPage() {
  const { id } = useParams();
  if (id !== undefined) return <ResignationForm id={id} />;
  return <ResignationDashboard />;
}
