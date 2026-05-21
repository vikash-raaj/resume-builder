import { Zap, Shield, Download, LayoutTemplate, RefreshCw, Globe } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    color: "bg-blue-100 text-blue-600",
    title: "ATS-Optimized",
    desc: "All templates are engineered to pass Applicant Tracking Systems used by 99% of Fortune 500 companies.",
  },
  {
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600",
    title: "Instant Live Preview",
    desc: "See every change in real time as you type. No more blind editing — what you see is exactly what you get.",
  },
  {
    icon: Download,
    color: "bg-green-100 text-green-600",
    title: "One-Click PDF Export",
    desc: "Download a pixel-perfect PDF resume instantly. High-resolution, print-ready, and recruiter-friendly.",
  },
  {
    icon: LayoutTemplate,
    color: "bg-purple-100 text-purple-600",
    title: "Multiple Templates",
    desc: "Switch between 6+ professionally designed templates without losing any of your content.",
  },
  {
    icon: RefreshCw,
    color: "bg-pink-100 text-pink-600",
    title: "Auto-Save to Cloud",
    desc: "Your progress is saved automatically to Firebase. Pick up where you left off on any device.",
  },
  {
    icon: Globe,
    color: "bg-cyan-100 text-cyan-600",
    title: "Works Everywhere",
    desc: "Fully responsive — build and edit your resume on desktop, tablet, or mobile with ease.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            Everything You Need to Land the Job
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            TheResume.io gives you all the tools to build, customize, and export a professional resume without the hassle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`inline-flex p-3 rounded-xl ${color} mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
