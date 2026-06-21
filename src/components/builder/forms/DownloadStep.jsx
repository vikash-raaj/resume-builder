import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Share2, Check, FileText, Loader2, X, QrCode, BarChart3, GitBranch, Clock, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useResume } from '../../../context/ResumeContext';
import { useAuth } from '../../../context/AuthContext';
import { exportToDocx } from '../../../utils/docxExport';
import { getATSScore } from '../../../utils/atsChecker';
import ModernTemplate from '../templates/ModernTemplate';
import ClassicTemplate from '../templates/ClassicTemplate';
import MinimalTemplate from '../templates/MinimalTemplate';
import RigaTemplate from '../templates/RigaTemplate';
import ExecutiveTemplate from '../templates/ExecutiveTemplate';
import TechTemplate from '../templates/TechTemplate';

const templateMap = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  riga: RigaTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
};

export default function DownloadStep({ onBack, resumeId, onGoToStep }) {
  const { resume, setResume } = useResume();
  const { user } = useAuth();
  const printRef = useRef(null);

  const [shareState, setShareState] = useState('idle'); // idle | sharing | copied | error
  const [shareUrl, setShareUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [showATS, setShowATS] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [restoredVersion, setRestoredVersion] = useState(null);

  const docTitle = (
    resume.title ||
    `${resume.personalInfo.firstName || 'Resume'}_${resume.personalInfo.lastName || ''}`
  ).trim();

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: docTitle });

  // --- Share Link ---
  const handleShare = async () => {
    setShareState('sharing');
    const id = resumeId || `resume_${Date.now()}`;
    try {
      // Try Firestore first (works when logged in)
      await setDoc(doc(db, 'publicResumes', id), {
        ...resume,
        sharedAt: serverTimestamp(),
        sharedBy: user?.uid || null,
        viewCount: 0,
      });
    } catch (e) {
      // Not signed in or Firestore error — store in localStorage so /r/:id can read it
      try {
        const stored = JSON.parse(localStorage.getItem('publicResumes') || '{}');
        stored[id] = { ...resume, sharedAt: new Date().toISOString(), viewCount: 0 };
        localStorage.setItem('publicResumes', JSON.stringify(stored));
      } catch {}
    }
    try {
      const url = `${window.location.origin}/r/${id}`;
      await navigator.clipboard.writeText(url);
      setShareUrl(url);
      setShareState('copied');
    } catch {
      // clipboard blocked (e.g. http) — still show the URL visually
      const url = `${window.location.origin}/r/${id}`;
      setShareUrl(url);
      setShareState('copied');
    }
    setTimeout(() => setShareState('idle'), 4000);
  };

  // --- Word Export ---
  const handleDocx = async () => {
    setDocxLoading(true);
    try {
      await exportToDocx(resume, docTitle);
    } catch (e) {
      console.error('DOCX export failed', e);
    } finally {
      setDocxLoading(false);
    }
  };

  // --- ATS Check ---
  const handleATSCheck = () => {
    const result = getATSScore(resume);
    setAtsResult(result);
    setShowATS(true);
  };

  // --- Version History ---
  const handleShowVersions = async () => {
    setShowVersions(true);
    if (!user || !resumeId || versions.length > 0) return;
    setVersionsLoading(true);
    try {
      const q = query(
        collection(db, 'users', user.uid, 'resumes', resumeId, 'versions'),
        orderBy('savedAt', 'desc')
      );
      const snap = await getDocs(q);
      setVersions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { /* no versions yet */ }
    finally { setVersionsLoading(false); }
  };

  const ResumeTemplate = templateMap[resume.template] || RigaTemplate;
  // Always generate a predictable URL for QR (uses resumeId if available, else timestamp-based)
  const effectiveId = resumeId || `resume_${resume.personalInfo?.firstName || 'user'}_${resume.personalInfo?.lastName || 'resume'}`.toLowerCase().replace(/\s+/g, '_');
  const publicUrl = shareUrl || `${window.location.origin}/r/${effectiveId}`;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        <span className="text-blue-500">Download</span> your resume
      </h1>
      <p className="text-gray-500 mb-8">Your resume is ready. Export, share, or check ATS score below.</p>

      <div className="flex gap-8 items-start">
        {/* Actions */}
        <div className="w-56 flex-shrink-0 space-y-2.5">
          {/* PDF */}
          <button
            onClick={() => handlePrint()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          {/* Word */}
          <button
            onClick={handleDocx}
            disabled={docxLoading}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 px-5 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {docxLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Download Word
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            disabled={shareState === 'sharing'}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-colors ${
              shareState === 'copied'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'border border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {shareState === 'sharing' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : shareState === 'copied' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            {shareState === 'sharing' ? 'Publishing…' : shareState === 'copied' ? 'Link Copied!' : 'Share Link'}
          </button>

          {/* Show URL after share for manual copy */}
          {shareUrl && shareState === 'copied' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-2">
              <p className="text-[9px] text-emerald-600 font-semibold mb-0.5">Your shareable link:</p>
              <p className="text-[9px] text-emerald-700 break-all font-mono">{shareUrl}</p>
            </div>
          )}

          {/* QR Code */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-600 px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            <QrCode className="w-4 h-4" />
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>

          {/* ATS Check */}
          <button
            onClick={handleATSCheck}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-600 px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Check ATS Score
          </button>

          {/* Version History */}
          {user && resumeId && (
            <button
              onClick={handleShowVersions}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              Version History
            </button>
          )}

          {/* QR display */}
          {showQR && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2">
              <QRCodeSVG value={publicUrl} size={140} />
              <p className="text-[10px] text-gray-400 text-center">Scan to open your resume</p>
              <p className="text-[9px] text-gray-300 text-center break-all">{publicUrl}</p>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
              ← Back to Finish It
            </button>
          </div>
        </div>

        {/* Preview — scrollable so 2-column templates (Tech/Executive) don't get clipped */}
        <div
          className="flex-1 rounded-xl shadow-2xl bg-white overflow-auto"
          style={{ maxHeight: '80vh', minWidth: 0 }}
        >
          <div style={{ width: '794px', transformOrigin: 'top left', transform: 'scale(0.82)', marginBottom: '-142px' }}>
            <div ref={printRef} style={{ width: '794px', minHeight: '1123px' }}>
              <ResumeTemplate resume={resume} />
            </div>
          </div>
        </div>
      </div>

      {/* ATS Score Modal */}
      {showATS && atsResult && (
        <ATSModal
          result={atsResult}
          onClose={() => setShowATS(false)}
          onGoToStep={(step) => { setShowATS(false); onGoToStep?.(step); }}
        />
      )}

      {/* Versions Modal */}
      {showVersions && (
        <VersionsModal
          versions={versions}
          loading={versionsLoading}
          onRestore={(v) => { setResume(prev => ({ ...prev, ...v, id: prev.id })); setShowVersions(false); setRestoredVersion(v.versionName); setTimeout(() => setRestoredVersion(null), 3000); }}
          onClose={() => setShowVersions(false)}
        />
      )}

      {/* Restored toast */}
      {restoredVersion && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg bg-indigo-700 text-white text-sm font-medium">
          <Check className="w-4 h-4" /> Restored: {restoredVersion}
        </div>
      )}
    </div>
  );
}

function VersionsModal({ versions, loading, onRestore, onClose }) {
  const fmt = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Version History</h2>
            <p className="text-sm text-gray-500">Restore a previously saved version</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No saved versions yet.</p>
              <p className="text-xs mt-1">Use "Save Version" in the builder top bar to snapshot this resume.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{v.versionName}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                      <Clock className="w-3 h-3" /> {fmt(v.savedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => onRestore(v)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STEP_LABELS = ['Contact', 'Experience', 'Education', 'Skills', 'Summary', 'Finish It', 'Download'];

function issueToStep(issue) {
  const t = issue.toLowerCase();
  if (t.includes('email') || t.includes('phone') || t.includes('location') || t.includes('full name') || t.includes('linkedin') || t.includes('professional title') || t.includes('job title')) return 0;
  if (t.includes('summary')) return 4;
  if (t.includes('experience') || t.includes('employment') || t.includes('action verb') || t.includes('bullet') || t.includes('metric') || t.includes('quantif') || t.includes('description')) return 1;
  if (t.includes('skill')) return 3;
  if (t.includes('education') || t.includes('degree')) return 2;
  return null;
}

function ATSModal({ result, onClose, onGoToStep }) {
  const scoreColor =
    result.score >= 80 ? 'text-emerald-600' :
    result.score >= 60 ? 'text-yellow-600' : 'text-red-500';
  const barColor =
    result.score >= 80 ? 'bg-emerald-500' :
    result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">ATS Score</h2>
            <p className="text-sm text-gray-500">Applicant Tracking System compatibility</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Score circle */}
          <div className="flex flex-col items-center mb-6">
            <div className={`text-6xl font-black ${scoreColor}`}>{result.score}</div>
            <div className="text-gray-400 text-sm font-medium">out of 100</div>
            <div className="w-full bg-gray-100 rounded-full h-3 mt-4 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <p className={`mt-2 text-sm font-semibold ${scoreColor}`}>{result.label}</p>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Issues to Fix</h3>
              <div className="space-y-2">
                {result.issues.map((issue, i) => {
                  const step = issueToStep(issue);
                  return (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-red-50 rounded-lg">
                      <span className="text-red-500 mt-0.5 text-xs font-bold flex-shrink-0">✗</span>
                      <span className="text-sm text-red-700 flex-1">{issue}</span>
                      {step !== null && onGoToStep && (
                        <button
                          onClick={() => onGoToStep(step)}
                          className="flex-shrink-0 text-xs font-semibold text-red-600 border border-red-200 bg-white hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Fix in {STEP_LABELS[step]} →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Passing */}
          {result.passing.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Looks Good</h3>
              <div className="space-y-2">
                {result.passing.map((pass, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-600 mt-0.5 text-xs font-bold">✓</span>
                    <span className="text-sm text-emerald-700">{pass}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
