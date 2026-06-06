import React from 'react';
import { motion } from 'motion/react';
import { Play, Pause, ArrowLeft, RotateCcw, RefreshCw, Zap, Disc, Film } from 'lucide-react';
import { SavedReplay, ReplayEvent } from '../types';

interface ReplayHUDProps {
  replay: SavedReplay;
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  isLooping: boolean;
  onSetIndex: (index: number) => void;
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  onToggleLoop: () => void;
  onExit: () => void;
}

export const ReplayHUD: React.FC<ReplayHUDProps> = ({
  replay,
  currentIndex,
  isPlaying,
  playbackSpeed,
  isLooping,
  onSetIndex,
  onTogglePlay,
  onSetSpeed,
  onToggleLoop,
  onExit,
}) => {
  const totalFrames = replay.frames.length;
  const progressPercent = totalFrames > 0 ? (currentIndex / (totalFrames - 1)) * 100 : 0;

  // Format indices to a timestamp string "MM:SS.CC"
  const formatFrameToTime = (frameIdx: number) => {
    // 60 frames per second
    const totalSeconds = frameIdx / 60;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const centiseconds = Math.floor((totalSeconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  // Handle click on timeline to scrub
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetIndex = Math.floor(percent * (totalFrames - 1));
    onSetIndex(targetIndex);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 bg-zinc-950/95 border-t border-white/10 backdrop-blur-xl p-6 pointer-events-auto flex flex-col gap-4 font-sans select-none">
      
      {/* Top Header Row: Replay metadata & Exit Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 text-red-400 border border-red-500/30 p-2 rounded-lg flex items-center gap-1.5 animate-pulse text-xs font-mono uppercase tracking-[0.1em]">
            <Disc className="w-4 h-4 fill-red-500/20" />
            <span>Replay Playback</span>
          </div>
          <div>
            <h4 className="text-sm font-black italic tracking-wide uppercase text-white/95 leading-none">
              {replay.name || 'Unsaved Match'}
            </h4>
            <p className="text-[10px] text-zinc-400 font-mono mt-1 uppercase tracking-widest">
              Recorded: {replay.timestamp} • Duration: {(totalFrames / 60).toFixed(1)}s
            </p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-widest rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white font-bold border border-white/5 cursor-pointer backdrop-blur transition-all active:scale-95 uppercase font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Replay</span>
        </button>
      </div>

      {/* Interactive Timeline Track */}
      <div className="relative pt-3 pb-6 select-none group">
        
        {/* Seekable Track wrapper */}
        <div 
          className="h-2.5 bg-zinc-850 hover:h-3 rounded-full relative cursor-pointer overflow-visible transition-all"
          onClick={handleTimelineClick}
        >
          {/* Active progress bar */}
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-[width] duration-75"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Draggable indicator thumb */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-white border-2 border-violet-500 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)] scale-0 group-hover:scale-100 transition-transform duration-100 pointer-events-none"
            style={{ left: `${progressPercent}%`, marginLeft: '-10px' }}
          />

          {/* Event Hotspots on timeline */}
          {replay.events.map((evt, idx) => {
            const evtPercent = (evt.frameIndex / (totalFrames - 1)) * 100;
            const isGoal = evt.type === 'goal';
            const isBlue = evt.team === 'blue';
            
            // Marker styling based on event types
            let markerBg = 'bg-yellow-500';
            let glowColor = 'rgba(245, 158, 11, 0.5)';
            if (isGoal) {
              markerBg = isBlue ? 'bg-blue-500' : 'bg-red-500';
              glowColor = isBlue ? 'rgba(59,130,246,0.6)' : 'rgba(239,68,68,0.6)';
            } else if (evt.type === 'boost_pickup') {
              markerBg = 'bg-amber-400';
              glowColor = 'rgba(251,191,36,0.4)';
            }

            return (
              <div
                key={idx}
                className={`absolute group/evt top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 ${markerBg} cursor-pointer hover:scale-150 transition-all shadow-md z-10 flex items-center justify-center`}
                style={{ left: `${evtPercent}%`, transform: 'translate(-50%, -50%)', boxShadow: `0 0 6px ${glowColor}` }}
                title={`${evt.type.replace('_', ' ').toUpperCase()} (${evt.team || ''})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetIndex(evt.frameIndex);
                }}
              >
                {/* Event tooltip */}
                <div className="absolute bottom-6 opacity-0 group-hover/evt:opacity-100 bg-zinc-900 border border-white/10 text-[9px] font-bold text-white px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap uppercase tracking-widest font-mono">
                  {evt.type === 'goal' ? `GOAL - ${evt.team === 'blue' ? 'BLUE' : 'RED'} (Frame ${evt.frameIndex})` : `${evt.type.replace('_', ' ')}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timecode labels below track */}
        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-2.5">
          <span>{formatFrameToTime(currentIndex)}</span>
          <span>{formatFrameToTime(totalFrames - 1)}</span>
        </div>
      </div>

      {/* Playback Controls Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Play/Pause & Restart Button Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSetIndex(0)}
            className="p-2.5 rounded-lg border border-white/5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            title="Jump to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="px-6 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition-all font-black uppercase text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.1)] active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current text-black" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-black" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={onToggleLoop}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] tracking-wider rounded-lg border cursor-pointer font-bold transition-all active:scale-95 uppercase font-mono ${
              isLooping 
                ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
                : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle Repeat"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLooping ? 'animate-spin' : ''}`} />
            <span>{isLooping ? 'Looping Active' : 'Loop Off'}</span>
          </button>
        </div>

        {/* Speed multipliers */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-white/5">
          {[0.25, 0.5, 1.0, 2.0, 4.0].map((spd) => {
            const isActive = playbackSpeed === spd;
            return (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold tracking-tight rounded-md cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-white text-black font-black' 
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {spd.toFixed(2)}x
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
