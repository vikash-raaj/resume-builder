import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  collection, getDocs, deleteDoc, doc, setDoc,
  orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import AuthPrompt from "../components/AuthPrompt";
import {
  Plus, Mail, Trash2, Edit3, Clock, Loader2,
  Copy, X, AlertCircle, CheckCircle, Download,
} from "lucide-react";

// Hidden print template rendered off-screen
function PrintTemplate({ data }) {
  const today = data.date
    ? new Date(data.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: "1.8", color: "#111", padding: "60px 72px", maxWidth: "794px" }}>
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontWeight: "bold", fontSize: "16px", margin: 0 }}>{data.senderName || ""}</p>
        {data.senderJobTitle && <p style={{ color: "#555", margin: "2px 0 0" }}>{data.senderJobTitle}</p>}
        {data.senderEmail && <p style={{ color: "#555", margin: "2px 0 0" }}>{data.senderEmail}</p>}
      </div>

      <p style={{ color: "#777", marginBottom: "32px" }}>{today}</p>

      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontWeight: "600", margin: 0 }}>{data.recipientName || "Hiring Manager"}</p>
        {data.recipientJobTitle && <p style={{ margin: "2px 0 0" }}>{data.recipientJobTitle}</p>}
        {data.recipientCompany && <p style={{ margin: "2px 0 0" }}>{data.recipientCompany}</p>}
      </div>

      {data.subject && <p style={{ fontWeight: "600", marginBottom: "24px" }}>Re: {data.subject}</p>}

      <p style={{ marginBottom: "20px" }}>Dear {data.recipientName ? `${data.recipientName},` : "Hiring Manager,"}</p>

      {(data.content || "").split("\n").map((line, i) =>
        line.trim()
          ? <p key={i} style={{ marginBottom: "16px" }}>{line}</p>
          : <div key={i} style={{ height: "8px" }} />
      )}

      <div style={{ marginTop: "32px" }}>
        <p>Sincerely,</p>
        <p style={{ marginTop: "40px", fontWeight: "bold" }}>{data.senderName || ""}</p>
      </div>
    </div>
  );
}

function NewModal({ existingTitles, onConfirm, onClose }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) { setError("Please enter a name."); return; }
    if (existingTitles.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" already exists.`); return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Name your cover letter</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
              Cover Letter Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="e.g. Google — Software Engineer"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${
                error ? "border-red-400" : "border-gray-300 focus:border-blue-400"
              }`}
            />
            {error && (
              <div className="flex items-start gap-1.5 mt-2 text-red-600 text-xs">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{error}
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ item, onConfirm, onClose, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Delete cover letter?</h2>
            <p className="text-sm text-gray-500 truncate max-w-[220px]">"{item.title || "Untitled"}"</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

const COLLECTION = "coverLetters";

export default function CoverLetterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [duplicating, setDuplicating] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [printItem, setPrintItem] = useState(null);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printItem?.title || "Cover Letter",
    onAfterPrint: () => setPrintItem(null),
  });

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
      const q = query(collection(db, "users", user.uid, COLLECTION), orderBy("updatedAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      showToast("Failed to load cover letters.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (title) => {
    setShowNew(false);
    navigate("/cover-letter-builder", { state: { newTitle: title } });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await deleteDoc(doc(db, "users", user.uid, COLLECTION, deleteTarget.id));
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      showToast("Deleted.");
    } catch {
      showToast("Failed to delete.", "error");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (item) => {
    const base = `Copy of ${item.title || "Cover Letter"}`;
    const existing = items.map((i) => (i.title || "").toLowerCase());
    let name = base;
    let n = 2;
    while (existing.includes(name.toLowerCase())) name = `${base} (${n++})`;

    setDuplicating(item.id);
    try {
      const newId = `cl_${Date.now()}`;
      const { id: _id, updatedAt: _ts, ...data } = item;
      await setDoc(doc(db, "users", user.uid, COLLECTION, newId), {
        ...data, title: name, updatedAt: serverTimestamp(),
      });
      await load();
      showToast(`Duplicated as "${name}".`);
    } catch {
      showToast("Failed to duplicate.", "error");
    } finally {
      setDuplicating(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const triggerDownload = useCallback((item) => {
    setPrintItem(item);
    setTimeout(() => handlePrint(), 100);
  }, [handlePrint]);

  if (!user) return <AuthPrompt title="Cover Letters" />;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-900 text-white"
          }`}>
            {toast.type === "error"
              ? <AlertCircle className="w-4 h-4" />
              : <CheckCircle className="w-4 h-4 text-green-400" />}
            {toast.msg}
          </div>
        )}

        {showNew && (
          <NewModal
            existingTitles={items.map((i) => i.title || "")}
            onConfirm={handleCreate}
            onClose={() => setShowNew(false)}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            item={deleteTarget}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
            deleting={!!deleting}
          />
        )}

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cover Letters</h1>
              <p className="text-gray-500 mt-1 text-sm">Create compelling cover letters for your applications.</p>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
            >
              <Plus className="w-4 h-4" /> New Cover Letter
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-blue-50 inline-flex p-4 rounded-2xl mb-4">
                <Mail className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No cover letters yet</h2>
              <p className="text-gray-500 mb-6">Write a cover letter that gets you noticed.</p>
              <button
                onClick={() => setShowNew(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Create My First Cover Letter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create card */}
              <button
                onClick={() => setShowNew(true)}
                className="group border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[180px]"
              >
                <div className="bg-gray-100 group-hover:bg-blue-100 p-4 rounded-full transition-colors">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
                  + Create New Cover Letter
                </span>
              </button>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  {/* Preview area */}
                  <div className="h-36 bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-2 bg-gray-400 rounded mx-6 mb-2 mt-2" style={{ width: `${60 + (i % 3) * 15}%` }} />
                      ))}
                    </div>
                    <Mail className="w-10 h-10 text-blue-300" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base truncate mb-0.5">
                      {item.title || "Untitled"}
                    </h3>
                    {item.recipientCompany && (
                      <p className="text-xs text-gray-400 mb-2">To: {item.recipientCompany}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {formatDate(item.updatedAt)}
                    </div>

                    <div className="space-y-1.5">
                      {/* Download PDF */}
                      <button
                        onClick={() => triggerDownload(item)}
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-100"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>

                      <button
                        onClick={() => navigate(`/cover-letter-builder/${item.id}`)}
                        className="w-full flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 py-1.5 rounded-lg text-sm font-medium hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDuplicate(item)}
                          disabled={duplicating === item.id}
                          className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:border-blue-300 hover:text-blue-500 transition-colors disabled:opacity-50"
                        >
                          {duplicating === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                          Duplicate
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:border-red-300 hover:text-red-500 transition-colors"
                        >
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

        {/* Hidden print template — rendered off-screen, printed on demand */}
        <div className="hidden print:block">
          <div ref={printRef}>
            {printItem && <PrintTemplate data={printItem} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
