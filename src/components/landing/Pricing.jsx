import { useState } from "react";
import { CheckCircle, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSubscription } from "../../context/SubscriptionContext";

const PRO_FEATURES = [
  "Unlimited resumes",
  "All 6 premium templates",
  "PDF & DOCX download",
  "Advanced ATS score",
  "Cover letter builder",
  "Version history",
  "Priority support",
  "Cloud auto-save",
];

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started and trying out the platform.",
    cta: "Get Started Free",
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
    key: "pro-monthly",
    name: "Pro",
    interval: "month",
    price: "$1",
    period: "per month",
    description: "For serious job seekers who want every advantage.",
    cta: "Upgrade to Pro",
    highlight: true,
    badge: "Most Popular",
    features: PRO_FEATURES,
    missing: [],
  },
  {
    key: "pro-yearly",
    name: "Pro Yearly",
    interval: "year",
    price: "$10",
    period: "per year",
    note: "≈ $0.83/mo — save vs. paying monthly",
    description: "Same Pro toolkit, billed once a year.",
    cta: "Upgrade to Pro Yearly",
    badge: "Best Value",
    features: PRO_FEATURES,
    missing: [],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro, billingInterval, startCheckout, switchPlan } = useSubscription();
  const [checkingOutKey, setCheckingOutKey] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  const handleProClick = async (plan) => {
    if (isPro) { navigate('/dashboard'); return; }
    if (!user) { navigate('/?signin=1#pricing'); return; }
    setCheckoutError(null);
    setCheckingOutKey(plan.key);
    try {
      await startCheckout(plan.interval);
    } catch (err) {
      setCheckoutError({ key: plan.key, message: err.message });
      setCheckingOutKey(null);
    }
  };

  const handleSwitchClick = async (plan) => {
    setCheckoutError(null);
    setCheckingOutKey(plan.key);
    try {
      await switchPlan(plan.interval);
    } catch (err) {
      setCheckoutError({ key: plan.key, message: err.message });
    } finally {
      setCheckingOutKey(null);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const isProTier = Boolean(plan.interval);
            const isCurrent = isProTier ? isPro && billingInterval === plan.interval : !isPro;
            const isOtherProTier = isProTier && isPro && billingInterval !== plan.interval;
            const checkingOut = checkingOutKey === plan.key;

            return (
              <div
                key={plan.key}
                className={`rounded-2xl p-8 border-2 relative bg-white ${
                  plan.highlight ? "border-blue-600 shadow-2xl shadow-blue-100" : "border-gray-200"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`text-white text-sm font-semibold px-5 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap ${
                      plan.badge === "Best Value" ? "bg-emerald-600" : "bg-blue-600"
                    }`}>
                      <Zap className="w-3.5 h-3.5" /> {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Current plan</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 text-sm">/{plan.period}</span>
                  </div>
                  {plan.note && <p className="text-xs text-gray-400 mt-1">{plan.note}</p>}
                  <p className="text-gray-600 mt-2 text-sm">{plan.description}</p>
                </div>

                <button
                  onClick={
                    !isProTier ? () => navigate("/builder")
                    : isOtherProTier ? () => handleSwitchClick(plan)
                    : () => handleProClick(plan)
                  }
                  disabled={checkingOut}
                  className={`w-full py-3 rounded-xl font-semibold text-lg transition-all mb-8 flex items-center justify-center gap-2 disabled:opacity-70 ${
                    isProTier
                      ? isCurrent
                        ? "bg-emerald-500 text-white cursor-default"
                        : isOtherProTier
                          ? "border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {checkingOut ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {isOtherProTier ? "Switching plan…" : "Redirecting to checkout…"}</>
                  ) : isProTier && isCurrent ? "✓ Pro Active"
                  : isOtherProTier ? `Switch to ${plan.interval === 'year' ? 'Yearly' : 'Monthly'}`
                  : plan.cta}
                </button>
                {checkoutError?.key === plan.key && (
                  <p className="text-sm text-red-600 -mt-6 mb-6">
                    {checkoutError.message}
                  </p>
                )}

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
      </div>
    </section>
  );
}
