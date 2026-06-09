import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Film, Trash2, Play, Calendar, Clock, Trophy } from 'lucide-react';
import { SavedReplay } from '../types';

interface ReplayTheatreProps {
  isOpen: boolean;
  onClose: () => void;
  savedReplays: SavedReplay[];
  onPlayReplay: (replay: SavedReplay) => void;
  onDeleteReplay: (id: string) => void;
}

export const ReplayTheatre: React.FC<ReplayTheatreProps> = ({
  isOpen,
  onClose,
  savedReplays,
  onPlayReplay,
  onDeleteReplay,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/82 backdrop-blur-md p-4">
        
        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-[#09090b]/96 border border-zinc-800 rounded-2xl flex flex-col max-h-[85vh] shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          {/* Subtle Ambient Red/Blue background flows */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Modal Header */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tight text-white uppercase">REPLAY THEATRE</h2>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">
                  Analyze and playback recorded championship matches ({savedReplays.length})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-lg border border-white/5 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Replay Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 relative z-10 custom-scrollbar">
            {savedReplays.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 mb-4 shadow-inner">
                  <Film className="w-6 h-6 opacity-40" />
                </div>
                <h3 className="text-sm font-black text-white/80 uppercase tracking-widest">No Recorded Matches</h3>
                <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed font-medium">
                  Matches are recorded automatically. Complete an arcade match then click <strong className="text-zinc-400">"Save Replay"</strong> on the victory screen to watch!
                </p>
              </div>
            ) : (
              savedReplays.map((replay) => {
                const isBlueWinner = replay.finalScore.blue > replay.finalScore.red;
                const winTeamColor = isBlueWinner ? 'text-blue-400' : 'text-red-400';
                const winBgColor = isBlueWinner ? 'bg-blue-500/5 border-blue-500/20' : 'bg-red-500/5 border-red-500/20';

                return (
                  <motion.div
                    key={replay.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/70 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    
                    {/* Replay information */}
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${winBgColor} ${winTeamColor}`}>
                          {isBlueWinner ? 'BLUE VICTORIOUS' : 'RED VICTORIOUS'}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{replay.timestamp}</span>
                        </div>
                      </div>

                      {/* Scoreboard line */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-blue-500 font-mono">BLUE</span>
                        <span className="text-xl font-black italic text-zinc-300 tracking-tight font-mono">
                          <span className="text-white text-2xl">{replay.finalScore.blue}</span>
                          <span className="text-zinc-600 mx-2">-</span>
                          <span className="text-white text-2xl">{replay.finalScore.red}</span>
                        </span>
                        <span className="text-xs font-black text-red-500 font-mono">RED</span>
                      </div>

                      {/* Stat summary bar */}
                      <div className="flex items-center gap-4 text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {replay.durationSeconds.toFixed(1)}s
                        </span>
                        <span>•</span>
                        <span>
                          {replay.events.filter(e => e.type === 'goal').length} Goals
                        </span>
                        <span>•</span>
                        <span>
                          {replay.events.filter(e => e.type === 'heavy_hit').length} Hits
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2.5">
                      
                      {/* Delete button */}
                      <button
                        onClick={() => onDeleteReplay(replay.id)}
                        className="p-3 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all active:scale-95 cursor-pointer"
                        title="Delete saved replay permanent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Watch button */}
                      <button
                        onClick={() => onPlayReplay(replay)}
                        className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-black hover:bg-zinc-200 transition-all text-xs font-black uppercase italic tracking-wide cursor-pointer active:scale-95 shadow-md flex-1 md:flex-none"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Replay</span>
                      </button>
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex justify-between items-center text-[10px] text-zinc-500 font-mono uppercase tracking-widest px-6 relative z-10">
            <span>Standard storage capability: up to 10 replays</span>
            <span className="text-zinc-600">Rocket Cars</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
