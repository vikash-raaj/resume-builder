import { Link } from "react-router-dom";
import { Layers, ShieldCheck, FileCheck, Mail } from "lucide-react";
import AppLayout, { useContactModal } from "../components/AppLayout";

const PRINCIPLES = [
  {
    icon: Layers,
    title: "The whole job search, not just the resume",
    body: "CV builder, cover letters, resignation & recommendation letters, an application kit, a job tracker, interview prep, LinkedIn optimization, and salary insights — one place instead of six different tools.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, your account",
    body: "Every resume and letter is saved to your own account and only visible to you. Nothing is shared or sold to third parties.",
  },
  {
    icon: FileCheck,
    title: "ATS-friendly by design",
    body: "Every template is built to parse cleanly through applicant tracking systems, with a built-in ATS score checker that shows exactly what to fix before you apply.",
  },
];

function AboutContent() {
  const openContact = useContactModal();

  return (
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">About TheResume.io</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              TheResume.io is a free resume and job-application toolkit — an ATS-friendly resume builder
              with multiple templates, an AI-assisted cover letter builder, resignation and recommendation
              letter generators, a job application tracker, interview prep, LinkedIn profile optimization,
              and salary insights by role and location.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              It's built and maintained by one developer, growing feature by feature whenever an existing
              resume tool was too expensive, too bloated, or made a simple task like tailoring a resume to
              a job description harder than it needed to be.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-xl p-5">
                <Icon size={18} className="text-blue-500 mb-2" />
                <h2 className="text-sm font-semibold text-gray-900 mb-1">{title}</h2>
                <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Questions, bugs, or a feature idea?</h2>
              <p className="text-xs text-gray-500">
                Reach out directly, or browse common questions on the{" "}
                <Link to="/help-center" className="text-blue-600 hover:underline">Help Center</Link> page.
              </p>
            </div>
            <button
              onClick={openContact}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <Mail size={14} /> Get in touch
            </button>
          </div>
        </div>
      </div>
  );
}

export default function AboutPage() {
  return (
    <AppLayout>
      <AboutContent />
    </AppLayout>
  );
}
