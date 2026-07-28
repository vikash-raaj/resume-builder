import { ShieldCheck, Mail } from "lucide-react";
import AppLayout, { useContactModal } from "../components/AppLayout";

const SECTIONS = [
  {
    title: "Who operates this site",
    body: "TheResume.io is operated by Vikash Raj, an individual developer, not a registered company. This policy explains what information is collected when you use TheResume.io and how it's used.",
  },
  {
    title: "What we collect",
    body: "When you create an account, we collect your email address and authentication details through Firebase Authentication (including Google Sign-In, if you use it). When you use the builder, the resumes, cover letters, and other documents you create — along with their content — are stored in your account using Firebase/Firestore, a service operated by Google.",
  },
  {
    title: "What we don't do with your content",
    body: "Your resumes and letters are private to your account. We do not sell your personal data or document content to third parties, and we do not use the content of your resumes to train AI models. If you use the optional AI Writing Assistant, your prompt is sent to Anthropic's API using an API key you provide and control yourself — it is never stored on our servers.",
  },
  {
    title: "Cookies and analytics",
    body: "We use basic, privacy-respecting analytics to understand aggregate site usage (e.g. total page visits), and standard authentication cookies/tokens needed to keep you signed in. If you see advertising on this site, it's served through Google AdSense, which may use cookies to show relevant ads — you can control ad personalization through your Google Account settings.",
  },
  {
    title: "Third-party services we use",
    body: "Firebase (Google) for authentication, database storage, and hosting. Lemon Squeezy for processing Pro subscription payments — we never see or store your full card details; Lemon Squeezy handles that directly. Google AdSense for advertising, where applicable. Each of these services has its own privacy policy governing how they handle data on their end.",
  },
  {
    title: "Your rights",
    body: "You can view, edit, or delete any resume or letter directly from your Dashboard at any time. If you want your account and all associated data permanently deleted, contact us using the details below and we'll take care of it.",
  },
  {
    title: "Changes to this policy",
    body: "If this policy changes in a meaningful way, we'll update the date below. Continued use of TheResume.io after a change means you accept the updated policy.",
  },
];

function PrivacyContent() {
  const openContact = useContactModal();

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-xs text-gray-400">Last updated July 2026</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            This is a plain-language summary of how TheResume.io handles your data. It's written to be genuinely
            useful rather than legal boilerplate, but it isn't a substitute for professional legal advice if you
            need that for your own situation.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {SECTIONS.map((section) => (
            <div key={section.title} className="p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Questions about this policy?</h2>
            <p className="text-xs text-gray-500">Reach out directly and we'll answer as soon as we can.</p>
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

export default function PrivacyPolicyPage() {
  return (
    <AppLayout>
      <PrivacyContent />
    </AppLayout>
  );
}
