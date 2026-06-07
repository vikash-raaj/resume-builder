import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Zap } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

export default function PaymentSuccessPage() {
  const { user } = useAuth();
  const { activatePro, isPro } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    // In production: verify the Stripe session server-side via webhook.
    // Here, we trust the redirect and activate Pro in Firestore directly.
    // Stripe webhook should also write the subscription doc for server-side safety.
    if (user && !isPro) {
      activatePro().then(() => setActivated(true));
    } else if (isPro) {
      setActivated(true);
    }
  }, [user, isPro]);

  useEffect(() => {
    if (activated) {
      const t = setTimeout(() => navigate('/dashboard'), 3000);
      return () => clearTimeout(t);
    }
  }, [activated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md w-full mx-4">
        {!activated ? (
          <>
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Activating Pro…</h1>
            <p className="text-gray-500 text-sm">Just a moment while we set up your account.</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Pro Activated</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Welcome to Pro!</h1>
            <p className="text-gray-600 mb-8">
              You now have access to all 6 premium templates, unlimited resumes, DOCX export, and version history.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {['Unlimited resumes', 'All 6 templates', 'DOCX export', 'Version history'].map(f => (
                <div key={f} className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-blue-900">{f}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Redirecting to your dashboard in 3 seconds…</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
