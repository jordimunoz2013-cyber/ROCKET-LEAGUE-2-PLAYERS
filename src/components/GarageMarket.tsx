import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Sparkles, Check, Lock, Star, Eye, Shield, Zap, Flame } from 'lucide-react';
import { sounds } from '../audio';

export interface CarPalette {
  name: string;
  primary: string;
  secondary: string;
  price: number;
  rarity: 'Special' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary' | 'UltraLegendary' | 'Secret';
}

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stats: {
    speed: number;
    handling: number;
    weight: number;
  };
  svgPath: string; // for rendering a vector preview of the nose/wings in cards
  imageSrc: string;
  rarity: 'Special' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary' | 'UltraLegendary' | 'Secret';
}

export const MARKET_ITEMS: MarketItem[] = [
  {
    id: 'beast',
    name: 'The Beast',
    description: 'A heavy armored chassis featuring dual reinforce bumpers and solid square wheels. Brutal ram force.',
    price: 25,
    stats: { speed: 4, handling: 3, weight: 5 },
    svgPath: 'M 10 20 L 70 20 L 70 40 L 10 40 Z',
    imageSrc: '/src/assets/images/car_beast_1780657747389.png',
    rarity: 'Rare'
  },
  {
    id: 'spectre',
    name: 'Spectre F1',
    description: 'Formula-class streamline bullet with advanced rear stabilizing wings and swept air-intakes.',
    price: 100,
    stats: { speed: 5, handling: 5, weight: 2 },
    svgPath: 'M 10 30 L 45 10 L 60 10 L 80 30 L 60 50 L 45 50 Z',
    imageSrc: '/src/assets/images/car_spectre_1780657762621.png',
    rarity: 'Epic'
  },
  {
    id: 'cyber',
    name: 'Cyberspace',
    description: 'Brutalist exoskeleton racer. Fitted with wrap-around lightbars and composite solar polymer frame.',
    price: 250,
    stats: { speed: 5, handling: 4, weight: 3 },
    svgPath: 'M 10 20 L 40 10 L 80 30 L 40 50 Z',
    imageSrc: '/src/assets/images/car_cyber_1780657774963.png',
    rarity: 'Mythic'
  },
  {
    id: 'phantom',
    name: 'Phantom GT',
    description: 'Quantum advanced stealth model. Features translucent active nanotech stabilizer wings and neon underglow outline layers for ultimate aerodynamic slip.',
    price: 400,
    stats: { speed: 5, handling: 5, weight: 4 },
    svgPath: 'M 10 30 L 30 15 L 75 25 L 85 45 Z',
    imageSrc: '/src/assets/images/car_phantom.png',
    rarity: 'Legendary'
  },
  {
    id: 'apex',
    name: 'Apex Interceptor',
    description: 'A heavy racing interceptor muscle chassis equipped with carbon wings and solid frame reinforcement.',
    price: 600,
    stats: { speed: 5, handling: 4, weight: 4 },
    svgPath: 'M 15 20 L 75 25 L 85 50 L 75 75 Z',
    imageSrc: 'https://picsum.photos/seed/apex/400/400',
    rarity: 'Epic'
  },
  {
    id: 'phoenix',
    name: 'Phoenix VTOL',
    description: 'Ultra-class atmospheric hybrid jetcar. Configured with standard delta wing configuration and gold sweeping high-temp solar thermal accents.',
    price: 800,
    stats: { speed: 5, handling: 5, weight: 5 },
    svgPath: 'M 10 15 L 50 10 L 85 45 Z',
    imageSrc: '/src/assets/images/car_phoenix.png',
    rarity: 'UltraLegendary'
  },
  {
    id: 'centurion',
    name: 'Centurion GT-X',
    description: 'Premium heavy titanium-alloy sports muscle machine equipped with high-airflow turbine scoops.',
    price: 1000,
    stats: { speed: 5, handling: 5, weight: 4 },
    svgPath: 'M 15 25 L 45 15 L 75 15 L 85 30 L 75 45 Z',
    imageSrc: 'https://picsum.photos/seed/centurion/400/400',
    rarity: 'Legendary'
  },
  {
    id: 'glacier',
    name: 'Glacier Wolf',
    description: 'Icy tundra racing speedster constructed with hyper-conductive frost alloys and bladed fenders.',
    price: 1050,
    stats: { speed: 5, handling: 5, weight: 3 },
    svgPath: 'M 20 15 L 60 10 L 90 45 Z',
    imageSrc: 'https://picsum.photos/seed/glacier/400/400',
    rarity: 'Legendary'
  },
  {
    id: 'void',
    name: 'Infinity Void',
    description: 'Extraterrestrial dark matter racer. Emits an absolute gravity pull on collision, shifting spatial coordinate vectors.',
    price: 1250,
    stats: { speed: 5, handling: 5, weight: 5 },
    svgPath: 'M 10 30 L 50 10 L 90 30 L 50 50 Z',
    imageSrc: '/src/assets/images/car_void.png',
    rarity: 'Secret'
  },
  {
    id: 'reaper',
    name: 'Grim Reaper',
    description: 'Stealthy nightshade drift beast with carbon-composite sickle spoilers and ominous halogen underglow.',
    price: 1500,
    stats: { speed: 5, handling: 5, weight: 4 },
    svgPath: 'M 10 25 L 90 25 L 50 50 Z',
    imageSrc: 'https://picsum.photos/seed/reaper/400/400',
    rarity: 'Secret'
  },
  {
    id: 'spectre_electro',
    name: 'Spectre Electro',
    description: 'High-voltage pulse supercar. Engineered with dual lightning capacitors, lightning wings, and a hyper-magnetic battery frame.',
    price: 1750,
    stats: { speed: 5, handling: 5, weight: 4 },
    svgPath: 'M 15 20 L 50 12 L 85 20 L 65 35 L 35 35 Z',
    imageSrc: 'https://picsum.photos/seed/spectre/400/400',
    rarity: 'Mythic'
  },
  {
    id: 'nemesis',
    name: 'Nemesis GTS',
    description: 'A dark matter spectral interceptor engineered with active violet light manifolds, heavy thruster exhaust, and space-grade carbon fiber body paneling.',
    price: 2000,
    stats: { speed: 5, handling: 5, weight: 4 },
    svgPath: 'M 10 32 L 60 10 L 90 32 L 60 54 Z',
    imageSrc: 'https://picsum.photos/seed/nemesis/400/400',
    rarity: 'UltraLegendary'
  },
  {
    id: 'classified',
    name: 'Classified X',
    description: 'An ultra-premium hyper-grade experimental rocket prototype. Boasts maximum propulsion output, reactive aerospace wings and adaptive quantum energy exhaust.',
    price: 5000,
    stats: { speed: 5, handling: 5, weight: 5 },
    svgPath: 'M 10 30 L 50 5 L 90 30 L 50 55 Z',
    imageSrc: '/src/assets/images/secret_car_1780745475353.png',
    rarity: 'Secret'
  }
];

