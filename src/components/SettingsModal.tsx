import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Volume2, Eye, Key, Sliders, Check, Monitor, ShieldAlert } from 'lucide-react';
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
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'controls'>('general');

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
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
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
          <div className="flex border-b border-zinc-800 bg-zinc-950/40 p-1 gap-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-all ${
                activeTab === 'general' ? 'bg-zinc-900 border border-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General & AI</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-all ${
                activeTab === 'audio' ? 'bg-zinc-900 border border-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio Mixing</span>
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-all ${
                activeTab === 'controls' ? 'bg-zinc-900 border border-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Telegraphy</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 relative z-10 custom-scrollbar max-h-[50vh]">
            
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
                  <p className="text-[9px] text-zinc-500 font-medium italic mt-1 leading-none">
                    {language === 'es' 
                      ? '* Pantalla Completa es el modo por defecto para máxima inmersión en el estadio.' 
                      : language === 'ca'
                      ? '* Pantalla Sencera utilitza el màxim rendiment adaptatiu de l\'estadi.'
                      : '* Full Screen is optimized for fluid AAA esports-style stadium broadcast.'}
                  </p>
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
                  <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mt-1">
                    Affects visual orbit rotation delays and cinematically panned smoothing ratios
                  </p>
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

          </div>

          {/* Footer Save Row */}
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex justify-end">
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
