import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Volume2, VolumeX, Pause, Trophy, Clock, X, Film, Coins } from 'lucide-react';

interface ScoreOverlayProps {
  blueScore: number;
  redScore: number;
  matchTimer: number; // in seconds
  countdown: number | 'GO' | null;
  goalScored: 'blue' | 'red' | null;
  winner: 'blue' | 'red' | null;
  isPaused: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onExit: () => void;
  onSaveReplay: (name: string) => void;
  blueModel?: string;
  redModel?: string;
}

const getCarDisplayName = (model = 'interstellar') => {
  if (model === 'beast') return 'The Beast';
  if (model === 'spectre') return 'Spectre F1';
  if (model === 'cyber') return 'Cyberspace';
  if (model === 'phantom') return 'Phantom GT';
  if (model === 'phoenix') return 'Phoenix VTOL';
  return 'Interstellar';
};

const getCarAbilityName = (model = 'interstellar') => {
  if (model === 'beast') return 'Titan Armor 🛡️';
  if (model === 'spectre') return 'Hyper-Handling ⚡';
  if (model === 'cyber') return 'Solar Recharge ☀️';
  if (model === 'phantom') return 'Quantum Stealth 🌌';
  if (model === 'phoenix') return 'Supersonic Thrust 🔥';
  return 'Vanguard Engine 💎';
};

