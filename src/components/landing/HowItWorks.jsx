import { useNavigate } from "react-router-dom";
import { UserCircle, LayoutTemplate, FileDown } from "lucide-react";

const STEPS = [
  {
    icon: UserCircle,
    step: "01",
    title: "Fill In Your Details",
    desc: "Enter your personal info, work experience, education, and skills using our guided step-by-step form. No blank-page anxiety.",
  },
  {
    icon: LayoutTemplate,
    step: "02",
    title: "Choose Your Template",
    desc: "Browse professionally designed templates and switch between them instantly. Your content moves with you — no re-entry needed.",
  },
  {
    icon: FileDown,
    step: "03",
    title: "Download & Apply",
    desc: "Export your finished resume as a clean PDF in one click. Then go land that interview. It's that simple.",
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-200 font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-4xl font-bold mt-2 mb-4">Resume Ready in 3 Simple Steps</h2>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto">
            No design skills required. No confusing interfaces. Just a fast, intuitive flow that gets you a great resume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-blue-400/40" />

          {STEPS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="relative text-center">
              <div className="relative inline-flex mb-6">
                <div className="bg-white/20 backdrop-blur rounded-2xl p-5">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 bg-blue-400 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {step.slice(1)}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{title}</h3>
              <p className="text-blue-100 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => navigate("/builder")}
            className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
          >
            Start Building Now — It's Free
          </button>
        </div>
      </div>
    </section>
  );
}
