import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Sparkles, 
  Coins, 
  Shield, 
  Zap, 
  User, 
  Users, 
  Briefcase, 
  ChevronRight, 
  Newspaper, 
  ArrowLeft, 
  Check,
  TrendingUp,
  Award
} from 'lucide-react';
import { sounds } from '../audio';
import { TRANSLATIONS, Language } from '../localization';

export interface TransferOffer {
  team: string;
  reason: string;
  role: string;
  salary_level: string;
}

export interface CareerState {
  playerName: string;
  currentTeam: string;
  currentTeamColor: string;
  currentTeamSecondary: string;
  currentRole: string;
  salaryPrestige: string;
  reputation: string;
  fanSentiment: string;
  form: string;
  seasonMatchNum: number;
  stats: {
    wins: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    heavyHits: number;
  };
  feed: Array<{
    id: string;
    timestamp: string;
    news_article: string;
    coach_message: string;
    rival_reaction: string | null;
    opponentTeam: string;
    scoreline: string;
    won: boolean;
  }>;
  activeOffers: TransferOffer[];
  hasPendingMatchStoryResult: boolean;
  lastMatchStats?: {
    goalsScored: number;
    goalsConceded: number;
    heavyHits: number;
    won: boolean;
    opponentTeam: string;
  };
}

