import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, RefreshCw, Key } from 'lucide-react';
import {
  getStoredAIKey,
  generateBulletPoints,
  generateSummary,
  improveBulletPoint,
} from '../../utils/aiService';
import AIKeySetup from './AIKeySetup';

export default function AIWritingPanel({ type, context, onInsert }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(false);

  const hasKey = !!getStoredAIKey();

  const generate = async () => {
    if (!getStoredAIKey()) {
      setShowKeySetup(true);
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    try {
      let text = '';
      if (type === 'bullets') text = await generateBulletPoints(context);
      else if (type === 'summary') text = await generateSummary(context);
      else if (type === 'improve') text = await improveBulletPoint(context.text);
      setResult(text);
    } catch (e) {
      if (e.message === 'NO_KEY') { setShowKeySetup(true); return; }
      setError(e.message || 'AI generation failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="mt-2 bg-purple-50 border border-purple-100 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">AI Assistant</span>
          </div>
          <div className="flex gap-1.5">
            {!hasKey && (
              <button
                onClick={() => setShowKeySetup(true)}
                className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-800 border border-purple-200 rounded-lg px-2 py-1"
              >
                <Key className="w-3 h-3" />
                Setup Key
              </button>
            )}
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {loading ? 'Generating…' : result ? 'Regenerate' : 'Generate with AI'}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

        {result && (
          <div className="bg-white border border-purple-100 rounded-lg p-2.5 mt-2">
            <pre className="text-[11px] text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
            <div className="flex gap-2 mt-2.5 pt-2 border-t border-gray-100">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2 py-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              {onInsert && (
                <button
                  onClick={() => onInsert(result)}
                  className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-800 border border-purple-200 rounded-lg px-2 py-1 transition-colors font-semibold"
                >
                  Insert into field
                </button>
              )}
              <button
                onClick={generate}
                disabled={loading}
                className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2 py-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      {showKeySetup && (
        <AIKeySetup
          onClose={() => setShowKeySetup(false)}
          onSaved={() => { setShowKeySetup(false); generate(); }}
        />
      )}
    </>
  );
}
