import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';

export default function ProGate({ feature, children }) {
  const { isPro, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) return null;
  if (isPro) return children;

  return (
    <div className="relative group">
      <div className="pointer-events-none opacity-50 select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl z-10">
        <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/#pricing')}
        >
          <Zap className="w-4 h-4" />
          Unlock with Pro — $9/mo
        </div>
        {feature && <p className="text-xs text-gray-500 mt-2">{feature}</p>}
      </div>
    </div>
  );
}