interface CareerModeProps {
  onClose: () => void;
  onLaunchCareerMatch: (opponentTeam: string, difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary') => void;
  coins: number;
  onAddCoins: (amount: number) => void;
  onUpdatePlayerCarColors: (primary: string, secondary: string) => void;
  language?: Language;
}

// Preset Teams
export interface PresetTeam {
  name: string;
  primary: string;
  secondary: string;
  lore: string;
}

const STARTING_TEAMS: PresetTeam[] = [
  {
    name: "Neo Strikers",
    primary: "#06b6d4", // Cyan
    secondary: "#f43f5e", // Rose
    lore: "Flamboyant street-undergrounds in cyber district 404. High speed, aesthetic decals, massive fan base."
  },
  {
    name: "Zenith Syndicate",
    primary: "#a855f7", // Purple
    secondary: "#14b8a6", // Teal
    lore: "Rigid corporate-funded motorsport academy. Precision-driven trajectory calculation and raw G-force."
  },
  {
    name: "Rustland Rovers",
    primary: "#f97316", // Amber/Orange
    secondary: "#475569", // Slate
    lore: "Underdog heavy mechanics from mining outposts. Gritty copper metal construction, absolute resilience."
  }
];

// League Schedule
export const CAREER_OPPONENTS = [
  { name: "Gridlocked Gladiators", difficulty: "easy" as const, stadium: "rustlands", label: "Match 1: Season Debut" },
  { name: "Cyber Shredders", difficulty: "medium" as const, stadium: "cyber", label: "Match 2: Sector Cup" },
  { name: "Glacier Giants", difficulty: "hard" as const, stadium: "frozen", label: "Match 3: Frost Drift" },
  { name: "Vaporwave Sunset", difficulty: "expert" as const, stadium: "tokyo", label: "Match 4: Neo Semis" },
  { name: "Quantum Singularity", difficulty: "legendary" as const, stadium: "cosmic", label: "Match 5: Super Grand Final" }
];

export const CareerMode: React.FC<CareerModeProps> = ({
  onClose,
  onLaunchCareerMatch,
  coins,
  onAddCoins,
  onUpdatePlayerCarColors,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language || 'en'];
  const [career, setCareer] = useState<CareerState | null>(null);
  const [activeTab, setActiveTab] = useState<'hub' | 'feed' | 'transfers' | 'stats'>('hub');
  
  // Profile Creation states
  const [createdName, setCreatedName] = useState('JORDI');
  const [selectedStartTeam, setSelectedStartTeam] = useState<PresetTeam>(STARTING_TEAMS[0]);

  // API Call states
  const [loadingStory, setLoadingStory] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  // Initialize and Load Career
  useEffect(() => {
    const saved = localStorage.getItem('mini_rocket_career_state');
    if (saved) {
      try {
        const parsed: CareerState = JSON.parse(saved);
        setCareer(parsed);
      } catch (e) {
        console.error("Error loading career state:", e);
      }
    }
  }, []);

  // Save Career state utility
  const saveCareer = (updatedState: CareerState) => {
    setCareer(updatedState);
    localStorage.setItem('mini_rocket_career_state', JSON.stringify(updatedState));
  };

  // Start new Career
  const handleStartCareer = () => {
    sounds.playCountdownBeep(true);
    const initial: CareerState = {
      playerName: createdName.toUpperCase().trim() || 'ACE',
      currentTeam: selectedStartTeam.name,
      currentTeamColor: selectedStartTeam.primary,
      currentTeamSecondary: selectedStartTeam.secondary,
      currentRole: 'Substitute Driver',
      salaryPrestige: 'Low',
      reputation: 'Rookie Draft',
      fanSentiment: 'Mixed',
      form: 'Stable',
      seasonMatchNum: 1,
      stats: {
        wins: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        heavyHits: 0
      },
      feed: [],
      activeOffers: [],
      hasPendingMatchStoryResult: false
    };

    saveCareer(initial);
    // Sync colors to player configuration
    onUpdatePlayerCarColors(selectedStartTeam.primary, selectedStartTeam.secondary);
  };

  // Check if there is a pending match result from App.tsx
  useEffect(() => {
    if (!career) return;

    // Check if the global state says we finished a match
    const pendingResultStr = localStorage.getItem('mini_rocket_pending_career_match');
    if (pendingResultStr && !career.hasPendingMatchStoryResult) {
      try {
        const result = JSON.parse(pendingResultStr);
        localStorage.removeItem('mini_rocket_pending_career_match');

        // Prepare context
        const won = result.won;
        const goalsScored = result.blueGoals;
        const goalsConceded = result.redGoals;
        const heavyHits = result.heavyHits;
        const opponentTeam = result.opponentTeam;

        // Trigger Gemini API story generation
        generateMatchStory(won, goalsScored, goalsConceded, heavyHits, opponentTeam);
      } catch(e) {
        console.error("Error checking pending match:", e);
      }
    }
  }, [career]);

  const generateMatchStory = async (
    won: boolean,
    goalsScored: number,
    goalsConceded: number,
    heavyHits: number,
    opponentTeam: string
  ) => {
    if (!career) return;
    setLoadingStory(true);
    setStoryError(null);

    // Dynamic stats updates
    const updatedStats = {
      wins: career.stats.wins + (won ? 1 : 0),
      losses: career.stats.losses + (won ? 0 : 1),
      goalsScored: career.stats.goalsScored + goalsScored,
      goalsConceded: career.stats.goalsConceded + goalsConceded,
      heavyHits: career.stats.heavyHits + heavyHits
    };

    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: career.playerName,
          currentTeam: career.currentTeam,
          opponentTeam,
          goalsScored,
          goalsConceded,
          heavyHits,
          won,
          seasonProgress: `Match ${career.seasonMatchNum} of 5`,
          reputation: career.reputation,
          fanSentiment: career.fanSentiment,
          form: career.form,
          salaryPrestige: career.salaryPrestige,
          currentRole: career.currentRole
        })
      });

      if (!response.ok) {
        throw new Error('API server returned an error generating story.');
      }

      const responseData = await response.json();

      // Process Gemini Response and commit to history
      const newsStory = {
        id: Math.random().toString(36).substring(2),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        news_article: responseData.news_article,
        coach_message: responseData.coach_message,
        rival_reaction: responseData.rival_reaction,
        opponentTeam,
        scoreline: `${goalsScored} - ${goalsConceded}`,
        won
      };

      // Add coins prestige bonuses
      let winBonus = won ? 150 : 50;
      onAddCoins(winBonus);

      // Evolve match schedule (circular loop after match 5)
      const nextMatchNum = career.seasonMatchNum >= 5 ? 1 : career.seasonMatchNum + 1;

      const evolvedState: CareerState = {
        ...career,
        seasonMatchNum: nextMatchNum,
        reputation: responseData.career_update?.reputation || career.reputation,
        fanSentiment: responseData.career_update?.fan_sentiment || career.fanSentiment,
        form: responseData.career_update?.form || career.form,
        stats: updatedStats,
        feed: [newsStory, ...career.feed],
        activeOffers: responseData.transfer_offers || [],
        hasPendingMatchStoryResult: false
      };

      saveCareer(evolvedState);
      setActiveTab('feed'); // instantly switch to newsroom digest!
    } catch(err: any) {
      console.error(err);
      setStoryError("Failed to establish server connection. Loading emergency story fallback.");
      
      // Gritty offline storyteller fallback to maintain zero crashing
      const stubOffer = won ? [{
        team: "Tokyo Sunsets",
        reason: "Excellent scoring presence on heavy impacts.",
        role: "Starter",
        salary_level: "High"
      }] : [];

      const fallbackStory = {
        id: Math.random().toString(36).substring(2),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        news_article: `Despite physical field resistance, Jordi completed a major high-G match highlight against ${opponentTeam}. Tactical analysis streams are lit with heavy strike metrics of ${heavyHits} hits and a final team score of ${goalsScored}-${goalsConceded}! Fans are ecstatic.`,
        coach_message: `Good focus, Jordi. You displayed raw car football speed, but keep an eye on your defensive line rotation. Take 20 mins on the recovery rigs before next briefing.`,
        rival_reaction: `\"Jordi might be fast, but they don't have the heavy power to crack our zone defenses consistently. Good try, rookie.\"`,
        opponentTeam,
        scoreline: `${goalsScored} - ${goalsConceded}`,
        won
      };

      const evolvedState: CareerState = {
        ...career,
        seasonMatchNum: career.seasonMatchNum >= 5 ? 1 : career.seasonMatchNum + 1,
        reputation: won ? "Rising Star" : "Squad Recruit",
        fanSentiment: won ? "Positive" : "Uncertain",
        form: won ? "Hot Streak" : "Unstable",
        stats: updatedStats,
        feed: [fallbackStory, ...career.feed],
        activeOffers: stubOffer,
        hasPendingMatchStoryResult: false
      };

      saveCareer(evolvedState);
      setActiveTab('feed');
    } finally {
      setLoadingStory(false);
    }
  };

  const handleLaunchMatch = () => {
    if (!career) return;
    sounds.playCountdownBeep(true);
    
    // Get current opponent team metadata based on stage number
    const nextMatchIdx = (career.seasonMatchNum - 1) % CAREER_OPPONENTS.length;
    const opponent = CAREER_OPPONENTS[nextMatchIdx];

    // Trigger match activation in parent coordinator
    onLaunchCareerMatch(opponent.name, opponent.difficulty);
    onClose();
  };

  const handleSignContract = (offer: TransferOffer) => {
    if (!career) return;
    sounds.playWin();

    // Find custom color palette matches for the new team or provide stunning default aesthetics
    let newPri = "#3b82f6";
    let newSec = "#93c5fd";

    if (offer.team.toLowerCase().includes("tokyo")) {
      newPri = "#ff007f";
      newSec = "#f43f5e";
    } else if (offer.team.toLowerCase().includes("shredder") || offer.team.toLowerCase().includes("glaci")) {
      newPri = "#059669";
      newSec = "#34d399";
    } else if (offer.team.toLowerCase().includes("rust") || offer.team.toLowerCase().includes("refin")) {
      newPri = "#f97316";
      newSec = "#fb923c";
    } else if (offer.team.toLowerCase().includes("quantum") || offer.team.toLowerCase().includes("singul")) {
      newPri = "#8b5cf6";
      newSec = "#c084fc";
    } else if (offer.team.toLowerCase().includes("zenith")) {
      newPri = "#a855f7";
      newSec = "#22d3ee";
    }

    const updated: CareerState = {
      ...career,
      currentTeam: offer.team,
      currentTeamColor: newPri,
      currentTeamSecondary: newSec,
      currentRole: offer.role,
      salaryPrestige: offer.salary_level,
      activeOffers: [] // Clear Offers once signed!
    };

    saveCareer(updated);
    onUpdatePlayerCarColors(newPri, newSec);
    setActiveTab('hub');
  };

  const handleResetCareer = () => {
    if (confirm("Are you sure you want to reset your futuristic career history? This clears all contracts, standings, and news feed columns.")) {
      localStorage.removeItem('mini_rocket_career_state');
      setCareer(null);
    }
  };

  // Rendering Loader screen
  if (loadingStory) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl">
        <div className="text-center space-y-5 max-w-sm">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <Sparkles className="absolute w-6 h-6 text-violet-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black tracking-widest text-violet-400 uppercase font-mono">
              ⚡ SCANNING STADIUM TELEMETRY
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed uppercase">
              Drafting sports columns • Analyzing drift coordinates • Consulting scouts • Formulating career prestige adjustments...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Profile Creation view
  if (!career) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/98 backdrop-blur-2xl px-4 overflow-y-auto">
        <div className="w-full max-w-xl bg-black/40 border border-white/5 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md relative space-y-6">
          
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center space-y-2">
            <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase font-mono block">
              🚀 NEW CAREER PROPULSION
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold italic uppercase tracking-tighter text-white font-sans">
              CHAMPIONSHIP STORY MODE
            </h2>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
              Ascend from draft-pool substitute to permanent galaxy legend. Choose your team, dominate match schedules, handle heavy-hit news coverage, and sign record contracts.
            </p>
          </div>

          {/* Form input */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 font-mono">
              Driver Callsign
            </label>
            <input 
              type="text"
              maxLength={12}
              value={createdName}
              onChange={(e) => setCreatedName(e.target.value)}
              placeholder="Enter team pilot name..."
              className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 uppercase text-xs"
            />
          </div>

          {/* Preset teams selection */}
          <div className="space-y-3 text-left">
            <label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 font-mono block">
              Select Starting Draft Team
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STARTING_TEAMS.map((team) => {
                const isSelected = selectedStartTeam.name === team.name;
                return (
                  <button
                    key={team.name}
                    onClick={() => {
                      sounds.playBoost();
                      setSelectedStartTeam(team);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between h-36 ${
                      isSelected 
                        ? 'bg-cyan-500/5 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-3 h-3 rounded-full border border-black/50 shrink-0" style={{ backgroundColor: team.primary }} />
                        <span className="font-extrabold text-xs uppercase italic tracking-wide truncate">{team.name}</span>
                      </div>
                      <p className="text-[9.5px] text-zinc-500 leading-normal line-clamp-3">
                        {team.lore}
                      </p>
                    </div>

                    <div className="flex items-center justify-between w-full mt-2 border-t border-white/5 pt-2">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Draft Status</span>
                      {isSelected ? (
                        <div className="bg-cyan-400 text-black px-1.5 py-0.5 rounded text-[7px] font-black uppercase font-mono">
                          SELECTED
                        </div>
                      ) : (
                        <span className="text-[8px] font-mono text-zinc-600">Draft Cap</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleStartCareer}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-black uppercase italic tracking-wider py-4 rounded-xl shadow-[0_4px_25px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-98 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>COMMENCE PROFESSIONAL CAREER • GOAL: SEVENTH HEAVEN</span>
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Active Opponent Team Status
  const scheduleIdx = (career.seasonMatchNum - 1) % CAREER_OPPONENTS.length;
  const currOpponent = CAREER_OPPONENTS[scheduleIdx];

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#050508]/98 backdrop-blur-2xl text-slate-200 overflow-y-auto px-4 py-8">
      {/* Dynamic Career Header containing Name & Vital metrics */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* TOP STATUS BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center shadow-lg relative">
              <User className="w-5 h-5 text-zinc-400" />
              <div 
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border border-black/80" 
                style={{ backgroundColor: career.currentTeamColor }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold italic text-sm text-white uppercase tracking-wider font-sans">
                  PILOT: {career.playerName}
                </span>
                <span className="text-[8px] font-mono font-black border border-violet-500/35 px-1.5 py-0.5 rounded bg-violet-950/20 text-violet-400 uppercase">
                  {career.reputation}
                </span>
                <span className="text-[8px] font-mono font-black border border-cyan-400/30 px-1.5 py-0.5 rounded bg-cyan-950/20 text-cyan-300 uppercase">
                  {career.currentRole}
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5 flex items-center gap-1.5">
                <span>REPRESENTING:</span>
                <strong className="text-zinc-300">{career.currentTeam}</strong>
                <span>• CONTRACT SALARY VALUE:</span>
                <strong className="text-amber-400 uppercase tracking-widest">{career.salaryPrestige}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 px-3.5 rounded-xl font-mono">
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="text-[8px] text-zinc-500 block leading-none">CLUB CREDITS</span>
                <span className="text-xs font-black text-amber-400 leading-none">{coins}¢</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 border border-white/5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 tracking-wider font-bold transition uppercase cursor-pointer"
            >
              Exit Dashboard
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-left relative overflow-hidden">
            <TypographyLabel>FAN SENTIMENT</TypographyLabel>
            <div className="text-lg font-bold uppercase italic font-sans text-cyan-400 mt-1">
              • {career.fanSentiment}
            </div>
            <span className="text-[9px] text-zinc-500 uppercase font-mono mt-1.5 block">
              {language === 'es' ? 'Confianza de los Medios' : language === 'ca' ? 'Confiança dels Mitjans' : 'Media Trust Rating'}
            </span>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-left relative overflow-hidden">
            <TypographyLabel>DRIVER FORM</TypographyLabel>
            <div className="text-lg font-bold uppercase italic font-sans text-indigo-400 mt-1">
              ⚡ {career.form}
            </div>
            <span className="text-[9px] text-zinc-500 uppercase font-mono mt-1.5 block">Recent Momentum Streak</span>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-left relative overflow-hidden">
            <TypographyLabel>CAREER W / L RECORD</TypographyLabel>
            <div className="text-lg font-bold italic font-mono text-white mt-1">
              {career.stats.wins}W - {career.stats.losses}L
            </div>
            <span className="text-[9px] text-zinc-500 uppercase font-mono mt-1.5 block">Win/Loss Ratio</span>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 text-left relative overflow-hidden">
            <TypographyLabel>SEASON PROGRESS</TypographyLabel>
            <div className="text-lg font-extrabold italic font-sans text-amber-400 mt-1">
              MATCH {career.seasonMatchNum} / 5
            </div>
            {/* progress bar */}
            <div className="w-full bg-zinc-900 h-1 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-amber-400 h-full" style={{ width: `${(career.seasonMatchNum / 5) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-1.5 border-b border-white/5 pb-1">
          <TabButton active={activeTab === 'hub'} onClick={() => setActiveTab('hub')}>
            <Play className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Siguiente Partido' : language === 'ca' ? 'Següent Partit' : 'Next Match Grid'}</span>
          </TabButton>
          
          <TabButton active={activeTab === 'feed'} onClick={() => setActiveTab('feed')}>
            <Newspaper className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Sala de Prensa' : language === 'ca' ? 'Sala de Premsa' : 'Press Room Digest'} ({career.feed.length})</span>
          </TabButton>

          <TabButton active={activeTab === 'transfers'} onClick={() => setActiveTab('transfers')}>
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Agencia y Ofertas' : language === 'ca' ? 'Agència i Ofertes' : 'Agency & Market'} ({career.activeOffers?.length || 0})</span>
          </TabButton>

          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Resumen de Analíticas' : language === 'ca' ? 'Resum d\'Analítiques' : 'Analytics Summary'}</span>
          </TabButton>
        </div>

        {/* TAB VIEWS */}
        <AnimatePresence mode="wait">
          
          {/* HUB / NEXT MATCH TAB */}
          {activeTab === 'hub' && (
            <motion.div
              key="hub-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left"
            >
              {/* PRIMARY NEXT BOX CARD */}
              <div className="lg:col-span-2 bg-[#08080c] border border-violet-500/15 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-96 relative shadow-[0_0_30px_rgba(139,92,246,0.05)]">
                
                {/* background faint map grid or colors */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">
                      🔒 SCHEDULE BOARD: ACTIVE GRIDIRON CONTRACT
                    </span>
                  </div>

                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white font-sans leading-none">
                    {currOpponent.label}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">OPPONENT TEAM:</span>
                    <strong className="text-zinc-200 uppercase tracking-wide font-sans text-xs shrink-0 flex items-center gap-1.5">
                      {currOpponent.name}
                    </strong>
                    <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-rose-400 font-mono">
                      {currOpponent.difficulty} AI
                    </span>
                  </div>

                  <div className="mt-6 border-t border-white/5 pt-5 space-y-3 max-w-lg">
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                      {language === 'es' ? 'SERVICIO DE PRENSA IA: El análisis predice una batalla táctica de alta energía. El partido registrará altas intensidades en cada rebote. Ganar se registra directamente en tus métricas de piloto.' : language === 'ca' ? 'SERVEI DE PREMSA IA: L\'anàlisi preveu una batalla tàctica d\'alta energia. El partit registrarà altes intensitats a cada rebot. Guanyar es registra directament en les teves mètriques de pilot.' : 'AI PRESS SERVICE: Analysis predicts a highly energetic tactical battle. The ball speed is projected to exceed 120km/h on heavy kickoff impacts. Winning enters your pilot metrics immediately to generate dynamic story events.'}
                    </p>
                    <div className="bg-[#050508] border border-white/5 rounded-xl p-3 text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                      🎯 GOAL OBJECTIVE: STRIKE {currOpponent.difficulty === 'legendary' ? 5 : 5} GOALS ON THE RIVAL GATE AND GUARD GOAL LINE
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleLaunchMatch}
                    className="w-full bg-gradient-to-r from-rose-500 via-violet-600 to-indigo-600 hover:brightness-110 active:scale-[0.99] text-white py-4 px-8 rounded-xl font-sans font-black uppercase italic tracking-wider text-xs flex items-center justify-center gap-3 shadow-[0_4px_30px_rgba(239,68,68,0.25)] border border-rose-500/20 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white shrink-0 animate-pulse" />
                    <span>LAUNCH ROCKET ARENA MATCH NOW 🚀</span>
                  </button>
                </div>
              </div>

              {/* COACH PERSPECTIVE BRIEFING CARD */}
              <div className="bg-[#08080c] border border-white/5 p-6 rounded-3xl flex flex-col justify-between h-96 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-950/5 pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest leading-none">
                      COACH BRIEFING LOGS
                    </span>
                  </div>

                  <div className="bg-[#030305] border border-white/5 p-4 rounded-2xl relative">
                    <div className="text-[9px] text-zinc-500 uppercase font-mono mb-1 text-left">
                      MEMORANDUM DIRECTIVE:
                    </div>
                    
                    {career.feed.length > 0 ? (
                      <p className="text-[11px] text-slate-300 italic font-medium leading-relaxed">
                        "{career.feed[0].coach_message}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-mono leading-relaxed uppercase">
                        "Draft check complete. Welcome to the roster, Jordi. Your first match vs Gridlocked Gladiators is slated for immediate start. Focus on keeping momentum, use rails to recover from heavy collisons, grab orange/blue boost pads, and strike goals. Good luck."
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-950/80 border border-white/5 rounded-2xl p-4 space-y-2">
                  <span className="font-mono text-[8px] font-black text-violet-400 uppercase tracking-widest block">
                    😤 RECENT RIVAL STATS OR COMMENTARY
                  </span>
                  {career.feed.length > 0 && career.feed[0].rival_reaction ? (
                    <p className="text-[10px] text-zinc-400 italic font-medium leading-relaxed leading-normal">
                      {career.feed[0].rival_reaction}
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-500 font-mono leading-normal uppercase">
                      "Rivals are watching. Score a match victory to trigger custom responses in the Newsfeed."
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* PRESS FEED DIGEST TAB */}
          {activeTab === 'feed' && (
            <motion.div
              key="feed-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 max-w-2xl mx-auto text-left"
            >
              {storyError && (
                <div className="bg-amber-500/15 border border-amber-500/20 p-4 rounded-2xl text-[10px] font-mono text-amber-400 uppercase">
                  ⚠️ {storyError}
                </div>
              )}

              {career.feed.length === 0 ? (
                <div className="bg-[#08080c] border border-white/5 rounded-3xl p-10 text-center space-y-3">
                  <Newspaper className="w-10 h-10 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">
                    NO ARTICLES RECORDED IN PRESS ROOM
                  </h4>
                  <p className="text-[10.5px] text-zinc-500 font-mono uppercase leading-relaxed max-w-sm mx-auto">
                    News channels generate custom column reviews after career match actions. Launch your next scheduled duel to ignite media highlights!
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-[10px] font-black tracking-widest text-zinc-500 font-mono uppercase leading-none border-b border-white/5 pb-2.5">
                    📰 JOURNAL ARCHIVE: NEWS COLUMNS ({career.feed.length})
                  </div>

                  {career.feed.map((story) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#08080c] border border-white/5 p-5 md:p-6 rounded-3xl relative overflow-hidden shadow-lg space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${story.won ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span className="font-mono text-[9px] font-black uppercase text-zinc-400">
                            MATCH SUMMARY VS {story.opponentTeam.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-black py-0.5 px-2 rounded bg-zinc-950 text-slate-400 border border-white/5">
                          FINAL SCORE: {story.scoreline} ({story.won ? 'WIN' : 'LOSS'})
                        </span>
                      </div>

                      {/* Sports article content */}
                      <div className="space-y-3">
                        <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                          {story.news_article}
                        </p>
                      </div>

                      {/* Sub quotes columns */}
                      {story.rival_reaction && (
                        <div className="bg-zinc-950 border-l-2 border-indigo-500 p-3 rounded-r-xl">
                          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-mono block mb-1">
                            RIVAL VERBATIM RESPONSE:
                          </span>
                          <p className="text-[10.5px] text-zinc-400 italic">
                            {story.rival_reaction}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* AGENCY & TRANFSERS TAB */}
          {activeTab === 'transfers' && (
            <motion.div
              key="transfers-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 max-w-3xl mx-auto text-left"
            >
              <div className="text-[10px] font-black tracking-widest text-zinc-500 font-mono uppercase leading-none border-b border-white/5 pb-2.5">
                💼 AGENCY TRANSFER COMMITTMENTS & ACTIVE ROSTER PROPOSALS
              </div>

              {!career.activeOffers || career.activeOffers.length === 0 ? (
                <div className="bg-[#08080c] border border-white/5 rounded-3xl p-10 text-center space-y-3">
                  <Briefcase className="w-10 h-10 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">
                    NO TRANSFER PROPOSALS TRANSMITTED
                  </h4>
                  <p className="text-[10.5px] text-zinc-500 font-mono uppercase leading-relaxed max-w-sm mx-auto font-mono">
                    Scout agencies and rival clubs issue luxury contract offers based on your match wins, heavy collisions metrics, and rating levels. Perform highly in your next scheduling to receive signings!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {career.activeOffers.map((offer, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-[#08080c] border border-violet-500/20 p-5 rounded-2xl relative flex flex-col justify-between hover:border-violet-500/40 transition shadow-lg space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/30 border border-indigo-500/20 px-2 py-0.5 rounded">
                            CLUB ACQUISITIONS PROPOSAL
                          </span>
                          <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2 rounded">
                            {offer.salary_level} SALARY prestige
                          </span>
                        </div>

                        <h4 className="text-lg font-black italic uppercase italic text-white tracking-wide">
                          {offer.team}
                        </h4>

                        <div className="flex items-center gap-1.5 py-0.5">
                          <span className="text-[9px] text-zinc-500 font-mono uppercase">PROPOSED ROLE:</span>
                          <strong className="text-zinc-300 font-mono uppercase text-[9.5px]">{offer.role}</strong>
                        </div>

                        <p className="text-[10.5px] text-zinc-400 leading-normal leading-relaxed pt-2 border-t border-white/5">
                          {offer.reason}
                        </p>
                      </div>

                      <div className="pt-3">
                        <button
                          onClick={() => {
                            sounds.playWin();
                            handleSignContract(offer);
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[9px] py-2.5 rounded-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5 border border-indigo-500/30"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>SIGN CONTRACT & TRANSFER CLUBS ✍️</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STATS ANALYTICS TAB */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-6 text-left"
            >
              <div className="bg-[#08080c] border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-lg space-y-4">
                
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <span className="font-mono text-[9px] font-black uppercase text-zinc-400">
                    PERFORMANCE ANALYTICS DATABASE
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-center">
                  <div className="bg-zinc-950/60 p-4 border border-white/5 rounded-2xl">
                    <span className="text-[8px] text-zinc-500 uppercase tracking-wider block">Goals Scored</span>
                    <strong className="text-2xl font-black text-cyan-400 block mt-1">{career.stats.goalsScored}</strong>
                  </div>
                  <div className="bg-zinc-950/60 p-4 border border-white/5 rounded-2xl">
                    <span className="text-[8px] text-zinc-500 uppercase tracking-wider block">Goals Conceded</span>
                    <strong className="text-2xl font-black text-rose-400 block mt-1">{career.stats.goalsConceded}</strong>
                  </div>
                  <div className="bg-zinc-950/60 p-4 border border-white/5 rounded-2xl col-span-2 md:col-span-1">
                    <span className="text-[8px] text-zinc-500 uppercase tracking-wider block">Heavy Strikes (Collisions)</span>
                    <strong className="text-2xl font-black text-amber-400 block mt-1">{career.stats.heavyHits}</strong>
                  </div>
                </div>

                <div className="bg-zinc-950/30 border border-white/5 p-4 rounded-xl space-y-2">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                    Futuristic Career Milestone Progression
                  </h5>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Pilot data is calibrated dynamically. Winning grand-finals locks immortal legend standing, increasing contract proposals, coins pools, and media visibility. Use high impact vectors on collisions to maximize heavy strike telemetry rating.
                  </p>
                </div>
              </div>

              {/* Reset action */}
              <div className="text-center pt-2">
                <button
                  onClick={handleResetCareer}
                  className="text-[9px] font-mono text-rose-500/70 hover:text-rose-400 uppercase tracking-widest cursor-pointer hover:underline border border-rose-500/10 hover:border-rose-500/25 px-4 py-2 rounded-lg transition"
                >
                  ⚠ FULL RESET CAREER PROFILE HISTORY
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

// Internal Tiny helpers
const TypographyLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-wider leading-none">
    {children}
  </span>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={() => {
      sounds.playCountdownBeep(true);
      onClick();
    }}
    className={`px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer font-sans transition flex items-center gap-1.5 ${
      active 
        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md border border-violet-500/25' 
        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
    }`}
  >
    {children}
  </button>
);
