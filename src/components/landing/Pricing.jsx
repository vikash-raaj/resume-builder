import { CheckCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSubscription } from "../../context/SubscriptionContext";

// Set VITE_STRIPE_PAYMENT_LINK in .env.local with your Stripe Payment Link URL
// e.g. VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/xxxxxxxxxxxx
const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || null;

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started and trying out the platform.",
    cta: "Get Started Free",
    highlight: false,
    features: [
      "3 resumes",
      "3 core templates",
      "PDF download",
      "Live preview",
      "Basic ATS check",
    ],
    missing: ["Unlimited resumes", "All 6 premium templates", "DOCX export", "Version history", "Priority support"],
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For serious job seekers who want every advantage.",
    cta: "Start Pro Free Trial",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited resumes",
      "All 6 premium templates",
      "PDF & DOCX download",
      "Advanced ATS score",
      "Cover letter builder",
      "Version history",
      "Priority support",
      "Cloud auto-save",
    ],
    missing: [],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro } = useSubscription();

  const handleProClick = () => {
    if (isPro) { navigate('/dashboard'); return; }
    if (!user) { navigate('/?signin=1#pricing'); return; }
    if (STRIPE_PAYMENT_LINK) {
      // Append prefilled_email so Stripe can link to Firebase user
      const url = new URL(STRIPE_PAYMENT_LINK);
      url.searchParams.set('prefilled_email', user.email || '');
      url.searchParams.set('client_reference_id', user.uid);
      window.location.href = url.toString();
    } else {
      // Payment link not configured — dev mode, just activate for testing
      navigate('/payment-success');
    }
  };

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Start for free. Upgrade when you're ready to unlock the full toolkit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrent = plan.name === 'Pro' ? isPro : !isPro;
            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border-2 relative ${
                  plan.highlight
                    ? "border-blue-600 bg-white shadow-2xl shadow-blue-100"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-sm font-semibold px-5 py-1.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Current plan</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 text-sm">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{plan.description}</p>
                </div>

                <button
                  onClick={plan.highlight ? handleProClick : () => navigate("/builder")}
                  className={`w-full py-3 rounded-xl font-semibold text-lg transition-all mb-8 ${
                    plan.highlight
                      ? isPro
                        ? "bg-emerald-500 text-white cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {plan.highlight && isPro ? "✓ Pro Active" : plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-gray-400 line-through">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {!STRIPE_PAYMENT_LINK && (
          <p className="text-center text-xs text-gray-400 mt-8">
            💡 To enable real payments, set <code className="bg-gray-100 px-1 rounded">VITE_STRIPE_PAYMENT_LINK</code> in your <code className="bg-gray-100 px-1 rounded">.env.local</code>
          </p>
        )}
      </div>
    </section>
  );
}
