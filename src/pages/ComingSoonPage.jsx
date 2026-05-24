import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { ArrowLeft, Clock } from "lucide-react";

export default function ComingSoonPage({ title, description, icon: Icon, accent = "bg-blue-50", iconColor = "text-blue-500" }) {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 max-w-md w-full text-center">
          {/* Icon */}
          <div className={`inline-flex w-20 h-20 rounded-3xl ${accent} items-center justify-center mb-6`}>
            <Icon className={`w-10 h-10 ${iconColor}`} />
          </div>

          {/* Coming soon badge */}
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Clock className="w-3.5 h-3.5" />
            Coming Soon
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">{description}</p>

          {/* Placeholder features */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-2.5">
            {["Easy to use interface", "Professional templates", "AI-powered content", "Download & share instantly"].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="1.5,6 4.5,9 10.5,3" />
                  </svg>
                </span>
                {f}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mx-auto transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to my CVs
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
