import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Loader2, AlertCircle, Eye } from 'lucide-react';
import RigaTemplate from '../components/builder/templates/RigaTemplate';
import ModernTemplate from '../components/builder/templates/ModernTemplate';
import ClassicTemplate from '../components/builder/templates/ClassicTemplate';
import MinimalTemplate from '../components/builder/templates/MinimalTemplate';
import ExecutiveTemplate from '../components/builder/templates/ExecutiveTemplate';
import TechTemplate from '../components/builder/templates/TechTemplate';

const TEMPLATE_MAP = {
  riga: RigaTemplate,
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
};

export default function SharedResumePage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        // 1. Try Firestore first
        const snap = await getDoc(doc(db, 'publicResumes', id));
        if (snap.exists()) {
          const data = snap.data();
          setResume(data);
          setViewCount(data.viewCount || 0);
          // Increment view count silently
          updateDoc(doc(db, 'publicResumes', id), {
            viewCount: increment(1),
            lastViewedAt: serverTimestamp(),
          }).catch(() => {});
          return;
        }

        // 2. Fallback: check localStorage (shared without login)
        const stored = JSON.parse(localStorage.getItem('publicResumes') || '{}');
        if (stored[id]) {
          setResume(stored[id]);
          setViewCount(stored[id].viewCount || 0);
          return;
        }

        setError(true);
      } catch (e) {
        // Firestore error — try localStorage fallback
        try {
          const stored = JSON.parse(localStorage.getItem('publicResumes') || '{}');
          if (stored[id]) { setResume(stored[id]); return; }
        } catch {}
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <AlertCircle className="w-12 h-12 text-gray-300" />
        <h1 className="text-xl font-semibold text-gray-600">Resume not found</h1>
        <p className="text-gray-400 text-sm">This link may have expired or the resume is private.</p>
      </div>
    );
  }

  const ResumeTemplate = TEMPLATE_MAP[resume.template] || RigaTemplate;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {resume.title || `${resume.personalInfo?.firstName || ''} ${resume.personalInfo?.lastName || ''}`.trim() || 'Resume'}
          </p>
          <p className="text-xs text-gray-400">Shared resume — read only</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Eye className="w-3.5 h-3.5" />
          <span>{viewCount + 1} view{viewCount !== 0 ? 's' : ''}</span>
        </div>
      </div>

      {/* Resume */}
      <div className="py-10 px-4 flex justify-center">
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden" style={{ width: '794px' }}>
          <ResumeTemplate resume={resume} />
        </div>
      </div>

      {/* Watermark / CTA */}
      <div className="py-8 text-center">
        <p className="text-gray-400 text-sm">
          Built with{' '}
          <a href="/" className="text-blue-500 font-semibold hover:underline">
            TheResume.io
          </a>
          {' '}— Build your free resume in minutes
        </p>
      </div>
    </div>
  );
}
