import React from 'react';
import { Download, Puzzle, Globe, Code, Layers, Chrome, Layout } from 'lucide-react';

export const Integrations: React.FC = () => {
  const plugins = [
    {
      id: 'wordpress',
      name: 'WordPress Plugin',
      desc: 'Automatically embed verification badges on your posts.',
      icon: Layout,
      color: 'bg-blue-500',
      status: 'Available'
    },
    {
      id: 'substack',
      name: 'Substack Helper',
      desc: 'Copy-paste ready footer templates for Substack newsletters.',
      icon: Layers,
      color: 'bg-orange-500',
      status: 'Beta'
    },
    {
      id: 'medium',
      name: 'Medium Integration',
      desc: 'Browser script to inject badges into Medium editor.',
      icon: FileTextIcon,
      color: 'bg-slate-800',
      status: 'Coming Soon'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Integrations & Tools</h2>
        <p className="text-slate-500">
          Seamlessly integrate HumanAuth into your existing workflow and publishing platforms.
        </p>
      </div>

      {/* Browser Extension Hero */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-lg">
           <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Chrome className="w-3 h-3" /> Reader Extension
           </div>
           <h3 className="text-3xl font-bold mb-4">Verification Layer for the Web</h3>
           <p className="text-blue-100 mb-8 leading-relaxed">
             Download our browser extension to automatically detect and verify "Certified Human" badges on any website you visit. Restore trust in your daily reading.
           </p>
           <button className="bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" /> Add to Browser
           </button>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-20 hidden md:block">
           <ShieldIcon className="w-96 h-96" />
        </div>
      </div>

      {/* CMS Plugins Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-slate-500" /> CMS Plugins
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
             <div key={plugin.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${plugin.color} rounded-lg flex items-center justify-center text-white mb-4 shadow-sm`}>
                   <plugin.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{plugin.name}</h4>
                <p className="text-sm text-slate-500 mb-4 h-10">{plugin.desc}</p>
                <button 
                  disabled={plugin.status === 'Coming Soon'}
                  className="w-full py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {plugin.status === 'Available' ? 'Download' : plugin.status}
                </button>
             </div>
          ))}
        </div>
      </div>

      {/* Manual Embed */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8">
         <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="max-w-md">
               <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-500" /> Universal Embed Code
               </h3>
               <p className="text-sm text-slate-600 mb-4">
                  Add this HTML snippet to the footer of any article to display your latest certification badge dynamically.
               </p>
               <a href="#" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                  Read documentation <Globe className="w-3 h-3" />
               </a>
            </div>
            <div className="flex-1 bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto relative group">
               <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-[10px] uppercase">Copy</button>
               </div>
               {`<div 
  data-human-auth-id="YOUR_USER_ID"
  data-theme="light"
  class="human-auth-badge">
</div>
<script src="https://humanauth.app/embed.js" async></script>`}
            </div>
         </div>
      </div>
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