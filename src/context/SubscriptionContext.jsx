import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState('free'); // 'free' | 'pro'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPlan('free'); setLoading(false); return; }
    getDoc(doc(db, 'users', user.uid, 'subscription', 'status'))
      .then(snap => {
        if (snap.exists()) {
          const { status, plan: p } = snap.data();
          setPlan(status === 'active' && p === 'pro' ? 'pro' : 'free');
        } else {
          setPlan('free');
        }
      })
      .catch(() => setPlan('free'))
      .finally(() => setLoading(false));
  }, [user]);

  const isPro = plan === 'pro';

  // Called after successful Stripe payment (webhook would set this in prod)
  const activatePro = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'subscription', 'status'), {
      plan: 'pro',
      status: 'active',
      activatedAt: new Date().toISOString(),
    }, { merge: true });
    setPlan('pro');
  };

  return (
    <SubscriptionContext.Provider value={{ plan, isPro, loading, activatePro }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);

export const PRO_FEATURES = {
  maxResumes: { free: 3, pro: Infinity },
  templates: { free: ['riga', 'modern', 'classic'], pro: ['riga', 'modern', 'classic', 'minimal', 'executive', 'tech'] },
  wordExport: { free: false, pro: true },
  versionHistory: { free: false, pro: true },
  aiWriting: { free: true, pro: true },
};
