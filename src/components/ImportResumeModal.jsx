import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { getStoredAIKey } from '../utils/aiService';
import AIKeySetup from './builder/AIKeySetup';

export default function ImportResumeModal({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | reading | done
  const [error, setError] = useState('');
  const [showAIKeySetup, setShowAIKeySetup] = useState(false);
  const [hasKey, setHasKey] = useState(!!getStoredAIKey());

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setStatus('reading');
    try {
      // Loaded on demand — pdfjs-dist/mammoth are heavy and most users never import a resume.
      const { extractTextFromFile, buildImportedResume } = await import('../utils/resumeImport');
      const rawText = await extractTextFromFile(file);
      const { resume, aiEnhanced } = await buildImportedResume(rawText);
      navigate('/builder', {
        state: {
          importedResume: resume,
          importedFileName: file.name,
          importedAiEnhanced: aiEnhanced,
        },
      });
    } catch (e) {
      setError(e.message || 'Could not read this file. Please try a different PDF or DOCX.');
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Import your resume</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Upload an existing resume (PDF or Word) and we'll pre-fill the builder for you.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === 'reading'}
          className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl py-8 transition-colors disabled:opacity-60"
        >
          {status === 'reading' ? (
            <>
              <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
              <span className="text-sm font-medium text-gray-600">Reading your resume…</span>
            </>
          ) : (
            <>
              <div className="bg-blue-50 p-3 rounded-full">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">Click to choose a PDF or DOCX file</span>
            </>
          )}
        </button>

        {error && (
          <div className="flex items-start gap-1.5 mt-3 text-red-600 text-xs">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!hasKey && (
          <div className="flex items-start gap-2 mt-4 bg-purple-50 border border-purple-100 rounded-xl px-3.5 py-3">
            <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-purple-800">
                Add your AI key for smarter parsing — it'll split your experience, education, and skills into the right fields automatically.
              </p>
              <button
                type="button"
                onClick={() => setShowAIKeySetup(true)}
                className="text-xs font-semibold text-purple-700 hover:underline mt-1"
              >
                Enable AI parsing
              </button>
            </div>
          </div>
        )}

        <div className="flex items-start gap-1.5 mt-4 text-[11px] text-gray-400">
          <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Works best with text-based PDFs and Word docs. Scanned/image-only resumes can't be read automatically.</span>
        </div>
      </div>

      {showAIKeySetup && (
        <AIKeySetup
          onClose={() => setShowAIKeySetup(false)}
          onSaved={() => setHasKey(true)}
        />
      )}
    </div>
  );
}
