import React, { useRef, useEffect, useState } from 'react';
import { WritingSession, KeystrokeEvent } from '../types';
import { Save, Check, Users } from 'lucide-react';

interface EditorProps {
  session: WritingSession;
  updateSession: (newData: Partial<WritingSession>, broadcast?: boolean) => void;
  readOnly?: boolean;
  onSave?: () => void;
  authorId: string;
}

export const Editor: React.FC<EditorProps> = ({ session, updateSession, readOnly = false, onSave, authorId }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [showSaved, setShowSaved] = useState(false);

  // Focus on mount if not readOnly
  useEffect(() => {
    if (!readOnly && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [readOnly]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    if (e.key === 'Backspace') {
      updateSession({ backspaceCount: session.backspaceCount + 1 });
    }
    
    // We increment total keystrokes for any key that modifies text or navigation
    if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') {
      updateSession({ totalKeystrokes: session.totalKeystrokes + 1 });
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const now = Date.now();
    
    // Determine action type roughly
    let action: KeystrokeEvent['action'] = 'type';
    const charDiff = newValue.length - session.finalContent.length;

    if (charDiff < 0) {
        action = 'backspace';
    } else if (charDiff > 5) {
        // Simple heuristic: if more than 5 chars added at once, assume paste/insert
        action = 'paste';
    }
    
    const newEvent: KeystrokeEvent = {
      timestamp: now,
      content: newValue,
      action,
      charCount: newValue.length,
      authorId: authorId // Tag event with current user ID
    };

    updateSession({
      finalContent: newValue,
      events: [...session.events, newEvent],
      endTime: now 
    }, true);
  };

  const handlePaste = () => {
    if (readOnly) return;
    updateSession({ pasteCount: session.pasteCount + 1 });
  };

  const handleManualSave = () => {
    if (onSave) {
      onSave();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);

      // Log an explicit auto-save event
      updateSession({
          events: [...session.events, {
              timestamp: Date.now(),
              content: session.finalContent,
              action: 'auto-save',
              charCount: session.finalContent.length,
              authorId: authorId
          }]
      });
    }
  };

  return (
    <div className="w-full h-full max-w-3xl mx-auto flex flex-col">
      <textarea
        ref={textAreaRef}
        value={session.finalContent}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        readOnly={readOnly}
        placeholder="Start writing to earn your badge..."
        className={`
          w-full h-[60vh] md:h-full p-8 md:p-12 resize-none outline-none 
          text-lg md:text-xl leading-relaxed text-slate-800 
          placeholder:text-slate-300 serif bg-white shadow-sm rounded-lg border border-slate-100
          transition-colors duration-200
          ${readOnly ? 'bg-slate-50 text-slate-600 cursor-default' : 'focus:ring-2 focus:ring-blue-500/20'}
        `}
        spellCheck={false}
      />
      
      {!readOnly && (
        <div className="flex justify-between items-center mt-2 px-4">
          <div className="flex items-center gap-2">
            <button 
                onClick={handleManualSave}
                className={`
                flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all duration-200
                ${showSaved 
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}
                `}
            >
                {showSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {showSaved ? 'Saved' : 'Save Draft'}
            </button>
            <div className="text-xs text-blue-400 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-100" title="Real-time collaboration active">
                <Users className="w-3 h-3" /> Live
            </div>
          </div>
          
          <div className="text-right text-xs text-slate-400 font-mono">
            {session.finalContent.length} chars | {session.events.length} events
          </div>
        </div>
      )}
    </div>
  );
};