import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Software Engineer at Google",
    avatar: "SM",
    color: "bg-blue-500",
    stars: 5,
    text: "I updated my resume using TheResume.io and landed 4 interviews in one week. The ATS score feature showed me exactly what to fix. Absolutely worth it.",
  },
  {
    name: "James K.",
    role: "Marketing Manager",
    avatar: "JK",
    color: "bg-purple-500",
    stars: 5,
    text: "Switched from another resume builder and the difference is night and day. The live preview saves so much time and the templates actually look professional.",
  },
  {
    name: "Priya R.",
    role: "Data Analyst at Meta",
    avatar: "PR",
    color: "bg-green-500",
    stars: 5,
    text: "As someone with no design experience, TheResume.io made it incredibly easy to create something I'm truly proud to send out. Got my dream job in 3 weeks!",
  },
  {
    name: "Carlos D.",
    role: "Product Manager",
    avatar: "CD",
    color: "bg-orange-500",
    stars: 5,
    text: "Clean, fast, no bloat. I love how I can switch templates without re-entering all my details. The PDF export quality is excellent too.",
  },
  {
    name: "Aisha T.",
    role: "UX Designer at Airbnb",
    avatar: "AT",
    color: "bg-pink-500",
    stars: 5,
    text: "Even as a designer I couldn't be bothered building my own resume. TheResume.io's modern template is gorgeous and took 20 minutes to fill out.",
  },
  {
    name: "Wei L.",
    role: "Financial Analyst",
    avatar: "WL",
    color: "bg-cyan-500",
    stars: 5,
    text: "The free plan was enough for me to land a great job. The step-by-step form walked me through sections I would've forgotten to include.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            Loved by 500,000+ Job Seekers
          </h2>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Real stories from people who built their resumes with TheResume.io and got hired.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`${t.color} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
