import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Volume2, VolumeX, Shield, Zap, Keyboard, Film, Sparkles, Coins, X } from 'lucide-react';
import { sounds } from '../audio';
import { SavedReplay, GameMode } from '../types';
import { ReplayTheatre } from './ReplayTheatre';
import { GarageMarket } from './GarageMarket';

interface MainMenuProps {
  onStartGame: (mode: GameMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  savedReplays: SavedReplay[];
  onPlayReplay: (replay: SavedReplay) => void;
  onDeleteReplay: (id: string) => void;
  coins: number;
  onBuyCar: (modelId: string, price: number) => void;
  unlockedModels: string[];
  blueConfig: { model: string; primary: string; secondary: string; decal?: string };
  redConfig: { model: string; primary: string; secondary: string; decal?: string };
  onUpdateBlueConfig: (config: { model: string; primary: string; secondary: string; decal?: string }) => void;
  onUpdateRedConfig: (config: { model: string; primary: string; secondary: string; decal?: string }) => void;
  unlockedPalettes: string[];
  onBuyPalette: (paletteName: string, price: number) => void;
  unlockedDecals: string[];
  onBuyDecal: (decalId: string, price: number) => void;
  selectedStadium: string;
  onSelectStadium: (stadiumId: string) => void;
}

export interface Stadium {
  id: string;
  name: string;
  description: string;
  primaryBg: string; // pitch ground
  accentLine: string; // boundary and center circle lines color
  ambientVibe: 'green' | 'space' | 'rust' | 'ice' | 'cyber';
  image: string;
}

export const STADIUMS: Stadium[] = [
  { id: 'emerald', name: 'Emerald Meadows', description: 'Traditional vibrant grass lawn pitch with solar daylight beams.', primaryBg: '#15803d', accentLine: '#22c55e', ambientVibe: 'green', image: '/src/assets/images/map_emerald_1780745493797.png' },
  { id: 'cosmic', name: 'Zenith Orbit', description: 'Floating deep space spaceboard surrounded by orbiting meteor particles.', primaryBg: '#090911', accentLine: '#38bdf8', ambientVibe: 'space', image: '/src/assets/images/map_cosmic_1780745509552.png' },
  { id: 'rustlands', name: 'Rustlands Refinery', description: 'Desert outpost field paved with hot copper iron slabs and industrial exhausts.', primaryBg: '#541c0c', accentLine: '#f97316', ambientVibe: 'rust', image: '/src/assets/images/map_rustlands_1780745542907.png' },
  { id: 'frozen', name: 'Glacier Stream', description: 'Frozen deep azure sheets glazed in slippery snowflakes and snowbanks.', primaryBg: '#1e3a8a', accentLine: '#60a5fa', ambientVibe: 'ice', image: '/src/assets/images/map_frozen_1780745525981.png' },
  { id: 'cyber', name: 'Silicon Sector 404', description: 'Matrix neon digital grid lacing pulsing binary tracks and electronic bypasses.', primaryBg: '#020617', accentLine: '#10b981', ambientVibe: 'cyber', image: '/src/assets/images/map_cyber_1780745560317.png' },
  { id: 'tokyo', name: 'Neo Tokyo Grid', description: 'Retro-synthwave sunset grid surrounded by high-tech neon skyline holograms.', primaryBg: '#11052c', accentLine: '#ff007f', ambientVibe: 'cyber', image: '/src/assets/images/map_tokyo.png' },
  { id: 'lava', name: 'Volcanic Caldera', description: 'Suspended rock platform floating over churning, fluorescent pink-violet plasma streams.', primaryBg: '#150020', accentLine: '#d946ef', ambientVibe: 'space', image: '/src/assets/images/map_lava.png' },
  { id: 'vaporwave', name: 'Vaporwave Beach', description: 'Sun-drenched neon grid field on a nostalgic digital beach with pastel palm silhouettes.', primaryBg: '#1e0b36', accentLine: '#06b6d4', ambientVibe: 'cyber', image: 'https://picsum.photos/seed/vaporwave/400/400' },
  { id: 'temple', name: 'Aether Temple', description: 'An ancient ruins stadium crafted from gold-veined marble slabs, illuminated by sacred amber runes.', primaryBg: '#2d1a04', accentLine: '#fbbf24', ambientVibe: 'rust', image: 'https://picsum.photos/seed/temple/400/400' },
  { id: 'biodome', name: 'Bio-Dome Habitat', description: 'Sleek hydroponic dome pitch layered with luminescent emerald moss channels and forest fireflies.', primaryBg: '#041d11', accentLine: '#10b981', ambientVibe: 'green', image: 'https://picsum.photos/seed/biodome/400/400' }
];

const renderMiniPitchPreview = (stadiumId: string) => {
  if (stadiumId === 'emerald') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#0e4626] flex items-center justify-center">
        {/* Striped patterns */}
        <div className="absolute inset-0 flex">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-full"
              style={{ backgroundColor: idx % 2 === 0 ? 'rgba(11, 56, 32, 0.45)' : 'rgba(15, 82, 45, 0.25)' }}
            />
          ))}
        </div>
        {/* Pitch lines */}
        <div className="absolute inset-2 border border-white/20 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/15 -translate-x-1/2" />
          <div className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center">
            <div className="w-1 h-1 bg-white/15 rounded-full" />
          </div>
          {/* Goal crease */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-2.5 border-r border-t border-b border-white/15" />
          <div className="absolute right-0 top-1/4 bottom-1/4 w-2.5 border-l border-t border-b border-white/15" />
        </div>
        {/* Spotlight cones */}
        <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-white/[0.04] blur-sm pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white/[0.04] blur-sm pointer-events-none" />
      </div>
    );
  } else if (stadiumId === 'cosmic') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#050409] flex items-center justify-center">
        {/* Starfields */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1 left-4 w-0.5 h-0.5 bg-white rounded-full" />
          <div className="absolute top-4 right-4 w-[1px] h-[1px] bg-white rounded-full" />
          <div className="absolute bottom-2 left-2 w-[1px] h-[1px] bg-sky-300 rounded-full" />
          <div className="absolute top-2 right-6 w-[1.5px] h-[1.5px] bg-white rounded-full animate-pulse" />
        </div>
        {/* Nebula violet glow */}
        <div className="absolute w-12 h-12 bg-purple-600/10 rounded-full blur-md" />
        {/* Orbit circle */}
        <div className="absolute inset-2 border border-sky-400/25 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-sky-400/15 -translate-x-1/2" />
          <div className="w-5 h-5 rounded-full border border-sky-400/20 flex items-center justify-center">
            <div className="absolute w-7 h-1.5 border border-sky-500/20 rounded-full transform -rotate-12" />
          </div>
        </div>
      </div>
    );
  } else if (stadiumId === 'rustlands') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#2a0c02] flex items-center justify-center">
        {/* Hot copper segments */}
        <div className="absolute inset-0 flex flex-col">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="flex-1 w-full border-b border-orange-950/25"
              style={{ backgroundColor: idx % 2 === 0 ? 'rgba(58, 16, 5, 0.4)' : 'rgba(84, 28, 12, 0.25)' }}
            />
          ))}
        </div>
        <div className="absolute inset-2 border border-orange-500/25 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-orange-500/15 -translate-x-1/2" />
          <div className="w-5 h-5 rounded-full border border-orange-500/15 flex items-center justify-center" />
        </div>
        <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-600/15 rounded-br" />
        <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-600/15 rounded-bl" />
      </div>
    );
  } else if (stadiumId === 'frozen') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#071630] flex items-center justify-center">
        {/* Blue glacier strips */}
        <div className="absolute inset-0 flex">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-full"
              style={{ backgroundColor: idx % 2 === 0 ? 'rgba(10, 35, 77, 0.55)' : 'rgba(19, 58, 118, 0.3)' }}
            />
          ))}
        </div>
        <div className="absolute top-1 left-2 w-5 h-[1px] bg-white/10 transform rotate-12" />
        <div className="absolute bottom-3 right-1 w-7 h-[1px] bg-white/10 transform -rotate-45" />
        <div className="absolute inset-2 border border-blue-300/25 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-blue-300/15 -translate-x-1/2" />
          <div className="w-5 h-5 rounded-full border border-blue-300/20 flex items-center justify-center" />
        </div>
      </div>
    );
  } else if (stadiumId === 'cyber') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#020512] flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:6px_6px]" />
        <div className="absolute inset-2 border border-emerald-500/30 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/20 -translate-x-1/2" />
          <div className="w-5 h-5 rounded-full border border-emerald-500/25 flex items-center justify-center">
            <div className="w-1 h-1 bg-emerald-400/40 rounded-full" />
          </div>
        </div>
      </div>
    );
  } else if (stadiumId === 'tokyo') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#1a082e] flex items-center justify-center">
        {/* Retro scanlines or sunset glows */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-pink-500/25 to-transparent" />
        <div className="absolute inset-2 border border-pink-500/30 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-pink-500/25 -translate-x-1/2" />
          <div className="w-5 h-5 rounded-full border border-pink-500/35 flex items-center justify-center">
            <div className="absolute w-7 h-[1px] bg-yellow-400/30" />
          </div>
        </div>
      </div>
    );
  } else if (stadiumId === 'lava') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#150020] flex items-center justify-center">
        {/* Plasma/Lava cracks preview */}
        <div className="absolute bottom-1 left-2 w-6 h-6 rounded-full bg-fuchsia-600/20 blur-sm animate-pulse" />
        <div className="absolute top-2 right-4 w-4 h-4 rounded-full bg-pink-500/20 blur-sm animate-pulse" />
        <div className="absolute inset-2 border border-fuchsia-500/35 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-fuchsia-500/25 -translate-x-1/2" />
          <div className="w-5 h-5 rounded-full border border-fuchsia-500/30 flex items-center justify-center" />
        </div>
      </div>
    );
  } else if (stadiumId === 'vaporwave') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#1e0b36] flex items-center justify-center">
        {/* Cyber sunset and palm profile */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-cyan-500/25 via-pink-500/15 to-transparent" />
        <div className="absolute w-7 h-7 rounded-full bg-pink-500/25 top-1 right-2 blur-[1px]" />
        <div className="absolute inset-2 border border-cyan-400/30 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-400/20 -translate-x-1/2" />
          <div className="w-5 h-5 rounded-full border border-cyan-400/25 flex items-center justify-center" />
        </div>
      </div>
    );
  } else if (stadiumId === 'temple') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#2d1a04] flex items-center justify-center">
        {/* Ancient sands & runic runes */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(245,158,11,0.08)_2px,transparent_2px)] bg-[size:10px_10px]" />
        <div className="absolute inset-2 border border-amber-500/35 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-500/25 -translate-x-1/2" />
          <div className="w-5 h-5 rounded-full border border-amber-500/30 flex items-center justify-center" />
        </div>
      </div>
    );
  } else if (stadiumId === 'biodome') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#041d11] flex items-center justify-center">
        {/* Luminescent mossy spores preview */}
        <div className="absolute inset-0 bg-[#052817]" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)', opacity: 0.3 }} />
        <div className="absolute w-1 h-1 bg-emerald-400 rounded-full top-2 left-4 animate-ping" />
        <div className="absolute w-1 h-1 bg-emerald-400 rounded-full bottom-3 right-6 animate-ping" />
        <div className="absolute inset-2 border border-emerald-500/30 rounded-md flex items-center justify-center">
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/20 -translate-x-1/2" />
          <div className="w-5 h-5 rounded-full border border-emerald-500/25 flex items-center justify-center" />
        </div>
      </div>
    );
  }
  return <div className="w-full h-full bg-[#050505]" />;
};

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
  savedReplays,
  onPlayReplay,
  onDeleteReplay,
  coins,
  onBuyCar,
  unlockedModels,
  blueConfig,
  redConfig,
  onUpdateBlueConfig,
  onUpdateRedConfig,
  unlockedPalettes,
  onBuyPalette,
  unlockedDecals,
  onBuyDecal,
  selectedStadium,
  onSelectStadium,
}) => {
  const [isTheatreOpen, setIsTheatreOpen] = useState(false);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  return (
    <div id="main-menu-overlay" className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]/98 backdrop-blur-xl px-4 overflow-y-auto">
      {/* Background ambient lighting effects to replicate the cosmic look */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative immersive top grid or elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60 pointer-events-none" />

      {/* Title with Immersive UI Display Typography and Styling */}
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-12 max-w-2xl relative z-10"
      >
        <div className="font-sans text-[11px] font-black tracking-[0.45em] text-cyan-400 bg-cyan-950/40 px-5 py-2.5 rounded-full border border-cyan-500/20 uppercase mb-5 shadow-[0_0_20px_rgba(34,211,238,0.15)] inline-block animate-pulse">
          ⚡ ROCKET LEAGUE 2 PLAYERS ⚡
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold italic tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-yellow-200 to-red-400 drop-shadow-[0_4px_25px_rgba(255,255,255,0.15)] font-sans">
          ROCKET LEAGUE 2 PLAYERS
        </h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-zinc-400 to-red-500 font-black tracking-[0.4em] uppercase text-sm mt-3">
          1VS1 ARCADE DUEL
        </div>

        <p className="text-slate-400 text-xs md:text-sm mt-5 max-w-md mx-auto leading-relaxed">
          ROCKET LEAGUE 2 PLAYERS. Boost, drift, strike and flip straight into the goal cages!
        </p>
      </motion.div>

      {/* Main Action area matching Immersive UI starts here */}
      <div className="flex flex-col items-center gap-4 relative z-10 w-full max-w-lg">
        
        {/* Game Mode Launcher Columns */}
        <div className="w-full flex flex-col gap-3.5 mb-1 bg-black/30 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
          {/* Mode A: same_laptop */}
          <button
            onClick={() => {
              sounds.playCountdownBeep(true);
              onStartGame('same_laptop');
            }}
            className="w-full group relative bg-[#020202] border border-zinc-800 hover:border-blue-500/50 text-white px-5 py-3.5 overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between shadow-[0_4px_24px_rgba(59,130,246,0.02)]"
          >
            <div className="flex flex-col items-start text-left z-10">
              <span className="font-mono text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">LOCAL MULTIPLAYER</span>
              <span className="font-black uppercase italic tracking-wide text-sm leading-tight text-white group-hover:text-blue-400">1VS1 SAME LAPTOP</span>
              <span className="text-[10px] text-zinc-500 font-medium">Standard keyboard duel controls for P1 & P2</span>
            </div>
            <div className="relative z-10 w-7 h-7 rounded-full border border-zinc-800 group-hover:border-blue-500/50 flex items-center justify-center shrink-0">
              <Play className="w-3.5 h-3.5 fill-blue-400/10 text-blue-400 ml-0.5" />
            </div>
            <div className="absolute top-0 right-0 h-full w-0 bg-blue-500 group-hover:w-2 transition-all"></div>
          </button>

          {/* Mode B: vs_bot */}
          <button
            onClick={() => {
              sounds.playCountdownBeep(true);
              onStartGame('vs_bot');
            }}
            className="w-full group relative bg-[#020202] border border-zinc-800 hover:border-violet-500/50 text-white px-5 py-3.5 overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between shadow-[0_4px_24px_rgba(139,92,246,0.02)]"
          >
            <div className="flex flex-col items-start text-left z-10">
              <span className="font-mono text-[9px] font-bold text-violet-400 uppercase tracking-widest leading-none mb-1">CHALLENGE ARENA</span>
              <span className="font-black uppercase italic tracking-wide text-sm leading-tight text-white group-hover:text-violet-400">1VS1 VS SKILLED BOT</span>
              <span className="text-[10px] text-zinc-500 font-medium">Test your skills against an advanced autopilot driver</span>
            </div>
            <div className="relative z-10 w-7 h-7 rounded-full border border-zinc-800 group-hover:border-violet-500/50 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 fill-violet-400 text-violet-400 animate-pulse" />
            </div>
            <div className="absolute top-0 right-0 h-full w-0 bg-violet-500 group-hover:w-2 transition-all"></div>
          </button>

          {/* Mode C: bot_vs_bot */}
          <button
            onClick={() => {
              sounds.playCountdownBeep(true);
              onStartGame('bot_vs_bot');
            }}
            className="w-full group relative bg-[#020202] border border-zinc-800 hover:border-red-500/50 text-white px-5 py-3.5 overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between shadow-[0_4px_24px_rgba(239,68,68,0.02)]"
          >
            <div className="flex flex-col items-start text-left z-10">
              <span className="font-mono text-[9px] font-bold text-red-500 uppercase tracking-widest leading-none mb-1">SPECTATE AUTO-SIM</span>
              <span className="font-black uppercase italic tracking-wide text-sm leading-tight text-white group-hover:text-red-400">1VS1 BOT VS BOT</span>
              <span className="text-[10px] text-zinc-500 font-medium">Observe dynamic tactical simulated auto play</span>
            </div>
            <div className="relative z-10 w-7 h-7 rounded-full border border-zinc-800 group-hover:border-red-500/50 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div className="absolute top-0 right-0 h-full w-0 bg-red-500 group-hover:w-2 transition-all"></div>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {/* Custom Garage & Shop Button with glowing amber aesthetics */}
          <button
            onClick={() => {
              sounds.playCountdownBeep(true);
              setIsGarageOpen(true);
            }}
            className="group relative bg-zinc-950 border border-zinc-850 hover:border-amber-500/50 text-zinc-300 hover:text-white p-3 overflow-hidden transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider font-mono shadow-[0_4px_20px_rgba(245,158,11,0.02)] rounded-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:text-amber-300 group-hover:animate-spin" />
            <span className="relative z-10 leading-none">Garage Shop</span>
            <span className="bg-amber-500/10 border border-amber-500/25 text-amber-400 px-1 py-0.5 rounded text-[7px] font-mono shrink-0 mt-0.5 leading-none">
              {coins}¢
            </span>
          </button>

          {/* Replay Theatre Button with glowing purple aesthetics */}
          <button
            onClick={() => {
              sounds.playCountdownBeep(true);
              setIsTheatreOpen(true);
            }}
            className="group relative bg-zinc-950 border border-zinc-850 hover:border-violet-500/50 text-zinc-300 hover:text-white p-3 overflow-hidden transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider font-mono rounded-xl"
          >
            <Film className="w-4 h-4 text-violet-400 group-hover:text-violet-300 transition-all" />
            <span className="relative z-10 leading-none">Replays</span>
            {savedReplays.length > 0 ? (
              <span className="bg-violet-500 text-white font-mono text-[7px] font-black px-1 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.6)] shrink-0 mt-0.5 leading-none">
                {savedReplays.length} files
              </span>
            ) : (
              <span className="text-[7px] text-zinc-600 font-mono shrink-0 mt-0.5 leading-none">Empty</span>
            )}
          </button>

          {/* Drive Instructions Button with glowing blue aesthetics */}
          <button
            onClick={() => {
              sounds.playCountdownBeep(true);
              setIsInstructionsOpen(true);
            }}
            className="group relative bg-zinc-950 border border-zinc-850 hover:border-blue-500/50 text-zinc-300 hover:text-white p-3 overflow-hidden transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider font-mono rounded-xl"
          >
            <Keyboard className="w-4 h-4 text-blue-400 group-hover:animate-bounce" />
            <span className="relative z-10 leading-none">Instructions</span>
            <span className="text-[7px] text-zinc-500 font-mono shrink-0 mt-0.5 leading-none">How to play</span>
          </button>
        </div>

        {/* Stadium Arena Choice list panel */}
        <div className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3 mt-1 text-left">
          <span className="font-mono text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none">CHOOSE ARENA PITCH</span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full">
            {STADIUMS.map((stadium) => {
              const active = selectedStadium === stadium.id;
              return (
                <button
                  key={stadium.id}
                  onClick={() => {
                    sounds.playBoost();
                    onSelectStadium(stadium.id);
                  }}
                  className={`p-1 flex flex-col items-stretch rounded-xl border text-left transition-all relative cursor-pointer overflow-hidden group ${
                    active
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.15)] bg-opacity-90'
                      : 'bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                  }`}
                >
                  <div className="w-full h-14 rounded-lg overflow-hidden mb-1.5 relative border border-black/30">
                    {renderMiniPitchPreview(stadium.id)}
                    <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                  
                  <div className="px-1.5 pb-1">
                    <span className="text-[9px] font-black uppercase italic tracking-wide block leading-none truncate">{stadium.name}</span>
                    <span className="text-[7px] text-zinc-500 block font-mono mt-1 uppercase leading-none">{stadium.ambientVibe} Vibe</span>
                  </div>
                  {active && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Practice Drills & Sandbox Gym */}
        <div className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3 mt-1 text-left">
          <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">⚽ DRILLS & PRACTICE GYM</span>
          <div className="grid grid-cols-2 gap-3.5 w-full">
            <button
              onClick={() => {
                sounds.playCountdownBeep(true);
                onStartGame('free_practice');
              }}
              className="group relative bg-[#020202] border border-zinc-800 hover:border-emerald-500/50 text-white p-4 overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between rounded-xl"
            >
              <div className="flex flex-col items-start text-left z-10">
                <span className="font-mono text-[8px] font-bold text-emerald-400 uppercase tracking-widest leading-none mb-1">FREE PRACTICE</span>
                <span className="font-black uppercase italic tracking-wide text-xs leading-none text-white group-hover:text-emerald-400">SANDBOX TRAINING</span>
                <p className="text-[8.5px] text-zinc-500 font-medium mt-1 leading-none">Drive and strike ball without defenders</p>
              </div>
              <div className="relative z-10 w-7 h-7 rounded-full border border-zinc-800 group-hover:border-emerald-500/50 flex items-center justify-center shrink-0">
                <Play className="w-3 h-3 text-emerald-400" />
              </div>
            </button>

            <button
              onClick={() => {
                sounds.playCountdownBeep(true);
                onStartGame('machine_practice');
              }}
              className="group relative bg-[#020202] border border-zinc-800 hover:border-amber-500/50 text-white p-4 overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between rounded-xl"
            >
              <div className="flex flex-col items-start text-left z-10">
                <span className="font-mono text-[8px] font-bold text-amber-500 uppercase tracking-widest leading-none mb-1">DEFENSE & PASS MACHINE</span>
                <span className="font-black uppercase italic tracking-wide text-xs leading-none text-white group-hover:text-amber-400">AUTOMATIC LAUNCHER</span>
                <p className="text-[8.5px] text-zinc-500 font-medium mt-1 leading-none">Deflect and intercept balls fired by launcher</p>
              </div>
              <div className="relative z-10 w-7 h-7 rounded-full border border-zinc-800 group-hover:border-amber-500/50 flex items-center justify-center shrink-0">
                <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              </div>
            </button>
          </div>
        </div>

        {/* Support audio controls toggle */}
        <button
          onClick={onToggleMute}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-mono uppercase tracking-wider mt-1"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-red-400" />
              <span>Sounds Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-green-400" />
              <span>Audio System Active</span>
            </>
          )}
        </button>
      </div>

      {/* Render Replay Theatre dialog */}
      <ReplayTheatre
        isOpen={isTheatreOpen}
        onClose={() => setIsTheatreOpen(false)}
        savedReplays={savedReplays}
        onPlayReplay={(replay) => {
          setIsTheatreOpen(false);
          onPlayReplay(replay);
        }}
        onDeleteReplay={onDeleteReplay}
      />

      {/* Render Garage and Shop dialog */}
      <GarageMarket
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        coins={coins}
        onBuyCar={onBuyCar}
        unlockedModels={unlockedModels}
        blueConfig={blueConfig}
        redConfig={redConfig}
        onUpdateBlueConfig={onUpdateBlueConfig}
        onUpdateRedConfig={onUpdateRedConfig}
        unlockedPalettes={unlockedPalettes}
        onBuyPalette={onBuyPalette}
        unlockedDecals={unlockedDecals}
        onBuyDecal={onBuyDecal}
      />

      {/* DRIVING & ABILITY INSTRUCTIONS OVERLAY */}
      {isInstructionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col justify-between max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20 px-6">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-black italic uppercase text-white tracking-wider">Drive steering & vehicle perks</h3>
              </div>
              <button
                onClick={() => {
                  sounds.playCountdownBeep(false);
                  setIsInstructionsOpen(false);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body layout */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar text-left text-zinc-350">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Team Blue drive */}
                <div className="bg-blue-950/10 border border-blue-500/15 rounded-xl p-4">
                  <span className="font-mono text-[8px] font-black tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/15 uppercase">TEAM BLUE (P1) CONTROLS</span>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-white bg-blue-500/20 border border-blue-500/35 px-2 py-1 rounded">W / A / S / D</span>
                    <span className="text-xs text-zinc-400 leading-normal">Steer Left/Right, Accelerate forwards, Reverse brake. Auto Speed Boost.</span>
                  </div>
                </div>

                {/* Team Red drive */}
                <div className="bg-red-950/10 border border-red-500/15 rounded-xl p-4">
                  <span className="font-mono text-[8px] font-black tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/15 uppercase">TEAM RED (P2) CONTROLS</span>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-white bg-red-500/20 border border-red-500/35 px-2 py-1 rounded">↑ / ← / ↓ / →</span>
                    <span className="text-xs text-zinc-400 leading-normal">Steer Left/Right, Accelerate forwards, Reverse brake. Auto Speed Boost.</span>
                  </div>
                </div>

              </div>

              {/* Rarity and Passive abilities description list */}
              <div className="border-t border-zinc-900 pt-5 space-y-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">CHASSIS PASSIVE COMBAT ABILITIES</span>
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div className="bg-zinc-900/30 border border-zinc-850 p-2.5 rounded-lg">
                    <strong className="text-slate-400 italic font-black uppercase">Interstellar (Special)</strong>
                    <p className="text-zinc-400 mt-0.5 text-[10.5px]">Standard rocket build. Balanced handling weight ratio for traditional pitch control.</p>
                  </div>
                  
                  <div className="bg-zinc-900/30 border border-zinc-850 p-2.5 rounded-lg">
                    <strong className="text-cyan-400 italic font-black uppercase">The Beast (Rare)</strong>
                    <p className="text-zinc-400 mt-0.5 text-[10.5px]">Heavier ram frame. Hits the ball with massive extra kinetic impact speed on direct collisions.</p>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-850 p-2.5 rounded-lg">
                    <strong className="text-purple-400 italic font-black uppercase">Spectre F1 (Epic)</strong>
                    <p className="text-zinc-400 mt-0.5 text-[10.5px]">Aerodynamic wing setup. Has increased maximum speed levels when using orange golden boost pads.</p>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-850 p-2.5 rounded-lg">
                    <strong className="text-fuchsia-400 italic font-black uppercase">Cyberspace (Mythic)</strong>
                    <p className="text-zinc-400 mt-0.5 text-[10.5px]">Advanced electronic traction. Offers much higher tyre grip and tighter maneuverability ratios.</p>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-850 p-2.5 rounded-lg">
                    <strong className="text-amber-400 italic font-black uppercase">Phantom GT (Legendary)</strong>
                    <p className="text-zinc-400 mt-0.5 text-[10.5px]">Frictionless underglow. Recover and start accelerating instantly from static positions with minimal drag.</p>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-850 p-2.5 rounded-lg">
                    <strong className="text-red-400 italic font-black uppercase">Phoenix VTOL (UltraLegendary)</strong>
                    <p className="text-zinc-400 mt-0.5 text-[10.5px]">Supercharged fuel burner. Extends the high-energy boost duration length by 50% for maximum propulsion.</p>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-850 p-2.5 rounded-lg">
                    <strong className="text-emerald-400 italic font-black uppercase">Infinity Void (Secret)</strong>
                    <p className="text-zinc-400 mt-0.5 text-[10.5px]">Sub-atomic exhaust streams. Ultimate chassis specs - has maximum top acceleration speed and hyper maneuverability.</p>
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-900/10 text-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-6 shrink-0 leading-none">
              Deduce passive tactics depending on your custom garage chassis choice
            </div>
          </motion.div>
        </div>
      )}


      {/* Subtle tips footer */}
      <div className="mt-14 text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> First to 5 Goals wins</span>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Golden Boost Pads</span>
        </div>
        <p className="opacity-50">Press [P] to Pause • [R] to Reset</p>
      </div>
    </div>
  );
};
