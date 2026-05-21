import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { ResumeProvider } from "../context/ResumeContext";
import BuilderLayout from "../components/builder/BuilderLayout";
import { Loader2 } from "lucide-react";

export default function BuilderPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [initialResume, setInitialResume] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) {
      // New resume — title comes from Dashboard's navigation state
      const newTitle = location.state?.newTitle || "";
      setInitialResume({ template: "riga", title: newTitle });
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
    </ResumeProvider>
  );
}
