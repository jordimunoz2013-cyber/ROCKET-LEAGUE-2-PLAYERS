import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Sparkles, Check, Lock, Shield, Star, Flame, Zap, ArrowRight, Crown, Gift } from 'lucide-react';
import { sounds } from '../audio';
import { TRANSLATIONS, Language } from '../localization';

export interface BattlePassReward {
  level: number;
  freeReward: {
    id: string;
    type: 'coins' | 'car' | 'palette' | 'decal' | 'wheels';
    name: string;
    amount?: number;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Prestige';
    displayIcon: string;
  };
  premiumReward: {
    id: string;
    type: 'coins' | 'car' | 'palette' | 'decal' | 'wheels';
    name: string;
    amount?: number;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Prestige';
    displayIcon: string;
  };
}

interface BattlePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onAddCoins: (amount: number) => void;
  unlockedModels: string[];
  onAddUnlockedModel: (id: string) => void;
  unlockedPalettes: string[];
  onAddUnlockedPalette: (name: string) => void;
  unlockedDecals: string[];
  onAddUnlockedDecal: (id: string) => void;
  unlockedWheels: string[];
  onAddUnlockedWheels: (id: string) => void;
  language?: Language;
}

interface SeasonConfig {
  id: string;
  name: string;
  themeColor: string;
  accentGlow: string;
  bgGradient: string;
  description: string;
  emoji: string;
  rewards: BattlePassReward[];
}

const fillTo50Levels = (base: BattlePassReward[], seasonId: string): BattlePassReward[] => {
  const result = [...base];
  const maxExisting = base.length > 0 ? Math.max(...base.map(r => r.level)) : 0;
  
  const decTypes = ['stripes', 'flames', 'lightning', 'tech_grid', 'stars', 'carbon', 'honeycomb', 'waves', 'vortex', 'gold_leaf', 'cyber_circuit'];
  const pList = ['Cyber Jade', 'Volcanic Gold', 'Plasma Violet', 'Sunset Hot Coral', 'Neon Spectre', 'Cosmic Overlord', 'Valkyrie Cyan', 'Singularity Gold', 'Cyberpunk Cyber', 'Abyssal Shadow', 'Stellar Flare'];
  const wList = ['classic', 'cyber', 'magma', 'frost', 'gold_star', 'classified_drive'];
  const cList = ['beast', 'spectre', 'cyber', 'phantom', 'apex', 'phoenix', 'centurion', 'glacier', 'void', 'reaper', 'spectre_electro', 'nemesis', 'classified'];
  const cNames = ['The Beast', 'Spectre F1', 'Cyberspace', 'Phantom GT', 'Apex Interceptor', 'Phoenix VTOL', 'Centurion GT-X', 'Glacier Wolf', 'Infinity Void', 'Grim Reaper', 'Spectre Electro', 'Nemesis GTS', 'Classified X'];

  for (let l = maxExisting + 1; l <= 50; l++) {
    const typeMod = l % 5;
    let freeRew: any;
    let premRew: any;

    if (typeMod === 1) {
      const freeAmt = 100 + (l * 10);
      const premAmt = 250 + (l * 20);
      freeRew = { id: `coins_${freeAmt}_lvl${l}`, type: 'coins' as const, name: `${freeAmt} Credits`, amount: freeAmt, rarity: 'Common' as const, displayIcon: '💰' };
      premRew = { id: `coins_${premAmt}_lvl${l}`, type: 'coins' as const, name: `${premAmt} Golden Credits`, amount: premAmt, rarity: 'Epic' as const, displayIcon: '🪙' };
    } else if (typeMod === 2) {
      const pIdx = (l + 2) % pList.length;
      const paletteName = pList[pIdx];
      freeRew = { id: `palette_free_${l}`, type: 'palette' as const, name: `${paletteName} Classic Matte`, rarity: 'Rare' as const, displayIcon: '🎨' };
      premRew = { id: `palette_prem_${l}`, type: 'palette' as const, name: `${paletteName} Premium Gloss`, rarity: 'Epic' as const, displayIcon: '✨' };
    } else if (typeMod === 3) {
      const decId = decTypes[l % decTypes.length];
      freeRew = { id: `decal_free_${l}`, type: 'decal' as const, name: `${decId.replace('_', ' ').toUpperCase()} Decal`, rarity: 'Rare' as const, displayIcon: '🖌️' };
      premRew = { id: `decal_prem_${l}`, type: 'decal' as const, name: `Prestige ${decId.replace('_', ' ').toUpperCase()} Foil`, rarity: 'Legendary' as const, displayIcon: '👑' };
    } else if (typeMod === 4) {
      const wId = wList[l % wList.length];
      freeRew = { id: `wheels_free_${l}`, type: 'wheels' as const, name: `Sport ${wId.toUpperCase()} Rims`, rarity: 'Epic' as const, displayIcon: '🛞' };
      premRew = { id: `wheels_prem_${l}`, type: 'wheels' as const, name: `Chrono ${wId.toUpperCase()} Orbitals`, rarity: 'Legendary' as const, displayIcon: '💫' };
    } else {
      if (l % 10 === 0) {
        const carIdx = (l / 10) % cList.length;
        const carId = cList[carIdx];
        const carName = cNames[carIdx];
        freeRew = { id: `coins_800_lvl${l}`, type: 'coins' as const, name: `800 Credits Grand Prize`, amount: 800, rarity: 'Epic' as const, displayIcon: '💰' };
        premRew = { id: carId, type: 'car' as const, name: `${carName} Champion Special`, rarity: 'Prestige' as const, displayIcon: '🏎️' };
      } else {
        const freeAmt = 300;
        const premAmt = 700;
        freeRew = { id: `coins_${freeAmt}_lvl${l}`, type: 'coins' as const, name: `${freeAmt} Credits`, amount: freeAmt, rarity: 'Epic' as const, displayIcon: '💰' };
        premRew = { id: `coins_${premAmt}_lvl${l}`, type: 'coins' as const, name: `${premAmt} Golden Credits`, amount: premAmt, rarity: 'Legendary' as const, displayIcon: '💎' };
      }
    }

    result.push({
      level: l,
      freeReward: freeRew,
      premiumReward: premRew
    });
  }
  return result;
};

