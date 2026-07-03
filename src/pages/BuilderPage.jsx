import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { ResumeProvider } from "../context/ResumeContext";
import BuilderLayout from "../components/builder/BuilderLayout";
import { Loader2, Check, X, Sparkles } from "lucide-react";

export default function BuilderPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [initialResume, setInitialResume] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [importBanner, setImportBanner] = useState(null);

  useEffect(() => {
    if (!id) {
      const { importedResume, importedFileName, importedAiEnhanced, newTitle } = location.state || {};
      if (importedResume) {
        setInitialResume({ template: "riga", title: importedFileName?.replace(/\.(pdf|docx)$/i, "") || "", ...importedResume });
        setImportBanner({ fileName: importedFileName, aiEnhanced: importedAiEnhanced });
        return;
      }
      // New resume — title comes from Dashboard's navigation state
      setInitialResume({ template: "riga", title: newTitle || "" });
      return;
    }
    if (!user) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "resumes", id));
        if (snap.exists()) setInitialResume(snap.data());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <ResumeProvider initial={initialResume}>
      <BuilderLayout resumeId={id} />
      {importBanner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg bg-indigo-700 text-white text-sm font-medium max-w-lg no-print">
          {importBanner.aiEnhanced ? <Sparkles className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0" />}
          <span>
            Imported from {importBanner.fileName || "your file"} — please review the details below.
            {!importBanner.aiEnhanced && " Add an AI key for smarter section splitting."}
          </span>
          <button onClick={() => setImportBanner(null)} className="flex-shrink-0 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </ResumeProvider>
  );
}
