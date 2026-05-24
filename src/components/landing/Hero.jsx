import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const TYPING_WORDS = ["Gets You Hired", "Lands More Interviews", "Stands Out", "Gets You Promoted", "Beats The ATS"];

function useTypewriter(words) {
  const [display, setDisplay] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const speed = isDeleting ? 50 : 90;
    const pauseAtEnd = !isDeleting && display === current ? 1600 : 0;

    const timer = setTimeout(() => {
      if (!isDeleting && display === current) {
        setIsDeleting(true);
        return;
      }
      if (isDeleting && display === "") {
        setIsDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
        return;
      }
      setDisplay(isDeleting ? current.slice(0, display.length - 1) : current.slice(0, display.length + 1));
    }, pauseAtEnd || speed);

    return () => clearTimeout(timer);
  }, [display, isDeleting, wordIndex, words]);

  return display;
}

const RESUME_PREVIEW = {
  name: "Alex Johnson",
  title: "Senior Product Designer",
  email: "alex@email.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  summary: "Creative and detail-oriented Product Designer with 6+ years of experience crafting intuitive digital experiences for SaaS and consumer products.",
  experience: [
    { company: "Figma Inc.", role: "Senior Product Designer", period: "2021 – Present" },
    { company: "Airbnb", role: "UX Designer", period: "2019 – 2021" },
  ],
  skills: ["Figma", "UX Research", "Prototyping", "Design Systems", "React"],
};

export default function Hero() {
  const navigate = useNavigate();
  const typedWord = useTypewriter(TYPING_WORDS);

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              Trusted by 500,000+ job seekers
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Build a Resume That
              <br />
              <span className="text-blue-600 whitespace-nowrap">
                {typedWord}
                <span className="inline-block w-[3px] h-[1em] bg-blue-500 ml-1 align-middle animate-pulse" />
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Create a stunning, ATS-optimized resume in minutes. Choose from professional templates, fill in your details, and download your resume instantly.
            </p>

            <div className="space-y-3">
              {[
                "ATS-friendly templates designed by HR experts",
                "Live preview as you type — no guesswork",
                "Download as PDF in one click",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/builder")}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
              >
                Create My Resume
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#templates"
                className="flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                View Templates
              </a>
            </div>

            <p className="text-sm text-gray-500">No credit card required · Free forever plan available</p>
          </div>

          {/* Right: Resume card mock */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-blue-200 rounded-full opacity-30 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-indigo-200 rounded-full opacity-30 blur-3xl" />

              {/* Resume card */}
              <div className="relative bg-white rounded-2xl resume-shadow w-80 p-6 border border-gray-100">
                {/* Header strip */}
                <div className="bg-blue-600 -mx-6 -mt-6 px-6 pt-6 pb-5 rounded-t-2xl mb-4">
                  <h2 className="text-white text-xl font-bold">{RESUME_PREVIEW.name}</h2>
                  <p className="text-blue-100 text-sm font-medium">{RESUME_PREVIEW.title}</p>
                  <div className="flex flex-wrap gap-2 mt-2 text-blue-200 text-xs">
                    <span>{RESUME_PREVIEW.email}</span>
                    <span>·</span>
                    <span>{RESUME_PREVIEW.phone}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Summary</h3>
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{RESUME_PREVIEW.summary}</p>
                </div>

                {/* Experience */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Experience</h3>
                  {RESUME_PREVIEW.experience.map((e) => (
                    <div key={e.company} className="mb-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-semibold text-gray-800">{e.role}</span>
                        <span className="text-xs text-gray-400">{e.period}</span>
                      </div>
                      <span className="text-xs text-gray-500">{e.company}</span>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {RESUME_PREVIEW.skills.map((s) => (
                      <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-6 bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg">
                ✓ ATS Score: 98%
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
