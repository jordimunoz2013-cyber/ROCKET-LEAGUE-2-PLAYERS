import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Users, Settings, Award, DollarSign, Activity, ShoppingBag, Play, Calendar, Trophy, Zap, RefreshCw } from 'lucide-react';
import { TRANSLATIONS, Language } from '../localization';

export interface ManagerPlayer {
  id: string;
  name: string;
  attack: number;
  defense: number;
  speed: number;
  potential: number;
  morale: 'high' | 'medium' | 'low';
  role: 'striker' | 'defender' | 'hybrid' | 'goalkeeper';
  salary: number;
  contractLength: number;
  value: number;
}

interface Fixture {
  id: string;
  comp: 'league' | 'cup' | 'champions' | 'world_cup';
  round: number | string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  stage?: 'group' | 'knockout';
  group?: 'A' | 'B';
}

interface TeamStanding {
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

interface ManagerModeProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  coins: number;
  onAddCoins: (amount: number) => void;
  onLaunchSimulatedMatch: (
    opponentTeam: string,
    matchType: '1v1' | '2v2' | '3v3',
    formation: 'offensive' | 'balanced' | 'defensive',
    tactics: {
      aggression: number;
      riskLevel: number;
      boostPriority: number;
      rotationStrictness: number;
    },
    lineup: ManagerPlayer[],
    playMode?: 'play' | 'watch'
  ) => void;
}

const DRAFT_POOL: ManagerPlayer[] = [
  { id: 'scout-1', name: 'Zane Vance', attack: 88, defense: 62, speed: 91, potential: 94, morale: 'high', role: 'striker', salary: 120, contractLength: 5, value: 500 },
  { id: 'scout-2', name: 'Kaelen Reed', attack: 65, defense: 87, speed: 78, potential: 90, morale: 'medium', role: 'defender', salary: 110, contractLength: 4, value: 450 },
  { id: 'scout-3', name: 'Tarek Cruz', attack: 75, defense: 75, speed: 82, potential: 85, morale: 'medium', role: 'hybrid', salary: 95, contractLength: 6, value: 380 },
  { id: 'scout-4', name: 'Elena Hale', attack: 52, defense: 92, speed: 70, potential: 95, morale: 'high', role: 'goalkeeper', salary: 130, contractLength: 5, value: 600 },
  { id: 'scout-5', name: 'Jordi Català', attack: 94, defense: 55, speed: 96, potential: 98, morale: 'high', role: 'striker', salary: 160, contractLength: 8, value: 850 },
  { id: 'scout-6', name: 'Sienna Brooks', attack: 81, defense: 69, speed: 85, potential: 88, morale: 'low', role: 'hybrid', salary: 80, contractLength: 3, value: 310 },
];

