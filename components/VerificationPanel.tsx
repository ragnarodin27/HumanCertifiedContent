import React, { useState, useEffect, useMemo, useRef } from 'react';
import { WritingSession, KeystrokeEvent, TimelineMarker } from '../types';
import { Play, Pause, SkipBack, MonitorPlay, List, BarChart3, Activity, AlertTriangle, User, Flag, X } from 'lucide-react';
import { Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface VerificationPanelProps {
  session: WritingSession;
  updateSession?: (newData: Partial<WritingSession>, broadcast?: boolean) => void;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ session, updateSession }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [activeTab, setActiveTab] = useState<'replay' | 'logs'>('replay');
  const [playbackIndex, setPlaybackIndex] = useState(session.events.length - 1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const duration = useMemo(() => {
    if (!session.endTime || session.events.length === 0) return 0;
    return session.endTime - session.startTime;
  }, [session]);

  const displayedContent = useMemo(() => {
    if (session.events.length === 0) return '';
    const safeIndex = Math.min(Math.max(0, playbackIndex), session.events.length - 1);
    return session.events[safeIndex].content;
  }, [session.events, playbackIndex]);

  // Activity data for chart (events per 10 second bucket)
  const chartData = useMemo(() => {
    if (!session.startTime) return [];
    const bucketSize = 10000; // 10 seconds
    const buckets: Record<number, number> = {};
    
    session.events.forEach(e => {
        const bucketTime = Math.floor((e.timestamp - session.startTime) / bucketSize) * bucketSize;
        buckets[bucketTime] = (buckets[bucketTime] || 0) + 1;
    });

    return Object.entries(buckets).map(([time, count]) => ({
        time: Math.floor(parseInt(time) / 1000) + 's',
        keystrokes: count
    }));
  }, [session]);

  useEffect(() => {
    let interval: number;
    if (isPlaying && activeTab === 'replay') {
      interval = window.setInterval(() => {
        setPlaybackIndex(prev => {
          if (prev >= session.events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 50 / playbackSpeed); // Base speed 50ms per event
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, session.events.length, activeTab]);

  // Keyboard navigation for replay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only active if the replay view is visible and focused on replay tab
      if (!showDetails || activeTab !== 'replay') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setIsPlaying(false); // Pause manual scrubbing
          setPlaybackIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setIsPlaying(false); // Pause manual scrubbing
          setPlaybackIndex(prev => Math.min(session.events.length - 1, prev + 1));
          break;
        case ' ':
          e.preventDefault(); // Prevent scroll
          setIsPlaying(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDetails, activeTab, session.events.length]);

  // Auto-scroll to bottom of preview
  useEffect(() => {
      if(scrollRef.current && isPlaying) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [displayedContent, isPlaying]);

  // Handle adding markers
  const handleAddMarker = () => {
    if (!updateSession) return;
    setIsPlaying(false);
    const label = prompt("Timeline Marker Label (e.g., 'Draft 1', 'Major Edit'):", "Key Moment");
    if (label) {
        const newMarker: TimelineMarker = {
            id: crypto.randomUUID(),
            eventIndex: playbackIndex,
            timestamp: session.events[playbackIndex].timestamp,
            label,
            color: 'bg-red-500' 
        };
        updateSession({
            timelineMarkers: [...(session.timelineMarkers || []), newMarker]
        });
    }
  };

  const removeMarker = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!updateSession) return;
      if (confirm("Remove this marker?")) {
          updateSession({
              timelineMarkers: (session.timelineMarkers || []).filter(m => m.id !== id)
          });
      }
  };

  // Helper to get color for author ID (deterministic hash)
  const getAuthorColor = (id: string | undefined) => {
      if (!id) return 'bg-slate-100 text-slate-500 ring-1 ring-slate-200';
      const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const styles = [
          'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
          'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
          'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
          'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
          'bg-pink-100 text-pink-700 ring-1 ring-pink-200',
          'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
          'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
          'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200',
      ];
      return styles[hash % styles.length];
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-100 pb-4">
         <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Verification Data
            </h3>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
               {session.events.length} events logged
            </span>
         </div>
         
         <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             <button
                onClick={() => setShowDetails(true)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${showDetails ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <MonitorPlay className="w-3.5 h-3.5" /> Full Evidence
             </button>
             <button
                onClick={() => setShowDetails(false)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${!showDetails ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <BarChart3 className="w-3.5 h-3.5" /> Summary Stats
             </button>
         </div>
      </div>

      <div className={`grid grid-cols-1 ${showDetails ? 'lg:grid-cols-3' : 'lg:grid-cols-1 max-w-3xl mx-auto w-full'} gap-6 transition-all duration-500 ease-in-out`}>
        {/* Left: Replay Viewer & Logs (Conditionally rendered) */}
        {showDetails && (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-[500px] lg:h-[600px] animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Tab Header */}
            <div className="p-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <div className="flex bg-slate-200/50 p-1 rounded-lg gap-1">
                  <button 
                     onClick={() => setActiveTab('replay')}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'replay' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     <MonitorPlay className="w-3.5 h-3.5" /> Replay
                  </button>
                  <button 
                     onClick={() => setActiveTab('logs')}
                     className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === 'logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     <List className="w-3.5 h-3.5" /> Event Log
                  </button>
               </div>
               
               {activeTab === 'replay' && (
                  <div className="text-xs font-mono text-slate-400 px-2">
                    {new Date(session.events[playbackIndex]?.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
               )}
            </div>

            {/* Tab Content: Replay */}
            {activeTab === 'replay' && (
                <>
                    <div 
                        ref={scrollRef}
                        className="flex-1 p-6 overflow-y-auto font-serif text-lg leading-relaxed text-slate-800 whitespace-pre-wrap bg-white"
                    >
                    {displayedContent}
                    <span className="inline-block w-0.5 h-5 bg-blue-500 ml-0.5 animate-pulse align-middle"></span>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 relative">
                        {/* Timeline Markers */}
                        <div className="relative w-full h-4 mb-2 select-none">
                            {session.timelineMarkers?.map((marker) => (
                                <div 
                                    key={marker.id}
                                    className="absolute top-0 transform -translate-x-1/2 group cursor-pointer z-10"
                                    style={{ left: `${(marker.eventIndex / Math.max(1, session.events.length - 1)) * 100}%` }}
                                    onClick={() => setPlaybackIndex(marker.eventIndex)}
                                >
                                    <div className="w-0.5 h-4 bg-red-400 mx-auto"></div>
                                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap flex items-center gap-1 z-20 pointer-events-none">
                                        {marker.label}
                                    </div>
                                    <div 
                                        onClick={(e) => removeMarker(marker.id, e)}
                                        className="w-4 h-4 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center justify-center shadow-sm hover:bg-red-200 absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove Marker"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <input
                            type="range"
                            min="0"
                            max={session.events.length - 1}
                            value={playbackIndex}
                            onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4 relative z-0"
                        />
                    
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPlaybackIndex(0)}
                                    className="p-2 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
                                    title="Restart"
                                >
                                    <SkipBack className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
                                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                                </button>
                                
                                {updateSession && (
                                    <button
                                        onClick={handleAddMarker}
                                        className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-red-500 transition-colors ml-1"
                                        title="Add Timeline Marker"
                                    >
                                        <Flag className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <span className="text-xs uppercase tracking-wide text-slate-400">Speed</span>
                                {[1, 5, 10].map(speed => (
                                    <button 
                                        key={speed}
                                        onClick={() => setPlaybackSpeed(speed)}
                                        className={`px-2 py-1 rounded text-xs ${playbackSpeed === speed ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                                    >
                                        {speed}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Tab Content: Logs */}
            {activeTab === 'logs' && (
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase sticky top-0">
                        <div className="col-span-2">Time</div>
                        <div className="col-span-2">Author</div>
                        <div className="col-span-2">Action</div>
                        <div className="col-span-6">Details</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0">
                        {session.events.map((event, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-2 text-xs border-b border-slate-50 hover:bg-slate-50 transition-colors font-mono">
                                <div className="col-span-2 text-slate-400">
                                    {((event.timestamp - session.startTime) / 1000).toFixed(1)}s
                                </div>
                                <div className="col-span-2">
                                   <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-sm ${getAuthorColor(event.authorId)}`}>
                                      {event.authorId ? event.authorId.slice(0,4) : 'UNK'}
                                   </span>
                                </div>
                                <div className="col-span-2">
                                    <span className={`
                                        px-1.5 py-0.5 rounded
                                        ${event.action === 'backspace' ? 'bg-red-50 text-red-600' : 
                                          event.action === 'paste' ? 'bg-amber-50 text-amber-600' : 
                                          event.action === 'auto-save' ? 'bg-slate-100 text-slate-500' :
                                          event.action === 'format' ? 'bg-purple-50 text-purple-600' :
                                          'bg-emerald-50 text-emerald-600'}
                                    `}>
                                        {event.action}
                                    </span>
                                </div>
                                <div className="col-span-6 text-slate-600 truncate" title={event.content}>
                                    Len: {event.charCount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Right: Stats & Metadata */}
        <div className="flex flex-col gap-6 w-full">
          {/* Stats Cards */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Human Metrics</h3>
            
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Total Duration</span>
                  <span className="font-mono font-bold text-slate-800">
                      {(duration / 1000 / 60).toFixed(1)}m
                  </span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Backspaces</span>
                  <span className="font-mono font-bold text-slate-800">{session.backspaceCount}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Paste Events</span>
                  <span className={`font-mono font-bold ${session.pasteCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {session.pasteCount}
                  </span>
               </div>
            </div>

            {session.pasteCount > 2 && (
               <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>High paste count detected. This may affect the validity of the human certification.</p>
               </div>
            )}
          </div>

          {/* Activity Chart */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-1 min-h-[200px]">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Flow Rhythm</h3>
              <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                          <defs>
                              <linearGradient id="colorKeystrokes" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="keystrokes" stroke="#3b82f6" fillOpacity={1} fill="url(#colorKeystrokes)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">Keystrokes per 10s interval</p>
          </div>
        </div>
      </div>
    </div>
  );
};