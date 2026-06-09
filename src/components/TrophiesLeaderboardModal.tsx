import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Shield, Star, Crown, Flame, ChevronUp, Swords } from 'lucide-react';
import { TRANSLATIONS, Language } from '../localization';

export interface LeaderboardEntry {
  name: string;
  trophies: number;
  isPlayer?: boolean;
}

const DEFAULT_COMPETITORS: LeaderboardEntry[] = [
  { name: 'Xavi Rocket', trophies: 2350 },
  { name: 'Marc V8', trophies: 1840 },
  { name: 'Laia Cyber', trophies: 1420 },
  { name: 'Leo Drift', trophies: 1100 },
  { name: 'Albert Turbo', trophies: 850 },
  { name: 'Marta Spark', trophies: 620 },
  { name: 'Oriol Titan', trophies: 450 },
  { name: 'Pau Burner', trophies: 310 },
  { name: 'Gemma Electro', trophies: 180 },
  { name: 'Gerard Clutch', trophies: 90 },
];

export const getLeagueInfo = (trophies: number, language: Language = 'en') => {
  if (trophies >= 2000) {
    return {
      name: language === 'ca' ? 'Campió 👑' : language === 'es' ? 'Campeón 👑' : 'Champion 👑',
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.25)]',
      icon: '👑',
      desc: language === 'ca' ? 'L\'elit espacial absoluta d\'alt impacte.' : language === 'es' ? 'La élite absoluta de alta gravedad.' : 'Absolute spatial elite G-force.'
    };
  }
  if (trophies >= 1000) {
    return {
      name: language === 'ca' ? 'Diamant 💎' : language === 'es' ? 'Diamante 💎' : 'Diamond 💎',
      color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.25)]',
      icon: '💎',
      desc: language === 'ca' ? 'Lliga de pilots veterans i llandes de neon.' : language === 'es' ? 'Liga de pilotos veteranos y llantas de neón.' : 'Veteran pilot league and custom neon rims.'
    };
  }
  if (trophies >= 500) {
    return {
      name: language === 'ca' ? 'Or 🟨' : language === 'es' ? 'Oro 🟨' : 'Gold 🟨',
      color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      icon: '🟨',
      desc: language === 'ca' ? 'Competidors regulars en circuits interatòmics.' : language === 'es' ? 'Competidores de peso en circuitos interatómicos.' : 'Championship contenders on main circuit vectors.'
    };
  }
  if (trophies >= 200) {
    return {
      name: language === 'ca' ? 'Argent ⬜' : language === 'es' ? 'Plata ⬜' : 'Silver ⬜',
      color: 'text-zinc-300 bg-zinc-300/10 border-zinc-300/20',
      icon: '⬜',
      desc: language === 'ca' ? 'Pilot provat amb tàctiques de rebot estables.' : language === 'es' ? 'Piloto consolidado con tácticas estables .' : 'Stable bounce tactician with seasoned flight hours.'
    };
  }
  return {
    name: language === 'ca' ? 'Bronze 🟫' : language === 'es' ? 'Bronce 🟫' : 'Bronze 🟫',
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    icon: '🟫',
    desc: language === 'ca' ? 'Àrea inicial professional per rookies de forces G.' : language === 'es' ? 'Piloto novato ganando momentum.' : 'G-force rookie gaining initial launch trajectory.'
  };
};

interface TrophiesLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerTrophies: number;
  playerName?: string;
  onUpdatePlayerName?: (name: string) => void;
  language?: Language;
}

