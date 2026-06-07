import { useState } from 'react';
import { Sparkles, X, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { saveAIKey, getStoredAIKey } from '../../utils/aiService';

export default function AIKeySetup({ onClose, onSaved }) {
  const [key, setKey] = useState(getStoredAIKey());
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      setError('Key should start with "sk-ant-". Get yours at console.anthropic.com');
      return;
    }
    saveAIKey(trimmed);
    onSaved?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Enable AI Features</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            AI features use the Claude API. Enter your Anthropic API key — it's stored only in your browser and never sent to our servers.
          </p>

          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-4"
          >
            <ExternalLink className="w-3 h-3" />
            Get your free API key at console.anthropic.com
          </a>

          <div className="relative mb-3">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(''); }}
              placeholder="sk-ant-api03-..."
              className={`w-full border rounded-xl px-3 py-2.5 text-sm pr-10 outline-none transition-colors ${
                error ? 'border-red-400' : 'border-gray-300 focus:border-purple-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          <p className="text-[11px] text-gray-400 mb-4">
            Your key is stored locally and used only for direct API calls. We recommend using a key with a low spend limit.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Save & Enable AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
