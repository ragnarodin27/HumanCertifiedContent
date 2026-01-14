import React from 'react';
import { CheckCircle, Fingerprint, ShieldCheck, Award } from 'lucide-react';
import { BadgeStyle, BadgeColor, BadgeTheme } from '../types';

interface BadgeProps {
  timestamp: number;
  style: BadgeStyle;
  color: BadgeColor;
  theme?: BadgeTheme;
  compact?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ timestamp, style, color, theme = 'light', compact = false }) => {
  const dateStr = new Date(timestamp).toLocaleDateString();
  
  const colors = {
    emerald: { 
      bg: theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-50', 
      border: theme === 'dark' ? 'border-emerald-800' : 'border-emerald-200', 
      text: theme === 'dark' ? 'text-emerald-100' : 'text-emerald-800', 
      accent: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600', 
      gradient: 'from-emerald-500/10' 
    },
    blue: { 
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50', 
      border: theme === 'dark' ? 'border-blue-800' : 'border-blue-200', 
      text: theme === 'dark' ? 'text-blue-100' : 'text-blue-800', 
      accent: theme === 'dark' ? 'text-blue-400' : 'text-blue-600', 
      gradient: 'from-blue-500/10' 
    },
    purple: { 
      bg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50', 
      border: theme === 'dark' ? 'border-purple-800' : 'border-purple-200', 
      text: theme === 'dark' ? 'text-purple-100' : 'text-purple-800', 
      accent: theme === 'dark' ? 'text-purple-400' : 'text-purple-600', 
      gradient: 'from-purple-500/10' 
    },
    gold: { 
      bg: theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-50', 
      border: theme === 'dark' ? 'border-amber-800' : 'border-amber-200', 
      text: theme === 'dark' ? 'text-amber-100' : 'text-amber-800', 
      accent: theme === 'dark' ? 'text-amber-400' : 'text-amber-600', 
      gradient: 'from-amber-500/10' 
    },
    red: { 
      bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50', 
      border: theme === 'dark' ? 'border-red-800' : 'border-red-200', 
      text: theme === 'dark' ? 'text-red-100' : 'text-red-800', 
      accent: theme === 'dark' ? 'text-red-400' : 'text-red-600', 
      gradient: 'from-red-500/10' 
    },
    cyan: { 
      bg: theme === 'dark' ? 'bg-cyan-900/30' : 'bg-cyan-50', 
      border: theme === 'dark' ? 'border-cyan-800' : 'border-cyan-200', 
      text: theme === 'dark' ? 'text-cyan-100' : 'text-cyan-800', 
      accent: theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600', 
      gradient: 'from-cyan-500/10' 
    },
    pink: { 
      bg: theme === 'dark' ? 'bg-pink-900/30' : 'bg-pink-50', 
      border: theme === 'dark' ? 'border-pink-800' : 'border-pink-200', 
      text: theme === 'dark' ? 'text-pink-100' : 'text-pink-800', 
      accent: theme === 'dark' ? 'text-pink-400' : 'text-pink-600', 
      gradient: 'from-pink-500/10' 
    },
    indigo: { 
      bg: theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50', 
      border: theme === 'dark' ? 'border-indigo-800' : 'border-indigo-200', 
      text: theme === 'dark' ? 'text-indigo-100' : 'text-indigo-800', 
      accent: theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600', 
      gradient: 'from-indigo-500/10' 
    },
  };

  const getModernGradient = (c: BadgeColor) => {
    switch(c) {
        case 'emerald': return 'from-emerald-600 to-teal-800';
        case 'blue': return 'from-blue-600 to-indigo-800';
        case 'purple': return 'from-purple-600 to-fuchsia-800';
        case 'gold': return 'from-amber-500 to-orange-700';
        case 'red': return 'from-red-600 to-rose-800';
        case 'cyan': return 'from-cyan-600 to-sky-800';
        case 'pink': return 'from-pink-600 to-rose-900';
        case 'indigo': return 'from-indigo-600 to-violet-900';
        default: return 'from-slate-600 to-slate-800';
    }
  };

  const themeClasses = theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800';
  const palette = colors[color];
  const hoverEffects = "transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-xl cursor-default";

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${palette.bg} border ${palette.border} ${palette.text} pl-2 pr-3 py-1 rounded-full text-xs font-medium select-none shadow-sm transition-transform hover:scale-105 cursor-default`}>
        <div className={`p-0.5 rounded-full ${theme === 'dark' ? 'bg-black/40' : 'bg-white/60'}`}>
           <CheckCircle className={`w-3 h-3 ${palette.accent}`} />
        </div>
        <span className="font-bold tracking-tight">Certified Human</span>
        <span className={`text-[10px] opacity-60 font-mono border-l ${palette.border} pl-2 ml-0.5 leading-none`}>
          {dateStr}
        </span>
      </div>
    );
  }

  /* Minimal Style */
  if (style === 'minimal') {
    return (
      <div className={`w-full max-w-sm border ${palette.border} ${themeClasses} rounded-lg p-4 flex items-center justify-between shadow-sm ${hoverEffects}`}>
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${palette.bg} ${palette.accent}`}>
               <Fingerprint className="w-6 h-6" />
            </div>
            <div>
               <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Certified Human</h3>
               <p className="text-xs opacity-60">{dateStr}</p>
            </div>
         </div>
         <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${palette.accent}`}>
            <CheckCircle className="w-4 h-4" />
            <span>Verified</span>
         </div>
      </div>
    );
  }

  /* Modern Style */
  if (style === 'modern') {
    return (
      <div className={`relative overflow-hidden w-full max-w-sm rounded-xl p-6 text-white shadow-lg bg-gradient-to-br ${getModernGradient(color)} ${hoverEffects}`}>
         <div className="absolute top-0 right-0 p-4 opacity-20">
            <Fingerprint className="w-24 h-24 transform rotate-12" />
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
               <ShieldCheck className="w-6 h-6" />
               <span className="font-mono text-xs opacity-75">ID: {timestamp.toString().slice(-8)}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1 tracking-tight">Certified Human</h3>
            <p className="text-sm opacity-90 mb-6 font-medium">Authorship Verified by HumanAuth</p>
            
            <div className="flex justify-between items-end border-t border-white/20 pt-4">
               <div>
                  <div className="text-xs opacity-60 uppercase tracking-wider mb-0.5">Signed</div>
                  <div className="font-mono text-sm">{dateStr}</div>
               </div>
               <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                  100% ORGANIC
               </div>
            </div>
         </div>
      </div>
    );
  }

  /* Classic Style (Default) */
  return (
    <div className={`relative overflow-hidden border-2 ${palette.border} rounded-xl p-6 shadow-sm max-w-sm w-full ${themeClasses} ${theme === 'light' ? 'bg-gradient-to-br from-white to-slate-50' : 'bg-slate-900'} ${hoverEffects}`}>
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 ${palette.bg} rounded-full blur-2xl opacity-50`}></div>
      
      <div className="flex flex-col items-center text-center relative z-10">
        <div className={`mb-3 p-3 ${palette.bg} rounded-full ${palette.accent}`}>
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold uppercase tracking-wide">Certified Human</h3>
        <p className="text-xs opacity-60 font-medium mb-4">Authorship Verified</p>
        
        <div className={`w-full rounded-lg p-3 text-sm mb-4 ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
          <div className="flex justify-between items-center mb-1">
            <span>Verification Date:</span>
            <span className="font-semibold">{dateStr}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Signature:</span>
            <span className="font-mono text-xs opacity-50">0xHMN...{timestamp.toString().slice(-4)}</span>
          </div>
        </div>

        <div className={`flex items-center gap-1 ${palette.accent} text-xs font-bold uppercase tracking-wider`}>
          <CheckCircle className="w-3 h-3" />
          <span>Biometric Pattern Match</span>
        </div>
      </div>
    </div>
  );
};