import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WritingSession, AppView, AIAnalysis, BadgeConfig, GeneratedAsset, CertifiedArticle } from './types';
import { Editor } from './components/Editor';
import { VerificationPanel } from './components/VerificationPanel';
import { Badge } from './components/Badge';
import { BadgeCustomizer } from './components/BadgeCustomizer';
import { BlockchainReceipt } from './components/BlockchainReceipt';
import { Dashboard } from './components/Dashboard';
import { ContentScanner } from './components/ContentScanner';
import { Integrations } from './components/Integrations';
import { analyzeWritingStyle, generateVisualAsset } from './services/geminiService';
import { anchorToBlockchain } from './services/blockchainService';
import { Pencil, CheckCircle, Share2, Sparkles, AlertCircle, RefreshCw, Twitter, Linkedin, Facebook, Instagram, LayoutDashboard, FileText, ShieldCheck, ArrowRight, Link as LinkIcon, Lock, Image as ImageIcon, Download, Loader2, Users, Wifi, ScanLine, Puzzle } from 'lucide-react';

const CLIENT_ID = crypto.randomUUID().split('-')[0];

const INITIAL_SESSION: WritingSession = {
  id: crypto.randomUUID(),
  startTime: Date.now(),
  endTime: null,
  events: [],
  finalContent: '',
  pasteCount: 0,
  backspaceCount: 0,
  totalKeystrokes: 0,
  isCertified: false,
  badgeConfig: { style: 'classic', color: 'blue', theme: 'light' },
  generatedAssets: [],
  timelineMarkers: []
};

const SESSION_STORAGE_KEY = 'human_auth_session_v1';
const HISTORY_STORAGE_KEY = 'human_auth_history_v1';
const SYNC_CHANNEL_NAME = 'human_auth_collab_v1';

const ASSET_THEMES = [
  {
    id: 'blockchain',
    label: 'Blockchain Certificate',
    prompt: 'Verification screen showing blockchain-backed certificate ID, immutable proof of authorship, and Certified Human Badge. Futuristic but minimalist design, blue and black accents.'
  },
  {
    id: 'timeline',
    label: 'Timeline Visualization',
    prompt: 'Interactive timeline replay UI with slider, pause indicators, edit markers, and smooth animations. White background, blue highlights, professional typography.'
  },
  {
    id: 'mobile',
    label: 'Mobile Badge View',
    prompt: 'Mobile app interface for Certified Human Badge. Clean text editor, badge verification screen, and publishing preview. Minimalist design, blue accents, responsive layout.'
  },
  {
    id: 'trust-panel',
    label: 'Reader Trust Panel',
    prompt: 'Reader-facing trust panel showing Certified Human Badge details. Includes certificate ID, writing time, keystroke count, and replay option. Elegant, minimalist design.'
  },
  {
    id: 'pitch-deck',
    label: 'Global Impact Slide',
    prompt: 'Pitch deck slide showing world map with glowing Certified Human Badges on articles across different regions. Blue accents, professional layout.'
  },
  {
    id: 'marketplace',
    label: 'Marketplace Listing',
    prompt: 'Marketplace interface showcasing Certified Human content as premium listings. Includes badges, article previews, and trust signals. Clean, modern design.'
  }
];

const MastodonIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21.327 8.566c0-4.71-3.16-6.153-5.272-6.533-3.17-.57-6.57-.57-9.58 0C3.77 2.595 1.48 4.72 1.258 10.32c-.06 1.53-.12 3.07-.12 4.62 0 5.4 3.78 8.42 8.44 8.72 2.37.15 4.54-.15 6.45-.73 0 0 .54-.16.54-.62v-1.78c-1.14.3-2.6.5-3.8.5-2.7 0-3.32-1.7-3.36-2.54.02-.12.04-.23.06-.35 3.32.77 6.36.4 8.12-.34 1.76-.73 2.9-2.3 2.87-4.9 0-1.26-.05-2.53-.13-3.79zm-4.75 6.4h-2.18v-5.2c0-1.1-.47-1.65-1.4-1.65-.96 0-1.45.6-1.45 1.76v3.25h-2.17v-3.25c0-1.18-.5-1.76-1.45-1.76-.94 0-1.4.56-1.4 1.65v5.2h-2.17v-5.4c0-2.3 1.2-3.46 3.6-3.46 1.37 0 2.27.6 2.7 1.8.44-1.2 1.33-1.8 2.68-1.8 2.4 0 3.6 1.15 3.6 3.46v5.4z" />
  </svg>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [session, setSession] = useState<WritingSession>(INITIAL_SESSION);
  const [history, setHistory] = useState<CertifiedArticle[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(ASSET_THEMES[0].id);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [collaboratorCount, setCollaboratorCount] = useState(0);

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload, senderId } = event.data;
      if (senderId === CLIENT_ID) return; 

      if (type === 'UPDATE_SESSION') {
        setSession(prev => {
            if (prev.finalContent === payload.finalContent && prev.events.length === payload.events.length) {
                return prev;
            }
            return { ...prev, ...payload };
        });
      } else if (type === 'PING') {
          setCollaboratorCount(prev => Math.min(prev + 1, 5));
      }
    };
    channel.postMessage({ type: 'PING', senderId: CLIENT_ID });
    return () => channel.close();
  }, []);

  // Load state on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.id && parsed.events) {
           // Ensure theme property exists for older sessions
           if (!parsed.badgeConfig.theme) parsed.badgeConfig.theme = 'light';
           if (!parsed.timelineMarkers) parsed.timelineMarkers = [];
           setSession({ ...INITIAL_SESSION, ...parsed });
        }
      } catch (e) { console.error("Session load error", e); }
    }

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) { console.error("History load error", e); }
    }
    
    setIsLoaded(true);
  }, []);

  // Persist state
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  }, [session, history, isLoaded]);

  const handleUpdateSession = useCallback((newData: Partial<WritingSession>, broadcast = true) => {
    setSession(prev => {
        const updated = { ...prev, ...newData };
        if (broadcast && channelRef.current) {
            channelRef.current.postMessage({
                type: 'UPDATE_SESSION',
                payload: updated,
                senderId: CLIENT_ID
            });
        }
        return updated;
    });
  }, []);

  const handleManualSave = useCallback(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const saveToHistory = (silent = false) => {
     if (!isCertified) return;
     
     // Check if already in history to avoid dups
     if (history.find(h => h.id === session.id)) return;

     const newArticle: CertifiedArticle = {
        id: session.id,
        title: session.finalContent.split('\n')[0].slice(0, 50) || "Untitled",
        date: session.endTime || Date.now(),
        wordCount: session.finalContent.split(' ').filter(w => w.length > 0).length,
        humanScore: analysis?.humanScore || 0,
        badgeStyle: session.badgeConfig,
        blockchainReceipt: session.blockchainReceipt
     };

     setHistory(prev => [newArticle, ...prev]);
     if (!silent) alert("Saved to Dashboard History!");
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will delete your current writing progress.")) {
      const newSession = {
        ...INITIAL_SESSION,
        id: crypto.randomUUID(),
        startTime: Date.now()
      };
      handleUpdateSession(newSession, true);
      setAnalysis(null);
      setView(AppView.WRITE);
    }
  };

  const handleBadgeConfigChange = useCallback((newConfig: Partial<BadgeConfig>) => {
    handleUpdateSession({
        badgeConfig: { ...session.badgeConfig, ...newConfig }
    });
  }, [session.badgeConfig, handleUpdateSession]);

  const runGeminiAnalysis = async () => {
    if (session.finalContent.length < 50) return;
    setIsAnalyzing(true);
    const result = await analyzeWritingStyle(session);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleBlockchainAnchor = async () => {
    if (!isCertified) return;
    setIsAnchoring(true);
    try {
      const receipt = await anchorToBlockchain(session);
      handleUpdateSession({ blockchainReceipt: receipt });
    } catch (e) {
      console.error("Blockchain anchoring failed", e);
      alert("Failed to anchor to blockchain. Please try again.");
    } finally {
      setIsAnchoring(false);
    }
  };

  const handleGenerateImage = async () => {
    const theme = ASSET_THEMES.find(t => t.id === selectedTheme);
    if (!theme) return;

    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateVisualAsset(theme.prompt);
      if (imageUrl) {
        const newAsset: GeneratedAsset = {
          id: crypto.randomUUID(),
          theme: theme.label,
          prompt: theme.prompt,
          imageUrl,
          createdAt: Date.now()
        };
        handleUpdateSession({ 
          generatedAssets: [newAsset, ...session.generatedAssets] 
        });
      } else {
        alert("Could not generate image. Please try again.");
      }
    } catch (e) {
      console.error("Image generation failed", e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleExport = (method: 'copy' | 'download') => {
      // Auto-save to history on export if not present
      if (!history.find(h => h.id === session.id)) {
          saveToHistory(true);
      }

      const data = {
          title: "Certified Human Content",
          content: session.finalContent,
          badgeId: session.id,
          badgeStyle: session.badgeConfig,
          blockchain: session.blockchainReceipt,
          assets: session.generatedAssets.map(a => a.id),
          date: new Date(session.endTime || Date.now()).toISOString(),
          stats: privacyMode ? { 
              durationSeconds: ((session.endTime || Date.now()) - session.startTime) / 1000,
              wordCount: session.finalContent.split(' ').filter(w => w.length > 0).length,
              certified: true 
          } : {
              events: session.events,
              backspaceCount: session.backspaceCount,
              pasteCount: session.pasteCount,
              totalKeystrokes: session.totalKeystrokes,
              certified: true
          }
      };

      const jsonString = JSON.stringify(data, null, 2);

      if (method === 'copy') {
          navigator.clipboard.writeText(jsonString);
          alert("Verification package copied to clipboard!");
      } else {
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `human-auth-${session.id.slice(0, 8)}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      }
      setShowExportConfirm(false);
  };

  const shareToSocial = (platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'mastodon') => {
      const shareUrl = `https://humanauth.app/verify/${session.id}`;
      const title = session.finalContent.split('\n')[0].trim().substring(0, 60) || "Untitled Article";
      const wordCount = session.finalContent.split(' ').filter(w => w.length > 0).length;
      
      const text = `I just certified "${title}" (${wordCount} words) as 100% Human-Authored! ✍️✨\n\nDiscover the verified human authorship behind this text!`;
      const hashtags = "CertifiedHuman,Writing,HumanAuth,NoAI";
      const features = 'width=600,height=500,menubar=no,toolbar=no,resizable=yes,scrollbars=yes';

      if (platform === 'twitter') {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`, 'share-twitter', features);
      } else if (platform === 'linkedin') {
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, 'share-linkedin', features);
      } else if (platform === 'facebook') {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`, 'share-facebook', features);
      } else if (platform === 'instagram') {
          const assetSection = document.getElementById('visual-assets-section');
          if (assetSection) assetSection.scrollIntoView({ behavior: 'smooth' });
          alert("Instagram sharing requires an image! \n\n1. Generate a Visual Asset above.\n2. Download the image.\n3. Upload it to Instagram!");
          window.open('https://www.instagram.com/', 'share-instagram', features);
      } else if (platform === 'mastodon') {
          const instance = prompt("Enter your Mastodon instance (e.g., mastodon.social):", "mastodon.social");
          if (instance) window.open(`https://${instance}/share?text=${encodeURIComponent(text + ' ' + shareUrl)}`, 'share-mastodon', features);
      }
  };

  const copyDirectLink = () => {
     const url = `https://humanauth.app/verify/${session.id}`;
     navigator.clipboard.writeText(url);
     alert("Direct verification link copied to clipboard!");
  };

  const isCertified = session.events.length > 10 && session.pasteCount < 3 && session.finalContent.length > 20;

  if (!isLoaded) return null;

  const NavButton = ({ targetView, icon: Icon, label, disabled = false }: { targetView: AppView, icon: any, label: string, disabled?: boolean }) => (
    <button
      onClick={() => setView(targetView)}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
        ${view === targetView 
          ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
             <div className="bg-blue-600 text-white p-1.5 rounded-lg">
               <ShieldCheck className="w-5 h-5" />
             </div>
             <h1 className="text-xl font-bold text-slate-800 tracking-tight">Human<span className="text-blue-600">Auth</span></h1>
          </div>

          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
             <NavButton targetView={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
             <NavButton targetView={AppView.WRITE} icon={FileText} label="Write" />
             <NavButton targetView={AppView.VERIFY} icon={ShieldCheck} label="Verify" disabled={session.events.length === 0} />
             <NavButton targetView={AppView.PUBLISH} icon={Share2} label="Publish" disabled={!isCertified} />
             <div className="w-px h-6 bg-slate-200 mx-2"></div>
             <NavButton targetView={AppView.SCANNER} icon={ScanLine} label="Scanner" />
             <NavButton targetView={AppView.INTEGRATIONS} icon={Puzzle} label="Tools" />
          </nav>

          <div className="flex items-center gap-2">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 text-xs font-medium text-slate-500" title="Open in another tab to test collaboration">
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span className="hidden xl:inline">Live Sync</span>
             </div>

             {session.finalContent.length > 0 && (
                   <button 
                    onClick={handleReset}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Reset Session"
                   >
                       <RefreshCw className="w-5 h-5" />
                   </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {view === AppView.DASHBOARD && (
           <Dashboard history={history} onChangeView={setView} />
        )}

        {view === AppView.SCANNER && (
            <ContentScanner />
        )}

        {view === AppView.INTEGRATIONS && (
            <Integrations />
        )}

        {view === AppView.WRITE && (
          <div className="h-full flex flex-col items-center">
            <Editor 
              session={session} 
              updateSession={handleUpdateSession} 
              onSave={handleManualSave}
              authorId={CLIENT_ID}
            />
            
            <div className="mt-6 flex gap-4 text-sm text-slate-400">
               <span className="flex items-center gap-1">
                 {isCertified ? <CheckCircle className="w-4 h-4 text-blue-500" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                 Human Pattern Tracking Active
               </span>
            </div>
          </div>
        )}

        {view === AppView.VERIFY && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
               <div className="flex flex-col gap-6">
                   <div className="flex justify-center md:justify-start">
                       {isCertified ? (
                           <div className="transform transition-all duration-300 ease-out hover:scale-[1.02]">
                             <Badge 
                                  timestamp={session.endTime || Date.now()} 
                                  style={session.badgeConfig.style}
                                  color={session.badgeConfig.color}
                                  theme={session.badgeConfig.theme}
                             />
                           </div>
                       ) : (
                           <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center text-slate-400 text-center w-full max-w-sm">
                               <AlertCircle className="w-10 h-10 mb-2" />
                               <h3 className="font-semibold text-slate-600">Certification Pending</h3>
                               <p className="text-sm">Write more content to generate your human badge.</p>
                           </div>
                       )}
                   </div>

                   {isCertified && (
                     <div className="max-w-sm w-full">
                       <BadgeCustomizer 
                          config={session.badgeConfig} 
                          onChange={handleBadgeConfigChange} 
                       />
                     </div>
                   )}
               </div>

               <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-fit">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          AI Writing Analysis
                      </h3>
                      {!analysis && (
                          <button 
                            onClick={runGeminiAnalysis}
                            disabled={isAnalyzing || session.finalContent.length < 50}
                            className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium hover:bg-purple-100 disabled:opacity-50"
                          >
                              {isAnalyzing ? 'Analyzing...' : 'Run Audit'}
                          </button>
                      )}
                  </div>

                  {analysis ? (
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <div className="text-xs text-blue-600 uppercase font-bold">Human Score</div>
                                  <div className="text-2xl font-bold text-blue-800">{analysis.humanScore}%</div>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-lg">
                                  <div className="text-xs text-slate-500 uppercase">Originality</div>
                                  <div className="text-xl font-bold text-slate-800">{analysis.originalityScore}/100</div>
                              </div>
                          </div>
                          
                          <div className="text-xs text-purple-700 bg-purple-50 p-3 rounded border border-purple-100">
                             🤖 <strong>AI Feedback:</strong> {analysis.feedback}
                          </div>
                      </div>
                  ) : (
                      <p className="text-sm text-slate-500">
                          {session.finalContent.length < 50 
                            ? "Write at least 50 characters to enable AI analysis." 
                            : "Run an AI audit to check if your writing style aligns with natural human patterns."}
                      </p>
                  )}
               </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
               <VerificationPanel 
                 session={session} 
                 updateSession={handleUpdateSession}
               />
            </div>
            
            <div className="flex justify-end">
               <button
                  onClick={() => setView(AppView.PUBLISH)}
                  disabled={!isCertified}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                  Proceed to Publish <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        )}

        {view === AppView.PUBLISH && (
             <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Publish & Share</h2>
                    <p className="text-slate-500">Your content is certified. Choose how you want to share it.</p>
                </div>
                
                {/* Save to History Button */}
                <div className="flex justify-end mb-4">
                   <button 
                     onClick={() => saveToHistory(false)}
                     className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                   >
                     <CheckCircle className="w-4 h-4" /> Save Record to Dashboard
                   </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                   <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-blue-500" />
                      Blockchain Verification
                   </h3>
                   {session.blockchainReceipt ? (
                      <BlockchainReceipt receipt={session.blockchainReceipt} />
                   ) : (
                      <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                          <Lock className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-600 mb-4 text-center max-w-md">Anchor your content hash.</p>
                          <button
                             onClick={handleBlockchainAnchor}
                             disabled={isAnchoring}
                             className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                          >
                             {isAnchoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                             Mint Permanent Record
                          </button>
                      </div>
                   )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm" id="visual-assets-section">
                   <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-purple-500" />
                      Visual Assets
                   </h3>
                   
                   <div className="mb-4">
                      <label className="text-sm text-slate-600 block mb-2">Select Theme</label>
                      <div className="flex flex-wrap gap-2">
                        {ASSET_THEMES.map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedTheme === theme.id ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                   </div>

                   {session.generatedAssets.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                         {session.generatedAssets.map((asset) => (
                            <div key={asset.id} className="relative group rounded-lg overflow-hidden border border-slate-200">
                               <img src={asset.imageUrl} alt={asset.theme} className="w-full h-auto" />
                               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <a href={asset.imageUrl} download={`human-auth-${asset.id}.png`} className="p-2 bg-white rounded-full text-slate-800 hover:text-blue-600">
                                     <Download className="w-4 h-4" />
                                  </a>
                               </div>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-8 text-center mb-4">
                         <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                         <p className="text-sm text-slate-500">Generate a visual representation of your certification.</p>
                      </div>
                   )}

                   <button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                   >
                      {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Generate Asset
                   </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-blue-500" />
                      Social Share
                   </h3>
                   <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <button onClick={() => shareToSocial('twitter')} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                         <div className="p-2 bg-black text-white rounded-full"><Twitter className="w-4 h-4" /></div>
                         <span className="text-xs font-medium text-slate-600">X / Twitter</span>
                      </button>
                      <button onClick={() => shareToSocial('linkedin')} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                         <div className="p-2 bg-[#0077b5] text-white rounded-full"><Linkedin className="w-4 h-4" /></div>
                         <span className="text-xs font-medium text-slate-600">LinkedIn</span>
                      </button>
                      <button onClick={() => shareToSocial('facebook')} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                         <div className="p-2 bg-[#1877f2] text-white rounded-full"><Facebook className="w-4 h-4" /></div>
                         <span className="text-xs font-medium text-slate-600">Facebook</span>
                      </button>
                      <button onClick={() => shareToSocial('instagram')} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                         <div className="p-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full"><Instagram className="w-4 h-4" /></div>
                         <span className="text-xs font-medium text-slate-600">Instagram</span>
                      </button>
                      <button onClick={() => shareToSocial('mastodon')} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                         <div className="p-2 bg-[#6364ff] text-white rounded-full"><MastodonIcon className="w-4 h-4" /></div>
                         <span className="text-xs font-medium text-slate-600">Mastodon</span>
                      </button>
                   </div>

                   <div className="mt-6 pt-6 border-t border-slate-100">
                       <div className="flex gap-3">
                           <button 
                             onClick={() => setShowExportConfirm(true)}
                             className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                           >
                              <Download className="w-4 h-4" /> Export Data
                           </button>
                           <button 
                             onClick={copyDirectLink}
                             className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
                           >
                              <LinkIcon className="w-4 h-4" /> Copy Link
                           </button>
                       </div>
                   </div>
                </div>
             </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
               <ShieldCheck className="w-6 h-6 text-blue-600" />
               <span className="text-lg font-bold text-slate-800">HumanAuth</span>
            </div>
            <p className="text-slate-500 text-sm mb-4">The Standard for Verified Human Authorship</p>
            <div className="flex justify-center gap-6 text-sm text-slate-400">
               <a href="#" className="hover:text-slate-600">Privacy Policy</a>
               <a href="#" className="hover:text-slate-600">Terms of Service</a>
               <a href="#" className="hover:text-slate-600">Blockchain Explorer</a>
            </div>
            <div className="mt-8 text-xs text-slate-300">
               Session ID: {session.id} | Client: {CLIENT_ID}
            </div>
         </div>
      </footer>

      {/* Export Modal */}
      {showExportConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Export Verification Data</h3>
                  <p className="text-sm text-slate-500 mb-4">
                      Download the complete cryptographic proof package for this content. You can host this file to prove authorship independently.
                  </p>
                  
                  <div className="flex items-center gap-2 mb-6 bg-slate-50 p-3 rounded-lg">
                      <input 
                        type="checkbox" 
                        id="privacy-mode" 
                        checked={privacyMode} 
                        onChange={(e) => setPrivacyMode(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor="privacy-mode" className="text-sm text-slate-700 cursor-pointer select-none">
                          Privacy Mode (Exclude raw keystroke logs)
                      </label>
                  </div>

                  <div className="flex gap-3">
                      <button 
                          onClick={() => setShowExportConfirm(false)}
                          className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={() => handleExport('copy')}
                          className="flex-1 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                      >
                          Copy JSON
                      </button>
                      <button 
                          onClick={() => handleExport('download')}
                          className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                          Download
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// Simple icons for local use
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" /></svg>
);
const FileTextIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

export default App;