export const TrophiesLeaderboardModal: React.FC<TrophiesLeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerTrophies,
  playerName = 'Jordi Muñoz',
  onUpdatePlayerName,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language || 'en'];
  const [currPlayerName, setCurrPlayerName] = useState(playerName);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCurrPlayerName(playerName);
  }, [playerName]);

  if (!isOpen) return null;

  // Build the complete combined leaderboard dynamically
  const playerEntry: LeaderboardEntry = {
    name: currPlayerName,
    trophies: playerTrophies,
    isPlayer: true
  };

  const combinedLeagues = [...DEFAULT_COMPETITORS, playerEntry];
  combinedLeagues.sort((a,b) => b.trophies - a.trophies);

  // Find player position in ranking (1-indexed)
  const playerRank = combinedLeagues.findIndex(x => x.isPlayer) + 1;
  const playerLeague = getLeagueInfo(playerTrophies, (language || 'en') as Language);

  const handleSaveName = () => {
    if (currPlayerName.trim()) {
      if (onUpdatePlayerName) {
        onUpdatePlayerName(currPlayerName.trim());
      }
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="w-full max-w-3xl max-h-[95vh] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/98 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col relative"
      >
        {/* Top styling band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 animate-pulse" />

        {/* Header Section */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Trophy className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h1 className="text-xl font-black italic text-white uppercase tracking-tight">
                {language === 'ca' ? 'ARENA CLASSIFICACIÓ COMPÈTIVA' : language === 'es' ? 'RANKING COMPETITIVO LIGA CLUB' : 'LEAGUE CARS COMPETITIVE ARENA'}
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase mt-1">
                🏆 {language === 'ca' ? 'COSPEIX PUNGLADES I DOMINA EL RÀNQUING' : language === 'es' ? 'CONSIGUE TROFEOS Y ESCALA LIGAS' : 'COLLECT TROPHIES & DOMINATE THE WORLD LEADERBOARD'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container split-layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: PLAYER TROPHY PROGRESS AND LEAGUE INFO */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="bg-black/40 border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full" />
              
              <span className="text-[8px] font-black tracking-[0.25em] text-cyan-400 font-mono uppercase mb-2">
                {language === 'ca' ? 'EL TEU PERFIL RECONEGUT' : language === 'es' ? 'TU PERFIL RECONOCIDO' : 'YOUR COMPETITIVE PROFILE'}
              </span>

              {/* Editing Player Name */}
              {isEditing ? (
                <div className="flex gap-1.5 w-full max-w-[200px] mb-3">
                  <input
                    type="text"
                    value={currPlayerName}
                    onChange={(e) => setCurrPlayerName(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 px-2.5 py-1 text-xs text-white rounded font-mono"
                    placeholder="racer name..."
                    maxLength={16}
                  />
                  <button
                    onClick={handleSaveName}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[9px] px-2.5 py-1 rounded cursor-pointer transition uppercase"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 justify-center mb-3">
                  <h3 className="text-base font-black uppercase text-white tracking-wide">
                    {currPlayerName}
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[8px] font-mono font-bold text-zinc-500 hover:text-cyan-400 transition-all uppercase px-1 rounded border border-zinc-800"
                  >
                    {language === 'ca' ? 'Editar' : language === 'es' ? 'Editar' : 'Edit'}
                  </button>
                </div>
              )}

              {/* GIANT COUNT */}
              <div className="text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-1">
                <span>{playerTrophies}</span>
                <span className="text-yellow-500 text-2xl">🏆</span>
              </div>

              {/* CURRENT LEAGUE */}
              <div className={`mt-4 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${playerLeague.color}`}>
                {playerLeague.icon} {playerLeague.name}
              </div>

              <span className="text-[10px] text-zinc-400 mt-2 block font-mono max-w-[180px] leading-relaxed">
                {playerLeague.desc}
              </span>
            </div>

            {/* LEAGUE TIER THRESHOLDS RULE BOOK */}
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono border-b border-zinc-900 pb-1.5">
                🎖️ {language === 'ca' ? 'ESTRUCTURA DE RANGE DE LLES LLIGUES' : language === 'es' ? 'ESTRUCTURA DE LIGAS ADMITIDAS' : 'LIGA CARS DIVISION PROGRESSION'}
              </h4>

              <div className="space-y-1.5 text-[10px] leading-none font-mono">
                <div className="flex justify-between items-center text-amber-400">
                  <span>👑 CHAMPION</span>
                  <span className="font-extrabold">2000+ KP</span>
                </div>
                <div className="flex justify-between items-center text-cyan-400">
                  <span>💎 DIAMOND</span>
                  <span className="font-extrabold">1000 - 1999 KP</span>
                </div>
                <div className="flex justify-between items-center text-yellow-400">
                  <span>🟨 GOLD</span>
                  <span className="font-extrabold">500 - 999 KP</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span>⬜ SILVER</span>
                  <span className="font-extrabold">200 - 499 KP</span>
                </div>
                <div className="flex justify-between items-center text-orange-500">
                  <span>🟫 BRONZE</span>
                  <span className="font-extrabold">0 - 199 KP</span>
                </div>
              </div>

              <div className="text-[9px] text-zinc-500 font-mono leading-relaxed mt-2 pt-2 border-t border-zinc-900">
                ⚠️ {language === 'ca' ? 'PARTITS COMPÈTIFS: Guanyar atorga +10🏆, perdre resta -5🏆, empatar dona 0🏆.' : language === 'es' ? 'CONDICIONES: Victoria otorga +10🏆, derrota resta -5🏆, empate otorga 0🏆.' : 'MATCH TRAJECTORY: Victories grant +10🏆, defeats deduct -5🏆, draws yield 0🏆.'}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LEADERBOARD MAIN LIST */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden shadow-md flex-1 flex flex-col">
              <div className="bg-black/55 px-4 py-2.5 border-b border-white/5 flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                <span>{language === 'ca' ? 'POSICIÓ PILOT' : language === 'es' ? 'POSICIÓN PILOTO' : 'PILOT RANK POSITION'}</span>
                <span>🏆 {language === 'ca' ? 'TROFEUS' : language === 'es' ? 'TROFEOS' : 'TROPHIES'} / {language === 'ca' ? 'LLIGA' : language === 'es' ? 'LIGA' : 'LEAGUE'}</span>
              </div>

              <div className="divide-y divide-white/5 overflow-y-auto max-h-[380px] flex-1">
                {combinedLeagues.map((entry, idx) => {
                  const entryLeague = getLeagueInfo(entry.trophies, (language || 'en') as Language);
                  const isUser = entry.isPlayer;

                  return (
                    <div
                      key={`${entry.name}-${idx}`}
                      className={`px-4 py-3 flex items-center justify-between gap-3 text-xs ${
                        isUser
                          ? 'bg-cyan-500/10 border-y border-cyan-500/25/15 shadow-[inset_0_0_15px_rgba(6,182,212,0.05)]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Leaderboard numbers styling */}
                        <span className={`w-6 font-mono text-xs font-black text-center ${
                          idx === 0 ? 'text-yellow-500 text-sm' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-orange-500' : 'text-zinc-650'
                        }`}>
                          {idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : `${idx + 1}`}
                        </span>

                        <span className={`font-black uppercase truncate max-w-[150px] ${isUser ? 'text-cyan-400 font-extrabold' : 'text-zinc-350'}`}>
                          {entry.name}
                          {isUser && <span className="text-[8px] font-mono font-bold text-cyan-500 border border-cyan-500/20 px-1 ml-1.5 rounded bg-cyan-950/20">YOU</span>}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 self-stretch select-none">
                        {/* Trophies badge */}
                        <span className="font-mono font-extrabold text-zinc-200">
                          {entry.trophies} <span className="text-[10px] text-zinc-500">🏆</span>
                        </span>

                        {/* Lean League Tag */}
                        <span className={`text-[8px] font-mono leading-none tracking-widest uppercase font-black py-1 px-2.5 rounded-full border shrink-0 ${entryLeague.color.replace('shadow-[0_0_15px_rgba(251,191,36,0.25)]', '')}`}>
                          {entryLeague.name.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
