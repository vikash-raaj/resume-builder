import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

type Plan = 'free' | 'pro';
type BillingInterval = 'month' | 'year' | null;

type SubscriptionContextValue = {
  plan: Plan;
  isPro: boolean;
  billingInterval: BillingInterval;
  loading: boolean;
  startCheckout: (interval?: 'month' | 'year') => Promise<void>;
  switchPlan: (interval: 'month' | 'year') => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

const CHECKOUT_FUNCTION_URL = import.meta.env.VITE_CHECKOUT_FUNCTION_URL;
const CHANGE_PLAN_FUNCTION_URL = import.meta.env.VITE_CHANGE_PLAN_FUNCTION_URL;

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan>('free');
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPlan('free'); setBillingInterval(null); setLoading(false); return; }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, 'users', user.uid, 'subscription', 'status'),
      (snap) => {
        if (snap.exists()) {
          const { status, plan: p, interval: i } = snap.data() as { status?: string; plan?: string; interval?: string };
          const active = status === 'active' && p === 'pro';
          setPlan(active ? 'pro' : 'free');
          setBillingInterval(active ? ((i as BillingInterval) || 'month') : null);
        } else {
          setPlan('free');
          setBillingInterval(null);
        }
        setLoading(false);
      },
      () => { setPlan('free'); setBillingInterval(null); setLoading(false); }
    );
    return unsub;
  }, [user]);

  const isPro = plan === 'pro';

  // Redirects to a real Lemon Squeezy Checkout session. Pro is only ever
  // granted by the lemonSqueezyWebhook Cloud Function after a real payment —
  // nothing on the client can mark an account Pro.
  const startCheckout = async (interval: 'month' | 'year' = 'month') => {
    if (!user) return;
    const idToken = await user.getIdToken();
    const res = await fetch(CHECKOUT_FUNCTION_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ interval }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to start checkout');
    }
    const { url } = await res.json();
    window.location.href = url;
  };

  // Switches an existing Pro subscription between monthly and yearly billing
  // (with proration) instead of starting a second, duplicate subscription.
  const switchPlan = async (interval: 'month' | 'year') => {
    if (!user) return;
    const idToken = await user.getIdToken();
    const res = await fetch(CHANGE_PLAN_FUNCTION_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ interval }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to change plan');
    }
  };

  return (
    <SubscriptionContext.Provider value={{ plan, isPro, billingInterval, loading, startCheckout, switchPlan }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext) as SubscriptionContextValue;

export const PRO_FEATURES = {
  maxResumes: { free: 3, pro: Infinity },
  templates: { free: ['riga', 'modern', 'classic'], pro: ['riga', 'modern', 'classic', 'minimal', 'executive', 'tech'] },
  wordExport: { free: false, pro: true },
  versionHistory: { free: false, pro: true },
  aiWriting: { free: true, pro: true },
};
