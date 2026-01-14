import React, { useState } from 'react';
import { Search, ShieldCheck, AlertTriangle, ExternalLink, Globe, FileText, Loader2 } from 'lucide-react';

export const ContentScanner: React.FC = () => {
  const [input, setInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  const handleScan = () => {
    if (!input.trim()) return;
    setIsScanning(true);
    setResult(null);

    // Simulation of scanning logic
    setTimeout(() => {
      setIsScanning(false);
      // Mock logic: if input contains "human" or "certified", it passes.
      if (input.toLowerCase().includes('human') || input.toLowerCase().includes('certified') || input.length > 50) {
        setResult('success');
      } else {
        setResult('fail');
      }
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Content Scanner</h2>
        <p className="text-slate-500">
          Verify the authenticity of an article or check a URL for HumanAuth metadata.
        </p>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex flex-col md:flex-row gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste URL or text snippet to verify..."
          className="flex-1 px-4 py-3 outline-none text-slate-800 placeholder:text-slate-400 rounded-lg bg-transparent"
        />
        <button 
          onClick={handleScan}
          disabled={isScanning || !input}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
        >
          {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {isScanning ? 'Scanning...' : 'Verify'}
        </button>
      </div>

      {/* Results Area */}
      {result && (
        <div className={`rounded-xl p-8 border-2 ${result === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} animate-in zoom-in-95 duration-300`}>
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-4 rounded-full ${result === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {result === 'success' ? <ShieldCheck className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
            </div>
            
            <div>
              <h3 className={`text-xl font-bold mb-2 ${result === 'success' ? 'text-emerald-800' : 'text-amber-800'}`}>
                {result === 'success' ? 'Certified Human Content Detected' : 'No Certification Metadata Found'}
              </h3>
              <p className={`text-sm ${result === 'success' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {result === 'success' 
                  ? 'This content contains valid HumanAuth metadata and has been verified against the blockchain ledger.'
                  : 'We could not verify this content. It may be AI-generated or has not been certified yet.'
                }
              </p>
            </div>

            {result === 'success' && (
              <div className="w-full mt-4 bg-white/50 rounded-lg p-4 text-left text-sm border border-emerald-200/50">
                <div className="flex justify-between py-1 border-b border-emerald-200/50">
                  <span className="text-emerald-700 font-medium">Human Score</span>
                  <span className="font-mono text-emerald-900">98%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/50 mt-2">
                  <span className="text-emerald-700 font-medium">Verified Author</span>
                  <span className="font-mono text-emerald-900">ID: 8f2a...9x1</span>
                </div>
                <div className="flex justify-between py-1 mt-2">
                  <span className="text-emerald-700 font-medium">Scan Date</span>
                  <span className="font-mono text-emerald-900">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !isScanning && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500">
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex gap-3">
             <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
             <div>
               <h4 className="font-semibold text-slate-700 mb-1">URL Scan</h4>
               <p>Enter a published article URL. Our scanner checks for the embedded HumanAuth meta tags.</p>
             </div>
           </div>
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex gap-3">
             <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />
             <div>
               <h4 className="font-semibold text-slate-700 mb-1">Text Analysis</h4>
               <p>Paste raw text. We'll run a quick biometric consistency check against known human patterns.</p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};