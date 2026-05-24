import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Plus, Trash2, Edit3, Clock, Loader2, Copy,
  AlertCircle, CheckCircle, ArrowLeft, Save, Send, Download,
} from "lucide-react";

// ─── Print Template ──────────────────────────────────────────────────────────

function RecommendationPrintTemplate({ data }) {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return (
    <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: "1.8", color: "#111", padding: "60px 72px", maxWidth: "794px" }}>
      <div style={{ marginBottom: "32px" }}>
        {(data.firstName || data.lastName) && (
          <p style={{ fontWeight: "bold", fontSize: "16px", margin: 0 }}>{data.firstName} {data.lastName}</p>
        )}
      </div>

      <p style={{ color: "#777", marginBottom: "32px" }}>{today}</p>

      <div style={{ marginBottom: "32px" }}>
        {data.recommenderName && <p style={{ fontWeight: "600", margin: 0 }}>{data.recommenderName}</p>}
        {data.recommenderCompany && <p style={{ margin: "2px 0 0" }}>{data.recommenderCompany}</p>}
      </div>

      <p style={{ marginBottom: "20px" }}>Dear {data.recommenderName || "Sir/Madam"},</p>

      <p style={{ marginBottom: "16px" }}>
        I hope this message finds you well. I am reaching out to kindly request a recommendation letter on my behalf.
        {data.purpose ? ` This letter is intended for ${data.purpose}.` : ""}
      </p>

      {data.emphasis && data.emphasis.length > 0 && (
        <p style={{ marginBottom: "16px" }}>
          I would greatly appreciate it if you could speak to the following qualities: {data.emphasis.join(", ")}.
        </p>
      )}

      {data.collaboratedProject && (
        <p style={{ marginBottom: "16px" }}>
          In particular, I believe our collaboration on {data.collaboratedProject} would provide excellent examples.
        </p>
      )}

      {data.anythingElse && (
        <p style={{ marginBottom: "16px" }}>{data.anythingElse}</p>
      )}

      {data.deadline && (
        <p style={{ marginBottom: "16px" }}>
          If possible, I would appreciate receiving this letter by{" "}
          {new Date(data.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
        </p>
      )}

      <p style={{ marginBottom: "16px" }}>
        Thank you sincerely for considering my request. Your support means a great deal to me.
      </p>

      <div style={{ marginTop: "32px" }}>
        <p>Warm regards,</p>
        <p style={{ marginTop: "40px", fontWeight: "bold" }}>{data.firstName} {data.lastName}</p>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function RecommendationDashboard() {
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
    documentTitle: printItem?.title || "Recommendation Request",
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
      const q = query(collection(db, "users", user.uid, "recommendationLetters"), orderBy("updatedAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch { showToast("Failed to load.", "error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await deleteDoc(doc(db, "users", user.uid, "recommendationLetters", deleteTarget.id));
      setItems((p) => p.filter((i) => i.id !== deleteTarget.id));
      showToast("Deleted.");
    } catch { showToast("Failed to delete.", "error"); }
    finally { setDeleting(null); setDeleteTarget(null); }
  };

  const handleDuplicate = async (item) => {
    const base = `Copy of ${item.title || "Recommendation"}`;
    const existing = items.map((i) => (i.title || "").toLowerCase());
    let name = base; let n = 2;
    while (existing.includes(name.toLowerCase())) name = `${base} (${n++})`;
    setDuplicating(item.id);
    try {
      const { id: _id, updatedAt: _ts, ...data } = item;
      await setDoc(doc(db, "users", user.uid, "recommendationLetters", `rec_${Date.now()}`),
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

  if (!user) return <AuthPrompt title="Recommendation Letters" />;

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
              <h1 className="text-2xl font-bold text-gray-900">Recommendation Letters</h1>
              <p className="text-gray-500 mt-1 text-sm">Request powerful recommendations that open doors.</p>
            </div>
            <button onClick={() => navigate("/recommendation-letters/new")}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100">
              <Plus className="w-4 h-4" /> New Request
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-green-50 inline-flex p-4 rounded-2xl mb-4">
                <Send className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No recommendation requests yet</h2>
              <p className="text-gray-500 mb-6">Request a personalized recommendation letter from someone who knows you.</p>
              <button onClick={() => navigate("/recommendation-letters/new")}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Request My First Recommendation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <button onClick={() => navigate("/recommendation-letters/new")}
                className="group border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[180px]">
                <div className="bg-gray-100 group-hover:bg-blue-100 p-4 rounded-full transition-colors">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                </div>
                <span className="font-semibold text-gray-500 group-hover:text-blue-600">+ New Request</span>
              </button>

              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all">
                  <div className="h-36 bg-gradient-to-br from-green-50 to-teal-100 flex flex-col items-center justify-center gap-1">
                    <Send className="w-8 h-8 text-green-400" />
                    {item.recommenderName && (
                      <p className="text-xs text-gray-500 mt-1">From: {item.recommenderName}</p>
                    )}
                    {item.sendMethod && (
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-gray-400 border">{item.sendMethod}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base truncate mb-0.5">{item.title || "Untitled"}</h3>
                    {item.firstName && <p className="text-xs text-gray-400 mb-2">For: {item.firstName} {item.lastName}</p>}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                      <Clock className="w-3.5 h-3.5" />Updated {formatDate(item.updatedAt)}
                    </div>
                    <div className="space-y-1.5">
                      <button onClick={() => triggerDownload(item)}
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-100">
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>
                      <button onClick={() => navigate(`/recommendation-letters/${item.id}`)}
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
            {printItem && <RecommendationPrintTemplate data={printItem} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const RELATIONSHIPS = ["Manager", "Colleague", "Professor", "Mentor", "Client", "Direct Report", "Other"];
const LANGUAGES = ["English", "German", "French", "Spanish", "Italian", "Portuguese", "Dutch"];
const EMPHASIS_OPTIONS = ["Ownership", "Collaboration", "Leadership", "Communication", "Technical skills", "Reliability", "Impact"];
const TONES = ["Warm", "Professional", "Short"];

const BLANK = {
  title: "Untitled",
  firstName: "", lastName: "",
  recommenderName: "", relationship: "Manager", recommenderCompany: "",
  sendMethod: "LinkedIn",
  purpose: "", emphasis: [], anythingElse: "", collaboratedProject: "",
  language: "English", tone: "Warm", additionalNotes: "", deadline: "",
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function InputField({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 transition-colors bg-white" />
  );
}

function PreviewPanel({ form }) {
  const hasContent = form.firstName || form.recommenderName || form.purpose || form.emphasis.length > 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full flex flex-col">
      {!hasContent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Your recommendation request will appear here</h3>
          <p className="text-xs text-gray-400 max-w-xs mb-5">
            Fill in the details on the left and click Generate request. We'll create a personalized message you can review and edit before sending.
          </p>
          <div className="text-left space-y-2 w-full max-w-xs">
            {[
              "A polite, well-structured request",
              "Tone adapted to your relationship",
              "Optimized for LinkedIn or email",
              "Optional draft recommendation letter",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs text-gray-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Nothing is sent automatically. You stay in full control.
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-sm text-gray-700">
          <h3 className="font-bold text-gray-900">Request Preview</h3>
          <p>
            <span className="font-semibold">To:</span> {form.recommenderName || "—"}{" "}
            {form.recommenderCompany ? `(${form.recommenderCompany})` : ""}
          </p>
          <p>
            <span className="font-semibold">From:</span> {form.firstName} {form.lastName}
          </p>
          {form.sendMethod && (
            <p><span className="font-semibold">Via:</span> {form.sendMethod}</p>
          )}
          {form.purpose && (
            <p><span className="font-semibold">Purpose:</span> {form.purpose}</p>
          )}
          {form.emphasis.length > 0 && (
            <p><span className="font-semibold">Emphasize:</span> {form.emphasis.join(", ")}</p>
          )}
          {form.tone && (
            <p><span className="font-semibold">Tone:</span> {form.tone}</p>
          )}
        </div>
      )}
    </div>
  );
}

function RecommendationForm({ id }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...BLANK });
  const [loading, setLoading] = useState(!!id && id !== "new");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: form.title || "Recommendation Request",
  });

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (id && id !== "new") {
      getDoc(doc(db, "users", user.uid, "recommendationLetters", id))
        .then((snap) => { if (snap.exists()) setForm({ ...BLANK, ...snap.data(), emphasis: snap.data().emphasis || [] }); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleEmphasis = (item) => {
    setForm((f) => ({
      ...f,
      emphasis: f.emphasis.includes(item)
        ? f.emphasis.filter((e) => e !== item)
        : f.emphasis.length < 3 ? [...f.emphasis, item] : f.emphasis,
    }));
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docId = (!id || id === "new") ? `rec_${Date.now()}` : id;
      await setDoc(doc(db, "users", user.uid, "recommendationLetters", docId),
        { ...form, updatedAt: serverTimestamp() }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (!id || id === "new") navigate(`/recommendation-letters/${docId}`, { replace: true });
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

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/recommendation-letters")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <input value={form.title} onChange={set("title")}
              className="text-base font-semibold text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-gray-300 px-1" />
          </div>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? "✓" : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>

        <div className="flex gap-0 h-[calc(100vh-57px)]">
          {/* Left: form */}
          <div className="w-1/2 overflow-y-auto border-r border-gray-200 p-8 space-y-6">
            <h1 className="text-xl font-bold text-gray-900">Request a <span className="font-bold">Written recommendation</span></h1>

            {/* About You */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900">About You</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Your First Name">
                  <div className="flex items-center gap-2">
                    <InputField value={form.firstName} onChange={set("firstName")} placeholder="Jane" />
                    {form.firstName && (
                      <span className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1.5,6 4.5,9 10.5,3" /></svg>
                      </span>
                    )}
                  </div>
                </Field>
                <Field label="Your Last Name">
                  <div className="flex items-center gap-2">
                    <InputField value={form.lastName} onChange={set("lastName")} placeholder="Smith" />
                    {form.lastName && (
                      <span className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1.5,6 4.5,9 10.5,3" /></svg>
                      </span>
                    )}
                  </div>
                </Field>
              </div>
            </section>

            {/* About Your Recommender */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900">About Your Recommender</h2>
              <Field label="Recommender Name">
                <InputField value={form.recommenderName} onChange={set("recommenderName")} placeholder="Steve Jobs" />
              </Field>
              <Field label="Your Relationship to the Recommender" hint="Helps us adjust tone and credibility">
                <select value={form.relationship} onChange={set("relationship")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white appearance-none">
                  {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Recommender's Company or Organization at the Time">
                <InputField value={form.recommenderCompany} onChange={set("recommenderCompany")} placeholder="Company Name" />
              </Field>
            </section>

            {/* Help Us Personalize */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900">Help Us Personalize It <span className="text-gray-400 font-normal text-sm">(Optional)</span></h2>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">How will you send the request?</p>
                <div className="flex gap-2">
                  {["LinkedIn", "Email"].map((m) => (
                    <button key={m} onClick={() => setForm((f) => ({ ...f, sendMethod: m }))}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        form.sendMethod === m ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"
                      }`}>{m}</button>
                  ))}
                </div>
              </div>
              <Field label="Purpose of the Recommendation" hint="Helps us choose the right wording">
                <input value={form.purpose} onChange={set("purpose")} placeholder="e.g. Product Manager role, promotion"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400" />
              </Field>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">What should they emphasize?</p>
                <p className="text-xs text-gray-400 mb-3">Pick up to 3</p>
                <div className="flex flex-wrap gap-2">
                  {EMPHASIS_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => toggleEmphasis(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.emphasis.includes(opt)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-blue-300"
                      }`}>{opt}</button>
                  ))}
                </div>
              </div>
              <Field label="Anything Else to Emphasize?">
                <input value={form.anythingElse} onChange={set("anythingElse")} placeholder="e.g. Product Manager role, promotion"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400" />
              </Field>
              <Field label="Collaborated Project (Optional)">
                <input value={form.collaboratedProject} onChange={set("collaboratedProject")} placeholder="e.g. Marketing campaign for Product X"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400" />
              </Field>
            </section>

            {/* Tone & Preferences */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-900">Tone & Preferences <span className="text-gray-400 font-normal text-sm">(Optional)</span></h2>
              <Field label="Letter Language">
                <select value={form.language} onChange={set("language")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white appearance-none">
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Tone</p>
                <div className="flex gap-2">
                  {TONES.map((t) => (
                    <button key={t} onClick={() => setForm((f) => ({ ...f, tone: t }))}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        form.tone === t ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <Field label="Anything Else to Mention?">
                <input value={form.additionalNotes} onChange={set("additionalNotes")} placeholder="e.g. Achievements, strengths, or impact"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400" />
              </Field>
              <Field label="Deadline">
                <input type="date" value={form.deadline} onChange={set("deadline")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400" />
              </Field>
            </section>

            <button onClick={() => handlePrint()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 rounded-xl font-semibold transition-colors shadow-md shadow-blue-100">
              <Download className="w-5 h-5" /> Download PDF
            </button>
            <button onClick={save} disabled={saving}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-teal-300 text-gray-700 hover:text-teal-600 py-3 rounded-xl font-medium transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving…" : saved ? "Saved!" : "Save"}
            </button>
          </div>

          {/* Right: preview */}
          <div className="w-1/2 p-8 overflow-y-auto bg-gray-50">
            <PreviewPanel form={form} />
          </div>
        </div>

        <div className="hidden print:block">
          <div ref={printRef}>
            <RecommendationPrintTemplate data={form} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Route dispatcher ─────────────────────────────────────────────────────────

export default function RecommendationLetterPage() {
  const { id } = useParams();
  if (id !== undefined) return <RecommendationForm id={id} />;
  return <RecommendationDashboard />;
}