export const SEASONS: SeasonConfig[] = [
  {
    id: 'cyber_neon',
    name: 'Season 1: Neon Cyber',
    themeColor: 'from-pink-500 to-cyan-500',
    accentGlow: 'rgba(236,72,153,0.3)',
    bgGradient: 'bg-slate-950/98',
    description: 'Enter the neon-drenched grid. Futuristic cybernetic wraps and experimental hypercars await.',
    emoji: '🌌',
    rewards: fillTo50Levels([
      {
        level: 1,
        freeReward: { id: 'coins_100', type: 'coins', name: '100 Credits', amount: 100, rarity: 'Common', displayIcon: '💰' },
        premiumReward: { id: 'cyber', type: 'wheels', name: 'Cyber Neon Wheels', rarity: 'Rare', displayIcon: '🛞' }
      },
      {
        level: 2,
        freeReward: { id: 'decal_stripe', type: 'decal', name: 'Racer Stripe Decal', rarity: 'Common', displayIcon: '🎨' },
        premiumReward: { id: 'magma', type: 'wheels', name: 'Magma Fusion Wheels', rarity: 'Epic', displayIcon: '🛞' }
      },
      {
        level: 3,
        freeReward: { id: 'coins_150', type: 'coins', name: '150 Credits', amount: 150, rarity: 'Common', displayIcon: '💰' },
        premiumReward: { id: 'nemesis', type: 'car', name: 'Nemesis Hypercar', rarity: 'Legendary', displayIcon: '🚗' }
      },
      {
        level: 4,
        freeReward: { id: 'wheels_classic', type: 'wheels', name: 'Classic Obsidian Wheels', rarity: 'Common', displayIcon: '🛞' },
        premiumReward: { id: 'frost', type: 'wheels', name: 'Frost Overdrive Wheels', rarity: 'Epic', displayIcon: '🛞' }
      },
      {
        level: 5,
        freeReward: { id: 'decal_stars', type: 'decal', name: 'Cyber Stars Decal', rarity: 'Rare', displayIcon: '🎨' },
        premiumReward: { id: 'coins_500', type: 'coins', name: '500 Extra Credits', amount: 500, rarity: 'Epic', displayIcon: '💰' }
      },
      {
        level: 6,
        freeReward: { id: 'coins_200', type: 'coins', name: '200 Credits', amount: 200, rarity: 'Common', displayIcon: '💰' },
        premiumReward: { id: 'classified', type: 'car', name: 'Classified Hyper-Racer', rarity: 'Prestige', displayIcon: '👑' }
      }
    ], 'cyber_neon')
  },
  {
    id: 'frozen_peak',
    name: 'Season 2: Frozen Peak',
    themeColor: 'from-blue-400 to-indigo-600',
    accentGlow: 'rgba(56,189,248,0.3)',
    bgGradient: 'bg-zinc-950/98',
    description: 'Chilly winds sweep the peaks. Unleash arctic tire compounds and sub-zero fusion generators.',
    emoji: '🏔️',
    rewards: fillTo50Levels([
      {
        level: 1,
        freeReward: { id: 'coins_150', type: 'coins', name: '150 Credits', amount: 150, rarity: 'Common', displayIcon: '💰' },
        premiumReward: { id: 'frost', type: 'wheels', name: 'Frost Overdrive Wheels', rarity: 'Rare', displayIcon: '🛞' }
      },
      {
        level: 2,
        freeReward: { id: 'palette_blizzard', type: 'palette', name: 'Blizzard Frost Palette', rarity: 'Rare', displayIcon: '🎨' },
        premiumReward: { id: 'gold_star', type: 'wheels', name: 'Stellar Gold Wheels', rarity: 'Epic', displayIcon: '🛞' }
      },
      {
        level: 3,
        freeReward: { id: 'coins_200', type: 'coins', name: '200 Credits', amount: 200, rarity: 'Common', displayIcon: '💰' },
        premiumReward: { id: 'glacier', type: 'car', name: 'Glacier Wolf', rarity: 'Legendary', displayIcon: '🚗' }
      },
      {
        level: 4,
        freeReward: { id: 'wheels_classic', type: 'wheels', name: 'Classic Obsidian Wheels', rarity: 'Common', displayIcon: '🛞' },
        premiumReward: { id: 'classified_drive', type: 'wheels', name: 'Singularity Drive Wheels', rarity: 'Legendary', displayIcon: '🛞' }
      },
      {
        level: 5,
        freeReward: { id: 'coins_300', type: 'coins', name: '300 Credits', amount: 300, rarity: 'Epic', displayIcon: '💰' },
        premiumReward: { id: 'apex', type: 'car', name: 'Apex Interceptor', rarity: 'Prestige', displayIcon: '👑' }
      }
    ], 'frozen_peak')
  },
  {
    id: 'toxic_junk',
    name: 'Season 3: Wasteland Fury',
    themeColor: 'from-yellow-500 to-emerald-600',
    accentGlow: 'rgba(16,185,129,0.3)',
    bgGradient: 'bg-stone-950/98',
    description: 'Gritty rust, toxic green lightning, and brutal mechanical frames forged in the junkyard scrap.',
    emoji: '☢️',
    rewards: fillTo50Levels([
      {
        level: 1,
        freeReward: { id: 'coins_200', type: 'coins', name: '200 Credits', amount: 200, rarity: 'Common', displayIcon: '💰' },
        premiumReward: { id: 'magma', type: 'wheels', name: 'Magma Fusion Wheels', rarity: 'Rare', displayIcon: '🛞' }
      },
      {
        level: 2,
        freeReward: { id: 'decal_rust', type: 'decal', name: 'Toxic Rust Decal', rarity: 'Rare', displayIcon: '🎨' },
        premiumReward: { id: 'cyber', type: 'wheels', name: 'Cyber Neon Wheels', rarity: 'Rare', displayIcon: '🛞' }
      },
      {
        level: 3,
        freeReward: { id: 'coins_250', type: 'coins', name: '250 Credits', amount: 250, rarity: 'Common', displayIcon: '💰' },
        premiumReward: { id: 'beast', type: 'car', name: 'The Beast', rarity: 'Legendary', displayIcon: '🚗' }
      },
      {
        level: 4,
        freeReward: { id: 'wheels_classic', type: 'wheels', name: 'Classic Obsidian Wheels', rarity: 'Common', displayIcon: '🛞' },
        premiumReward: { id: 'gold_star', type: 'wheels', name: 'Stellar Gold Wheels', rarity: 'Epic', displayIcon: '🛞' }
      },
      {
        level: 5,
        freeReward: { id: 'coins_400', type: 'coins', name: '400 Credits', amount: 400, rarity: 'Epic', displayIcon: '💰' },
        premiumReward: { id: 'spectre_electro', type: 'car', name: 'Spectre Electro', rarity: 'Prestige', displayIcon: '👑' }
      }
    ], 'toxic_junk')
  }
];

