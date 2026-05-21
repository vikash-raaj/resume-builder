import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Share2 } from 'lucide-react';
import { useResume } from '../../../context/ResumeContext';
import ModernTemplate from '../templates/ModernTemplate';
import ClassicTemplate from '../templates/ClassicTemplate';
import MinimalTemplate from '../templates/MinimalTemplate';
import RigaTemplate from '../templates/RigaTemplate';

const templateMap = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  riga: RigaTemplate,
};

export default function DownloadStep({ onBack }) {
  const { resume } = useResume();
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle:
      (resume.title || `${resume.personalInfo.firstName || 'Resume'}_${resume.personalInfo.lastName || ''}`).trim(),
  });

  const ResumeTemplate = templateMap[resume.template] || RigaTemplate;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        <span className="text-blue-500">Download</span> your resume
      </h1>
      <p className="text-gray-500 mb-8">Your resume is ready. Download it as a PDF.</p>

      <div className="flex gap-8 items-start">
        {/* Actions */}
        <div className="w-52 flex-shrink-0 space-y-3">
          <button
            onClick={() => handlePrint()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 px-5 py-3 rounded-xl font-semibold text-sm transition-colors">
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
              ← Back to Finish It
            </button>
          </div>
        </div>

        {/* Preview */}
        <div
          className="flex-1 overflow-hidden rounded-xl shadow-2xl bg-white"
          style={{ maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}
        >
          <div style={{ width: '794px', transformOrigin: 'top left', transform: 'scale(0.72)', marginBottom: '-314px' }}>
            <div ref={printRef} style={{ width: '794px', minHeight: '1123px' }}>
              <ResumeTemplate resume={resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
