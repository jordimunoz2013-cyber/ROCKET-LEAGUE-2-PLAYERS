import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Volume2, Eye, Key, Sliders, Check, Monitor, Palette } from 'lucide-react';
import { TRANSLATIONS, Language } from '../localization';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  difficulty: 'easy' | 'normal' | 'hard' | 'pro';
  onDifficultyChange: (diff: 'easy' | 'normal' | 'hard' | 'pro') => void;
  musicVolume: number;
  onMusicVolumeChange: (vol: number) => void;
  sfxVolume: number;
  onSfxVolumeChange: (vol: number) => void;
  cameraSensitivity: number;
  onCameraSensitivityChange: (sens: number) => void;
  replayQuality: 'low' | 'medium' | 'high';
  onReplayQualityChange: (qual: 'low' | 'medium' | 'high') => void;
  displayMode: 'fullscreen' | 'borderless' | 'windowed';
  onDisplayModeChange: (mode: 'fullscreen' | 'borderless' | 'windowed') => void;
  trainingAssist: boolean;
  onTrainingAssistChange: (on: boolean) => void;

  // New customizable props for "In settings I must custom all"
  gameSpeed: number;
  onGameSpeedChange: (speed: number) => void;
  maxScore: number;
  onMaxScoreChange: (score: number) => void;
  matchDuration: number;
  onMatchDurationChange: (duration: number) => void;
  ballRadius: number;
  onBallRadiusChange: (radius: number) => void;
  ballBounciness: number;
  onBallBouncinessChange: (bounciness: number) => void;
  carFriction: number;
  onCarFrictionChange: (friction: number) => void;

  // Car customizer colors and cosmetics (Team blue)
  blueConfig: { primary: string; secondary: string; model?: string; decal?: string; wheels?: string };
  onUpdateBlueConfig: (config: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  difficulty,
  onDifficultyChange,
  musicVolume,
  onMusicVolumeChange,
  sfxVolume,
  onSfxVolumeChange,
  cameraSensitivity,
  onCameraSensitivityChange,
  replayQuality,
  onReplayQualityChange,
  displayMode,
  onDisplayModeChange,
  trainingAssist,
  onTrainingAssistChange,

  // Workshop physics & cosmetic settings
  gameSpeed,
  onGameSpeedChange,
  maxScore,
  onMaxScoreChange,
  matchDuration,
  onMatchDurationChange,
  ballRadius,
  onBallRadiusChange,
  ballBounciness,
  onBallBouncinessChange,
  carFriction,
  onCarFrictionChange,

  blueConfig,
  onUpdateBlueConfig,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'controls' | 'physics'>('general');

  // Backup and restore progression functions
  const handleExportProgress = () => {
    const keys = [
      'mini_rocket_coins',
      'mini_rocket_player_trophies',
      'mini_rocket_player_name',
      'mini_rocket_unlocked_cars',
      'mini_rocket_unlocked_wheels',
      'mini_rocket_unlocked_palettes',
      'mini_rocket_unlocked_decals',
      'mini_rocket_selected_stadium',
      'mini_rocket_blue_config',
      'mini_rocket_red_config',
      'mini_rocket_saved_replays',
      'mini_rocket_bp_active_season_idx',
    ];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('mini_rocket_bp_xp_') || k.startsWith('mini_rocket_bp_lvl_') || k.startsWith('mini_rocket_bp_premium_') || k.startsWith('mini_rocket_bp_claimed_'))) {
        keys.push(k);
      }
    }
    const backup: Record<string, string | null> = {};
    keys.forEach(k => {
      backup[k] = localStorage.getItem(k);
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liga_cars_profile_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (typeof backup !== 'object' || backup === null) {
          throw new Error('Invalid JSON format');
        }
        Object.entries(backup).forEach(([key, val]) => {
          if (key.startsWith('mini_rocket_') && typeof val === 'string') {
            localStorage.setItem(key, val);
          }
        });
        alert(language === 'es' ? '¡Progreso restaurado con éxito! Recargando...' : language === 'ca' ? '¡Progrés restaurat amb èxit! Recarregant...' : 'Progression profile restored successfully! Reloading...');
        window.location.reload();
      } catch (err) {
        alert(language === 'es' ? 'Error: El archivo no es una copia de seguridad válida.' : 'Error: Selected file is not a valid progression backup.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        
        {/* Main Dialog Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#09090b]/98 border border-zinc-800 rounded-2xl flex flex-col max-h-[90vh] shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Settings className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-lg font-black italic tracking-wide text-white uppercase">{t.settingsTitle}</h2>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">
                  Calibrate drivers, AI coefficients, game balance and audio rails
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-lg border border-white/5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Menu Navbar */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/40 p-1 gap-1 overflow-x-auto shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg cursor-pointer transition-all shrink-0 ${
                activeTab === 'general' ? 'bg-zinc-900 border border-white/5 text-white' : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General & AI</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg cursor-pointer transition-all shrink-0 ${
                activeTab === 'audio' ? 'bg-zinc-900 border border-white/5 text-white' : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio Mixing</span>
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg cursor-pointer transition-all shrink-0 ${
                activeTab === 'controls' ? 'bg-zinc-900 border border-white/5 text-white' : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Telegraphy</span>
            </button>
            <button
              onClick={() => setActiveTab('physics')}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-lg cursor-pointer transition-all shrink-0 ${
                activeTab === 'physics' ? 'bg-amber-500/10 border border-amber-500/35 text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>🔧 WORKSHOP TUNER</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 relative z-10 custom-scrollbar max-h-[55vh]">
            
            {activeTab === 'general' && (
              <div className="space-y-6">
                
                {/* 1. Language Sector */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#f59e0b]">{t.languageSelect}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['en', 'es', 'ca'] as Language[]).map(lang => {
                      const labels: Record<Language, string> = { en: "English", es: "Español", ca: "Català" };
                      const isActive = language === lang;
                      return (
                        <button
                          key={lang}
                          onClick={() => onLanguageChange(lang)}
                          className={`py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider border cursor-pointer transition-all flex items-center justify-center gap-2 ${
                            isActive 
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold shadow-lg' 
                              : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                          }`}
                        >
                          {labels[lang]}
                          {isActive && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Difficulty Selection */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{t.difficulty}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['easy', 'normal', 'hard', 'pro'] as const).map(diff => {
                      const labels: Record<string, string> = { easy: t.easy, normal: t.normal, hard: t.hard, pro: t.pro };
                      const isActive = difficulty === diff;
                      return (
                        <button
                          key={diff}
                          onClick={() => onDifficultyChange(diff)}
                          className={`py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider border cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                            isActive 
                              ? 'bg-orange-500/10 border-orange-500 text-orange-400 font-bold shadow-lg' 
                              : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                          }`}
                        >
                          <span>{labels[diff]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Replay quality */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{t.replayQuality}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map(qual => {
                      const labels: Record<string, string> = { low: t.qualityLow, medium: t.qualityMedium, high: t.qualityHigh };
                      const isActive = replayQuality === qual;
                      return (
                        <button
                          key={qual}
                          onClick={() => onReplayQualityChange(qual)}
                          className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border cursor-pointer text-center transition-all ${
                            isActive 
                              ? 'bg-zinc-100 text-black font-black border-transparent' 
                              : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-white'
                          }`}
                        >
                          {qual.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Display Mode Selection */}
                <div className="space-y-2.5 border-t border-zinc-800/60 pt-4">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#38bdf8] flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>{language === 'es' ? 'VISTA DE PANTALLA' : language === 'ca' ? 'MODALITAT PANTALLA' : 'DISPLAY GRAPHIC MODE'}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['fullscreen', 'borderless', 'windowed'] as const).map(mode => {
                      const labels: Record<string, string> = {
                        fullscreen: language === 'es' ? 'PANTALLA COMPLETA' : language === 'ca' ? 'SENCERA' : 'FULLSCREEN',
                        borderless: language === 'es' ? 'SIN BORDES' : language === 'ca' ? 'SENSE MARCS' : 'BORDERLESS',
                        windowed: language === 'es' ? 'VENTANA' : language === 'ca' ? 'FINESTRA' : 'WINDOWED'
                      };
                      const isActive = displayMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => onDisplayModeChange(mode)}
                          className={`py-2 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border cursor-pointer text-center transition-all ${
                            isActive 
                              ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-bold shadow-lg' 
                              : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                          }`}
                        >
                          {labels[mode]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Tactical Training Flight Assist Prediction */}
                <div className="space-y-2 bg-gradient-to-r from-emerald-950/10 to-teal-950/20 border border-emerald-950/45 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                        {language === 'es' ? '🔮 ASISTENCIA DE TRAYECTORIA' : language === 'ca' ? '🔮 ASSISTÈNCIA TRAJECTÒRIA' : '🔮 BALL FLIGHT ASSIST'}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-medium mt-0.5 max-w-[280px] leading-tight">
                        {language === 'es' ? 'Predice rebotes, zonas de caída y trayectorias del balón en tiempo real.' : language === 'ca' ? 'Dibuixa i prediu la trajectòria i rebots de la pilota.' : 'Renders trajectory lines, bounce, and landing indicators in real-time.'}
                      </span>
                    </div>
                    <button
                      onClick={() => onTrainingAssistChange(!trainingAssist)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        trainingAssist ? 'bg-emerald-500' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          trainingAssist ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 6. SAVE, DOWNLOAD PROFILE AND EXPOSE OFFLINE COPIES */}
                <div className="space-y-2.5 bg-[#140c04]/40 border border-amber-500/15 p-4 rounded-xl text-left">
                  <span className="text-[11px] font-black uppercase text-amber-500 tracking-wider font-mono block">
                    📥 {language === 'es' ? 'RESPALDAR Y EXPORTAR PROGRESO' : language === 'ca' ? 'DISTRIBUCIÓ DE PROGRÉS (JSON)' : 'OFFLINE DOWNLOAD & SAVE PROGRESSION'}
                  </span>
                  <p className="text-[9.5px] text-zinc-400 leading-normal mb-3">
                    {language === 'es'
                      ? 'Descarga tu perfil (monedas, trofeos, nivel, vehículos desbloqueados, repeticiones) para jugar sin perder tu partida.'
                      : language === 'ca'
                      ? 'Descarrega el teu perfil de seguretat en format JSON per protegir tota la teva partida.'
                      : 'Download your fully saved live progression indicators (trophies, coins, high scores, replays, garage unlocks) as an offline backup file.'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleExportProgress}
                      className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-extrabold text-[10.5px] uppercase rounded-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 flex-1"
                    >
                      💾 {language === 'es' ? 'Exportar Perfil' : language === 'ca' ? 'Exportar' : 'Export Profile'}
                    </button>
                    
                    <label className="px-4 py-2 bg-[#020202] hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-extrabold text-[10.5px] uppercase rounded-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 flex-1 text-center">
                      <span>📤 {language === 'es' ? 'Importar Perfil' : language === 'ca' ? 'Importar' : 'Import Progress'}</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportProgress}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                
                {/* Soundtrack volume slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-zinc-400">{t.volumeMusic}</span>
                    <span className="text-xs font-mono font-bold text-zinc-500">{Math.round(musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* React sfx slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-zinc-400">{t.volumeSFX}</span>
                    <span className="text-xs font-mono font-bold text-zinc-500">{Math.round(sfxVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sfxVolume}
                    onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

              </div>
            )}

            {activeTab === 'controls' && (
              <div className="space-y-5">
                
                {/* Camera Sensitivity Slider */}
                <div className="space-y-2 bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-black uppercase text-white">{t.cameraSensitivity}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-violet-400">{(cameraSensitivity).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={cameraSensitivity}
                    onChange={(e) => onCameraSensitivityChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                {/* Keys layout mappings */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#f59e0b] block">{t.controlBinds}</span>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-zinc-400 uppercase font-black">{t.bindWASD}</span>
                      <div className="flex gap-1.5 font-mono">
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-white">W</span>
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-white">A</span>
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-white">S</span>
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-white">D</span>
                        <span className="px-3 py-1 bg-zinc-900 border border-indigo-500/30 text-indigo-400 rounded font-bold text-[10px]">SPACE</span>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-zinc-400 uppercase font-black">{t.bindArrows}</span>
                      <div className="flex gap-1.5 font-mono">
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-white">▲</span>
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-white">◀</span>
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-white">▼</span>
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-white">▶</span>
                        <span className="px-3 py-1 bg-zinc-900 border border-violet-500/30 text-violet-400 rounded font-bold text-[10px]">ENTER</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'physics' && (
              <div className="space-y-5">
                <div className="bg-amber-950/15 border border-amber-500/20 p-4 rounded-xl space-y-4 text-left">
                  <h3 className="text-xs font-black tracking-widest text-amber-400 uppercase font-mono">
                    🪐 SYSTEM PHYSICS COEFFICIENTS
                  </h3>
                  
                  {/* Game Timescale Speed Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-[#f3f4f6]">GAME TIMESCALE SPEED</span>
                      <span className="font-mono text-[11px] text-amber-400 font-bold">{gameSpeed.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={gameSpeed}
                      onChange={(e) => onGameSpeedChange(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <p className="text-[8px] text-zinc-500 uppercase font-mono font-bold leading-none">
                      Speeds up or slows down the simulation clock (0.50x to 2.00x)
                    </p>
                  </div>

                  {/* Ball Bounciness Restitution */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-[#f3f4f6]">BALL BOUNCINESS (RESTITUTION)</span>
                      <span className="font-mono text-[11px] text-amber-400 font-bold">{ballBounciness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="1.20"
                      step="0.05"
                      value={ballBounciness}
                      onChange={(e) => onBallBouncinessChange(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <p className="text-[8px] text-zinc-500 uppercase font-mono font-bold leading-none">
                      Controls how elastically the ball rebounds from boundaries and goalposts
                    </p>
                  </div>

                  {/* Car Friction Traction Coefficient */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-[#f3f4f6]">CAR TYRE GRIP & TRACTION</span>
                      <span className="font-mono text-[11px] text-amber-400 font-bold">
                        {carFriction === 0.995 ? "Perfect Grip Asphalt 🏎️" : carFriction <= 0.950 ? "Ice Drift ❄️" : "Radial Grid 🛞"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.900"
                      max="0.995"
                      step="0.005"
                      value={carFriction}
                      onChange={(e) => onCarFrictionChange(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <p className="text-[8px] text-zinc-500 uppercase font-mono font-bold leading-none">
                      Tyre friction dampener on acceleration drift vector alignments
                    </p>
                  </div>

                  {/* Ball Physical Radius (Size) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-[#f3f4f6]">STADIUM BALL SIZE</span>
                      <span className="font-mono text-[11px] text-amber-400 font-bold">{ballRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="56"
                      step="4"
                      value={ballRadius}
                      onChange={(e) => onBallRadiusChange(parseInt(e.target.value, 10))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <p className="text-[8px] text-zinc-500 uppercase font-mono font-bold leading-none">
                      Controls physical volume space occupied by active ball (16px - 56px)
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl space-y-4 text-left">
                  <h3 className="text-xs font-black tracking-widest text-[#38bdf8] uppercase font-mono">
                    🏁 MATCH RULES & CHASSIS COSMETICS
                  </h3>

                  {/* Match Goal Limits */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 font-mono">GOAL MATCH TERMINATOR LIMIT</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 5, 7, 10].map(val => (
                        <button
                          key={val}
                          onClick={() => onMaxScoreChange(val)}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                            maxScore === val 
                              ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg' 
                              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white'
                          }`}
                        >
                          {val} Goals
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Match Timer Limit */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400 font-mono">MATCH DURATION TIMER</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[60, 120, 180, 300].map(val => (
                        <button
                          key={val}
                          onClick={() => onMatchDurationChange(val)}
                          className={`py-1.5 rounded-lg text-xxs font-mono font-bold border transition-all cursor-pointer ${
                            matchDuration === val 
                              ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg' 
                              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white'
                          }`}
                        >
                          {val === 60 ? "1 Mins" : val === 120 ? "2 Mins" : val === 180 ? "3 Mins" : "5 Mins"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TEAM COLOR TUNNERS */}
                  <div className="space-y-2.5 border-t border-zinc-800/80 pt-3 flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider font-mono">🎨 MY CAR PAINT GRAPHIC COLORS</span>
                    
                    <div className="flex flex-col sm:flex-row gap-3.5">
                      <div className="flex-1 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 font-mono block">PRIMARY BASE COAT</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={blueConfig.primary}
                            onChange={(e) => onUpdateBlueConfig({ ...blueConfig, primary: e.target.value })}
                            className="w-10 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                          />
                          <span className="text-[10px] font-mono uppercase text-white font-black">{blueConfig.primary}</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 font-mono block">SECONDARY TRIM PAINT</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={blueConfig.secondary}
                            onChange={(e) => onUpdateBlueConfig({ ...blueConfig, secondary: e.target.value })}
                            className="w-10 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                          />
                          <span className="text-[10px] font-mono uppercase text-white font-black">{blueConfig.secondary}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CHASSIS STYLE AND DECAL SELECTION */}
                  <div className="grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-3">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-black uppercase text-zinc-500 font-mono block">CHASSIS BODY DESIGN</label>
                      <select
                        value={blueConfig.model || 'interstellar'}
                        onChange={(e) => onUpdateBlueConfig({ ...blueConfig, model: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[9px] text-white uppercase font-mono font-bold w-full focus:outline-none"
                      >
                        {['interstellar', 'beast', 'spectre_f1', 'cyberspace', 'phantom_gt', 'apex_interceptor', 'phoenix_vtol', 'centurion_gt_x', 'infinity_void', 'grim_reaper'].map(m => (
                          <option key={m} value={m}>{m.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] font-black uppercase text-zinc-500 font-mono block">WHEELS TYPE RIM</label>
                      <select
                        value={blueConfig.wheels || 'classic'}
                        onChange={(e) => onUpdateBlueConfig({ ...blueConfig, wheels: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[9px] text-white uppercase font-mono font-bold w-full focus:outline-none"
                      >
                        {['classic', 'cyber', 'magma', 'frost', 'gold_star'].map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Footer Save Row */}
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white text-black hover:bg-zinc-200 transition-all text-xs font-black uppercase italic tracking-wide cursor-pointer active:scale-95 shadow-md"
            >
              <span>{t.close}</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
