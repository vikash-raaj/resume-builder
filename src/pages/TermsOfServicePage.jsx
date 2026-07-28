import { FileCheck, Mail } from "lucide-react";
import AppLayout, { useContactModal } from "../components/AppLayout";

const SECTIONS = [
  {
    title: "The service",
    body: "TheResume.io is a resume and job-application toolkit — a resume builder, cover letter builder, resignation and recommendation letter generators, a job tracker, interview prep, LinkedIn optimization, and salary insights. It's operated by Vikash Raj, an individual developer, not a registered company.",
  },
  {
    title: "Your account",
    body: "You're responsible for keeping your account credentials secure and for all activity under your account. You must provide accurate information when creating an account, and you must be old enough to legally agree to these terms in your country.",
  },
  {
    title: "Your content",
    body: "You own everything you create using TheResume.io — your resumes, cover letters, and other documents remain yours. We store them so you can access and edit them, and we don't claim any ownership over your content or use it for purposes other than providing the service to you.",
  },
  {
    title: "Free plan and Pro subscription",
    body: "The Free plan includes a limited set of features (currently up to 3 resumes and 3 core templates). Pro is a paid subscription, billed monthly or yearly, that unlocks unlimited resumes, all templates, DOCX export, version history, and priority support. Subscription payments are processed by Lemon Squeezy, acting as merchant of record; billing, invoicing, and payment method details are handled entirely on their platform, not ours.",
  },
  {
    title: "Cancelling or changing your plan",
    body: "You can switch between monthly and yearly billing, or cancel your Pro subscription, at any time from your account. Cancelling stops future billing; it does not retroactively refund the current billing period unless required by applicable law or offered at our discretion.",
  },
  {
    title: "Acceptable use",
    body: "Don't use TheResume.io to create fraudulent documents intended to misrepresent your identity, credentials, or work history to a third party, or to attempt to disrupt, reverse-engineer, or abuse the service. We reserve the right to suspend accounts that violate this.",
  },
  {
    title: "Service availability",
    body: "We aim to keep TheResume.io available and reliable, but as with any online service, we can't guarantee it will be uninterrupted or error-free. We're not liable for lost data or missed opportunities resulting from downtime, though we take reasonable steps to prevent it and to back up your data.",
  },
  {
    title: "Limitation of liability",
    body: "TheResume.io is provided on an \"as is\" basis. We aren't liable for indirect, incidental, or consequential damages arising from your use of the service, including outcomes related to job applications made using documents created here. You're responsible for reviewing and verifying the accuracy of anything you generate before submitting it to an employer.",
  },
  {
    title: "Changes to these terms",
    body: "If these terms change in a meaningful way, we'll update the date below. Continued use of TheResume.io after a change means you accept the updated terms.",
  },
];

function TermsContent() {
  const openContact = useContactModal();

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-xs text-gray-400">Last updated July 2026</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            These terms are written in plain language to be genuinely useful rather than legal boilerplate, but
            they aren't a substitute for professional legal advice if you need that for your own situation. By
            using TheResume.io, you agree to the terms below.
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
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Questions about these terms?</h2>
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

export default function TermsOfServicePage() {
  return (
    <AppLayout>
      <TermsContent />
    </AppLayout>
  );
}
