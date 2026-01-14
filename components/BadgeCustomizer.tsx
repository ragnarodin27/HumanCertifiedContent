import React from 'react';
import { Palette, Check, Moon, Sun } from 'lucide-react';
import { BadgeConfig, BadgeStyle, BadgeColor } from '../types';

interface BadgeCustomizerProps {
  config: BadgeConfig;
  onChange: (config: Partial<BadgeConfig>) => void;
}

export const BadgeCustomizer: React.FC<BadgeCustomizerProps> = ({ config, onChange }) => {
  const styles: BadgeStyle[] = ['classic', 'modern', 'minimal'];
  const colors: BadgeColor[] = ['emerald', 'blue', 'purple', 'gold', 'red', 'cyan', 'pink', 'indigo'];

  const getColorClass = (color: BadgeColor) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500';
      case 'blue': return 'bg-blue-600';
      case 'purple': return 'bg-purple-600';
      case 'gold': return 'bg-amber-500';
      case 'red': return 'bg-red-500';
      case 'cyan': return 'bg-cyan-500';
      case 'pink': return 'bg-pink-500';
      case 'indigo': return 'bg-indigo-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-full">
      <div className="flex items-center gap-2 mb-5 text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
        <Palette className="w-4 h-4 text-slate-500" />
        Customize Badge Appearance
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-widest">Badge Style</label>
          <div className="flex bg-slate-100 rounded-lg p-1">
            {styles.map(style => (
              <button
                key={style}
                onClick={() => onChange({ style })}
                className={`
                  flex-1 text-xs py-2 rounded-md capitalize transition-all duration-200 font-medium
                  ${config.style === style 
                    ? 'bg-white shadow-sm text-slate-900 ring-1 ring-black/5' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                `}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Accent Color</label>
              
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md">
                 <button
                   onClick={() => onChange({ theme: 'light' })}
                   className={`p-1.5 rounded ${config.theme === 'light' ? 'bg-white shadow-sm text-amber-500' : 'text-slate-400'}`}
                   title="Light Mode"
                 >
                    <Sun className="w-3.5 h-3.5" />
                 </button>
                 <button
                   onClick={() => onChange({ theme: 'dark' })}
                   className={`p-1.5 rounded ${config.theme === 'dark' ? 'bg-white shadow-sm text-blue-900' : 'text-slate-400'}`}
                   title="Dark Mode"
                 >
                    <Moon className="w-3.5 h-3.5" />
                 </button>
              </div>
           </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => onChange({ color })}
                className={`
                  w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 relative
                  ${config.color === color 
                    ? 'ring-2 ring-offset-2 ring-slate-900 scale-100' 
                    : 'hover:scale-110 opacity-90 hover:opacity-100'}
                `}
                aria-label={`Select ${color} color`}
              >
                <div className={`w-full h-full rounded-full ${getColorClass(color)}`} />
                {config.color === color && (
                  <Check className="w-4 h-4 text-white absolute" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};