export const SHARED_PALETTES: CarPalette[] = [
  { name: 'Cobalt Classic', primary: '#3b82f6', secondary: '#60a5fa', price: 0, rarity: 'Special' },
  { name: 'Crimson Fury', primary: '#ef4444', secondary: '#fb923c', price: 0, rarity: 'Special' },
  { name: 'Cyber Jade', primary: '#10b981', secondary: '#6ee7b7', price: 100, rarity: 'Rare' },
  { name: 'Volcanic Gold', primary: '#b91c1c', secondary: '#facc15', price: 250, rarity: 'Rare' },
  { name: 'Plasma Violet', primary: '#8b5cf6', secondary: '#f472b6', price: 500, rarity: 'Epic' },
  { name: 'Sunset Hot Coral', primary: '#f43f5e', secondary: '#fda4af', price: 750, rarity: 'Epic' },
  { name: 'Neon Spectre', primary: '#4f46e5', secondary: '#a78bfa', price: 1000, rarity: 'Mythic' },
  { name: 'Cosmic Overlord', primary: '#1e1b4b', secondary: '#a855f7', price: 1250, rarity: 'Legendary' },
  { name: 'Valkyrie Cyan', primary: '#06b6d4', secondary: '#f8fafc', price: 1500, rarity: 'Epic' },
  { name: 'Singularity Gold', primary: '#1d4ed8', secondary: '#eab308', price: 1750, rarity: 'UltraLegendary' },
  { name: 'Cyberpunk Cyber', primary: '#f63be6', secondary: '#00ffff', price: 2000, rarity: 'Secret' },
  { name: 'Abyssal Shadow', primary: '#020617', secondary: '#38bdf8', price: 2250, rarity: 'Secret' },
  { name: 'Stellar Flare', primary: '#f97316', secondary: '#ec4899', price: 2500, rarity: 'Secret' }
];

export const BLUE_PALETTES: CarPalette[] = SHARED_PALETTES;
export const RED_PALETTES: CarPalette[] = SHARED_PALETTES;