export const ScoreOverlay: React.FC<ScoreOverlayProps> = ({
  blueScore,
  redScore,
  matchTimer,
  countdown,
  goalScored,
  winner,
  isPaused,
  isMuted,
  onToggleMute,
  onTogglePause,
  onRestart,
  onExit,
  onSaveReplay,
  blueModel = 'interstellar',
  redModel = 'interstellar',
}) => {
  const [replayName, setReplayName] = React.useState('');
  const [hasSaved, setHasSaved] = React.useState(false);

  // Reset local save form state if match restarted
  React.useEffect(() => {
    if (!winner) {
      setHasSaved(false);
      setReplayName('');
    }
  }, [winner]);

  // Format MM:SS for timer
  const formatTime = (totalSecs: number) => {
    const isOvertime = totalSecs >= 300;
    const timeToDisplay = isOvertime ? (totalSecs - 300) : (300 - totalSecs);
    const mins = Math.floor(timeToDisplay / 60);
    const secs = Math.floor(timeToDisplay % 60);
    const prefix = isOvertime ? 'OT +' : '';
    return `${prefix}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Status text helper matching "Immersive UI" spec style
  const getStatusText = () => {
    if (countdown !== null) return 'Get Ready';
    if (goalScored) return 'Goal Scored!';
    if (winner) return 'Match Finished';
    if (isPaused) return 'Match Paused';
    if (matchTimer >= 300 && blueScore === redScore) return 'OVERTIME - GOLDEN GOAL';
    return 'Match Active';
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-sans z-30">
      
      {/* IMMERSIVE HEADER HUD: MATCH STATUS, TIMER & NEON SCOREBOARD */}
      <div className="w-full flex items-start justify-between p-6 pointer-events-auto">
        
        {/* Left HUD: Blue Score with glowing orb and Active Ability details */}
        <div className="flex flex-col items-start gap-1 p-1">
          <div className="flex items-center gap-4 bg-black/55 backdrop-blur-md px-6 py-2.5 rounded-full border border-blue-500/35 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-pulse"></div>
            <span className="text-sm font-black tracking-widest text-blue-400 hidden sm:inline">BLUE</span>
            <span className="text-4xl font-black italic text-white leading-none tracking-tight">{blueScore}</span>
          </div>
          <div className="bg-black/35 border border-blue-500/10 px-3 py-1 rounded mt-1.5 backdrop-blur-sm self-start flex flex-col">
            <span className="text-[10px] font-black text-white italic tracking-wide">
              {getCarDisplayName(blueModel)}
            </span>
            <span className="text-[8px] font-mono text-blue-300 font-bold tracking-tight">
              {getCarAbilityName(blueModel)}
            </span>
          </div>
        </div>

        {/* Center HUD: Timing, status & system indicator */}
        <div className="flex flex-col items-center">
          <div className="text-xl font-mono text-white/70 bg-black/40 border border-white/5 backdrop-blur-md px-5 py-1.5 rounded-full shadow-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{formatTime(matchTimer)}</span>
          </div>
          <div className="text-[10px] font-black tracking-[0.4em] uppercase mt-2.5 text-yellow-500 drop-shadow-sm">
            {getStatusText()}
          </div>
        </div>

        {/* Right HUD: Red Score with glowing orb and Active Ability details */}
        <div className="flex flex-col items-end gap-1 p-1">
          <div className="flex items-center gap-4 bg-black/55 backdrop-blur-md px-6 py-2.5 rounded-full border border-red-500/35 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <span className="text-4xl font-black italic text-white leading-none tracking-tight">{redScore}</span>
            <span className="text-sm font-black tracking-widest text-red-400 hidden sm:inline">RED</span>
            <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse"></div>
          </div>
          <div className="bg-black/35 border border-red-500/10 px-3 py-1 rounded mt-1.5 backdrop-blur-sm self-end flex flex-col items-end">
            <span className="text-[10px] font-black text-white italic tracking-wide">
              {getCarDisplayName(redModel)}
            </span>
            <span className="text-[8px] font-mono text-red-300 font-bold tracking-tight">
              {getCarAbilityName(redModel)}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK SYSTEM UTILITIES (Floating cleanly in the game margin) */}
      <div className="absolute top-24 left-6 pointer-events-auto flex items-center gap-2">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-wider rounded-lg bg-black/50 hover:bg-black text-slate-400 hover:text-white font-bold border border-white/10 cursor-pointer backdrop-blur transition-all active:scale-95 uppercase font-mono"
          title="Exit current game to Main Menu"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Menu</span>
        </button>

        <button
          onClick={onTogglePause}
          className="p-2 rounded-lg bg-black/50 hover:bg-black text-slate-400 hover:text-white border border-white/10 cursor-pointer backdrop-blur transition-all active:scale-95"
          title="Pause / Unpause Game [P]"
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-yellow-400 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onRestart}
          className="p-2 rounded-lg bg-black/50 hover:bg-black text-slate-400 hover:text-white border border-white/10 cursor-pointer backdrop-blur transition-all active:scale-95"
          title="Restart entire match [R]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CENTRAL NOTIFICATIONS OVERLAY PANEL */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-4">
        
        {/* BIG COUNTDOWN WRITING */}
        <AnimatePresence mode="wait">
          {countdown !== null && (
            <motion.div
              key={countdown}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 1.0, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 150 }}
              className="text-center font-black pointer-events-none"
            >
              {countdown === 'GO' ? (
                <span className="text-[120px] md:text-[180px] font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-500 drop-shadow-[0_0_60px_rgba(245,158,11,0.4)]">
                  GO!
                </span>
              ) : (
                <span className="text-[140px] md:text-[220px] font-black italic text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                  {countdown}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GOAL! SPLASH SCREEN GIVING VIBRANT SHOWER OF CHAMPIONSHIP ENERGY */}
        <AnimatePresence>
          {goalScored !== null && (
            <motion.div
              initial={{ scale: 0.1, y: 150, opacity: 0, rotate: -15 }}
              animate={{ scale: 1.0, y: 0, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.6, opacity: 0, rotate: 15 }}
              className="p-8 px-16 rounded-3xl text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 bg-[#050505]/95 backdrop-blur-xl"
            >
              <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-gray-400 uppercase drop-shadow">
                GOAL!
              </h2>
              <p className={`text-xs md:text-sm uppercase font-extrabold tracking-[0.4em] mt-3 ${
                goalScored === 'blue' ? 'text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
              }`}>
                {goalScored === 'blue' ? '★ PLAYER 1 (BLUE) SCORES ★' : '★ PLAYER 2 (RED) SCORES ★'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GAME PAUSED CARD */}
        {isPaused && !winner && !goalScored && (
          <div className="bg-[#050505]/96 border border-white/15 p-10 rounded-3xl flex flex-col items-center justify-center text-center max-w-sm shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-auto">
            <h3 className="text-3xl font-black text-yellow-500 uppercase tracking-widest italic mb-1">
              PAUSED
            </h3>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest mb-8">
              CHAMPIONSHIP ON STANDBY
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={onTogglePause}
                className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-slate-250 cursor-pointer transition active:scale-95 shadow-lg"
              >
                RESUME
              </button>
              <button
                onClick={onRestart}
                className="flex-1 px-5 py-3 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-350 font-bold text-xs cursor-pointer transition"
              >
                RESTART
              </button>
            </div>
          </div>
        )}

        {/* CHAMPIONSHIP VICTORY OVERLAY WITH DESIGN THEME STYLE */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#050505]/98 border border-white/10 p-12 rounded-3xl flex flex-col items-center justify-center text-center shadow-[0_30px_70px_rgba(0,0,0,0.9)] pointer-events-auto max-w-lg z-50 backdrop-blur-2xl relative"
            >
              {/* Glowing Orb containing Trophy */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl relative ${
                winner === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                <div className={`absolute inset-0 rounded-full blur-xl opacity-40 ${winner === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`} />
                <Trophy className="w-12 h-12 relative z-10 animate-bounce" />
              </div>

              <span className={`text-[10px] font-black tracking-[0.4em] uppercase px-4 py-1.5 rounded-full border ${
                winner === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                MATCH COMPLETED
              </span>

              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mt-6 mb-2 leading-none uppercase">
                {winner === 'blue' ? 'BLUE TEAM' : 'RED TEAM'} <br />
                <span className="text-yellow-500 text-3xl font-black tracking-widest mt-1 inline-block uppercase">VICTORIOUS</span>
              </h2>

              <p className="text-xs text-slate-500 font-mono mb-4 uppercase tracking-[0.25em] mt-3">
                FINAL SCORE &nbsp;•&nbsp;&nbsp;
                <span className="text-blue-400 font-extrabold">{blueScore}</span>
                <span className="text-slate-600 mx-2">-</span>
                <span className="text-red-400 font-extrabold">{redScore}</span>
              </p>

              {/* Gold coin earnings box */}
              <div className="bg-amber-500/10 border border-amber-500/35 px-5 py-2.5 rounded-xl flex items-center justify-center gap-3 mb-8 max-w-xs mx-auto shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Coins className="w-5 h-5 text-amber-400 fill-amber-500/10 animate-bounce" />
                <div className="font-mono text-left">
                  <span className="text-[9px] text-amber-300 font-bold uppercase block leading-none tracking-widest">Match Earnings</span>
                  <span className="text-white text-sm font-black">+{((blueScore + redScore) * 15) + 100} Coins Saved</span>
                </div>
              </div>

              {/* White interactive play button styled exactly like Immersive template start button */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={onRestart}
                  className="group relative bg-white text-black px-10 py-4.5 overflow-hidden transition-all hover:pr-12 active:scale-95 cursor-pointer flex-1 font-black uppercase italic tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  <span className="relative z-10">Play Again</span>
                  <div className={`absolute top-0 right-0 h-full w-0 ${winner === 'blue' ? 'bg-blue-500' : 'bg-red-500'} group-hover:w-3 transition-all`}></div>
                </button>
                
                <button
                  onClick={onExit}
                  className="px-6 py-4.5 rounded-none bg-slate-900 border border-white/10 text-white font-bold cursor-pointer hover:bg-slate-800 transition active:scale-95 text-xs uppercase tracking-wider font-mono flex-1"
                >
                  Exit to Menu
                </button>
              </div>

              {/* SAVING ARCADE REPLAY SECTION */}
              <div className="w-full mt-6 border-t border-white/10 pt-5 flex flex-col gap-3">
                {!hasSaved ? (
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                    <input
                      type="text"
                      placeholder="Name this epic moment..."
                      value={replayName}
                      onChange={(e) => setReplayName(e.target.value)}
                      className="flex-1 bg-zinc-900/60 border border-white/10 px-4 py-2.5 text-xs text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:border-violet-500/80 transition-all font-mono uppercase"
                    />
                    <button
                      onClick={() => {
                        const finalName = replayName.trim() || `CHAMPIONSHIP_${blueScore}_${redScore}`;
                        onSaveReplay(finalName);
                        setHasSaved(true);
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 text-white font-black uppercase text-[10px] tracking-widest rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-violet-500/20"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Save Replay</span>
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-violet-500/10 border border-violet-500/35 rounded-lg py-3 px-4 text-xs font-mono font-bold text-violet-400 uppercase tracking-[0.2em] text-center"
                  >
                    ✓ Championship Replay Saved in Theatre!
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER TIPS BAR */}
      <div className="w-full text-center p-4 text-slate-600 text-[10px] font-bold tracking-[0.2em] font-mono select-none uppercase">
        GOAL LIMIT: 5 &nbsp;•&nbsp; PRESS [P] TO PAUSE &nbsp;•&nbsp; PRESS [R] TO RESET MATCH
      </div>
    </div>
  );
};

