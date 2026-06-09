import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Pause, Trophy, Clock, X, Film, Coins, Crown, Flame, ChevronUp } from 'lucide-react';
import { TRANSLATIONS, Language } from '../localization';
import { getLeagueInfo } from './TrophiesLeaderboardModal';

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
  onPlayLatestReplay?: () => void;
  blueModel?: string;
  redModel?: string;
  blueTeamName?: string;
  redTeamName?: string;
  gameMode?: string;
  currentCoins?: number;
  language?: Language;
  
  // Trophy and Battle Pass dynamic post-match feedback
  bpXpGained?: number;
  bpXpBefore?: number;
  bpXpAfter?: number;
  bpLevelBefore?: number;
  bpLevelAfter?: number;
  isAdvancedPassOwned?: boolean;
  isCompetitiveRanked?: boolean;
  trophiesGained?: number;
  previousTrophies?: number;
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
  onTogglePause,
  onRestart,
  onExit,
  onSaveReplay,
  onPlayLatestReplay,
  blueModel = 'interstellar',
  redModel = 'interstellar',
  blueTeamName = 'BLUE',
  redTeamName = 'RED',
  currentCoins = 0,
  language = 'en',
  bpXpGained = 25,
  bpXpBefore = 0,
  bpXpAfter = 25,
  bpLevelBefore = 1,
  bpLevelAfter = 1,
  isAdvancedPassOwned = false,
  isCompetitiveRanked = false,
  trophiesGained = 0,
  previousTrophies = 100,
}) => {
  const t = TRANSLATIONS[language || 'en'];
  const [replayName, setReplayName] = React.useState('');
  const [hasSaved, setHasSaved] = React.useState(false);
  const [animatedCoins, setAnimatedCoins] = React.useState<number | null>(null);

  // Satisfying coin count-up animation
  React.useEffect(() => {
    if (winner) {
      const earned = winner === 'blue' ? 25 : 10;
      const startBalance = Math.max(0, currentCoins - earned);
      const targetBalance = currentCoins;
      setAnimatedCoins(startBalance);
      
      let current = startBalance;
      const step = Math.max(1, Math.ceil(earned / 15));
      const interval = setInterval(() => {
        current += step;
        if (current >= targetBalance) {
          setAnimatedCoins(targetBalance);
          clearInterval(interval);
        } else {
          setAnimatedCoins(current);
        }
      }, 60);
      
      return () => clearInterval(interval);
    }
  }, [winner, currentCoins]);

  // Reset local save form state and generate premium default name on winner
  React.useEffect(() => {
    if (winner) {
      setHasSaved(false);
      const randHex = Math.floor(Math.random() * 9000 + 1000);
      const teamLabel = winner === 'blue' ? blueTeamName.toUpperCase().replace(/\s+/g, '_') : redTeamName.toUpperCase().replace(/\s+/g, '_');
      const defaultName = `CHAMPION_REPLAY_${teamLabel}_${blueScore}_${redScore}_${randHex}`;
      setReplayName(defaultName);
    } else {
      setHasSaved(false);
      setReplayName('');
    }
  }, [winner, blueScore, redScore, blueTeamName, redTeamName]);

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
    if (countdown !== null) return t.getReady;
    if (goalScored) return t.goalScoredText;
    if (winner) return t.matchCompleted;
    if (isPaused) return t.pausedText;
    if (matchTimer >= 300 && blueScore === redScore) return 'OVERTIME - GOLDEN GOAL';
    return language === 'es' ? 'Partido Activo' : language === 'ca' ? 'Partit Actiu' : 'Match Active';
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-sans z-30">
      
      {/* IMMERSIVE HEADER HUD: MATCH STATUS, TIMER & NEON SCOREBOARD */}
      <div className="w-full flex items-start justify-between p-6 pointer-events-auto">
        
        {/* Left HUD: Blue Score with glowing orb and Active Ability details */}
        <div className="flex flex-col items-start gap-1 p-1">
          <div className="flex items-center gap-4 bg-black/55 backdrop-blur-md px-6 py-2.5 rounded-full border border-blue-500/35 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-pulse"></div>
            <span className="text-sm font-black tracking-widest text-blue-400 font-sans uppercase">{blueTeamName}</span>
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
            <span className="text-sm font-black tracking-widest text-red-400 font-sans uppercase">{redTeamName}</span>
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
          <span>{t.exit.toUpperCase()}</span>
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

        {/* GOAL! SPLASH SCREEN */}
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
              <p className={`text-xs md:text-sm uppercase font-extrabold tracking-[0.3em] mt-3 ${
                goalScored === 'blue' ? 'text-blue-400' : 'text-red-400'
              }`}>
                {goalScored === 'blue' ? `★ ${blueTeamName.toUpperCase()} SCORES! ★` : `★ ${redTeamName.toUpperCase()} SCORES! ★`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GAME PAUSED CARD */}
        {isPaused && !winner && !goalScored && (
          <div className="bg-[#050505]/96 border border-white/15 p-10 rounded-3xl flex flex-col items-center justify-center text-center max-w-sm shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-auto">
            <h3 className="text-3xl font-black text-yellow-500 uppercase tracking-widest italic mb-1">
              {t.pausedText.split(' ')[1] || t.pausedText}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest mb-8 uppercase">
              {language === 'es' ? 'CAMPEONATO EN ESPERA' : language === 'ca' ? 'CAMPIONAT EN ESPERA' : 'CHAMPIONSHIP ON STANDBY'}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={onTogglePause}
                className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-slate-200 cursor-pointer transition active:scale-95 shadow-lg"
              >
                {language === 'es' ? 'REANUDAR' : language === 'ca' ? 'REPRENDRE' : 'RESUME'}
              </button>
              <button
                onClick={onRestart}
                className="flex-1 px-5 py-3 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-350 font-bold text-xs cursor-pointer transition"
              >
                {language === 'es' ? 'REINICIAR' : language === 'ca' ? 'REINICIAR' : 'RESTART'}
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
              className="bg-[#050505]/98 border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col items-center justify-start text-center shadow-[0_30px_70px_rgba(0,0,0,0.9)] pointer-events-auto max-w-xl z-50 backdrop-blur-2xl relative max-h-[85vh] overflow-y-auto select-none"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#4b5563 #0d1117' }}
            >
              {/* Glowing Orb containing Trophy */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-2xl shrink-0 relative ${
                winner === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                <div className={`absolute inset-0 rounded-full blur-xl opacity-40 ${winner === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`} />
                <Trophy className="w-7 h-7 relative z-10 animate-bounce" />
              </div>

              <span className={`text-[9px] font-black tracking-[0.4em] uppercase px-3 py-1 rounded-full border shrink-0 ${
                winner === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {t.matchCompleted}
              </span>

              <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white mt-3 mb-1 leading-none uppercase shrink-0">
                {winner === 'blue' ? blueTeamName : redTeamName} <br />
                <span className="text-yellow-500 text-xl font-black tracking-widest mt-1 inline-block uppercase">
                  {language === 'es' ? 'VICTORIOSO' : language === 'ca' ? 'VICTORIÓS' : 'VICTORIOUS'}
                </span>
              </h2>

              <p className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-[0.25em] mt-1 shrink-0">
                {t.score.toUpperCase()} &nbsp;•&nbsp;&nbsp;
                <span className="text-blue-400 font-extrabold">{blueScore}</span>
                <span className="text-slate-600 mx-2">-</span>
                <span className="text-red-400 font-extrabold">{redScore}</span>
              </p>

              {/* DYNAMIC BENTO POST-MATCH REWARDS GRID */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch max-w-2xl mx-auto my-3 text-left">
                
                {/* 1. CREDITS REWARD SUMMARY */}
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl w-64 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <h4 className="text-[9px] font-black tracking-[0.2em] text-yellow-500 uppercase font-mono border-b border-zinc-900 pb-1.5 flex items-center gap-1.5 mb-2.5">
                      <Coins className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span>{language === 'es' ? 'CRÉDITOS OBTENIDOS' : language === 'ca' ? 'CRÈDITS GUANYATS' : 'CREDITS EARNED'}</span>
                    </h4>
                    
                    <div className="space-y-1.5 text-xxs font-mono">
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>{t.participationReward}:</span>
                        <span className="text-zinc-350 font-bold">+10¢</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>{t.victoryBonus}:</span>
                        <span className={`font-bold ${winner === 'blue' ? 'text-emerald-400' : 'text-zinc-650'}`}>
                          {winner === 'blue' ? '+15¢' : '+0¢'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-zinc-900">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-extrabold text-[10px] text-white uppercase tracking-wide">{language === 'es' ? 'Total' : language === 'ca' ? 'Total' : 'Total'}:</span>
                      <span className="font-mono text-emerald-400 font-black text-sm">
                        +{winner === 'blue' ? '25' : '10'} {t.coins.toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-black/45 rounded-lg py-1 px-2 flex justify-between items-center border border-zinc-900 text-[9px] font-mono">
                      <span className="text-zinc-500 font-bold">{language === 'es' ? 'Saldo' : language === 'ca' ? 'Saldo' : 'Balance'}:</span>
                      <span className="text-yellow-500 font-black">
                        {animatedCoins !== null ? animatedCoins : currentCoins}¢
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. COMPETITIVE TROPHY LEAGUE STATUS */}
                {(() => {
                  const finalTrophies = Math.max(0, previousTrophies + trophiesGained);
                  const activeLeague = getLeagueInfo(finalTrophies, (language || 'en') as Language);
                  const isLoss = trophiesGained < 0;
                  const absTrophies = Math.abs(trophiesGained);
                  const trophySign = trophiesGained > 0 ? '+' : isLoss ? '-' : '+';
                  const trophyColor = trophiesGained > 0 ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-zinc-500';

                  return (
                    <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl w-64 flex flex-col justify-between shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                      <div>
                        <h4 className="text-[9px] font-black tracking-[0.2em] text-cyan-400 uppercase font-mono border-b border-zinc-900 pb-1.5 flex items-center gap-1.5 mb-2.5">
                          <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{language === 'es' ? 'LIGA DE DE TROFEOS' : language === 'ca' ? 'LLIGA DE TROFEUS' : 'TROPHY ARENA STATUS'}</span>
                        </h4>

                        {isCompetitiveRanked ? (
                          <div className="space-y-1.5 text-xxs font-mono">
                            <div className="flex justify-between items-center text-zinc-500">
                              <span>{language === 'es' ? 'Previo:' : language === 'ca' ? 'Previ:' : 'Previous Trophies:'}</span>
                              <span className="text-zinc-350 font-bold">{previousTrophies} 🏆</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-500">
                              <span>{language === 'es' ? 'Cambio:' : language === 'ca' ? 'Canvi:' : 'Trophy Change:'}</span>
                              <span className={`font-bold ${trophyColor}`}>
                                {trophySign}{absTrophies} 🏆
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-zinc-500 italic leading-relaxed py-1">
                            {language === 'es' ? '🚫 Amistoso - Sin trofeos en juego.' : language === 'ca' ? '🚫 Amistós - Sense trofeus en joc.' : '🚫 Friendly exhibition match - trophies disabled.'}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-2 border-t border-zinc-900">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-extrabold text-[10px] text-white uppercase tracking-wide">{language === 'es' ? 'Total' : language === 'ca' ? 'Total' : 'Total'}:</span>
                          <span className="font-mono text-cyan-400 font-extrabold text-xs">
                            {finalTrophies} 🏆
                          </span>
                        </div>
                        <div className="bg-black/45 rounded-lg py-1 px-2.5 flex items-center justify-between border border-zinc-900 text-[8.5px] font-mono leading-none">
                          <span className="text-zinc-500 font-sans font-black">{activeLeague.name.split(' ')[0]}</span>
                          <span className="text-[11px] truncate max-w-[80px]" title={activeLeague.name}>
                            {activeLeague.icon}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. BATTLE PASS PROGRESS CARD */}
                {(() => {
                  const xpRequired = isAdvancedPassOwned ? 50 : 100;
                  return (
                    <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl w-64 flex flex-col justify-between shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                      <div>
                        <h4 className="text-[9px] font-black tracking-[0.2em] text-purple-400 uppercase font-mono border-b border-zinc-900 pb-1.5 flex items-center gap-1.5 mb-2.5">
                          <Crown className="w-3.5 h-3.5 text-purple-400" />
                          <span>{language === 'es' ? 'PASO EXP RECOMPENSAS' : language === 'ca' ? 'PAS DE BATALLA EXP' : 'BATTLE PASS XP'}</span>
                        </h4>

                        <div className="space-y-1.5 text-xxs font-mono">
                          <div className="flex justify-between items-center text-zinc-500">
                            <span>{language === 'es' ? 'XP Obtenido:' : language === 'ca' ? 'XP Guanyat:' : 'Match XP Earned:'}</span>
                            <span className="text-purple-400 font-extrabold">+{bpXpGained} XP</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-500">
                            <span>{language === 'es' ? 'Nivel anterior:' : language === 'ca' ? 'Nivell previ:' : 'Previous Level:'}</span>
                            <span className="text-zinc-350">{bpLevelBefore}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-zinc-900 space-y-2">
                        {/* Progress Bar ratio */}
                        <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono">
                          <span className="font-extrabold uppercase text-white flex items-center gap-0.5">
                            {isAdvancedPassOwned ? '💎 ADVANCED' : '🆓 BASIC'} LVL {bpLevelAfter}
                          </span>
                          <span>{bpXpAfter} / {xpRequired} XP</span>
                        </div>

                        {/* Progress core bar */}
                        <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-zinc-900">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                            style={{ width: `${(bpXpAfter / xpRequired) * 100}%` }}
                          />
                        </div>

                        {/* Level Up Notice overlay */}
                        {bpLevelAfter > bpLevelBefore && (
                          <div className="bg-purple-950/30 border border-purple-500/20 py-0.5 px-1.5 rounded text-[7.5px] font-black uppercase text-purple-400 tracking-wider text-center animate-bounce">
                            🎉 LEVEL UP! NEW REWARDS UNLOCKED
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* REPLAY SAVE BLOCK (OPTIONAL & FLUID) */}
              <div className="w-full mt-2 border-t border-white/10 pt-4 flex flex-col gap-3">
                {!hasSaved ? (
                  <div className="space-y-2 bg-violet-950/10 border border-violet-500/10 p-3.5 rounded-xl text-left">
                    <div>
                      <span className="text-[9.5px] font-black tracking-widest text-violet-400 uppercase font-mono block mb-0.5">
                        🎥 {language === 'es' ? 'COPIA COMPACTA DE HIGHLIGHTS' : language === 'ca' ? 'HIGHLIGHTS DEL PARTIT' : 'PERSIST MATCH HIGHLIGHTS'}
                      </span>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        {language === 'es' ? 'Guarda este partido en tu Teatro de Repeticiones para analizar tus toques.' : language === 'ca' ? 'Desa aquest partit al teu Teatre de Repeticions.' : 'Save this matchup history to replay and review your strategies.'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full mt-1.5">
                      <input
                        type="text"
                        placeholder="Choose replay name..."
                        value={replayName}
                        onChange={(e) => setReplayName(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-white/10 px-3 py-1.5 text-xs text-white placeholder-zinc-550 rounded-lg focus:outline-none focus:border-violet-500/50 transition-all font-mono uppercase"
                      />
                      <button
                        onClick={() => {
                          const finalName = replayName.trim() || `CHAMPIONSHIP_${blueScore}_${redScore}`;
                          onSaveReplay(finalName);
                          setHasSaved(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-black uppercase text-[10px] tracking-widest rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(139,92,246,0.25)] border border-violet-500/20"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>{t.saveReplayText}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2 px-3 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-[0.15em] text-center flex items-center justify-center gap-2"
                    >
                      <span>✓ {language === 'es' ? 'REPETICIÓN GUARDADA:' : language === 'ca' ? 'REPETICIÓ GUARDADA:' : 'REPLAY PERSISTED:'} "{replayName.toUpperCase()}"</span>
                    </motion.div>
                    {onPlayLatestReplay && (
                      <button
                        onClick={onPlayLatestReplay}
                        className="group relative bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 text-white py-2 px-6 overflow-hidden transition-all active:scale-95 cursor-pointer font-black uppercase italic tracking-wider text-xs flex items-center justify-center gap-2 rounded-xl border border-violet-500/20"
                      >
                        <Film className="w-3.5 h-3.5 animate-pulse" />
                        <span className="relative z-10">{language === 'es' ? 'Ver Repetición Ahora 🎥' : language === 'ca' ? 'Veure Repetició Ara 🎥' : 'Watch Replay Now 🎥'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* ALWAYS VISIBLE ACTION CONTROLS */}
                <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
                  <button
                    onClick={onRestart}
                    className="group relative bg-white text-black px-6 py-2.5 overflow-hidden transition-all active:scale-95 cursor-pointer flex-1 font-black uppercase italic tracking-wider text-[10px] flex items-center justify-center gap-2 rounded-lg border border-white"
                  >
                    <span className="relative z-10">{language === 'es' ? 'Jugar de Nuevo' : language === 'ca' ? 'Jugar de Nou' : 'Play Again'}</span>
                    <div className={`absolute top-0 right-0 h-full w-0 ${winner === 'blue' ? 'bg-blue-500' : 'bg-red-500'} group-hover:w-3 transition-all`}></div>
                  </button>
                  
                  <button
                    onClick={onExit}
                    className="px-5 py-2.5 rounded-lg bg-zinc-900 border border-white/5 text-slate-300 font-bold cursor-pointer hover:bg-zinc-800 hover:text-white transition active:scale-95 text-[10px] uppercase font-mono flex-1"
                  >
                    {t.exit}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER TIPS BAR */}
      <div className="w-full text-center p-4 text-slate-600 text-[10px] font-bold tracking-[0.2em] font-mono select-none uppercase">
        {language === 'es' ? 'LÍMITE DE GOLES: 5 • PRESIONA [P] PARA PAUSAR • PRESIONA [R] PARA REINICIAR' : language === 'ca' ? 'LÍMIT DE GOLS: 5 • PREM [P] PER PAUSAR • PREM [R] PER REINICIAR' : 'GOAL LIMIT: 5 • PRESS [P] TO PAUSE • PRESS [R] TO RESET MATCH'}
      </div>
    </div>
  );
};