export const ManagerMode: React.FC<ManagerModeProps> = ({
  isOpen,
  onClose,
  language,
  coins,
  onAddCoins,
  onLaunchSimulatedMatch,
}) => {
  const t = TRANSLATIONS[language];

  // SUB-TABS MANAGEMENT
  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'competitions' | 'squad' | 'tactics' | 'scout'>('matches');
  const [activeComp, setActiveComp] = useState<'league' | 'cup' | 'champions' | 'world_cup'>('league');

  // CORE PERSISTED STATES
  const [clubName, setClubName] = useState<string>("Barcelona Rockets");
  const [showClubOnboarding, setShowClubOnboarding] = useState<boolean>(false);
  const [customClubName, setCustomClubName] = useState<string>("Barcelona Rockets");

  const [squad, setSquad] = useState<ManagerPlayer[]>([]);
  const [scouts, setScouts] = useState<ManagerPlayer[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);

  // TACTICAL PARAMETERS
  const [currentFormation, setCurrentFormation] = useState<'offensive' | 'balanced' | 'defensive'>('balanced');
  const [aggression, setAggression] = useState<number>(0.65);
  const [riskLevel, setRiskLevel] = useState<number>(0.5);
  const [boostPriority, setBoostPriority] = useState<number>(0.75);
  const [rotationStrictness, setRotationStrictness] = useState<number>(0.6);

  // DETAILED MODAL STATS STATE
  const [simResult, setSimResult] = useState<{
    isOpen: boolean;
    comp: string;
    round: string | number;
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
    stats: any;
  } | null>(null);

  // 1. LIFECYCLE INITIALIZER & TELEMETRY LISTENER
  useEffect(() => {
    // Determine Onboarding necessity
    const savedClub = localStorage.getItem('mini_rocket_manager_club_name');
    if (!savedClub) {
      setShowClubOnboarding(true);
    } else {
      setClubName(savedClub);
      setCustomClubName(savedClub);
    }

    // Load static arrays
    const savedSquad = localStorage.getItem('mini_rocket_manager_squad');
    if (savedSquad) {
      try { setSquad(JSON.parse(savedSquad)); } catch (e) { initializeDefaultSquad(); }
    } else {
      initializeDefaultSquad();
    }

    const savedScouts = localStorage.getItem('mini_rocket_manager_scouts');
    if (savedScouts) {
      try { setScouts(JSON.parse(savedScouts)); } catch (e) { setScouts(DRAFT_POOL); }
    } else {
      setScouts(DRAFT_POOL);
    }

    const savedFixtures = localStorage.getItem('mini_rocket_manager_fixtures');
    let loadedFixtures: Fixture[] = [];
    if (savedFixtures) {
      try {
        loadedFixtures = JSON.parse(savedFixtures);
        setFixtures(loadedFixtures);
      } catch (e) {
        loadedFixtures = generateAllFixtures(savedClub || "Barcelona Rockets");
      }
    } else {
      loadedFixtures = generateAllFixtures(savedClub || "Barcelona Rockets");
    }

    // LISTENER FOR PENDING COMPLETED MATCHES FROM THE PHYSICS ENGINE
    const pendingResultStr = localStorage.getItem('mini_rocket_pending_manager_match');
    if (pendingResultStr && loadedFixtures.length > 0) {
      try {
        const result = JSON.parse(pendingResultStr);
        let updated = [...loadedFixtures];
        const matchIdx = updated.findIndex(f => f.id === result.fixtureId);
        if (matchIdx !== -1) {
          const fx = updated[matchIdx];
          
          // Identify if player team was home or away to align goals properly
          const isHome = fx.home === clubName || fx.home === "Barcelona Rockets";
          fx.homeScore = isHome ? result.blueGoals : result.redGoals;
          fx.awayScore = isHome ? result.redGoals : result.blueGoals;
          fx.played = true;
          updated[matchIdx] = fx;

          // Auto-simulate other fixtures of that round
          updated = autoSimulateRemainingMatches(updated, fx.comp, fx.round);

          // Handle bracket and group promotions
          updated = handleKnockoutAdvancement(updated, fx.comp, fx.round, savedClub || "Barcelona Rockets");

          setFixtures(updated);
          localStorage.setItem('mini_rocket_manager_fixtures', JSON.stringify(updated));

          // Load popups
          setSimResult({
            isOpen: true,
            comp: fx.comp,
            round: fx.round,
            home: fx.home,
            away: fx.away,
            homeScore: fx.homeScore!,
            awayScore: fx.awayScore!,
            stats: generateRandomStats(fx.homeScore!, fx.awayScore!)
          });
        }
      } catch (e) {
        console.error("Critical error parsing telemetry:", e);
      }
      localStorage.removeItem('mini_rocket_pending_manager_match');
    }
  }, [clubName]);

  const initializeDefaultSquad = () => {
    const initial: ManagerPlayer[] = [
      { id: 'init-1', name: 'Leo Finch', attack: 72, defense: 58, speed: 76, potential: 84, morale: 'high', role: 'striker', salary: 60, contractLength: 10, value: 200 },
      { id: 'init-2', name: 'Maya Lin', attack: 52, defense: 78, speed: 65, potential: 82, morale: 'medium', role: 'defender', salary: 55, contractLength: 8, value: 180 },
      { id: 'init-3', name: 'Zaid Tariq', attack: 64, defense: 64, speed: 70, potential: 80, morale: 'medium', role: 'hybrid', salary: 50, contractLength: 12, value: 160 },
    ];
    setSquad(initial);
    localStorage.setItem('mini_rocket_manager_squad', JSON.stringify(initial));
  };


  // FIXTURES SCHEDULER (Unified System)
  const generateAllFixtures = (activeClub: string) => {
    const defaultLeagues = [
      activeClub, "Madrid Motors", "Thunder FC", "Velocity United",
      "Cyber Shredders", "Glacier Giants", "Tokyo Sunset", "Quantum Singularity FC"
    ];

    // Round-Robin generators
    const list = [...defaultLeagues];
    const n = list.length;
    const items: Fixture[] = [];
    
    for (let r = 1; r < n; r++) {
      for (let i = 0; i < n / 2; i++) {
        items.push({
          id: `league_r${r}_m${i}`,
          comp: 'league',
          round: r,
          home: list[i],
          away: list[n - 1 - i],
          homeScore: null,
          awayScore: null,
          played: false
        });
      }
      const first = list[0];
      const rest = list.slice(1);
      const popped = rest.pop()!;
      list[0] = first;
      list[1] = popped;
      for (let j = 0; j < rest.length; j++) {
        list[2 + j] = rest[j];
      }
    }

    // CUP KNOCKOUT BRACKET QF INITIALIZERS
    const cupItems: Fixture[] = [
      { id: 'cup_qf_1', comp: 'cup', round: 'qf', home: activeClub, away: "Tokyo Sunset", homeScore: null, awayScore: null, played: false },
      { id: 'cup_qf_2', comp: 'cup', round: 'qf', home: "Madrid Motors", away: "Quantum Singularity FC", homeScore: null, awayScore: null, played: false },
      { id: 'cup_qf_3', comp: 'cup', round: 'qf', home: "Thunder FC", away: "Glacier Giants", homeScore: null, awayScore: null, played: false },
      { id: 'cup_qf_4', comp: 'cup', round: 'qf', home: "Velocity United", away: "Cyber Shredders", homeScore: null, awayScore: null, played: false },
      { id: 'cup_sf_1', comp: 'cup', round: 'sf', home: 'Winner QF1', away: 'Winner QF2', homeScore: null, awayScore: null, played: false },
      { id: 'cup_sf_2', comp: 'cup', round: 'sf', home: 'Winner QF3', away: 'Winner QF4', homeScore: null, awayScore: null, played: false },
      { id: 'cup_f_1', comp: 'cup', round: 'final', home: 'Winner SF1', away: 'Winner SF2', homeScore: null, awayScore: null, played: false }
    ];

    // CHAMPIONS GROUP STAGE A & B LISTINGS
    const clGroupAFx: Fixture[] = [
      { id: 'cl_g1_1', comp: 'champions', round: 1, home: activeClub, away: "Milan Machs", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'cl_g1_2', comp: 'champions', round: 1, home: "Munich Motors", away: "Paris Power", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'cl_g2_1', comp: 'champions', round: 2, home: activeClub, away: "Munich Motors", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'cl_g2_2', comp: 'champions', round: 2, home: "Milan Machs", away: "Paris Power", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'cl_g3_1', comp: 'champions', round: 3, home: activeClub, away: "Paris Power", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'cl_g3_2', comp: 'champions', round: 3, home: "Milan Machs", away: "Munich Motors", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' }
    ];
    const clGroupBFx: Fixture[] = [
      { id: 'cl_gb1_1', comp: 'champions', round: 1, home: "London Lightnings", away: "Lisbon Lions", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'cl_gb1_2', comp: 'champions', round: 1, home: "Madrid Motors", away: "Amsterdam Arrows", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'cl_gb2_1', comp: 'champions', round: 2, home: "London Lightnings", away: "Madrid Motors", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'cl_gb2_2', comp: 'champions', round: 2, home: "Lisbon Lions", away: "Amsterdam Arrows", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'cl_gb3_1', comp: 'champions', round: 3, home: "London Lightnings", away: "Amsterdam Arrows", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'cl_gb3_2', comp: 'champions', round: 3, home: "Lisbon Lions", away: "Madrid Motors", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' }
    ];
    const clKnockouts: Fixture[] = [
      { id: 'cl_sf_1', comp: 'champions', round: 'sf', home: 'Winner Group A', away: 'Runner Group B', homeScore: null, awayScore: null, played: false, stage: 'knockout' },
      { id: 'cl_sf_2', comp: 'champions', round: 'sf', home: 'Winner Group B', away: 'Runner Group A', homeScore: null, awayScore: null, played: false, stage: 'knockout' },
      { id: 'cl_f_1', comp: 'champions', round: 'final', home: 'Winner SF1', away: 'Winner SF2', homeScore: null, awayScore: null, played: false, stage: 'knockout' }
    ];

    // WORLD CUP fixtures List
    const wcGroupA: Fixture[] = [
      { id: 'wc_ga1_1', comp: 'world_cup', round: 1, home: "Catalonia", away: "Spain", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'wc_ga1_2', comp: 'world_cup', round: 1, home: "Germany", away: "Brazil", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'wc_ga2_1', comp: 'world_cup', round: 2, home: "Catalonia", away: "Germany", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'wc_ga2_2', comp: 'world_cup', round: 2, home: "Spain", away: "Brazil", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'wc_ga3_1', comp: 'world_cup', round: 3, home: "Catalonia", away: "Brazil", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' },
      { id: 'wc_ga3_2', comp: 'world_cup', round: 3, home: "Spain", away: "Germany", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'A' }
    ];
    const wcGroupB: Fixture[] = [
      { id: 'wc_gb1_1', comp: 'world_cup', round: 1, home: "France", away: "USA", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'wc_gb1_2', comp: 'world_cup', round: 1, home: "Japan", away: "Argentina", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'wc_gb2_1', comp: 'world_cup', round: 2, home: "France", away: "Japan", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'wc_gb2_2', comp: 'world_cup', round: 2, home: "USA", away: "Argentina", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'wc_gb3_1', comp: 'world_cup', round: 3, home: "France", away: "Argentina", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' },
      { id: 'wc_gb3_2', comp: 'world_cup', round: 3, home: "USA", away: "Japan", homeScore: null, awayScore: null, played: false, stage: 'group', group: 'B' }
    ];
    const wcKnockouts: Fixture[] = [
      { id: 'wc_sf_1', comp: 'world_cup', round: 'sf', home: 'Winner Group A', away: 'Runner Group B', homeScore: null, awayScore: null, played: false, stage: 'knockout' },
      { id: 'wc_sf_2', comp: 'world_cup', round: 'sf', home: 'Winner Group B', away: 'Runner Group A', homeScore: null, awayScore: null, played: false, stage: 'knockout' },
      { id: 'wc_f_1', comp: 'world_cup', round: 'final', home: 'Winner SF1', away: 'Winner SF2', homeScore: null, awayScore: null, played: false, stage: 'knockout' }
    ];

    const finalSet = [...items, ...cupItems, ...clGroupAFx, ...clGroupBFx, ...clKnockouts, ...wcGroupA, ...wcGroupB, ...wcKnockouts];
    setFixtures(finalSet);
    localStorage.setItem('mini_rocket_manager_fixtures', JSON.stringify(finalSet));
    return finalSet;
  };

  const autoSimulateRemainingMatches = (list: Fixture[], comp: string, round: number | string): Fixture[] => {
    return list.map(f => {
      if (f.comp === comp && f.round === round && !f.played) {
        let homeBias = f.home.includes("Singularity") || f.home.includes("Sunset") ? 1 : 0;
        let awayBias = f.away.includes("Singularity") || f.away.includes("Sunset") ? 1 : 0;
        let hs = Math.max(0, Math.floor(Math.random() * 4) + homeBias);
        let as = Math.max(0, Math.floor(Math.random() * 4) + awayBias);
        
        // No draw allowed in bracket finals
        if ((comp === 'cup' || round === 'sf' || round === 'final') && hs === as) {
          if (Math.random() > 0.5) hs += 1; else as += 1;
        }

        return { ...f, homeScore: hs, awayScore: as, played: true };
      }
      return f;
    });
  };

  const handleKnockoutAdvancement = (list: Fixture[], comp: string, round: number | string, activeClub: string): Fixture[] => {
    const roundMatches = list.filter(f => f.comp === comp && f.round === round);
    if (!roundMatches.every(f => f.played)) return list;

    let updated = [...list];

    if (comp === 'cup') {
      if (round === 'qf') {
        const winners = roundMatches.map(f => (f.homeScore ?? 0) > (f.awayScore ?? 0) ? f.home : f.away);
        let count = 0;
        updated = updated.map(f => {
          if (f.comp === 'cup' && f.round === 'sf') {
            const hIdx = count * 2;
            const aIdx = hIdx + 1;
            count++;
            return { ...f, home: winners[hIdx] || 'Winner QF', away: winners[aIdx] || 'Winner QF', played: false, homeScore: null, awayScore: null };
          }
          return f;
        });
      } else if (round === 'sf') {
        const winners = roundMatches.map(f => (f.homeScore ?? 0) > (f.awayScore ?? 0) ? f.home : f.away);
        updated = updated.map(f => {
          if (f.comp === 'cup' && f.round === 'final') {
            return { ...f, home: winners[0] || 'Winner SF1', away: winners[1] || 'Winner SF2', played: false, homeScore: null, awayScore: null };
          }
          return f;
        });
      }
    } else if (comp === 'champions' || comp === 'world_cup') {
      if (round === 3) {
        const stdA = getGroupStandings(list, comp, 'A');
        const stdB = getGroupStandings(list, comp, 'B');
        const winA = stdA[0]?.teamName || 'Winner A';
        const runA = stdA[1]?.teamName || 'Runner A';
        const winB = stdB[0]?.teamName || 'Winner B';
        const runB = stdB[1]?.teamName || 'Runner B';

        updated = updated.map(f => {
          if (f.comp === comp && f.round === 'sf') {
            if (f.id.endsWith('1')) {
              return { ...f, home: winA, away: runB, played: false, homeScore: null, awayScore: null };
            } else {
              return { ...f, home: winB, away: runA, played: false, homeScore: null, awayScore: null };
            }
          }
          return f;
        });
      } else if (round === 'sf') {
        const winners = roundMatches.map(f => (f.homeScore ?? 0) > (f.awayScore ?? 0) ? f.home : f.away);
        updated = updated.map(f => {
          if (f.comp === comp && f.round === 'final') {
            return { ...f, home: winners[0] || 'Winner SF1', away: winners[1] || 'Winner SF2', played: false, homeScore: null, awayScore: null };
          }
          return f;
        });
      }
    }

    return updated;
  };

  const getGroupStandings = (list: Fixture[], comp: string, group: 'A' | 'B'): TeamStanding[] => {
    const teamsMap: Record<string, boolean> = {};
    list.filter(f => f.comp === comp && f.group === group).forEach(f => {
      teamsMap[f.home] = true;
      teamsMap[f.away] = true;
    });
    
    const records: Record<string, TeamStanding> = {};
    Object.keys(teamsMap).forEach(tName => {
      records[tName] = { teamName: tName, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });

    list.filter(f => f.comp === comp && f.group === group && f.played).forEach(f => {
      const h = f.home;
      const a = f.away;
      const hs = f.homeScore ?? 0;
      const as = f.awayScore ?? 0;

      if (!records[h] || !records[a]) return;

      records[h].played += 1;
      records[a].played += 1;
      records[h].gf += hs;
      records[h].ga += as;
      records[a].gf += as;
      records[a].ga += hs;

      if (hs > as) {
        records[h].wins += 1;
        records[h].pts += 3;
        records[a].losses += 1;
      } else if (as > hs) {
        records[a].wins += 1;
        records[a].pts += 3;
        records[h].losses += 1;
      } else {
        records[h].draws += 1;
        records[h].pts += 1;
        records[a].draws += 1;
        records[a].pts += 1;
      }
    });

    return Object.values(records).map(r => {
      r.gd = r.gf - r.ga;
      return r;
    }).sort((x, y) => {
      if (y.pts !== x.pts) return y.pts - x.pts;
      if (y.gd !== x.gd) return y.gd - x.gd;
      return y.gf - x.gf;
    });
  };

  const generateRandomStats = (hs: number, as: number) => {
    return {
      shots: [hs + Math.floor(Math.random() * 5 + 3), as + Math.floor(Math.random() * 5 + 3)],
      possession: [Math.floor(Math.random() * 20 + 40), 0],
      boost: [Math.floor(Math.random() * 150 + 200), Math.floor(Math.random() * 150 + 200)],
      tackles: [Math.floor(Math.random() * 8 + 3), Math.floor(Math.random() * 8 + 3)]
    };
  };

  // INSTANT MATH/SIMULATION ENGINE (Simulate It)
  const handleInstantSimulate = (fx: Fixture) => {
    let hs = Math.floor(Math.random() * 4);
    let as = Math.floor(Math.random() * 4);

    // No draw allowed in bracket finals
    if ((fx.comp === 'cup' || fx.round === 'sf' || fx.round === 'final') && hs === as) {
      if (Math.random() > 0.5) hs += 1; else as += 1;
    }

    let updated = [...fixtures];
    const idx = updated.findIndex(f => f.id === fx.id);
    if (idx !== -1) {
      updated[idx].homeScore = hs;
      updated[idx].awayScore = as;
      updated[idx].played = true;

      // Simulate remaining matches for that round
      updated = autoSimulateRemainingMatches(updated, fx.comp, fx.round);

      // Advance brackets
      updated = handleKnockoutAdvancement(updated, fx.comp, fx.round, clubName);

      setFixtures(updated);
      localStorage.setItem('mini_rocket_manager_fixtures', JSON.stringify(updated));

      // Math Coin formula: +10 participation, +15 victory bonus if won
      const isPlayerHome = fx.home === clubName || fx.home === "Barcelona Rockets";
      const isPlayerAway = fx.away === clubName || fx.away === "Barcelona Rockets";
      const playerWon = (isPlayerHome && hs > as) || (isPlayerAway && as > hs);
      const earned = playerWon ? 25 : 10;
      onAddCoins(earned);

      setSimResult({
        isOpen: true,
        comp: fx.comp,
        round: fx.round,
        home: fx.home,
        away: fx.away,
        homeScore: hs,
        awayScore: as,
        stats: generateRandomStats(hs, as)
      });
    }
  };


  // DIRECT SQUAD RECRUITMENT
  const buyPlayer = (player: ManagerPlayer) => {
    if (coins < player.value) {
      alert("Insufficient Treasury Funds! Secure tour victories to acquire prestige pilots.");
      return;
    }
    onAddCoins(-player.value);
    const updated = [...squad, { ...player, morale: 'high' as const }];
    setSquad(updated);
    localStorage.setItem('mini_rocket_manager_squad', JSON.stringify(updated));

    const updatedScouts = scouts.filter(s => s.id !== player.id);
    setScouts(updatedScouts);
    localStorage.setItem('mini_rocket_manager_scouts', JSON.stringify(updatedScouts));
  };

  const sellPlayer = (player: ManagerPlayer) => {
    if (squad.length <= 1) {
      alert("Refused! Your lineup registry requires at least 1 pilot.");
      return;
    }
    const refund = Math.round(player.value * 0.7);
    onAddCoins(refund);

    const updated = squad.filter(s => s.id !== player.id);
    setSquad(updated);
    localStorage.setItem('mini_rocket_manager_squad', JSON.stringify(updated));

    if (!scouts.some(s => s.name === player.name)) {
      const back = [...scouts, { ...player, id: `scout-${Date.now()}` }];
      setScouts(back);
      localStorage.setItem('mini_rocket_manager_scouts', JSON.stringify(back));
    }
  };

  const handleResetTournament = () => {
    if (window.confirm("Permanently reset tournament fixtures and league standings?")) {
      const generated = generateAllFixtures(clubName);
      setFixtures(generated);
      localStorage.setItem('mini_rocket_manager_fixtures', JSON.stringify(generated));
    }
  };

  // HELPER FOR RETRIEVING THE NEXT RELEVANT UNPLAYED PLAYER MATCH
  const getNextPlayerFixture = (cType: typeof activeComp) => {
    return fixtures.find(f => 
      f.comp === cType && 
      !f.played && 
      (f.home === clubName || f.home === "Barcelona Rockets" || f.away === clubName || f.away === "Barcelona Rockets")
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col h-[90vh] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden font-sans text-white"
        >
          {/* Header dashboard layout */}
          <div className="p-5 border-b border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black italic tracking-wide uppercase">ROCKET CARS MANAGER 2026</h2>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                  Club: <span className="text-emerald-400">{clubName}</span> • Signed pilots: {squad.length} Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-black text-yellow-500 font-mono">{coins} Credits</span>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigational TABS bar */}
          <div className="flex flex-wrap border-b border-zinc-900 bg-zinc-950/60 p-1.5 gap-1">
            {([
              { id: 'matches', val: 'Matchday', icon: Calendar },
              { id: 'competitions', val: 'Leagues & Brackets', icon: Trophy },
              { id: 'squad', val: 'Command Squad', icon: Users },
              { id: 'tactics', val: 'Tactical Playbook', icon: Settings },
              { id: 'scout', val: 'Scout Market', icon: ShoppingBag }
            ] as const).map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id);
                    if (tab.id === 'competitions') setActiveComp('league');
                  }}
                  className={`flex-1 min-w-[90px] py-3 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 rounded-lg transition-all cursor-pointer ${
                    activeSubTab === tab.id ? 'bg-zinc-900 border border-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.val}</span>
                </button>
              );
            })}
          </div>

          {/* MAIN INTERNAL DISPLAY VIEWPORT */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-zinc-950/30">

            {/* BLOCK 1: MATCHDAY TRACKER */}
            {activeSubTab === 'matches' && (
              <div className="space-y-4">
                
                {/* Mode Selector */}
                <div className="flex border-b border-zinc-900 bg-zinc-950 gap-1 p-1 rounded-xl">
                  {([
                    { id: 'league', label: 'Super League' },
                    { id: 'cup', label: 'Super Car Cup' },
                    { id: 'champions', label: 'Champions League' },
                    { id: 'world_cup', label: 'World Cup (NT)' }
                  ] as const).map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveComp(c.id)}
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                        activeComp === c.id ? 'bg-zinc-900 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Dashboard Action panel displaying next fixture */}
                {(() => {
                  const nextFx = getNextPlayerFixture(activeComp);
                  if (!nextFx) {
                    return (
                      <div className="bg-zinc-900/40 p-12 text-center rounded-2xl border border-dashed border-zinc-850">
                        <Award className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                        <h4 className="text-sm font-black uppercase text-white">Competition Concluded!</h4>
                        <p className="text-[10px] text-zinc-500 uppercase mt-1 font-mono">You completed all scheduling grids for this tournament bracket.</p>
                        <button
                          onClick={handleResetTournament}
                          className="mt-4 px-4 py-2 hover:bg-zinc-800 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-mono tracking-widest text-zinc-300 uppercase cursor-pointer"
                        >
                          Reset Tournament Calendar
                        </button>
                      </div>
                    );
                  }

                  const isHome = nextFx.home === clubName || nextFx.home === "Barcelona Rockets";
                  const opponentName = isHome ? nextFx.away : nextFx.home;

                  return (
                    <div className="bg-zinc-900/75 p-5 rounded-2xl border border-zinc-850 space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-black uppercase px-2.5 py-1 bg-zinc-950 text-emerald-400 rounded-lg">
                          Next Matchday • Round {nextFx.round}
                        </span>
                        <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">
                          Tournament: {activeComp.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-4 py-4">
                        <div className="flex-1 text-right">
                          <div className="text-sm font-black uppercase">{nextFx.home}</div>
                          <span className="text-[9px] text-zinc-550 italic">HOME</span>
                        </div>
                        <div className="w-12 h-12 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-center font-black text-zinc-400 text-lg">
                          VS
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-black uppercase text-zinc-200">{nextFx.away}</div>
                          <span className="text-[9px] text-zinc-550 italic">AWAY</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          onClick={() => {
                            localStorage.setItem('mini_rocket_active_manager_fixture', JSON.stringify(nextFx));
                            onLaunchSimulatedMatch(
                              opponentName,
                              '2v2',
                              currentFormation,
                              { aggression, riskLevel, boostPriority, rotationStrictness },
                              squad,
                              'play'
                            );
                          }}
                          className="py-3 bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" />
                          <span>Play Match</span>
                        </button>

                        <button
                          onClick={() => {
                            localStorage.setItem('mini_rocket_active_manager_fixture', JSON.stringify(nextFx));
                            onLaunchSimulatedMatch(
                              opponentName,
                              '2v2',
                              currentFormation,
                              { aggression, riskLevel, boostPriority, rotationStrictness },
                              squad,
                              'watch'
                            );
                          }}
                          className="py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Watch Bot SIM</span>
                        </button>

                        <button
                          onClick={() => handleInstantSimulate(nextFx)}
                          className="py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Instantly Simulate</span>
                        </button>
                      </div>

                    </div>
                  );
                })()}

                {/* Listing historic played fixtures of current active tour */}
                <div className="space-y-2">
                  <h3 className="text-[10px] text-zinc-400 font-mono font-black uppercase tracking-widest block">Round Calendar</h3>
                  <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl max-h-[220px] overflow-y-auto divide-y divide-zinc-900 custom-scrollbar">
                    {fixtures.filter(f => f.comp === activeComp).map((fx) => (
                      <div key={fx.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-zinc-950/20">
                        <div className="flex items-center gap-3">
                          <span className="text-[8.5px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400">R{fx.round}</span>
                          <span className="uppercase text-zinc-300 font-bold">{fx.home} vs {fx.away}</span>
                        </div>
                        {fx.played ? (
                          <span className="font-mono font-black text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">{fx.homeScore} - {fx.awayScore}</span>
                        ) : (
                          <span className="font-mono text-zinc-500 uppercase tracking-widest text-[8.5px]">UNPLAYED</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* BLOCK 2: COMPETITIONS TABLES & STANDINGS */}
            {activeSubTab === 'competitions' && (
              <div className="space-y-4">
                <div className="flex border-b border-zinc-900 bg-zinc-950 gap-1 p-1 rounded-xl">
                  {([
                    { id: 'league', label: 'Standings' },
                    { id: 'cup', label: 'Cup Bracket' },
                    { id: 'champions', label: 'Champions Group' },
                    { id: 'world_cup', label: 'World Standings' }
                  ] as const).map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveComp(c.id)}
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                        activeComp === c.id ? 'bg-zinc-900 text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* SHOWING CLUBS LEAGUE DIRECT LEADERBOARD */}
                {(activeComp === 'league' || activeComp === 'world_cup' || activeComp === 'champions') && (
                  <div className="space-y-4">
                    {(() => {
                      const groupsToRender = activeComp === 'champions' ? ['A', 'B'] : [undefined];
                      return groupsToRender.map((grpName, gIdx) => {
                        const tbl = getGroupStandings(fixtures, activeComp, grpName as any);
                        return (
                          <div key={gIdx} className="space-y-2">
                            {grpName && <h4 className="text-[10px] font-black uppercase text-yellow-500">Group {grpName} Stage</h4>}
                            <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                                  <tr>
                                    <th className="p-3 pl-4">Team</th>
                                    <th className="p-3 text-center">PL</th>
                                    <th className="p-3 text-center">W</th>
                                    <th className="p-3 text-center">D</th>
                                    <th className="p-3 text-center">L</th>
                                    <th className="p-3 text-center text-zinc-400">GD</th>
                                    <th className="p-3 text-right pr-4 text-emerald-400">PTS</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900">
                                  {tbl.map((row, idx) => (
                                    <tr key={idx} className={`hover:bg-zinc-900/15 ${row.teamName === clubName ? 'bg-emerald-500/5' : ''}`}>
                                      <td className="p-3 pl-4 font-bold max-w-[150px] truncate uppercase">
                                        <span className="text-zinc-500 font-mono text-[10px] mr-2.5">#{idx+1}</span>
                                        {row.teamName}
                                      </td>
                                      <td className="p-3 text-center font-mono">{row.played}</td>
                                      <td className="p-3 text-center font-mono text-zinc-300">{row.wins}</td>
                                      <td className="p-3 text-center font-mono text-zinc-400">{row.draws}</td>
                                      <td className="p-3 text-center font-mono text-zinc-500">{row.losses}</td>
                                      <td className="p-3 text-center font-mono">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                                      <td className="p-3 text-right pr-4 font-black font-mono text-emerald-400">{row.pts}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}

                {/* SHOWING CUP BRACKET TREE */}
                {activeComp === 'cup' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3">
                    {/* Quarterfinals */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 font-mono font-black uppercase tracking-wider">Quarter Finals (QF)</span>
                      <div className="space-y-2">
                        {fixtures.filter(f => f.comp === 'cup' && f.round === 'qf').map(fx => (
                          <div key={fx.id} className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-850 text-[10.5px]">
                            <div className="flex items-center justify-between text-zinc-300">
                              <span className="truncate">{fx.home}</span>
                              <span className="font-mono text-white font-black">{fx.played ? fx.homeScore : '-'}</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-400 mt-1.5">
                              <span className="truncate">{fx.away}</span>
                              <span className="font-mono text-white font-black">{fx.played ? fx.awayScore : '-'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Semifinals */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 font-mono font-black uppercase tracking-wider">Semi Finals (SF)</span>
                      <div className="space-y-2">
                        {fixtures.filter(f => f.comp === 'cup' && f.round === 'sf').map(fx => (
                          <div key={fx.id} className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-850 text-[10.5px]">
                            <div className="flex items-center justify-between text-zinc-300">
                              <span className="truncate">{fx.home}</span>
                              <span className="font-mono text-white font-black">{fx.played ? fx.homeScore : '-'}</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-400 mt-1.5">
                              <span className="truncate">{fx.away}</span>
                              <span className="font-mono text-white font-black">{fx.played ? fx.awayScore : '-'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Final */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 font-mono font-black uppercase tracking-wider">Grand Finals</span>
                      <div className="space-y-2">
                        {fixtures.filter(f => f.comp === 'cup' && f.round === 'final').map(fx => (
                          <div key={fx.id} className="p-3 bg-yellow-500/5 hover:bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-[11px]">
                            <div className="flex items-center justify-between text-yellow-400 font-bold">
                              <span className="truncate">{fx.home}</span>
                              <span className="font-mono font-black">{fx.played ? fx.homeScore : '-'}</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-300 mt-2">
                              <span className="truncate">{fx.away}</span>
                              <span className="font-mono font-black">{fx.played ? fx.awayScore : '-'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* BLOCK 3: SQUAD MANAGEMENT */}
            {activeSubTab === 'squad' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {squad.map((player) => {
                    const rating = Math.round((player.attack + player.defense + player.speed) / 3);
                    return (
                      <motion.div
                        key={player.id}
                        layout
                        className="bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between gap-4 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wide">{player.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-emerald-400 rounded-md font-mono">OVR {rating}</span>
                            </div>
                            <p className="text-[8.5px] text-zinc-500 font-mono mt-1 uppercase">Moral Index: HEALTHY • Potential OVR: {player.potential}</p>
                          </div>

                          <div className="text-[9px] bg-zinc-950 border border-zinc-850 py-1.5 px-2 text-[#4ade80] font-black uppercase rounded-lg">
                            {player.role.toUpperCase()}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-zinc-900 text-center font-mono">
                          <div>
                            <span className="text-[8px] text-zinc-550 block">STRIKE</span>
                            <span className="text-xs font-bold text-red-400">{player.attack}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-550 block">DEFENSE</span>
                            <span className="text-xs font-bold text-blue-400">{player.defense}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-550 block">SPEED</span>
                            <span className="text-xs font-bold text-amber-500">{player.speed}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[8.5px] text-zinc-500 font-mono leading-none">Salary: {player.salary} c/m</span>
                          <button
                            onClick={() => sellPlayer(player)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-red-500/20 cursor-pointer"
                          >
                            SELL PILOT (+{Math.round(player.value * 0.7)}c)
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BLOCK 4: TACTICS EDITOR */}
            {activeSubTab === 'tactics' && (
              <div className="space-y-4">
                
                {/* Formations button grid */}
                <div className="space-y-2">
                  <h3 className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">TACTICS FORMATION PLAN</h3>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['balanced', 'offensive', 'defensive'] as const).map(fmt => {
                      const active = currentFormation === fmt;
                      return (
                        <button
                          key={fmt}
                          onClick={() => setCurrentFormation(fmt)}
                          className={`py-3.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer text-center border transition-all ${
                            active ? 'bg-white text-zinc-950 border-white' : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {fmt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl space-y-4 font-mono text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider">Team Aggression Index</span>
                      <span className="text-emerald-400 font-bold">{Math.round(aggression * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0.1" max="1.0" step="0.05" value={aggression}
                      onChange={(e) => setAggression(parseFloat(e.target.value))}
                      className="w-full accent-emerald-400 appearance-none bg-zinc-800 h-1 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider">Aerial Risks Commitment</span>
                      <span className="text-[#38bdf8] font-bold">{Math.round(riskLevel * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0.1" max="1.0" step="0.05" value={riskLevel}
                      onChange={(e) => setRiskLevel(parseFloat(e.target.value))}
                      className="w-full accent-blue-400 appearance-none bg-zinc-800 h-1 rounded-lg"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* BLOCK 5: RECRUITS/SCOUT MARKET */}
            {activeSubTab === 'scout' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scouts.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-zinc-650 uppercase font-bold text-xs tracking-wider">
                      Scout catalog depleted. Signings will refresh on subsequent matchdays.
                    </div>
                  ) : (
                    scouts.map((sc) => {
                      const rating = Math.round((sc.attack + sc.defense + sc.speed) / 3);
                      return (
                        <div key={sc.id} className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between gap-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-black uppercase">{sc.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-zinc-910 text-yellow-500 rounded font-mono ml-2">OVR {rating}</span>
                            </div>
                            <span className="text-xs font-black text-yellow-500 font-mono font-bold leading-none">{sc.value} Cr</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono border-t border-b border-zinc-900 py-2">
                            <div>
                              <span className="text-zinc-550 block">STRIKE</span>
                              <span className="font-bold text-zinc-300">{sc.attack}</span>
                            </div>
                            <div>
                              <span className="text-zinc-550 block">DEFENSE</span>
                              <span className="font-bold text-zinc-300">{sc.defense}</span>
                            </div>
                            <div>
                              <span className="text-zinc-550 block">SPEED</span>
                              <span className="font-bold text-zinc-300">{sc.speed}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[8.5px] text-zinc-500 font-mono leading-none">Wage: {sc.salary} c/m</span>
                            <button
                              onClick={() => buyPlayer(sc)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[9px] font-black uppercase tracking-wider px-3.5 py-2 rounded-lg cursor-pointer flex items-center shadow-lg"
                            >
                              Sign Contract
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Footer Save Row */}
          <div className="p-4 border-t border-zinc-900/80 bg-zinc-950 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-md rounded-xl"
            >
              <span>{t.close}</span>
            </button>
          </div>

        </motion.div>

        {/* POPUP A: REALTIME DETAILED STATS POPUP ACCURATELY SIMULATING SPORTS COVERAGE */}
        <AnimatePresence>
          {simResult && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-55 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-white"
            >
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-6 rounded-2xl relative shadow-2xl font-mono text-xs space-y-5"
              >
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/5 py-1 px-3.5 rounded-lg border border-emerald-500/10 inline-block">MATCH SUMMARY SIMULATION</span>
                  <p className="text-[9.5px] text-zinc-500 uppercase mt-1">Tournament: {simResult.comp.toUpperCase()} • Round {simResult.round}</p>
                </div>

                <div className="flex items-center justify-center gap-4 py-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                  <div className="flex-1 text-right pr-2">
                    <div className="font-bold text-sm uppercase">{simResult.home}</div>
                  </div>
                  <div className="text-xl font-black text-white px-3.5 py-1.5 bg-zinc-950 rounded-lg border border-zinc-805">
                    {simResult.homeScore} - {simResult.awayScore}
                  </div>
                  <div className="flex-1 text-left pl-2">
                    <div className="font-bold text-sm uppercase text-zinc-200">{simResult.away}</div>
                  </div>
                </div>

                {/* Shuffled Stats bars */}
                <div className="space-y-3 pt-1">
                  {/* Shots */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-550 uppercase">
                      <span>{simResult.stats.shots[0]} Shots</span>
                      <span className="font-bold text-zinc-400">Total Shots</span>
                      <span>{simResult.stats.shots[1]} Shots</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full flex overflow-hidden">
                      <div className="bg-emerald-400" style={{ width: `${(simResult.stats.shots[0] / (simResult.stats.shots[0] + simResult.stats.shots[1] || 1)) * 100}%` }} />
                      <div className="bg-zinc-800" style={{ flex: 1 }} />
                    </div>
                  </div>

                  {/* Possession */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-550 uppercase">
                      <span>{simResult.stats.possession[0]}%</span>
                      <span className="font-bold text-zinc-400">Field Possession</span>
                      <span>{100 - simResult.stats.possession[0]}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full flex overflow-hidden">
                      <div className="bg-[#38bdf8]" style={{ width: `${simResult.stats.possession[0]}%` }} />
                      <div className="bg-zinc-800" style={{ flex: 1 }} />
                    </div>
                  </div>

                  {/* Shocks & boost */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-550 uppercase">
                      <span>{simResult.stats.boost[0]} Litres</span>
                      <span className="font-bold text-zinc-400">Core Boost Spent</span>
                      <span>{simResult.stats.boost[1]} Litres</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full flex overflow-hidden">
                      <div className="bg-amber-400" style={{ width: `${(simResult.stats.boost[0] / (simResult.stats.boost[0] + simResult.stats.boost[1] || 1)) * 100}%` }} />
                      <div className="bg-zinc-800" style={{ flex: 1 }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 pt-3">
                  <div className="text-[10px] text-zinc-400 uppercase text-center flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Wages paid and Match Rewards (+Coins) issued autonomously.</span>
                  </div>

                  <button
                    onClick={() => setSimResult(null)}
                    className="w-full py-3 bg-white text-zinc-950 font-black uppercase text-[10.5px] rounded-xl cursor-pointer active:scale-95 transition-all"
                  >
                    DISMISS TELEMETRY REPORT
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* POPUP B: TRADEMARK ONBOARDING FOR FIRST-TIME USERS */}
        <AnimatePresence>
          {showClubOnboarding && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-57 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 text-white"
            >
              <div className="w-full max-w-sm text-center space-y-6">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-2xl mx-auto shadow-md">
                  <Award className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black uppercase italic text-white tracking-wider">ESTABLISH REGISTER BRAND</h3>
                  <p className="text-[9.5px] text-zinc-550 uppercase leading-relaxed font-mono">Select a trademarks custom name for your franchise grid, aligning with actual club representations.</p>
                </div>

                <div className="space-y-4">
                  <div className="text-left space-y-1.5">
                    <label className="text-[9px] text-emerald-400 font-mono tracking-widest font-black uppercase block">Franchise Name</label>
                    <input
                      type="text"
                      value={customClubName}
                      onChange={(e) => setCustomClubName(e.target.value)}
                      placeholder="e.g. Barcelona Rockets, Neo Strikers..."
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3 px-4 text-xs font-mono font-black text-white focus:outline-none focus:border-emerald-500 uppercase focus:ring-0"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const trimmed = customClubName.trim() || "Barcelona Rockets";
                      setClubName(trimmed);
                      localStorage.setItem('mini_rocket_manager_club_name', trimmed);
                      localStorage.setItem('mini_rocket_manager_club_colors', JSON.stringify({ primary: '#3b82f6', secondary: '#f43f5e' }));
                      setShowClubOnboarding(false);
                      generateAllFixtures(trimmed);
                    }}
                    className="w-full py-4 bg-white text-zinc-950 font-black text-[10px] tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer uppercase shadow-lg"
                  >
                    COMMIT CLUB BLUEPRINT
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
};