export const getRarityStyles = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case 'special':
      return { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/25', ring: 'ring-slate-500/10' };
    case 'rare':
      return { text: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/35', ring: 'ring-cyan-500/20' };
    case 'epic':
      return { text: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/35', ring: 'ring-purple-500/20' };
    case 'mythic':
      return { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-500/35', ring: 'ring-fuchsia-500/20' };
    case 'legendary':
      return { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/40', ring: 'ring-amber-500/30' };
    case 'ultralegendary':
      return { text: 'text-red-400 animate-pulse', bg: 'bg-red-500/20', border: 'border-red-500/50', ring: 'ring-red-500/40' };
    case 'secret':
      return { text: 'text-emerald-400 font-extrabold', bg: 'bg-emerald-500/25', border: 'border-emerald-500/60', ring: 'ring-emerald-500/55' };
    default:
      return { text: 'text-slate-450', bg: 'bg-slate-500/10', border: 'border-slate-500/20', ring: 'ring-transparent' };
  }
};

export const renderCardVehiclePreview = (
  itemId: string,
  primaryColor: string = '#f59e0b',
  secondaryColor: string = '#fb7185',
  decal: string = 'none',
  wheelId: string = 'classic'
) => {
  const wheelTheme = {
    classic: { color: '#1e293b', rim: '#475569' },
    cyber: { color: '#090d16', rim: '#00ffff' },
    magma: { color: '#1a0902', rim: '#f97316' },
    frost: { color: '#051821', rim: '#38bdf8' },
    gold_star: { color: '#1f1601', rim: '#fbbf24' },
    classified_drive: { color: '#16021f', rim: '#d946ef' },
  }[wheelId] || { color: '#1e293b', rim: '#475569' };

  const renderSvgWheel = (x: number, y: number) => (
    <g>
      <rect x={x} y={y} width="12" height="6" rx="1.5" fill={wheelTheme.color} stroke="#090d16" strokeWidth="0.5" />
      <rect x={x + 2} y={y + 1} width="8" height="4" rx="1" fill={wheelTheme.rim} />
      {wheelId !== 'classic' && (
        <circle cx={x + 6} cy={y + 3} r="0.8" fill="#ffffff" />
      )}
    </g>
  );

  return (
    <svg className="w-24 h-24 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)] transform rotate-90" viewBox="0 0 100 100">
      {/* Wheels */}
      {renderSvgWheel(25, 15)}
      {renderSvgWheel(63, 15)}
      {renderSvgWheel(25, 79)}
      {renderSvgWheel(63, 79)}

      {/* Chassis body outline depends on model */}
      {itemId === 'beast' ? (
        <>
          <rect x="22" y="22" width="56" height="56" rx="2" fill={primaryColor} stroke="#0f172a" strokeWidth="2.5" />
          <rect x="30" y="24" width="40" height="4" fill={secondaryColor} />
          <rect x="30" y="72" width="40" height="4" fill={secondaryColor} />
          <rect x="42" y="42" width="16" height="16" fill={secondaryColor} />
          <rect x="48" y="38" width="18" height="24" rx="3" fill="#0f172a" stroke={secondaryColor} strokeWidth="1.5" />
          <line x1="48" y1="44" x2="66" y2="44" stroke="#334155" strokeWidth="1.5" />
          <line x1="48" y1="50" x2="66" y2="50" stroke="#334155" strokeWidth="1.5" />
          <rect x="17" y="27" width="5" height="46" fill="#334155" />
        </>
      ) : itemId === 'spectre' ? (
        <>
          <path d="M 22 28 C 30 35, 50 35, 76 45 C 84 48, 84 52, 76 55 C 50 65, 30 65, 22 72 Z" fill={primaryColor} stroke="#111827" strokeWidth="2.5" />
          <path d="M 38 42 L 58 46 L 58 54 L 38 58 Z" fill={secondaryColor} />
          <ellipse cx="50" cy="50" rx="15" ry="9" fill="#0f172a" stroke={secondaryColor} strokeWidth="1.5" />
          <rect x="16" y="24" width="5" height="52" rx="1" fill="#111827" />
          <rect x="13" y="24" width="3" height="10" fill={secondaryColor} />
          <rect x="13" y="66" width="3" height="10" fill={secondaryColor} />
        </>
      ) : itemId === 'cyber' ? (
        <>
          <path d="M 22 26 L 40 20 L 72 23 L 80 40 L 80 60 L 72 77 L 40 80 L 22 74 Z" fill={primaryColor} stroke="#090d16" strokeWidth="2.5" />
          <path d="M 38 32 L 62 32 L 62 68 L 38 68 Z" stroke={secondaryColor} fill="none" strokeWidth="2" />
          <path d="M 44 50 L 52 40 L 60 50 L 52 60 Z" fill="#090d16" stroke={secondaryColor} strokeWidth="1.5" />
          <rect x="17" y="35" width="4" height="30" fill="#0f172a" />
          <rect x="14" y="40" width="3" height="20" fill={secondaryColor} />
        </>
      ) : itemId === 'phantom' ? (
        <>
          <path d="M 22 30 L 45 30 L 71 36 L 82 50 L 71 64 L 45 70 L 22 70 Z" fill={primaryColor} stroke="#2e1065" strokeWidth="2.5" />
          <path d="M 38 42 L 60 50 L 38 58 Z" stroke="#a855f7" fill="none" strokeWidth="2" />
          <rect x="42" y="40" width="18" height="20" rx="4" fill="#1e1b4b" stroke={secondaryColor} strokeWidth="1.5" />
          <rect x="18" y="22" width="4" height="6" fill={secondaryColor} />
          <rect x="18" y="72" width="4" height="6" fill={secondaryColor} />
        </>
      ) : itemId === 'phoenix' ? (
        <>
          <path d="M 25 24 C 40 24, 52 14, 76 50 C 52 86, 40 76, 25 76 Z" fill={primaryColor} stroke="#7c2d12" strokeWidth="2.5" />
          <path d="M 38 38 L 56 50 L 38 62 L 32 50 Z" fill={secondaryColor} />
          <ellipse cx="54" cy="50" rx="14" ry="8" fill="#0f172a" stroke={secondaryColor} strokeWidth="2.5" />
          <circle cx="26" cy="24" r="3" fill="#ef4444" />
          <circle cx="26" cy="76" r="3" fill="#22c55e" />
        </>
      ) : itemId === 'apex' ? (
        <>
          <path d="M 22 25 L 45 20 L 76 25 L 85 50 L 76 75 L 45 80 L 22 75 Z" fill={primaryColor} stroke="#0f171a" strokeWidth="2.5" />
          <rect x="35" y="32" width="30" height="36" fill={secondaryColor} rx="4" />
          <line x1="25" y1="25" x2="80" y2="35" stroke="#0f171a" strokeWidth="1" />
          <line x1="25" y1="75" x2="80" y2="65" stroke="#0f171a" strokeWidth="1" />
          <polygon points="74,35 86,42 86,58 74,65" fill="#334155" stroke={secondaryColor} strokeWidth="1.5" />
        </>
      ) : itemId === 'glacier' ? (
        <>
          <path d="M 22 24 L 40 16 L 68 24 L 84 50 L 68 76 L 40 84 L 22 76 Z" fill={primaryColor} stroke="#0284c7" strokeWidth="2.5" />
          <path d="M 32 30 L 68 50 L 32 70 Z" fill={secondaryColor} opacity="0.8" />
          <ellipse cx="50" cy="50" rx="14" ry="14" fill="#000000" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M 12 18 L 22 28 M 12 82 L 22 72" stroke="#38bdf8" strokeWidth="2" />
        </>
      ) : itemId === 'reaper' ? (
        <>
          <path d="M 22 26 C 30 18, 62 10, 84 50 C 62 90, 30 82, 22 74 Z" fill="#090514" stroke="#ff0055" strokeWidth="3" />
          <polygon points="26,30 52,48 26,66" fill={secondaryColor} />
          <ellipse cx="62" cy="50" rx="9" ry="9" fill="#000000" stroke="#a21caf" strokeWidth="2" />
        </>
      ) : itemId === 'void' ? (
        <>
          <path d="M 22 26 C 22 26, 40 10, 50 10 C 60 10, 78 26, 78 26 L 78 74 C 78 74, 60 90, 50 90 C 40 90, 22 74, 22 74 Z" fill={primaryColor} stroke="#311042" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="13" fill="#030712" stroke={secondaryColor} strokeWidth="3" />
          <ellipse cx="50" cy="50" rx="22" ry="7" stroke={secondaryColor} fill="none" strokeWidth="1.5" transform="rotate(30, 50, 50)" />
          <ellipse cx="50" cy="50" rx="22" ry="7" stroke={secondaryColor} fill="none" strokeWidth="1.5" transform="rotate(-30, 50, 50)" />
        </>
      ) : itemId === 'centurion' ? (
        <>
          {/* Centurion GT-X premium sports body */}
          <path d="M 24 25 L 45 15 L 75 15 L 85 50 L 75 85 L 45 85 L 24 75 Z" fill={primaryColor} stroke="#0f172a" strokeWidth="2.5" />
          <rect x="36" y="24" width="32" height="52" fill={secondaryColor} rx="6" />
          <ellipse cx="52" cy="50" rx="14" ry="18" fill="#1e293b" stroke={secondaryColor} strokeWidth="2" />
          <polygon points="26,30 36,20 32,50 36,80 26,70" fill="#0f171a" stroke={primaryColor} strokeWidth="1" />
        </>
      ) : itemId === 'spectre_electro' ? (
        <>
          {/* Spectre Electro - high voltage supercar */}
          <path d="M 20 28 L 35 18 L 65 18 L 84 50 L 65 82 L 35 82 L 20 72 Z" fill={primaryColor} stroke="#eab308" strokeWidth="2.5" />
          <polygon points="26,32 38,28 35,50 38,72 26,68" fill={secondaryColor} opacity="0.9" />
          <path d="M 45 32 L 65 50 L 45 68 Z" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
          {/* Dual capacitors */}
          <rect x="22" y="24" width="8" height="4" fill="#eab308" />
          <rect x="22" y="72" width="8" height="4" fill="#eab308" />
          {/* Lightning symbol in center */}
          <path d="M 48 44 L 56 38 L 48 48 L 54 48 L 44 62 L 48 50 L 44 50 Z" fill="#facc15" />
        </>
      ) : itemId === 'classified' ? (
        <>
          {/* Real Classified X rocket supercar rendering with high detail and zero placeholder question mark */}
          <path d="M 22 28 L 42 16 L 74 24 L 86 50 L 74 76 L 42 84 L 22 72 L 25 50 Z" fill={primaryColor} stroke="#d946ef" strokeWidth="2.5" />
          <polygon points="32,30 68,50 32,70" fill={secondaryColor} opacity="0.9" />
          <ellipse cx="48" cy="50" rx="16" ry="12" fill="#030712" stroke="#d946ef" strokeWidth="1.5" />
          {/* Side rocket launchers / jet vents */}
          <rect x="23" y="18" width="8" height="6" fill="#e879f9" rx="1" />
          <rect x="23" y="76" width="8" height="6" fill="#e879f9" rx="1" />
          {/* High speed wings */}
          <polygon points="26,18 42,16 35,6" fill="#a855f7" />
          <polygon points="26,82 42,84 35,94" fill="#a855f7" />
          <circle cx="48" cy="50" r="3" fill="#facc15" />
        </>
      ) : (
        <>
          <rect x="22" y="24" width="56" height="52" rx="8" fill={primaryColor} stroke="#1e293b" strokeWidth="2" />
          <rect x="35" y="38" width="30" height="24" fill={secondaryColor} />
          <circle cx="58" cy="50" r="12" fill="#0f172a" stroke={secondaryColor} strokeWidth="1" />
        </>
      )}

      {/* Render SVG-based custom Decals on top of bodies */}
      {decal && decal !== 'none' && (
        <>
          {decal === 'stripes' && (
            <>
              <rect x="23" y="33" width="54" height="4" fill={secondaryColor} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
              <rect x="23" y="63" width="54" height="4" fill={secondaryColor} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
            </>
          )}
          {decal === 'flames' && (
            <>
              <path d="M 50 35 L 30 35 L 42 42 L 25 50 L 42 58 L 30 65 L 50 65 L 68 50 Z" fill="#f97316" />
              <path d="M 45 42 L 32 42 L 38 46 L 28 50 L 38 54 L 32 58 L 45 58 L 56 50 Z" fill="#facc15" />
            </>
          )}
          {decal === 'lightning' && (
            <path d="M 28 45 L 46 28 L 38 50 L 64 45 L 48 72 L 72 50" stroke="#facc15" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {decal === 'tech_grid' && (
            <>
              <path d="M 26 38 L 74 38 M 26 62 L 74 62 M 35 38 L 45 50 L 60 50 L 70 62" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
              <circle cx="45" cy="50" r="2.2" fill={secondaryColor} />
              <circle cx="60" cy="50" r="2.2" fill={secondaryColor} />
            </>
          )}
          {decal === 'honeycomb' && (
            <>
              <path d="M 25 40 L 32 35 L 42 35 L 49 40 L 42 45 L 32 45 Z M 49 40 L 56 35 L 66 35 L 73 40 L 66 45 L 56 45 Z M 37 55 L 44 50 L 54 50 L 61 55 L 54 60 L 44 60 Z" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M 25 60 L 32 55 L 42 55 L 49 60 L 42 65 L 32 65 Z" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.6" />
            </>
          )}
          {decal === 'waves' && (
            <>
              <path d="M 22 45 Q 38 30, 50 48 T 78 45" stroke="#06b6d4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 22 55 Q 38 40, 50 58 T 78 55" stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 22 35 Q 38 20, 50 38 T 78 35" stroke="#0891b2" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round" />
            </>
          )}
          {decal === 'stars' && (
            <>
              <path d="M 32 30 L 33 32 L 35 32 L 33 33 L 34 35 L 32 34 L 30 35 L 31 33 L 29 32 L 31 32 Z M 64 34 L 65 36 L 67 36 L 65 37 L 66 39 L 64 38 L 62 39 L 63 37 L 61 36 L 63 36 Z" fill="#ffffff" />
              <circle cx="44" cy="62" r="1.5" fill="#ffffff" />
              <circle cx="52" cy="30" r="1.2" fill="#ffffff" />
            </>
          )}
          {decal === 'vortex' && (
            <>
              <ellipse cx="50" cy="50" rx="20" ry="12" stroke="#ea580c" fill="none" strokeWidth="1.5" transform="rotate(15 50 50)" opacity="0.8" />
              <ellipse cx="50" cy="50" rx="14" ry="8" stroke="#f97316" fill="none" strokeWidth="1.5" transform="rotate(-25 50 50)" opacity="0.8" />
              <ellipse cx="50" cy="50" rx="8" ry="4" stroke="#facc15" fill="none" strokeWidth="1.5" transform="rotate(45 50 50)" opacity="0.8" />
              <circle cx="50" cy="50" r="2.5" fill="#eab308" />
            </>
          )}
          {decal === 'gold_leaf' && (
            <>
              {/* Left wing leaf */}
              <path d="M 32 35 Q 24 45, 30 55 T 45 60 Q 38 48, 38 42 Z" fill="#fbbf24" opacity="0.85" />
              {/* Right wing leaf */}
              <path d="M 68 35 Q 76 45, 70 55 T 55 60 Q 62 48, 62 42 Z" fill="#fbbf24" opacity="0.85" />
              {/* Center sleek laurel leaf */}
              <path d="M 50 25 Q 46 36, 50 48 Q 54 36, 50 25 Z" fill="#f59e0b" opacity="0.9" />
            </>
          )}
          {decal === 'cyber_circuit' && (
            <>
              <path d="M 28 30 L 40 30 L 46 38 L 46 50 M 72 30 L 60 30 L 54 38 L 54 50 M 50 65 L 50 80 M 35 60 L 42 68 L 58 68 L 65 60" stroke="#22d3ee" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85" />
              <circle cx="46" cy="50" r="2" fill="#22d3ee" />
              <circle cx="54" cy="50" r="2" fill="#22d3ee" />
              <rect x="47" y="61" width="6" height="6" fill="#0891b2" stroke="#22d3ee" strokeWidth="1" />
            </>
          )}
          {decal === 'carbon' && (
            <path d="M 22 28 L 38 44 M 32 28 L 48 44 M 42 28 L 58 44 M 52 28 L 68 44 M 22 40 L 38 24 M 32 40 L 48 24 M 42 40 L 58 24 M 52 40 L 68 24" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
          )}
        </>
      )}
    </svg>
  );
};

export const renderSingleWheelSVG = (wheelId: string) => {
  const wheelTheme = {
    classic: { color: '#1e293b', rim: '#475569' },
    cyber: { color: '#090d16', rim: '#00ffff' },
    magma: { color: '#1a0902', rim: '#f97316' },
    frost: { color: '#051821', rim: '#38bdf8' },
    gold_star: { color: '#1f1601', rim: '#fbbf24' },
    classified_drive: { color: '#16021f', rim: '#d946ef' },
  }[wheelId] || { color: '#1e293b', rim: '#475569' };

  return (
    <svg className="w-9 h-6 filter drop-shadow-[0_0_3px_rgba(255,255,255,0.15)]" viewBox="0 0 24 16">
      <rect x="2" y="2" width="20" height="12" rx="3" fill={wheelTheme.color} stroke="#090d16" strokeWidth="1" />
      <rect x="6" y="4" width="12" height="8" rx="1.5" fill={wheelTheme.rim} />
      {wheelId !== 'classic' && (
        <circle cx="12" cy="8" r="1.5" fill="#ffffff" />
      )}
    </svg>
  );
};

export interface PlayableWheel {
  id: string;
  name: string;
  description: string;
  price: number;
  speedBonus: number;
  color: string;
  rimColor: string;
  rarity: 'Special' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary' | 'UltraLegendary' | 'Secret';
}

export const MARKET_WHEELS: PlayableWheel[] = [
  { id: 'classic', name: 'Classic Obsidian', description: 'Standard durable tires with heavy iron rims (+0% Speed).', price: 0, speedBonus: 0, color: '#475569', rimColor: '#475569', rarity: 'Special' },
  { id: 'cyber', name: 'Cyber Neon', description: 'Sleek neon tires emitting cyan core telemetry signals (+5% Speed).', price: 250, speedBonus: 5, color: '#00ffff', rimColor: '#00ffff', rarity: 'Rare' },
  { id: 'magma', name: 'Magma Fusion', description: 'Treads forged from liquid sulfur pulsing with molten core thermal heat (+10% Speed).', price: 500, speedBonus: 10, color: '#f97316', rimColor: '#f97316', rarity: 'Epic' },
  { id: 'frost', name: 'Frost Overdrive', description: 'Deep cryo studs optimized for low-friction ice sector drifting (+15% Speed).', price: 750, speedBonus: 15, color: '#38bdf8', rimColor: '#38bdf8', rarity: 'Legendary' },
  { id: 'gold_star', name: 'Stellar Gold', description: 'Chromed golden spin rims reserved for star champions (+22% Speed).', price: 1000, speedBonus: 22, color: '#fbbf24', rimColor: '#fbbf24', rarity: 'UltraLegendary' },
  { id: 'classified_drive', name: 'Singularity Drive', description: 'Quantum spacetime warping experimental drive wheels (+30% Speed).', price: 1500, speedBonus: 30, color: '#d946ef', rimColor: '#d946ef', rarity: 'Secret' },
];

interface GarageMarketProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onBuyCar: (modelId: string, price: number) => void;
  unlockedModels: string[];
  blueConfig: { model: string; primary: string; secondary: string; decal?: string; wheels?: string };
  redConfig: { model: string; primary: string; secondary: string; decal?: string; wheels?: string };
  onUpdateBlueConfig: (config: { model: string; primary: string; secondary: string; decal?: string; wheels?: string }) => void;
  onUpdateRedConfig: (config: { model: string; primary: string; secondary: string; decal?: string; wheels?: string }) => void;
  unlockedPalettes: string[];
  onBuyPalette: (paletteName: string, price: number) => void;
  unlockedDecals: string[];
  onBuyDecal: (decalId: string, price: number) => void;
  unlockedWheels: string[];
  onBuyWheel: (wheelId: string, price: number) => void;
}

export const GarageMarket: React.FC<GarageMarketProps> = ({
  isOpen,
  onClose,
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
  unlockedWheels,
  onBuyWheel,
}) => {
  const [activeTab, setActiveTab] = useState<'garage' | 'market'>('garage');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = (item: MarketItem) => {
    if (coins < item.price) {
      sounds.playHit(true); // thud error sound
      setPurchaseError(`Insufficient currency! You need ${item.price - coins} more gold coins.`);
      setTimeout(() => setPurchaseError(null), 3000);
      return;
    }
    
    // Call host action
    onBuyCar(item.id, item.price);
    
    // Play sound trigger
    sounds.playWin(); // Win arpeggio is perfect for successful rare events!
    setPurchaseSuccess(`✓ UNLOCKED ${item.name.toUpperCase()} (${item.rarity.toUpperCase()})! Already inside space Garage.`);
    setTimeout(() => setPurchaseSuccess(null), 4000);
  };

  const handlePaletteClick = (pal: CarPalette, isBlue: boolean) => {
    const isUnlocked = pal.price === 0 || unlockedPalettes.includes(pal.name);
    if (isUnlocked) {
      sounds.playBoost();
      if (isBlue) {
        onUpdateBlueConfig({ ...blueConfig, primary: pal.primary, secondary: pal.secondary });
      } else {
        onUpdateRedConfig({ ...redConfig, primary: pal.primary, secondary: pal.secondary });
      }
    } else {
      // Need to buy!
      if (coins < pal.price) {
        sounds.playHit(true);
        setPurchaseError(`Insufficient currency! You need ${pal.price - coins} more gold coins for "${pal.name}" shader.`);
        setTimeout(() => setPurchaseError(null), 3000);
      } else {
        sounds.playWin();
        onBuyPalette(pal.name, pal.price);
        if (isBlue) {
          onUpdateBlueConfig({ ...blueConfig, primary: pal.primary, secondary: pal.secondary });
        } else {
          onUpdateRedConfig({ ...redConfig, primary: pal.primary, secondary: pal.secondary });
        }
        setPurchaseSuccess(`✓ UNLOCKED EXCLUSIVE COLOR: ${pal.name.toUpperCase()}! Fitted now.`);
        setTimeout(() => setPurchaseSuccess(null), 4000);
      }
    }
  };

  const DECAL_ITEMS = [
    { id: 'none', label: 'None', price: 0 },
    { id: 'stripes', label: 'Stripes', price: 2000 },
    { id: 'flames', label: 'Flames', price: 3500 },
    { id: 'lightning', label: 'Sparks', price: 5000 },
    { id: 'tech_grid', label: 'Cyber Grid', price: 6000 },
    { id: 'honeycomb', label: 'Hex Lattice', price: 6500 },
    { id: 'stars', label: 'Stars', price: 7500 },
    { id: 'waves', label: 'Tidal Wave', price: 8000 },
    { id: 'carbon', label: 'Carbon', price: 9000 },
    { id: 'vortex', label: 'Vortex', price: 10000 },
    { id: 'gold_leaf', label: 'Gold Leaf', price: 11000 },
    { id: 'cyber_circuit', label: 'Electro Circuit', price: 12000 },
  ];

  const handleDecalClick = (item: { id: string; label: string; price: number }, isBlue: boolean) => {
    const config = isBlue ? blueConfig : redConfig;
    const updateFn = isBlue ? onUpdateBlueConfig : onUpdateRedConfig;
    
    const isUnlocked = item.price === 0 || unlockedDecals.includes(item.id);
    if (isUnlocked) {
      sounds.playBoost();
      updateFn({ ...config, decal: item.id });
    } else {
      // Need to purchase!
      if (coins < item.price) {
        sounds.playHit(true);
        setPurchaseError(`Insufficient currency! You need ${item.price - coins} more gold coins for "${item.label}" vinyl.`);
        setTimeout(() => setPurchaseError(null), 3000);
      } else {
        sounds.playWin();
        onBuyDecal(item.id, item.price);
        updateFn({ ...config, decal: item.id });
        setPurchaseSuccess(`✓ UNLOCKED PREMIUM DECAL: ${item.label.toUpperCase()}! Fitted now.`);
        setTimeout(() => setPurchaseSuccess(null), 4000);
      }
    }
  };

  const handleWheelClick = (item: PlayableWheel, isBlue: boolean) => {
    const config = isBlue ? blueConfig : redConfig;
    const updateFn = isBlue ? onUpdateBlueConfig : onUpdateRedConfig;
    
    const isUnlocked = item.price === 0 || unlockedWheels.includes(item.id);
    if (isUnlocked) {
      sounds.playBoost();
      updateFn({ ...config, wheels: item.id });
    } else {
      // Need to purchase!
      if (coins < item.price) {
        sounds.playHit(true);
        setPurchaseError(`Insufficient currency! You need ${item.price - coins} more gold coins for "${item.name}" wheels.`);
        setTimeout(() => setPurchaseError(null), 3000);
      } else {
        sounds.playWin();
        onBuyWheel(item.id, item.price);
        updateFn({ ...config, wheels: item.id });
        setPurchaseSuccess(`✓ UNLOCKED PREMIUM WHEELS: ${item.name.toUpperCase()}! Fitted now.`);
        setTimeout(() => setPurchaseSuccess(null), 4000);
      }
    }
  };

  const playClick = () => {
    sounds.playCountdownBeep(true);
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4 overflow-hidden">
        
        {/* Main Dialog Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col max-h-[92vh] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Subtle Accent ambient lighting behind panels */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header Row */}
          <div className="p-6 border-b border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 bg-zinc-950/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black italic tracking-tight text-white uppercase flex items-center gap-2">
                  <span>CUSTOM GARAGE & ROCKET SHOP</span>
                </h2>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">
                  Unlock advanced chassis designs and customize team-compliant color shaders
                </p>
              </div>
            </div>

            {/* Right Header Side: Coins display & Tabs switcher */}
            <div className="flex items-center gap-4">
              {/* Cash Balance */}
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/35 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <div className="bg-amber-500/20 p-1.5 rounded-lg">
                  <Coins className="w-4 h-4 text-amber-400 fill-amber-500/10" />
                </div>
                <div className="font-mono">
                  <span className="text-xs text-amber-300 font-bold uppercase block leading-none">Coins Pool</span>
                  <span className="text-lg font-black text-white leading-none">{coins}</span>
                </div>
              </div>

              {/* Exit out */}
              <button
                onClick={onClose}
                className="p-2.5 rounded-lg border border-white/5 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center h-11 w-11"
                title="Save & Return"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Persistent Alerts */}
          {purchaseSuccess && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              {purchaseSuccess}
            </motion.div>
          )}

          {purchaseError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-rose-500/15 border-b border-rose-500/30 px-6 py-2.5 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider text-center"
            >
              ⚠️ {purchaseError}
            </motion.div>
          )}

          {/* Navigation Tabs bar */}
          <div className="flex items-center border-b border-zinc-900 px-6 bg-zinc-950/60 font-sans">
            <button
              onClick={() => { playClick(); setActiveTab('garage'); }}
              className={`py-3.5 px-6 text-xs uppercase tracking-widest font-black italic relative transition-all cursor-pointer ${
                activeTab === 'garage' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>1. Equip Garage</span>
              {activeTab === 'garage' && (
                <motion.div layoutId="marketTabIndicator" className="absolute bottom-0 inset-x-4 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => { playClick(); setActiveTab('market'); }}
              className={`py-3.5 px-6 text-xs uppercase tracking-widest font-black italic relative transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'market' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>2. Buy Car Bodies</span>
              <span className="bg-amber-500 text-black text-[9px] px-1.5 py-0.5 rounded-full font-mono font-black scale-90">Store</span>
              {activeTab === 'market' && (
                <motion.div layoutId="marketTabIndicator" className="absolute bottom-0 inset-x-4 h-0.5 bg-amber-500" />
              )}
            </button>
          </div>

          {/* Scrollable Workspace area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-black/40 custom-scrollbar select-none">
            
            {/* VIEW A: EQUIP GARAGE */}
            {activeTab === 'garage' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* ==========================================
                    PLAYER 1 (BLUE TEAM) CUSTOMIZATION PANEL
                    ========================================== */}
                <div className="bg-gradient-to-b from-blue-950/20 to-zinc-950/5 border border-blue-500/25 rounded-2xl p-5 md:p-6 shadow-[0_8px_40px_rgba(59,130,246,0.08)] relative flex flex-col gap-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* P1 Headers */}
                  <div className="flex items-center justify-between border-b border-blue-500/15 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
                      <span className="text-xs font-black tracking-widest text-blue-400 font-mono uppercase">
                        PLAYER 1 BLUE CUSTOMIZATION
                      </span>
                    </div>
                    <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold">W / A / S / D Keys</span>
                  </div>

                  {/* Body car image placeholder */}
                  {(() => {
                    const detail = MARKET_ITEMS.find(item => item.id === blueConfig.model) || {
                      name: 'Interstellar Default',
                      imageSrc: '/src/assets/images/car_interstellar.png',
                      rarity: 'Special' as const,
                      stats: { speed: 3.5, handling: 4, weight: 3 }
                    };
                    return (
                      <div className="w-full h-36 bg-zinc-950/90 border border-blue-500/10 rounded-xl flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                        <div className="absolute top-2 right-2 text-[8px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-mono z-20">
                          {detail.rarity.toUpperCase()}
                        </div>
                        <div className="transform scale-[1.3] group-hover:scale-[1.45] transition-all duration-300 z-10 flex items-center justify-center">
                          {renderCardVehiclePreview(blueConfig.model, blueConfig.primary, blueConfig.secondary, blueConfig.decal, blueConfig.wheels)}
                        </div>
                        <div className="absolute bottom-2 inset-x-3 flex items-center justify-between z-20">
                          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase font-mono">
                            HULL: {detail.name}
                          </span>
                          <span className="text-[8.5px] font-mono text-zinc-500">
                            SPD: {detail.stats.speed}/5 | HND: {detail.stats.handling}/5
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Personalization Options Grid / Stack */}
                  <div className="space-y-5">
                    
                    {/* A. Body Car Hull Choice */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest font-mono block">A. Body Car (Chassis)</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        <button
                          onClick={() => {
                            sounds.playBoost();
                            onUpdateBlueConfig({ ...blueConfig, model: 'interstellar' });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                            blueConfig.model === 'interstellar'
                              ? 'bg-blue-500/15 border-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase italic tracking-wide block">Interstellar</span>
                          <span className="text-[7.5px] font-bold text-slate-400 uppercase font-mono mt-0.5 block">Special Default</span>
                          {blueConfig.model === 'interstellar' && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-blue-400" />}
                        </button>

                        {MARKET_ITEMS.map((item) => {
                          const isUnlocked = unlockedModels.includes(item.id);
                          if (!isUnlocked) {
                            return (
                              <div
                                key={`locked-blue-${item.id}`}
                                className="p-2.5 rounded-xl border border-zinc-900/80 bg-zinc-950/20 opacity-30 text-left flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-[10px] font-black uppercase italic tracking-wide text-zinc-500 block truncate max-w-[90px]">{item.name}</span>
                                  <span className="text-[7px] text-zinc-650 block font-mono uppercase tracking-wider font-semibold">{item.rarity}</span>
                                </div>
                                <span className="text-[7px] text-zinc-500 font-bold uppercase font-mono">LOCKED</span>
                              </div>
                            );
                          }

                          const isSelected = blueConfig.model === item.id;
                          return (
                            <button
                              key={`unlocked-blue-${item.id}`}
                              onClick={() => {
                                sounds.playBoost();
                                onUpdateBlueConfig({ ...blueConfig, model: item.id });
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <span className="text-[10px] font-black uppercase italic tracking-wide block truncate max-w-[90px]">{item.name}</span>
                              <span className="text-[7.5px] font-mono text-zinc-500 uppercase mt-0.5 block">{item.rarity}</span>
                              {isSelected && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-blue-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* B. Body Color paint 선택 */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest font-mono block font-mono">B. Body Color Coating</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 tracking-wide custom-scrollbar">
                        {SHARED_PALETTES.map((pal) => {
                          const isSelected = blueConfig.primary === pal.primary;
                          const isUnlocked = pal.price === 0 || unlockedPalettes.includes(pal.name);
                          const rStyles = getRarityStyles(pal.rarity);
                          return (
                            <button
                              key={`shared-pal-blue-${pal.name}`}
                              onClick={() => handlePaletteClick(pal, true)}
                              className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 relative overflow-hidden cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                                  : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full flex overflow-hidden border border-white/10 shrink-0 relative">
                                <span className="w-1/2 h-full" style={{ backgroundColor: pal.primary }} />
                                <span className="w-1/2 h-full" style={{ backgroundColor: pal.secondary }} />
                                {!isUnlocked && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Lock className="w-2 h-2 text-blue-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-wider block leading-none truncate">{pal.name}</span>
                                <span className={`text-[6.5px] font-bold block mt-0.5 ${rStyles.text}`}>
                                  {isUnlocked ? pal.rarity : `${pal.price}¢`}
                                </span>
                              </div>
                              {isSelected && <Check className="absolute top-1.5 right-1.5 w-3 h-3 text-blue-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* C. Vinyl decals 선택 */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest font-mono block">C. Premium Vinyl Decal</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        {DECAL_ITEMS.map((item) => {
                          const isSelected = blueConfig.decal === item.id || (!blueConfig.decal && item.id === 'none');
                          const isUnlocked = item.price === 0 || unlockedDecals.includes(item.id);
                          return (
                            <button
                              key={`shared-decal-blue-${item.id}`}
                              onClick={() => handleDecalClick(item, true)}
                              className={`p-1.5 rounded-xl border text-left transition-all flex items-center gap-2 relative overflow-hidden cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                                  : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                              }`}
                            >
                              <div className="w-10 h-10 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                                <div className="scale-[0.38] transform rotate-90 flex items-center justify-center absolute z-10">
                                  {renderCardVehiclePreview(blueConfig.model, blueConfig.primary, blueConfig.secondary, item.id, blueConfig.wheels)}
                                </div>
                                {!isUnlocked && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                    <Lock className="w-2.5 h-2.5 text-blue-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-wider block leading-none truncate">{item.label}</span>
                                <span className="text-[6.5px] text-zinc-500 font-mono block mt-0.5">{isUnlocked ? 'DECAL' : `${item.price}¢`}</span>
                              </div>
                              {isSelected && <Check className="absolute top-1.5 right-1.5 w-3 h-3 text-blue-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* D. Performance Alloys 선택 (VARYING SPEED AS REQUESTED) */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest font-mono block">D. Alloy Wheels (Speed Altering)</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        {MARKET_WHEELS.map((item) => {
                          const isSelected = blueConfig.wheels === item.id || (!blueConfig.wheels && item.id === 'classic');
                          const isUnlocked = item.price === 0 || unlockedWheels.includes(item.id);
                          const isBetter = item.speedBonus > 0;
                          return (
                            <button
                              key={`shared-wheels-blue-${item.id}`}
                              onClick={() => handleWheelClick(item, true)}
                              className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 relative overflow-hidden cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                                  : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                              }`}
                            >
                              <div className="w-10 h-7 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                                <div className="z-10 flex items-center justify-center">
                                  {renderSingleWheelSVG(item.id)}
                                </div>
                                {!isUnlocked && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                    <Lock className="w-2.5 h-2.5 text-blue-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-wider block leading-none truncate">{item.name}</span>
                                <span className={`text-[6.5px] font-mono block mt-0.5 font-bold ${isBetter ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                  {isUnlocked 
                                    ? (isBetter ? `+${item.speedBonus}% SPEED` : 'Classic Base')
                                    : `${item.price}¢`
                                  }
                                </span>
                              </div>
                              {isSelected && <Check className="absolute top-1.5 right-1.5 w-3 h-3 text-blue-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* ==========================================
                    PLAYER 2 (RED TEAM) CUSTOMIZATION PANEL
                    ========================================== */}
                <div className="bg-gradient-to-b from-red-950/20 to-zinc-950/5 border border-red-500/25 rounded-2xl p-5 md:p-6 shadow-[0_8px_40px_rgba(239,68,68,0.08)] relative flex flex-col gap-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* P1 Headers */}
                  <div className="flex items-center justify-between border-b border-red-500/15 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
                      <span className="text-xs font-black tracking-widest text-red-400 font-mono uppercase">
                        PLAYER 2 RED CUSTOMIZATION
                      </span>
                    </div>
                    <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold">Arrow Keys</span>
                  </div>

                  {/* Body car image placeholder */}
                  {(() => {
                    const detail = MARKET_ITEMS.find(item => item.id === redConfig.model) || {
                      name: 'Interstellar Default',
                      imageSrc: '/src/assets/images/car_interstellar.png',
                      rarity: 'Special' as const,
                      stats: { speed: 3.5, handling: 4, weight: 3 }
                    };
                    return (
                      <div className="w-full h-36 bg-zinc-950/90 border border-red-500/10 rounded-xl flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                        <div className="absolute top-2 right-2 text-[8px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded font-mono z-20">
                          {detail.rarity.toUpperCase()}
                        </div>
                        <div className="transform scale-[1.3] group-hover:scale-[1.45] transition-all duration-300 z-10 flex items-center justify-center">
                          {renderCardVehiclePreview(redConfig.model, redConfig.primary, redConfig.secondary, redConfig.decal, redConfig.wheels)}
                        </div>
                        <div className="absolute bottom-2 inset-x-3 flex items-center justify-between z-20">
                          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase font-mono">
                            HULL: {detail.name}
                          </span>
                          <span className="text-[8.5px] font-mono text-zinc-500">
                            SPD: {detail.stats.speed}/5 | HND: {detail.stats.handling}/5
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Personalization Options Grid / Stack */}
                  <div className="space-y-5">
                    
                    {/* A. Body Car Hull Choice */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono block">A. Body Car (Chassis)</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        <button
                          onClick={() => {
                            sounds.playBoost();
                            onUpdateRedConfig({ ...redConfig, model: 'interstellar' });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                            redConfig.model === 'interstellar'
                              ? 'bg-red-500/15 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase italic tracking-wide block">Interstellar</span>
                          <span className="text-[7.5px] font-bold text-slate-400 uppercase font-mono mt-0.5 block">Special Default</span>
                          {redConfig.model === 'interstellar' && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-red-400" />}
                        </button>

                        {MARKET_ITEMS.map((item) => {
                          const isUnlocked = unlockedModels.includes(item.id);
                          if (!isUnlocked) {
                            return (
                              <div
                                key={`locked-red-equip-${item.id}`}
                                className="p-2.5 rounded-xl border border-zinc-900/80 bg-zinc-950/20 opacity-30 text-left flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-[10px] font-black uppercase italic tracking-wide text-zinc-500 block truncate max-w-[90px]">{item.name}</span>
                                  <span className="text-[7px] text-zinc-650 block font-mono uppercase tracking-wider font-semibold">{item.rarity}</span>
                                </div>
                                <span className="text-[7px] text-zinc-500 font-bold uppercase font-mono">LOCKED</span>
                              </div>
                            );
                          }

                          const isSelected = redConfig.model === item.id;
                          return (
                            <button
                              key={`unlocked-red-equip-${item.id}`}
                              onClick={() => {
                                sounds.playBoost();
                                onUpdateRedConfig({ ...redConfig, model: item.id });
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                                isSelected
                                  ? 'bg-red-500/15 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <span className="text-[10px] font-black uppercase italic tracking-wide block truncate max-w-[90px]">{item.name}</span>
                              <span className="text-[7.5px] font-mono text-zinc-500 uppercase mt-0.5 block">{item.rarity}</span>
                              {isSelected && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-red-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* B. Body Color paint 선택 */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono block font-mono">B. Body Color Coating</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 tracking-wide custom-scrollbar">
                        {SHARED_PALETTES.map((pal) => {
                          const isSelected = redConfig.primary === pal.primary;
                          const isUnlocked = pal.price === 0 || unlockedPalettes.includes(pal.name);
                          const rStyles = getRarityStyles(pal.rarity);
                          return (
                            <button
                              key={`shared-pal-red-${pal.name}`}
                              onClick={() => handlePaletteClick(pal, false)}
                              className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 relative overflow-hidden cursor-pointer ${
                                isSelected
                                  ? 'bg-red-500/15 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                                  : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full flex overflow-hidden border border-white/10 shrink-0 relative">
                                <span className="w-1/2 h-full" style={{ backgroundColor: pal.primary }} />
                                <span className="w-1/2 h-full" style={{ backgroundColor: pal.secondary }} />
                                {!isUnlocked && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Lock className="w-2 h-2 text-red-500" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-wider block leading-none truncate">{pal.name}</span>
                                <span className={`text-[6.5px] font-bold block mt-0.5 ${rStyles.text}`}>
                                  {isUnlocked ? pal.rarity : `${pal.price}¢`}
                                </span>
                              </div>
                              {isSelected && <Check className="absolute top-1.5 right-1.5 w-3 h-3 text-red-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* C. Vinyl decals 선택 */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono block">C. Premium Vinyl Decal</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        {DECAL_ITEMS.map((item) => {
                          const isSelected = redConfig.decal === item.id || (!redConfig.decal && item.id === 'none');
                          const isUnlocked = item.price === 0 || unlockedDecals.includes(item.id);
                          return (
                            <button
                              key={`shared-decal-red-${item.id}`}
                              onClick={() => handleDecalClick(item, false)}
                              className={`p-1.5 rounded-xl border text-left transition-all flex items-center gap-2 relative overflow-hidden cursor-pointer ${
                                isSelected
                                  ? 'bg-red-500/15 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                                  : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                              }`}
                            >
                              <div className="w-10 h-10 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                                <div className="scale-[0.38] transform rotate-90 flex items-center justify-center absolute z-10">
                                  {renderCardVehiclePreview(redConfig.model, redConfig.primary, redConfig.secondary, item.id, redConfig.wheels)}
                                </div>
                                {!isUnlocked && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                    <Lock className="w-2.5 h-2.5 text-red-500" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-wider block leading-none truncate">{item.label}</span>
                                <span className="text-[6.5px] text-zinc-500 font-mono block mt-0.5">{isUnlocked ? 'DECAL' : `${item.price}¢`}</span>
                              </div>
                              {isSelected && <Check className="absolute top-1.5 right-1.5 w-3 h-3 text-red-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* D. Performance Alloys 선택 (VARYING SPEED AS REQUESTED) */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono block">D. Alloy Wheels (Speed Altering)</label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        {MARKET_WHEELS.map((item) => {
                          const isSelected = redConfig.wheels === item.id || (!redConfig.wheels && item.id === 'classic');
                          const isUnlocked = item.price === 0 || unlockedWheels.includes(item.id);
                          const isBetter = item.speedBonus > 0;
                          return (
                            <button
                              key={`shared-wheels-red-${item.id}`}
                              onClick={() => handleWheelClick(item, false)}
                              className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 relative overflow-hidden cursor-pointer ${
                                isSelected
                                  ? 'bg-red-500/15 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                                  : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                              }`}
                            >
                              <div className="w-10 h-7 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                                <div className="z-10 flex items-center justify-center">
                                  {renderSingleWheelSVG(item.id)}
                                </div>
                                {!isUnlocked && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                    <Lock className="w-2.5 h-2.5 text-red-500" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-wider block leading-none truncate">{item.name}</span>
                                <span className={`text-[6.5px] font-mono block mt-0.5 font-bold ${isBetter ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                  {isUnlocked 
                                    ? (isBetter ? `+${item.speedBonus}% SPEED` : 'Classic Base')
                                    : `${item.price}¢`
                                  }
                                </span>
                              </div>
                              {isSelected && <Check className="absolute top-1.5 right-1.5 w-3 h-3 text-red-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* VIEW B: MARKET FOR CAR BODIES */}
            {activeTab === 'market' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MARKET_ITEMS.map((item) => {
                  const isUnlocked = unlockedModels.includes(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      className={`border bg-zinc-900/60 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
                        isUnlocked 
                          ? 'border-emerald-500/10 hover:border-emerald-500/25' 
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Stylized Badge if unlocked */}
                      {isUnlocked && (
                        <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 py-0.5 px-2 rounded-md text-[9px] font-mono tracking-widest uppercase font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Unlocked</span>
                        </div>
                      )}

                      <div>
                        {/* Dynamic Match-style vector render preview */}
                        <div className="h-36 bg-zinc-950/80 rounded-xl flex items-center justify-center border border-zinc-950 shadow-inner overflow-hidden mb-6 relative group">
                          {/* radial glowing circle background */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_75%)]" />
                          
                          <div className="transform scale-110 group-hover:scale-125 transition-transform duration-300">
                            {renderCardVehiclePreview(item.id, item.id === 'classified' ? '#d946ef' : '#fbbf24', item.id === 'classified' ? '#38bdf8' : '#f87171')}
                          </div>

                          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />
                          <div className="absolute bottom-2 left-3 text-[8px] font-mono text-amber-400 font-bold tracking-widest uppercase bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/15">
                            {item.id === 'classified' ? 'Classified X Spec' : `${item.id} Match Model`}
                          </div>
                        </div>

                        {/* Title details */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h4 className="text-base font-black italic uppercase text-white tracking-wide leading-none">{item.name}</h4>
                          {(() => {
                            const rStyles = getRarityStyles(item.rarity);
                            return (
                              <span className={`text-[8px] font-black tracking-widest uppercase font-mono px-1.5 py-0.5 rounded border leading-none ${rStyles.bg} ${rStyles.text} ${rStyles.border}`}>
                                {item.rarity}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-2.5 leading-relaxed min-h-[48px]">{item.description}</p>
                        
                        {/* Specs stats visual bar */}
                        <div className="mt-5 space-y-2.5 border-t border-zinc-950 pt-5 text-[10px] uppercase font-bold tracking-wider font-mono text-zinc-500">
                          
                          {/* Speed Spec */}
                          <div className="flex items-center justify-between">
                            <span>Top Acceleration</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                  key={s}
                                  className={`w-3.5 h-1.5 rounded-full ${
                                    s <= item.stats.speed 
                                      ? 'bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.3)]' 
                                      : 'bg-zinc-800'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Handling Spec */}
                          <div className="flex items-center justify-between">
                            <span>Manoeuvrability</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                  key={s}
                                  className={`w-3.5 h-1.5 rounded-full ${
                                    s <= item.stats.handling 
                                      ? 'bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.3)]' 
                                      : 'bg-zinc-800'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Weight Spec */}
                          <div className="flex items-center justify-between">
                            <span>Impact Mass</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                  key={s}
                                  className={`w-3.5 h-1.5 rounded-full ${
                                    s <= item.stats.weight 
                                      ? 'bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.3)]' 
                                      : 'bg-zinc-800'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Buy action footer section */}
                      <div className="mt-6 pt-5 border-t border-zinc-950">
                        {isUnlocked ? (
                          <div className="w-full text-center text-[10px] font-mono font-black border border-emerald-500/10 bg-emerald-500/5 py-3 rounded-xl uppercase text-emerald-400 tracking-[0.2em]">
                            ✓ Unlocked & Owned
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchase(item)}
                            className={`w-full py-3 px-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                              coins >= item.price
                                ? 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95 shadow-[0_4px_12px_rgba(245,158,11,0.2)]'
                                : 'bg-zinc-900 border border-white/5 text-zinc-500 hover:text-zinc-400'
                            }`}
                          >
                            <Coins className="w-4 h-4 shrink-0" />
                            <span>Buy for {item.price} Coins</span>
                          </button>
                        )}
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Dialog Footer standard */}
          <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex justify-between items-center text-[10px] text-zinc-500 font-mono uppercase tracking-widest px-6 relative z-10">
            <span>Play Matches to gain coins • 15 Coins per goal scored plus 100 on victory!</span>
            <span className="text-zinc-650">Rocket Personalization Engine</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