export const BattlePassModal: React.FC<BattlePassModalProps> = ({
  isOpen,
  onClose,
  coins,
  onAddCoins,
  unlockedModels,
  onAddUnlockedModel,
  unlockedPalettes,
  onAddUnlockedPalette,
  unlockedDecals,
  onAddUnlockedDecal,
  unlockedWheels,
  onAddUnlockedWheels,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language || 'en'];
  
  // Track selected season
  const [activeSeasonIndex, setActiveSeasonIndex] = useState<number>(() => {
    const saved = localStorage.getItem('mini_rocket_bp_active_season_idx');
    return saved ? parseInt(saved, 10) : 0;
  });

  const activeSeason = SEASONS[activeSeasonIndex] || SEASONS[0];

  // Progression States for current active season
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [claimed, setClaimed] = useState<string[]>([]);

  // Feedback notifications
  const [bpMessage, setBpMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Load progression state whenever active season shifts
  useEffect(() => {
    const seasonId = activeSeason.id;
    const loadedXp = parseInt(localStorage.getItem(`mini_rocket_bp_xp_${seasonId}`) || '0', 10);
    const loadedLvl = parseInt(localStorage.getItem(`mini_rocket_bp_lvl_${seasonId}`) || '1', 10);
    const loadedPaid = localStorage.getItem(`mini_rocket_bp_premium_${seasonId}`) === 'true';
    const loadedClaimed = JSON.parse(localStorage.getItem(`mini_rocket_bp_claimed_${seasonId}`) || '[]');
    
    setXp(loadedXp);
    setLevel(loadedLvl);
    setIsPaid(loadedPaid);
    setClaimed(loadedClaimed);

    localStorage.setItem('mini_rocket_bp_active_season_idx', String(activeSeasonIndex));
  }, [activeSeasonIndex]);

  if (!isOpen) return null;

  const xpRequired = isPaid ? 50 : 100;

  // Handle purchasing the Premium Track (Advanced Pass) for 500 Coins
  const handleBuyPremium = () => {
    if (isPaid) return;
    if (coins < 500) {
      sounds.playHit(true);
      setBpMessage({ text: language === 'co' ? '¡Crèdits insuficients per activar el Passi Avançat (500¢ requerido)!' : language === 'es' ? '¡Créditos insuficientes para activar el Pase Avanzado (500¢ requerido)!' : 'Insufficient Credits to unlock Premium Track (500¢ required)!', error: true });
      setTimeout(() => setBpMessage(null), 3500);
      return;
    }

    // Deduct coins and save advanced pass status 
    onAddCoins(-500);
    setIsPaid(true);
    localStorage.setItem(`mini_rocket_bp_premium_${activeSeason.id}`, 'true');

    // Re-adjust level mathematically if XP count qualifies immediately for higher standard
    // (If user already accumulated e.g. 100 XP, they immediately get +1 level on Premium!)
    const totalAccumulatedXp = (level - 1) * 100 + xp;
    const newLvl = Math.floor(totalAccumulatedXp / 50) + 1;
    const newXp = totalAccumulatedXp % 50;

    setLevel(newLvl);
    setXp(newXp);
    localStorage.setItem(`mini_rocket_bp_lvl_${activeSeason.id}`, String(newLvl));
    localStorage.setItem(`mini_rocket_bp_xp_${activeSeason.id}`, String(newXp));

    sounds.playCountdownBeep(true);
    setBpMessage({ text: language === 'ca' ? '💎 NETEJA DE COBERTURA COMPLETA: S\'ha desbloquejat el PAS ADVANCED!' : language === 'es' ? '💎 ¡PASE AVANZADO ACTIVADO! Disfruta de recompensas de categoría Épica y Mítica.' : '💎 ADVANCED ACCESS UNLOCKED! Claim super-premium exclusive cosmetics.' });
    setTimeout(() => setBpMessage(null), 4000);
  };

  // Helper verifying if a level is unlocked
  const isLevelUnlocked = (lvl: number) => {
    return level >= lvl;
  };

  // Claim specific reward
  const handleClaimReward = (lvl: number, isPremium: boolean, reward: BattlePassReward['freeReward']) => {
    const claimKey = `${activeSeason.id}_lvl${lvl}_${isPremium ? 'premium' : 'free'}`;
    if (claimed.includes(claimKey)) return;

    // Call callback of specific reward item type to sync with garage immediately
    if (reward.type === 'coins') {
      onAddCoins(reward.amount || 0);
    } else if (reward.type === 'car') {
      onAddUnlockedModel(reward.id);
    } else if (reward.type === 'palette') {
      // For palettes, use proper customized label from preset list
      let paletteName = 'Cobalt Classic';
      if (reward.id === 'palette_blizzard') paletteName = 'Blizzard Frost';
      else if (reward.id === 'palette_omega') paletteName = 'Omega Gold';
      onAddUnlockedPalette(paletteName);
    } else if (reward.type === 'decal') {
      onAddUnlockedDecal(reward.id);
    } else if (reward.type === 'wheels') {
      onAddUnlockedWheels(reward.id);
    }

    const nextClaimed = [...claimed, claimKey];
    setClaimed(nextClaimed);
    localStorage.setItem(`mini_rocket_bp_claimed_${activeSeason.id}`, JSON.stringify(nextClaimed));

    sounds.playCountdownBeep(true);
    setBpMessage({ text: language === 'ca' ? `🎁 S\'ha demanat amb èxit la teva recompensa: "${reward.name}"!` : language === 'es' ? `🎁 ¡Has reclamado con éxito: "${reward.name}" ! Añadido al garaje.` : `🎁 Successfully claimed item: "${reward.name}"! Equipped in your Garage.` });
    setTimeout(() => setBpMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className={`w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-3xl border border-white/10 ${activeSeason.bgGradient} shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col relative`}
        style={{
          boxShadow: `0 0 50px -10px ${activeSeason.accentGlow}`
        }}
      >
        {/* Glowing thematic accent header band */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${activeSeason.themeColor}`} />

        {/* Header Block */}
        <div className="p-6 pb-2 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeSeason.emoji}</span>
              <h1 className="text-2xl font-black italic tracking-tight text-white uppercase font-sans">
                {language === 'es' ? 'PASE DE BATALLA HISTÓRICO' : language === 'ca' ? 'PAS DE BATALLA ESTACIONAL' : 'SEASONAL BATTLE PASS'}
              </h1>
            </div>
            <p className="text-zinc-400 font-medium text-xs mt-0.5">
              {language === 'es' ? 'Doble pista de ascensos y cosméticos de prestigio' : language === 'ca' ? 'Doble pista d\'ascensos i cosmètics de prestigi' : 'Double-track professional pilot milestones and custom rims'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            {/* Season Rotator Selector tabs */}
            <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl self-stretch shrink-0">
              {SEASONS.map((sz, sIdx) => (
                <button
                  key={sz.id}
                  onClick={() => setActiveSeasonIndex(sIdx)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                    activeSeasonIndex === sIdx ? `bg-gradient-to-br ${sz.themeColor} text-white shadow-md` : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title={sz.name}
                >
                  S{sIdx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Header: Season Summary & Current XP Level Progress bar */}
        <div className="bg-black/30 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5">
          <div className="flex-1 space-y-2 max-w-lg">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black uppercase text-transparent bg-clip-text bg-gradient-to-r ${activeSeason.themeColor}`}>
                {activeSeason.name}
              </span>
              <span className="bg-white/10 text-white font-mono text-[9px] px-2 py-0.5 rounded font-black uppercase">
                {activeSeason.id === 'cyber_neon' ? (language === 'ca' ? 'ACTIU' : language === 'es' ? 'ACTIVO' : 'ACTIVE') : (language === 'ca' ? 'REPETIBLE' : language === 'es' ? 'REPETIBLE' : 'ARCHIVED')}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {activeSeason.description}
            </p>
          </div>

          {/* XP PROGRESS BAR SECTION */}
          <div className="w-full lg:w-96 bg-zinc-900/60 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-white flex items-center gap-1">
                {isPaid ? <Crown className="w-3.5 h-3.5 text-yellow-500 fill-current animate-pulse" /> : <Gift className="w-3.5 h-3.5 text-indigo-400" />}
                {language === 'es' ? `NIVEL DEL PASE: ${level}` : language === 'ca' ? `NIVELL DEL PAS: ${level}` : `PASS LEVEL: ${level}`}
              </span>
              <span className="font-mono text-zinc-400">
                {xp} <span className="text-zinc-600">/</span> {xpRequired} XP
              </span>
            </div>

            {/* BAR PROGRESS */}
            <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden relative border border-white/5">
              <div
                className={`h-full bg-gradient-to-r ${activeSeason.themeColor} rounded-full transition-all duration-500`}
                style={{ width: `${(xp / xpRequired) * 100}%` }}
              />
            </div>

            <div className="text-[9px] text-zinc-500 font-mono flex justify-between">
              <span>{isPaid ? '50 XP per Level' : '100 XP per Level'}</span>
              <span>{language === 'es' ? 'Ganado jugando partidos (+25 XP)' : language === 'ca' ? 'Guanyat jugant partits (+25 XP)' : 'Earned by completing matches (+25 XP)'}</span>
            </div>
          </div>
        </div>

        {/* FEEDBACK MASSAGE CONTAINER */}
        <AnimatePresence>
          {bpMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-3 text-xs font-mono font-bold uppercase tracking-wider text-center ${
                bpMessage.error ? 'bg-red-950/40 border-b border-red-500/20 text-red-400' : 'bg-emerald-950/40 border-b border-emerald-500/20 text-emerald-400'
              }`}
            >
              • {bpMessage.text} •
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN BODY: SPLIT VIEW (Buy Tracker Promos vs Grid Rewards) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          {/* LEFT COLUMN: UPGRADE PROMO PANEL FOR PREMIUM TRACK */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
            <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl" />
              
              <div className="flex items-center gap-1.5">
                <Crown className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-[10px] font-black tracking-widest text-zinc-500 font-mono uppercase">
                  {language === 'es' ? 'NIVEL DE ACCESO' : language === 'ca' ? 'NIVELL D\'ACCÉS' : 'UPGRADE ACCESS'}
                </span>
              </div>

              {isPaid ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl flex flex-col gap-1 items-center justify-center text-center">
                  <span className="text-yellow-400 text-lg font-black italic tracking-tight flex items-center gap-1.5">
                    <Crown className="w-4 h-4 fill-current animate-pulse" /> ADVANCED PASS
                  </span>
                  <span className="text-[8.5px] uppercase font-mono font-bold text-yellow-500 tracking-wide">
                    {language === 'es' ? 'DOBLE XP ACELERADO' : language === 'ca' ? 'DOBLE XP ACCELERAT' : 'ACCELERATED 50XP REQUIREMENT'}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-base font-black italic uppercase tracking-normal leading-tight text-white font-sans">
                    {language === 'es' ? 'CONSIGUE EL PASE AVANZADO' : language === 'ca' ? 'ACCONSEGUEIX EL PAS AVANÇAT' : 'GET ADVANCED PASS'}
                  </h3>
                  <ul className="text-[10px] text-zinc-400 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Level up 2x faster (50XP per level instead of 100XP)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Access exclusive premium hypercars-Nemesis & Classified</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Unlock custom glow-wheel models (magma, neon, frost)</span>
                    </li>
                  </ul>

                  <button
                    onClick={handleBuyPremium}
                    className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 active:scale-95 transition-all text-black font-black uppercase text-[10px] tracking-widest cursor-pointer rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(245,158,11,0.2)]"
                  >
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    <span>{language === 'es' ? 'COMPRAR POR 500¢' : language === 'ca' ? 'COMPRAR PER 500¢' : 'BUY ADVANCED (500¢)'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="bg-black/30 border border-white/5 p-4 rounded-2xl text-[9px] font-mono text-zinc-500 space-y-1">
              <span className="font-extrabold uppercase text-zinc-400 block mb-1">💡 PROGRESSION LOGS:</span>
              <p>• Every match played: +25 Battle Pass XP</p>
              <p>• XP matches are computed regardless of win or lose outcome.</p>
              <p>• Change active season anytime! All progress persists safely.</p>
            </div>
          </div>

          {/* RIGHT COLUMN: REWARDS TIERS CHRONOLOGY LIST */}
          <div className="flex-1 space-y-4">
            <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono border-b border-white/5 pb-2">
              🏆 {language === 'es' ? 'HITOS RECOLECTABLES DE LA TEMPORADA' : language === 'ca' ? 'MILLORES I RECOMPENSES DE LA TEMPORADA' : 'SEASONAL LIFETIME REWARD TIMELINE'}
            </h2>

            <div className="space-y-4 pr-1">
              {activeSeason.rewards.map((rw) => {
                const isLvlUnlocked = isLevelUnlocked(rw.level);
                
                const claimKeyFree = `${activeSeason.id}_lvl${rw.level}_free`;
                const isClaimedFree = claimed.includes(claimKeyFree);

                const claimKeyPrem = `${activeSeason.id}_lvl${rw.level}_premium`;
                const isClaimedPrem = claimed.includes(claimKeyPrem);

                const freeRewardItem = rw.freeReward;
                const premiumRewardItem = rw.premiumReward;

                return (
                  <div
                    key={rw.level}
                    className={`border rounded-2xl overflow-hidden p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-all ${
                      isLvlUnlocked
                        ? 'bg-zinc-900/60 border-indigo-500/20 shadow-lg'
                        : 'bg-zinc-950/20 border-white/5 opacity-65'
                    }`}
                  >
                    {/* LEVEL BADGE CELL */}
                    <div className="md:col-span-2 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r border-white/5 pb-3 md:pb-0 md:pr-4 h-full">
                      <span className="text-[10px] font-black uppercase text-zinc-500 font-mono tracking-widest">
                        {language === 'es' ? 'Nivel' : language === 'ca' ? 'Nivell' : 'Level'}
                      </span>
                      <span className={`text-4xl font-extrabold italic leading-none text-transparent bg-clip-text bg-gradient-to-r ${activeSeason.themeColor}`}>
                        {rw.level}
                      </span>
                      {!isLvlUnlocked && (
                        <span className="text-[7.5px] font-mono text-zinc-650 bg-white/5 py-0.5 px-1.5 rounded uppercase mt-1">
                          🔒 {language === 'es' ? 'Bloqueado' : language === 'ca' ? 'Bloquejat' : 'Locked'}
                        </span>
                      )}
                    </div>

                    {/* FREE REWARD CARD CELL */}
                    <div className="md:col-span-5 bg-zinc-950/40 p-3 rounded-xl border border-white/5 relative flex items-center justify-between gap-3 overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-1 bg-zinc-500" />
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl bg-black/40 w-9 h-9 rounded-lg flex items-center justify-center border border-white/5 shadow-inner">
                          {freeRewardItem.displayIcon}
                        </span>
                        <div>
                          <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                            🆓 {language === 'ca' ? 'RECOMPENSA LLIURE' : language === 'es' ? 'RECOMPENSA LIBRE' : 'FREE TRACK'}
                          </span>
                          <span className="text-xxs font-black text-white italic truncate max-w-[120px] block leading-snug">
                            {freeRewardItem.name}
                          </span>
                          <span className="text-[7px] font-bold text-zinc-400 capitalize bg-white/5 rounded px-1 mt-0.5 inline-block">
                            {freeRewardItem.rarity}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isClaimedFree ? (
                          <span className="text-[8.5px] font-black font-mono text-zinc-500 flex items-center gap-0.5 uppercase">
                            <Check className="w-3.5 h-3.5 text-zinc-500" /> Done
                          </span>
                        ) : isLvlUnlocked ? (
                          <button
                            onClick={() => handleClaimReward(rw.level, false, freeRewardItem)}
                            className="bg-white hover:bg-slate-100 text-black font-black text-[9px] uppercase px-3 py-1 cursor-pointer rounded-lg shadow active:scale-95 transition-all tracking-wider"
                          >
                            Claim
                          </button>
                        ) : (
                          <span className="text-[8px] font-mono text-zinc-600 uppercase font-bold">Pending</span>
                        )}
                      </div>
                    </div>

                    {/* PREMIUM REWARD CARD CELL */}
                    <div className="md:col-span-5 bg-zinc-950/40 p-3 rounded-xl border border-white/5 relative flex items-center justify-between gap-3 overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-1 bg-yellow-500" />
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl bg-black/40 w-9 h-9 rounded-lg flex items-center justify-center border border-white/5 shadow-inner">
                          {premiumRewardItem.displayIcon}
                        </span>
                        <div>
                          <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5 fill-current" /> {language === 'ca' ? 'PAS COLL·LECTIBLE' : language === 'es' ? 'PASO AVANZADO' : 'ADVANCED TRACK'}
                          </span>
                          <span className="text-xxs font-black text-white italic truncate max-w-[120px] block leading-snug">
                            {premiumRewardItem.name}
                          </span>
                          <span className="text-[7.5px] font-bold text-yellow-400 bg-yellow-500/10 rounded px-1 mt-0.5 inline-block border border-yellow-500/10">
                            {premiumRewardItem.rarity}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {!isPaid && (
                          <Lock className="w-3 h-3 text-zinc-500 shrink-0" title="Purchase Advanced Pass to claim" />
                        )}

                        {isClaimedPrem ? (
                          <span className="text-[8.5px] font-black font-mono text-yellow-500 flex items-center gap-0.5 uppercase">
                            <Check className="w-3.5 h-3.5 text-yellow-500" /> Done
                          </span>
                        ) : isLvlUnlocked && isPaid ? (
                          <button
                            onClick={() => handleClaimReward(rw.level, true, premiumRewardItem)}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[9px] uppercase px-3 py-1 cursor-pointer rounded-lg shadow active:scale-95 transition-all tracking-wider"
                          >
                            Claim
                          </button>
                        ) : (
                          <span className="text-[8px] font-mono text-zinc-600 uppercase font-bold">
                            {isPaid ? 'Pending' : 'Locked'}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
