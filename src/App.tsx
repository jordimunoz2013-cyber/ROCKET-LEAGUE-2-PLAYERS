import React, { useEffect, useRef, useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { ScoreOverlay } from './components/ScoreOverlay';
import { ReplayHUD } from './components/ReplayHUD';
import { GameEngine } from './gameEngine';
import { GamePhase, CONFIG, ReplayFrame, ReplayEvent, SavedReplay, GameMode } from './types';
import { sounds } from './audio';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('MENU');
  
  // HUD States
  const [blueScore, setBlueScore] = useState(0);
  const [redScore, setRedScore] = useState(0);
  const [matchTimer, setMatchTimer] = useState(0);
  const [countdown, setCountdown] = useState<number | 'GO' | null>(null);
  const [goalScored, setGoalScored] = useState<'blue' | 'red' | null>(null);
  const [winner, setWinner] = useState<'blue' | 'red' | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('same_laptop');

  // PERSONALIZATION GARAGE & CAR MARKET
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('mini_rocket_coins');
    return saved ? parseInt(saved, 10) : 150; // default 150 setup bonus
  });

  const [unlockedModels, setUnlockedModels] = useState<string[]>(() => {
    const saved = localStorage.getItem('mini_rocket_unlocked_models');
    return saved ? JSON.parse(saved) : ['interstellar'];
  });

  const [unlockedPalettes, setUnlockedPalettes] = useState<string[]>(() => {
    const saved = localStorage.getItem('mini_rocket_unlocked_palettes');
    return saved ? JSON.parse(saved) : ['Cobalt Classic', 'Crimson Fury'];
  });

  const [unlockedDecals, setUnlockedDecals] = useState<string[]>(() => {
    const saved = localStorage.getItem('mini_rocket_unlocked_decals');
    return saved ? JSON.parse(saved) : ['none'];
  });

  const [selectedStadium, setSelectedStadium] = useState<string>(() => {
    const saved = localStorage.getItem('mini_rocket_selected_stadium');
    return saved ? saved : 'emerald';
  });

  const [blueConfig, setBlueConfig] = useState(() => {
    const saved = localStorage.getItem('mini_rocket_blue_config');
    return saved ? JSON.parse(saved) : { model: 'interstellar', primary: '#3b82f6', secondary: '#60a5fa', decal: 'none' };
  });

  const [redConfig, setRedConfig] = useState(() => {
    const saved = localStorage.getItem('mini_rocket_red_config');
    const red = saved ? JSON.parse(saved) : { model: 'interstellar', primary: '#3b82f6', secondary: '#60a5fa', decal: 'none' };
    
    // Ensure red inherits the same paint colors and decals from blue configurations initially
    const blueSaved = localStorage.getItem('mini_rocket_blue_config');
    const blue = blueSaved ? JSON.parse(blueSaved) : { primary: '#3b82f6', secondary: '#60a5fa', decal: 'none' };
    return {
      ...red,
      primary: blue.primary,
      secondary: blue.secondary,
      decal: blue.decal || 'none'
    };
  });

  const handleUpdateBlueConfig = (config: any) => {
    setBlueConfig(config);
    setRedConfig((prev: any) => ({
      ...prev,
      primary: config.primary,
      secondary: config.secondary,
      decal: config.decal || 'none'
    }));
  };

  const handleUpdateRedConfig = (config: any) => {
    setRedConfig(config);
    setBlueConfig((prev: any) => ({
      ...prev,
      primary: config.primary,
      secondary: config.secondary,
      decal: config.decal || 'none'
    }));
  };
  
  // Settings
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Canvas and Engine refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const activeKeys = useRef<Record<string, boolean>>({});
  const rafId = useRef<number | null>(null);

  // Interval and timeout refs to prevent memory leaks and auto-match triggers
  const countdownIntervalRef = useRef<any>(null);
  const goalResetTimeoutRef = useRef<any>(null);
  const winTimeoutRef = useRef<any>(null);

  const clearAllTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (goalResetTimeoutRef.current) {
      clearTimeout(goalResetTimeoutRef.current);
      goalResetTimeoutRef.current = null;
    }
    if (winTimeoutRef.current) {
      clearTimeout(winTimeoutRef.current);
      winTimeoutRef.current = null;
    }
  };

  // Time tracker for match stopwatch
  const matchStartTime = useRef<number>(0);
  const pausedDuration = useRef<number>(0);
  const pauseStart = useRef<number>(0);
  const goalFreezeStart = useRef<number>(0);

  // REPLAY SYSTEM STATES
  const [savedReplays, setSavedReplays] = useState<SavedReplay[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<SavedReplay | null>(null);
  const [replayFrameIndex, setReplayFrameIndex] = useState<number>(0);
  const [isReplayPlaying, setIsReplayPlaying] = useState<boolean>(true);
  const [replaySpeed, setReplaySpeed] = useState<number>(1.0);
  const [isReplayLooping, setIsReplayLooping] = useState<boolean>(false);

  // REPLAY SYSTEM REFS FOR HIGH-PERFORMANCE STEADY CLOCK
  const currentReplayFrames = useRef<ReplayFrame[]>([]);
  const currentReplayEvents = useRef<ReplayEvent[]>([]);
  const lastBoostPadStates = useRef<boolean[]>([]);
  const lastHitFrame = useRef<number>(0);

  const replayFrameIndexRef = useRef<number>(0);
  const isReplayPlayingRef = useRef<boolean>(true);
  const replaySpeedRef = useRef<number>(1.0);
  const isReplayLoopingRef = useRef<boolean>(false);

  // Sync state variables with high speed animation loop refs
  useEffect(() => {
    replayFrameIndexRef.current = replayFrameIndex;
  }, [replayFrameIndex]);

  useEffect(() => {
    isReplayPlayingRef.current = isReplayPlaying;
  }, [isReplayPlaying]);

  useEffect(() => {
    replaySpeedRef.current = replaySpeed;
  }, [replaySpeed]);

  useEffect(() => {
    isReplayLoopingRef.current = isReplayLooping;
  }, [isReplayLooping]);

  // Synchronizers for personalizations
  useEffect(() => {
    localStorage.setItem('mini_rocket_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('mini_rocket_unlocked_models', JSON.stringify(unlockedModels));
  }, [unlockedModels]);

  useEffect(() => {
    localStorage.setItem('mini_rocket_unlocked_palettes', JSON.stringify(unlockedPalettes));
  }, [unlockedPalettes]);

  useEffect(() => {
    localStorage.setItem('mini_rocket_unlocked_decals', JSON.stringify(unlockedDecals));
  }, [unlockedDecals]);

  useEffect(() => {
    localStorage.setItem('mini_rocket_selected_stadium', selectedStadium);
  }, [selectedStadium]);

  useEffect(() => {
    localStorage.setItem('mini_rocket_blue_config', JSON.stringify(blueConfig));
    if (engineRef.current) {
      engineRef.current.cars.blue.carModel = blueConfig.model;
      engineRef.current.cars.blue.colorPrimary = blueConfig.primary;
      engineRef.current.cars.blue.colorSecondary = blueConfig.secondary;
      engineRef.current.cars.blue.decal = blueConfig.decal || 'none';
    }
  }, [blueConfig]);

  useEffect(() => {
    localStorage.setItem('mini_rocket_red_config', JSON.stringify(redConfig));
    if (engineRef.current) {
      engineRef.current.cars.red.carModel = redConfig.model;
      engineRef.current.cars.red.colorPrimary = redConfig.primary;
      engineRef.current.cars.red.colorSecondary = redConfig.secondary;
      engineRef.current.cars.red.decal = redConfig.decal || 'none';
    }
  }, [redConfig]);

  // Initialise Game Engine once on mount & Load Saved Replays
  useEffect(() => {
    engineRef.current = new GameEngine();
    
    // Inject loaded configs into newly initialized engine
    if (engineRef.current) {
      engineRef.current.cars.blue.carModel = blueConfig.model;
      engineRef.current.cars.blue.colorPrimary = blueConfig.primary;
      engineRef.current.cars.blue.colorSecondary = blueConfig.secondary;
      engineRef.current.cars.blue.decal = blueConfig.decal || 'none';
      engineRef.current.cars.red.carModel = redConfig.model;
      engineRef.current.cars.red.colorPrimary = redConfig.primary;
      engineRef.current.cars.red.colorSecondary = redConfig.secondary;
      engineRef.current.cars.red.decal = redConfig.decal || 'none';
    }

    // Check if muted defaults to any local preference if needed
    setIsMuted(sounds.isMuted());

    // Load saved replays from filesystem / client localstorage
    try {
      const stored = localStorage.getItem('mini_rocket_saved_replays');
      if (stored) {
        setSavedReplays(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse saved replays from browser storage', e);
    }
  }, []);

  // Handle Resize and Maintain Aspect Ratio
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const parent = canvasRef.current.parentElement;
      if (!parent) return;

      const pWidth = parent.clientWidth;
      const pHeight = parent.clientHeight;
      
      const targetAspect = CONFIG.arenaWidth / CONFIG.arenaHeight;
      const parentAspect = pWidth / pHeight;

      let newScale = 1;
      if (parentAspect > targetAspect) {
        // Limited by height
        newScale = pHeight / CONFIG.arenaHeight;
      } else {
        // Limited by width
        newScale = pWidth / CONFIG.arenaWidth;
      }
      
      // Prevent over-stretching
      setScale(Math.min(newScale, 1.1));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [phase]);

  // Keyboard Event Listeners for smooth action
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      activeKeys.current[key] = true;

      // Handle Quick Controls
      if (key === 'p') {
        togglePause();
      }
      if (key === 'r') {
        restartMatch();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      activeKeys.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, isPaused, winner]);

  // Actions
  const startGame = (mode: GameMode = 'same_laptop') => {
    clearAllTimers();
    setGameMode(mode);
    setWinner(null);
    setGoalScored(null);
    setIsPaused(false);
    
    if (engineRef.current) {
      engineRef.current.resetMatch();
      setBlueScore(0);
      setRedScore(0);
    }

    // Reset recording tracks
    currentReplayFrames.current = [];
    currentReplayEvents.current = [];
    lastBoostPadStates.current = engineRef.current ? engineRef.current.boostPads.map(p => p.active) : [];
    lastHitFrame.current = 0;
    
    startCountdown();
  };

  const startCountdown = (isGoalReset: boolean = false) => {
    clearAllTimers();
    setPhase('COUNTDOWN');
    setCountdown(3);
    sounds.playCountdownBeep(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count === 0) {
        setCountdown('GO');
        sounds.playCountdownBeep(true);
      } else if (count < 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        setPhase('PLAYING');
        
        // Start timers
        if (isGoalReset && goalFreezeStart.current > 0) {
          pausedDuration.current += (Date.now() - goalFreezeStart.current);
          goalFreezeStart.current = 0;
        } else {
          matchStartTime.current = Date.now();
          pausedDuration.current = 0;
          pauseStart.current = 0;
          goalFreezeStart.current = 0;
        }
      } else {
        setCountdown(count);
        sounds.playCountdownBeep(false);
      }
    }, 1000);
    countdownIntervalRef.current = interval;
  };

  const togglePause = () => {
    if (phase !== 'PLAYING') return;

    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        pauseStart.current = Date.now();
      } else {
        pausedDuration.current += Date.now() - pauseStart.current;
      }
      return next;
    });
  };

  const toggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  const restartMatch = () => {
    clearAllTimers();
    if (engineRef.current) {
      engineRef.current.resetMatch();
    }
    setBlueScore(0);
    setRedScore(0);
    setWinner(null);
    setGoalScored(null);
    setIsPaused(false);

    // Reset recording tracks
    currentReplayFrames.current = [];
    currentReplayEvents.current = [];
    lastBoostPadStates.current = engineRef.current ? engineRef.current.boostPads.map(p => p.active) : [];
    lastHitFrame.current = 0;

    startCountdown();
  };

  const exitToMenu = () => {
    clearAllTimers();
    if (rafId.current) cancelAnimationFrame(rafId.current);
    setPhase('MENU');
    setWinner(null);
    setGoalScored(null);
    setIsPaused(false);
  };

  // REPLAY SYSTEM MANAGEMENT HANDLERS
  const recordCurrentFrame = () => {
    const engine = engineRef.current;
    if (!engine) return;

    const frame: ReplayFrame = {
      ball: {
        x: engine.ball.x,
        y: engine.ball.y,
        vx: engine.ball.vx,
        vy: engine.ball.vy,
      },
      blue: {
        x: engine.cars.blue.x,
        y: engine.cars.blue.y,
        vx: engine.cars.blue.vx,
        vy: engine.cars.blue.vy,
        angle: engine.cars.blue.angle,
        isBoosting: engine.cars.blue.isBoosting,
        carModel: engine.cars.blue.carModel,
        colorPrimary: engine.cars.blue.colorPrimary,
        colorSecondary: engine.cars.blue.colorSecondary,
        decal: engine.cars.blue.decal,
      },
      red: {
        x: engine.cars.red.x,
        y: engine.cars.red.y,
        vx: engine.cars.red.vx,
        vy: engine.cars.red.vy,
        angle: engine.cars.red.angle,
        isBoosting: engine.cars.red.isBoosting,
        carModel: engine.cars.red.carModel,
        colorPrimary: engine.cars.red.colorPrimary,
        colorSecondary: engine.cars.red.colorSecondary,
        decal: engine.cars.red.decal,
      },
      boostPadsActive: engine.boostPads.map(p => p.active),
      scores: {
        blue: engine.cars.blue.score,
        red: engine.cars.red.score,
      },
    };

    currentReplayFrames.current.push(frame);
  };

  const recordEventsThisFrame = () => {
    const engine = engineRef.current;
    if (!engine) return;

    const frameIdx = currentReplayFrames.current.length - 1;

    // Detect Goal triggers
    if (engine.goalScoredThisFrame) {
      currentReplayEvents.current.push({
        frameIndex: frameIdx,
        type: 'goal',
        team: engine.goalScoredThisFrame,
        x: engine.ball.x,
        y: engine.ball.y,
      });
    }

    // Detect Heavy Bumps
    if (engine.screenShake > 4 && frameIdx - lastHitFrame.current > 20) {
      lastHitFrame.current = frameIdx;
      currentReplayEvents.current.push({
        frameIndex: frameIdx,
        type: 'heavy_hit',
        x: engine.ball.x,
        y: engine.ball.y,
      });
    }

    // Detect Active Boost pad collection
    engine.boostPads.forEach((pad, i) => {
      const prev = lastBoostPadStates.current[i];
      if (prev && !pad.active) {
        // Evaluate closest vehicle
        const dBlue = Math.hypot(engine.cars.blue.x - pad.x, engine.cars.blue.y - pad.y);
        const dRed = Math.hypot(engine.cars.red.x - pad.x, engine.cars.red.y - pad.y);
        const team = dBlue < dRed ? 'blue' : 'red';
        
        currentReplayEvents.current.push({
          frameIndex: frameIdx,
          type: 'boost_pickup',
          team,
          x: pad.x,
          y: pad.y,
        });
      }
    });

    lastBoostPadStates.current = engine.boostPads.map(p => p.active);
  };

  const handleSaveReplay = (name: string) => {
    if (currentReplayFrames.current.length === 0) return;

    const newReplay: SavedReplay = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      timestamp: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationSeconds: currentReplayFrames.current.length / 60,
      finalScore: { blue: blueScore, red: redScore },
      frames: [...currentReplayFrames.current],
      events: [...currentReplayEvents.current],
    };

    const nextReplays = [newReplay, ...savedReplays].slice(0, 10);
    setSavedReplays(nextReplays);
    localStorage.setItem('mini_rocket_saved_replays', JSON.stringify(nextReplays));
  };

  const handleDeleteReplay = (id: string) => {
    const nextReplays = savedReplays.filter(r => r.id !== id);
    setSavedReplays(nextReplays);
    localStorage.setItem('mini_rocket_saved_replays', JSON.stringify(nextReplays));
  };

  const handlePlayReplay = (replay: SavedReplay) => {
    setPhase('REPLAY');
    setSelectedReplay(replay);
    setReplayFrameIndex(0);
    setIsReplayPlaying(true);
    setReplaySpeed(1.0);
    setIsReplayLooping(false);

    if (engineRef.current) {
      engineRef.current.particles = [];
    }
  };

  const handleExitReplay = () => {
    setPhase('MENU');
    setSelectedReplay(null);
    setReplayFrameIndex(0);
    setIsReplayPlaying(false);
  };

  const handleSetReplayIndex = (idx: number) => {
    setReplayFrameIndex(idx);
    replayFrameIndexRef.current = idx;
    if (engineRef.current) {
      engineRef.current.particles = [];
    }
  };

  const triggerReplayEvents = (prevIdx: number, currIdx: number, events: ReplayEvent[]) => {
    events.forEach(evt => {
      if (prevIdx < evt.frameIndex && currIdx >= evt.frameIndex) {
        if (evt.type === 'goal') {
          sounds.playWin();
          // Spawn confetti splash in theatre engine
          if (engineRef.current) {
            for (let i = 0; i < 35; i++) {
              engineRef.current.particles.push({
                x: evt.x,
                y: evt.y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                color: evt.team === 'blue' ? '#3b82f6' : '#ef4444',
                radius: Math.random() * 5 + 3,
                life: 1.0,
                decay: 0.02,
              });
            }
          }
        } else if (evt.type === 'heavy_hit') {
          sounds.playHit(true);
          if (engineRef.current) {
            for (let i = 0; i < 15; i++) {
              engineRef.current.particles.push({
                x: evt.x,
                y: evt.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: '#f59e0b',
                radius: Math.random() * 3 + 2,
                life: 0.8,
                decay: 0.04,
              });
            }
          }
        } else if (evt.type === 'boost_pickup') {
          sounds.playBoost();
        }
      }
    });
  };

  const applyReplayFrameToEngine = (frame: ReplayFrame) => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.ball.x = frame.ball.x;
    engine.ball.y = frame.ball.y;
    engine.ball.vx = frame.ball.vx;
    engine.ball.vy = frame.ball.vy;

    engine.cars.blue.x = frame.blue.x;
    engine.cars.blue.y = frame.blue.y;
    engine.cars.blue.vx = frame.blue.vx;
    engine.cars.blue.vy = frame.blue.vy;
    engine.cars.blue.angle = frame.blue.angle;
    engine.cars.blue.isBoosting = frame.blue.isBoosting;
    engine.cars.blue.carModel = frame.blue.carModel || 'interstellar';
    engine.cars.blue.colorPrimary = frame.blue.colorPrimary || '#3b82f6';
    engine.cars.blue.colorSecondary = frame.blue.colorSecondary || '#60a5fa';
    engine.cars.blue.decal = (frame.blue.decal as any) || 'none';

    engine.cars.red.x = frame.red.x;
    engine.cars.red.y = frame.red.y;
    engine.cars.red.vx = frame.red.vx;
    engine.cars.red.vy = frame.red.vy;
    engine.cars.red.angle = frame.red.angle;
    engine.cars.red.isBoosting = frame.red.isBoosting;
    engine.cars.red.carModel = frame.red.carModel || 'interstellar';
    engine.cars.red.colorPrimary = frame.red.colorPrimary || '#ef4444';
    engine.cars.red.colorSecondary = frame.red.colorSecondary || '#f87171';
    engine.cars.red.decal = (frame.red.decal as any) || 'none';

    frame.boostPadsActive.forEach((active, i) => {
      if (engine.boostPads[i]) {
        engine.boostPads[i].active = active;
      }
    });

    // Animate jet exhaust particles procedurally during playback
    if (frame.blue.isBoosting && Math.random() < 0.4) {
      engine.particles.push({
        x: frame.blue.x - Math.cos(frame.blue.angle) * (CONFIG.carWidth / 2 - 5),
        y: frame.blue.y - Math.sin(frame.blue.angle) * (CONFIG.carWidth / 2 - 5),
        vx: (Math.random() - 0.5) * 2 - Math.cos(frame.blue.angle) * 3,
        vy: (Math.random() - 0.5) * 2 - Math.sin(frame.blue.angle) * 3,
        color: frame.blue.colorPrimary || '#3b82f6',
        radius: Math.random() * 4 + 3,
        life: 1.0,
        decay: 0.04,
      });
    }

    if (frame.red.isBoosting && Math.random() < 0.4) {
      engine.particles.push({
        x: frame.red.x - Math.cos(frame.red.angle) * (CONFIG.carWidth / 2 - 5),
        y: frame.red.y - Math.sin(frame.red.angle) * (CONFIG.carWidth / 2 - 5),
        vx: (Math.random() - 0.5) * 2 - Math.cos(frame.red.angle) * 3,
        vy: (Math.random() - 0.5) * 2 - Math.sin(frame.red.angle) * 3,
        color: frame.red.colorPrimary || '#ef4444',
        radius: Math.random() * 4 + 3,
        life: 1.0,
        decay: 0.04,
      });
    }

    // Tick the dynamic particles drift
    engine.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.life -= p.decay;
    });
    engine.particles = engine.particles.filter(p => p.life > 0);
  };

  // Main Loop Handler
  useEffect(() => {
    if (phase !== 'PLAYING' && phase !== 'GOAL_SCORD' && phase !== 'REPLAY') {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    const loop = () => {
      const engine = engineRef.current;
      const canvas = canvasRef.current;
      if (!engine || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. UPDATE GAME PHYSICS (Only if not paused)
      if (phase === 'PLAYING' && !isPaused && !winner) {
        engine.update(activeKeys.current, gameMode);

        // Track timer
        const elapsed = (Date.now() - matchStartTime.current - pausedDuration.current) / 1000;
        setMatchTimer(Math.max(0, elapsed));

        // Sync local score states instantly
        const currentBlueScore = engine.cars.blue.score;
        const currentRedScore = engine.cars.red.score;
        setBlueScore(currentBlueScore);
        setRedScore(currentRedScore);

        // Record current frame state
        recordCurrentFrame();

        // Check if collision/boost events happened
        recordEventsThisFrame();

        // 5 Minutes time limit check (300 seconds)
        if (elapsed >= 300 && currentBlueScore !== currentRedScore) {
          const limitWinner = currentBlueScore > currentRedScore ? 'blue' : 'red';
          setWinner(limitWinner);
          setPhase('MENU');
          sounds.playWin();
          setCoins((prev) => prev + 100);
          return;
        }

        // Check if a goal was scored
        if (engine.goalScoredThisFrame) {
          const scorer = engine.goalScoredThisFrame;
          setGoalScored(scorer);

          // Increment coins pool for scoring a goal
          setCoins((prev) => prev + 15);

          // Check Win Condition (Max score reached, OR we were in overtime/sudden death, meaning this is the Golden Goal!)
          if (engine.cars[scorer].score >= CONFIG.maxScore && gameMode !== 'free_practice' && gameMode !== 'machine_practice') {
            setPhase('GOAL_SCORD'); // Freeze updates only on final victory target
            // Increment coins pool for match victory bonus
            setCoins((prev) => prev + 100);

            winTimeoutRef.current = setTimeout(() => {
              setWinner(scorer);
              setPhase('MENU'); // stops the updates, overlays the Win panel
              sounds.playWin();
              winTimeoutRef.current = null;
            }, 1800);
          } else {
            // Standard reset after goal - instead of splitting phase or stopping, action continues INSTANTLY!
            // No freezing/countdown phase change. We remain on ('PLAYING') and vehicles keep driving!
            const centerReset = (gameMode !== 'machine_practice');
            engine.resetPositions(centerReset);

            // Just flash the temporary "GOAL!" notification overlay but do not lock controls
            setGoalScored(scorer);
            if (goalResetTimeoutRef.current) clearTimeout(goalResetTimeoutRef.current);
            goalResetTimeoutRef.current = setTimeout(() => {
              setGoalScored(null);
              goalResetTimeoutRef.current = null;
            }, 1200);
          }
        }
      } else if (phase === 'GOAL_SCORD') {
        // Still update particles and ball (with friction) during final game-over/celebration flow
        engine.update({}, gameMode);
        recordCurrentFrame();
      } else if (phase === 'REPLAY') {
        if (selectedReplay) {
          const frames = selectedReplay.frames;
          const totalFrames = frames.length;

          // If playing back in real-time
          if (isReplayPlayingRef.current) {
            setReplayFrameIndex((prevIndex) => {
              const speed = replaySpeedRef.current;
              let nextIndex = prevIndex + speed;

              if (nextIndex >= totalFrames - 1) {
                if (isReplayLoopingRef.current) {
                  triggerReplayEvents(prevIndex, 0, selectedReplay.events);
                  return 0;
                } else {
                  setIsReplayPlaying(false);
                  return totalFrames - 1;
                }
              }

              triggerReplayEvents(Math.floor(prevIndex), Math.floor(nextIndex), selectedReplay.events);
              return nextIndex;
            });
          }

          // Render appropriate frame
          const activeIndex = Math.min(Math.floor(replayFrameIndexRef.current), totalFrames - 1);
          const frame = frames[activeIndex];
          if (frame) {
            applyReplayFrameToEngine(frame);
          }
        }
      }

      // 2. RENDER STAGE
      renderGame(ctx, engine);

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      clearAllTimers();
    };
  }, [phase, isPaused, winner, selectedReplay]);

  // DRAW RENDERING PROCEDURES
  const renderGame = (ctx: CanvasRenderingContext2D, engine: GameEngine) => {
    const w = CONFIG.arenaWidth;
    const h = CONFIG.arenaHeight;

    ctx.save();

    // SCREEN SHAKE IMPLEMENTATION
    if (engine.screenShake > 0.1) {
      const dx = (Math.random() - 0.5) * engine.screenShake;
      const dy = (Math.random() - 0.5) * engine.screenShake;
      ctx.translate(dx, dy);
    }

    // A. Pitch Background & Turf Strips
    // STADIUM COSMETIC MATRIX CONFIG
    let fieldStyles = {
      baseBg: '#0f172a',
      stripEven: 'rgba(15, 23, 42, 0.45)',
      stripOdd: 'rgba(30, 41, 59, 0.25)',
      gridColor: 'rgba(51, 65, 85, 0.12)',
      markingLine: 'rgba(255, 255, 255, 0.25)',
      extraDrawing: (canvasCtx: CanvasRenderingContext2D) => {}
    };

    if (selectedStadium === 'emerald') {
      fieldStyles = {
        baseBg: '#0e4626',
        stripEven: 'rgba(11, 56, 32, 0.5)',
        stripOdd: 'rgba(15, 82, 45, 0.25)',
        gridColor: 'rgba(34, 197, 94, 0.08)',
        markingLine: 'rgba(255, 255, 255, 0.35)',
        extraDrawing: (canvasCtx) => {
          canvasCtx.strokeStyle = 'rgba(34, 197, 94, 0.12)';
          canvasCtx.lineWidth = 1.5;
          for (let y = 80; y < h; y += 120) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(0, y);
            canvasCtx.lineTo(w, y);
            canvasCtx.stroke();
          }
        }
      };
    } else if (selectedStadium === 'cosmic') {
      fieldStyles = {
        baseBg: '#050409',
        stripEven: 'rgba(13, 10, 24, 0.75)',
        stripOdd: 'rgba(22, 17, 43, 0.35)',
        gridColor: 'rgba(56, 189, 248, 0.09)',
        markingLine: 'rgba(56, 189, 248, 0.4)',
        extraDrawing: (canvasCtx) => {
          canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          for (let i = 0; i < 24; i++) {
            const sx = (i * 137) % w;
            const sy = (i * 283) % h;
            const size = (i % 2 === 0) ? 1.5 : 2.5;
            canvasCtx.beginPath();
            canvasCtx.arc(sx, sy, size, 0, Math.PI * 2);
            canvasCtx.fill();
          }
          canvasCtx.strokeStyle = 'rgba(139, 92, 246, 0.18)';
          canvasCtx.lineWidth = 12;
          canvasCtx.beginPath();
          canvasCtx.arc(w / 2, h / 2, 190, 0, Math.PI * 2);
          canvasCtx.stroke();
        }
      };
    } else if (selectedStadium === 'rustlands') {
      fieldStyles = {
        baseBg: '#2a0c02',
        stripEven: 'rgba(58, 16, 5, 0.55)',
        stripOdd: 'rgba(84, 28, 12, 0.3)',
        gridColor: 'rgba(249, 115, 22, 0.1)',
        markingLine: 'rgba(249, 115, 22, 0.35)',
        extraDrawing: (canvasCtx) => {
          canvasCtx.fillStyle = 'rgba(124, 45, 18, 0.5)';
          for (let x = 60; x < w; x += 250) {
            for (let y = 60; y < h; y += 180) {
              canvasCtx.beginPath();
              canvasCtx.arc(x, y, 3.5, 0, Math.PI * 2);
              canvasCtx.arc(x + 15, y, 3.5, 0, Math.PI * 2);
              canvasCtx.fill();
            }
          }
        }
      };
    } else if (selectedStadium === 'frozen') {
      fieldStyles = {
        baseBg: '#071630',
        stripEven: 'rgba(10, 35, 77, 0.7)',
        stripOdd: 'rgba(19, 58, 118, 0.35)',
        gridColor: 'rgba(96, 165, 254, 0.08)',
        markingLine: 'rgba(147, 197, 253, 0.42)',
        extraDrawing: (canvasCtx) => {
          canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          for (let i = 0; i < 18; i++) {
            const fx = (i * 243) % w;
            const fy = (i * 123) % h;
            canvasCtx.beginPath();
            canvasCtx.arc(fx, fy, 16, 0, Math.PI * 2);
            canvasCtx.fill();
          }
        }
      };
    } else if (selectedStadium === 'cyber') {
      fieldStyles = {
        baseBg: '#020512',
        stripEven: 'rgba(5, 11, 26, 0.9)',
        stripOdd: 'rgba(10, 20, 44, 0.45)',
        gridColor: 'rgba(16, 185, 129, 0.15)',
        markingLine: 'rgba(16, 185, 129, 0.45)',
        extraDrawing: (canvasCtx) => {
          canvasCtx.fillStyle = 'rgba(16, 185, 129, 0.08)';
          canvasCtx.font = '8.5px monospace';
          for (let i = 0; i < 10; i++) {
            canvasCtx.fillText('0110 or 1001', (i * 181) % w, (i * 163) % h);
          }
        }
      };
    } else if (selectedStadium === 'tokyo') {
      fieldStyles = {
        baseBg: '#11052c',
        stripEven: 'rgba(23, 10, 52, 0.7)',
        stripOdd: 'rgba(38, 16, 84, 0.35)',
        gridColor: 'rgba(255, 0, 127, 0.12)',
        markingLine: '#ff007f',
        extraDrawing: (canvasCtx) => {
          // Draw Neon sunset girders on sides
          canvasCtx.strokeStyle = 'rgba(255, 0, 127, 0.25)';
          canvasCtx.lineWidth = 2;
          canvasCtx.beginPath();
          canvasCtx.moveTo(40, 0); canvasCtx.lineTo(40, h);
          canvasCtx.moveTo(w - 40, 0); canvasCtx.lineTo(w - 40, h);
          canvasCtx.stroke();
        }
      };
    } else if (selectedStadium === 'lava') {
      fieldStyles = {
        baseBg: '#100015',
        stripEven: 'rgba(15, 0, 25, 0.74)',
        stripOdd: 'rgba(32, 2, 48, 0.38)',
        gridColor: 'rgba(224, 64, 251, 0.14)',
        markingLine: '#e040fb',
        extraDrawing: (canvasCtx) => {
          // Draw glowing fluorescent rose-magma flows and cracks
          canvasCtx.fillStyle = 'rgba(224, 64, 251, 0.12)';
          canvasCtx.beginPath();
          canvasCtx.ellipse(80, h / 2, 45, 95, 0, 0, Math.PI * 2);
          canvasCtx.ellipse(w - 80, h / 2, 45, 95, 0, 0, Math.PI * 2);
          canvasCtx.fill();
        }
      };
    } else if (selectedStadium === 'vaporwave') {
      fieldStyles = {
        baseBg: '#18072b',
        stripEven: 'rgba(33, 11, 57, 0.75)',
        stripOdd: 'rgba(49, 18, 84, 0.38)',
        gridColor: 'rgba(0, 245, 255, 0.14)',
        markingLine: '#38bdf8',
        extraDrawing: (canvasCtx) => {
          // Neon retro grid details and palm silhouettes on bounds
          canvasCtx.fillStyle = 'rgba(236, 72, 153, 0.08)';
          canvasCtx.beginPath();
          canvasCtx.arc(w / 2, h / 2, 130, 0, Math.PI * 2);
          canvasCtx.fill();
        }
      };
    } else if (selectedStadium === 'temple') {
      fieldStyles = {
        baseBg: '#2a1701',
        stripEven: 'rgba(56, 32, 1, 0.7)',
        stripOdd: 'rgba(74, 43, 2, 0.35)',
        gridColor: 'rgba(245, 158, 11, 0.13)',
        markingLine: '#fbbf24',
        extraDrawing: (canvasCtx) => {
          // Runic amber carvings
          canvasCtx.strokeStyle = 'rgba(251, 191, 36, 0.18)';
          canvasCtx.lineWidth = 3;
          canvasCtx.beginPath();
          canvasCtx.arc(w / 2, h / 2, 75, 0, Math.PI * 2);
          canvasCtx.stroke();
        }
      };
    } else if (selectedStadium === 'biodome') {
      fieldStyles = {
        baseBg: '#02160d',
        stripEven: 'rgba(4, 30, 18, 0.72)',
        stripOdd: 'rgba(6, 44, 26, 0.36)',
        gridColor: 'rgba(16, 185, 129, 0.15)',
        markingLine: '#10b981',
        extraDrawing: (canvasCtx) => {
          // Tiny fireflies glowing dots
          canvasCtx.fillStyle = 'rgba(52, 211, 153, 0.45)';
          for (let i = 0; i < 8; i++) {
            const fx = (i * 197) % w;
            const fy = (i * 109) % h;
            canvasCtx.beginPath();
            canvasCtx.arc(fx, fy, 2, 0, Math.PI * 2);
            canvasCtx.fill();
          }
        }
      };
    }

    ctx.fillStyle = fieldStyles.baseBg;
    ctx.fillRect(0, 0, w, h);

    // Turf alternate strips for modern styling
    const stripWidth = w / 14;
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 === 0 ? fieldStyles.stripEven : fieldStyles.stripOdd;
      ctx.fillRect(i * stripWidth, 0, stripWidth, h);
    }

    // Grid details for tech vibe
    ctx.strokeStyle = fieldStyles.gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Call dynamic extra drawing details
    fieldStyles.extraDrawing(ctx);

    // Realistic Vignette and Shadowing to simulate professional stadium illumination
    const lightingGrad = ctx.createLinearGradient(0, 0, w, h);
    lightingGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)'); // Stadium glare highlight
    lightingGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    lightingGrad.addColorStop(1, 'rgba(0, 0, 0, 0.42)'); // Dark drop-off
    ctx.fillStyle = lightingGrad;
    ctx.fillRect(0, 0, w, h);

    const perimeterVignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.65);
    perimeterVignette.addColorStop(0, 'rgba(0,0,0,0)');
    perimeterVignette.addColorStop(1.0, 'rgba(0,0,0,0.58)');
    ctx.fillStyle = perimeterVignette;
    ctx.fillRect(0, 0, w, h);

    // Corner floodlights/light beams lacing into the field
    const drawFloodlight = (fx: number, fy: number, startAngle: number, endAngle: number) => {
      ctx.save();
      const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 220);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.03)');
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.arc(fx, fy, 220, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawFloodlight(0, 0, 0, Math.PI / 2);
    drawFloodlight(w, 0, Math.PI / 2, Math.PI);
    drawFloodlight(0, h, -Math.PI / 2, 0);
    drawFloodlight(w, h, Math.PI, -Math.PI / 2);

    // Physical posts drawer function
    const draw3DPost = (px: number, py: number) => {
      ctx.save();
      // Physical cylindrical shadow
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath();
      ctx.arc(px + 4, py + 4, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Metallic cylinder shader
      const grad = ctx.createLinearGradient(px - 1, py, px + 1, py);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(0.5, '#f8fafc');
      grad.addColorStop(1, '#475569');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Post outline
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    };

    // B. Pitch White Markings
    ctx.strokeStyle = fieldStyles.markingLine;
    ctx.lineWidth = 4;

    // Field Outer border lines
    ctx.strokeRect(0, 0, w, h);

    // Midfield Line
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Center Circle
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Center Dot
    ctx.fillStyle = fieldStyles.markingLine;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Left Goal Crease / Penalty Box
    ctx.beginPath();
    ctx.strokeRect(0, (h - CONFIG.goalHeight - 120) / 2, 140, CONFIG.goalHeight + 120);
    ctx.beginPath();
    ctx.arc(140, h / 2, 60, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Right Goal Crease / Penalty Box
    ctx.beginPath();
    ctx.strokeRect(w - 140, (h - CONFIG.goalHeight - 120) / 2, 140, CONFIG.goalHeight + 120);
    ctx.beginPath();
    ctx.arc(w - 140, h / 2, 60, Math.PI / 2, -Math.PI / 2, true);
    ctx.stroke();

    // Corner Kick Arcs
    const cSize = 30;
    // Top-Left
    ctx.beginPath(); ctx.arc(0, 0, cSize, 0, Math.PI / 2); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.arc(0, h, cSize, -Math.PI / 2, 0); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.arc(w, 0, cSize, Math.PI / 2, Math.PI); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.arc(w, h, cSize, Math.PI, -Math.PI / 2); ctx.stroke();


    // C. Draw Boost Pads
    engine.boostPads.forEach(pad => {
      ctx.save();
      if (pad.active) {
        // Glowing gold boost pad
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#f59e0b';
        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        ctx.lineWidth = 3;

        // Draw concentric pulses
        ctx.beginPath();
        ctx.arc(pad.x, pad.y, pad.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pad.x, pad.y, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cool down state (faded ring)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pad.x, pad.y, pad.radius - 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });


    // D. Outer Goal Nets Drawing (to visually sit under cars/ball)
    const minGoalY = (h - CONFIG.goalHeight) / 2;
    const maxGoalY = (h + CONFIG.goalHeight) / 2;
    const gWidth = CONFIG.goalWidth;

    // Left Goal
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.fillRect(-gWidth, minGoalY, gWidth, CONFIG.goalHeight);
    ctx.strokeRect(-gWidth, minGoalY, gWidth, CONFIG.goalHeight);

    // Grid net lines for left goal
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.lineWidth = 1.5;
    for (let gx = -gWidth; gx <= 0; gx += 20) {
      ctx.beginPath(); ctx.moveTo(gx, minGoalY); ctx.lineTo(gx, maxGoalY); ctx.stroke();
    }
    for (let gy = minGoalY; gy <= maxGoalY; gy += 20) {
      ctx.beginPath(); ctx.moveTo(-gWidth, gy); ctx.lineTo(0, gy); ctx.stroke();
    }

    // Right Goal
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.fillRect(w, minGoalY, gWidth, CONFIG.goalHeight);
    ctx.strokeRect(w, minGoalY, gWidth, CONFIG.goalHeight);

    // Grid net lines for right goal
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.lineWidth = 1.5;
    for (let gx = w; gx <= w + gWidth; gx += 20) {
      ctx.beginPath(); ctx.moveTo(gx, minGoalY); ctx.lineTo(gx, maxGoalY); ctx.stroke();
    }
    for (let gy = minGoalY; gy <= maxGoalY; gy += 20) {
      ctx.beginPath(); ctx.moveTo(w, gy); ctx.lineTo(w + gWidth, gy); ctx.stroke();
    }

    // DRAW PHYSICAL METALLIC GOALPOSTS (to visually seat goalposts elegantly)
    draw3DPost(0, minGoalY);
    draw3DPost(0, maxGoalY);
    draw3DPost(w, minGoalY);
    draw3DPost(w, maxGoalY);


    // E. Draw Shadows (for cars and ball together)
    // Left-down shifted semi-transparent shapes to simulate 3D altitude!
    const shadowOffset = 9;

    // Ball shadow
    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.beginPath();
    ctx.arc(engine.ball.x + shadowOffset, engine.ball.y + shadowOffset, engine.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Car shadows
    [engine.cars.blue, engine.cars.red].forEach(car => {
      ctx.save();
      ctx.translate(car.x + shadowOffset, car.y + shadowOffset);
      ctx.rotate(car.angle);
      
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      // Simple rounded rectangle shadow
      ctx.roundRect(-CONFIG.carWidth / 2, -CONFIG.carHeight / 2, CONFIG.carWidth, CONFIG.carHeight, 8);
      ctx.fill();
      ctx.restore();
    });


    // F. Draw Particles
    engine.particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });


    // G. Draw Soccer Ball
    const ball = engine.ball;
    ctx.save();
    ctx.translate(ball.x, ball.y);
    
    // Outer white/silver shell
    const grad = ctx.createRadialGradient(-ball.radius / 4, -ball.radius / 4, ball.radius / 8, 0, 0, ball.radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.72, '#cbd5e1');
    grad.addColorStop(1, '#64748b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Technical pentagons / Soccer Panels line paths
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    
    const panelPoints = 6;
    ctx.beginPath();
    // Inner center circle decal
    ctx.arc(0, 0, ball.radius * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    // Panel seams
    for (let i = 0; i < panelPoints; i++) {
      const ang = (i * Math.PI * 2) / panelPoints;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * ball.radius * 0.45, Math.sin(ang) * ball.radius * 0.45);
      ctx.lineTo(Math.cos(ang) * ball.radius, Math.sin(ang) * ball.radius);
      ctx.stroke();
    }

    // Gloss glow reflection highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(-ball.radius / 3, -ball.radius / 3, ball.radius / 3, 0, Math.PI * 2);
    ctx.fill();

    // Center metallic nut
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();


    // H. Draw Cars
    [engine.cars.blue, engine.cars.red].forEach(car => {
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      const cw = CONFIG.carWidth;
      const ch = CONFIG.carHeight;

      // 1. Headlight beams (translucent yellow wedges projecting forward)
      ctx.save();
      const beamGrad = ctx.createLinearGradient(cw / 2, 0, cw / 2 + 75, 0);
      beamGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
      beamGrad.addColorStop(1, 'rgba(253, 224, 71, 0.0)');
      ctx.fillStyle = beamGrad;
      
      ctx.beginPath();
      ctx.moveTo(cw / 2 - 4, -ch * 0.35);
      ctx.lineTo(cw / 2 + 75, -ch * 0.95);
      ctx.lineTo(cw / 2 + 75, ch * 0.95);
      ctx.lineTo(cw / 2 - 4, ch * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Wheels (four black rectangles at corners)
      ctx.fillStyle = '#0f172a';
      const wheelW = 12;
      const wheelH = 6;
      ctx.fillRect(-cw / 2 + 6, -ch / 2 - 3, wheelW, wheelH); // Front-Left
      ctx.fillRect(cw / 2 - 18, -ch / 2 - 3, wheelW, wheelH);  // Front-Right
      ctx.fillRect(-cw / 2 + 6, ch / 2 - 3, wheelW, wheelH);  // Rear-Left
      ctx.fillRect(cw / 2 - 18, ch / 2 - 3, wheelW, wheelH);   // Rear-Right

      // 3 & 4 & 5 & 6. Main Car Design depending on the equipped model
      const model = car.carModel || 'interstellar';

      if (model === 'beast') {
        // --- THE BEAST (Heavy Armored Chassis) ---
        // Main blocky body
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 2); // sharp rigid edges
        ctx.fill();
        ctx.stroke();

        // Thick side plating armor (Dual secondary strips)
        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw / 2 + 8, -ch / 2 + 2, cw - 16, 4);
        ctx.fillRect(-cw / 2 + 8, ch / 2 - 6, cw - 16, 4);

        // Center spine plate
        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw * 0.15, -ch * 0.15, cw * 0.4, ch * 0.3);

        // Heavy front ram-bumper bars (at positive X front)
        ctx.fillStyle = '#475569';
        ctx.fillRect(cw / 2 - 2, -ch * 0.4, 4, ch * 0.8);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cw / 2, -ch * 0.25, 3, ch * 0.5);

        // Cockpit Glass Visor (small thick reinforced square capsule)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-cw * 0.05, -ch * 0.2, cw * 0.25, ch * 0.4, 3);
        ctx.fill();
        ctx.strokeStyle = car.colorSecondary;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Armored windshield bars (horizontal grille lines)
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -ch * 0.2);
        ctx.lineTo(0, ch * 0.2);
        ctx.moveTo(cw * 0.1, -ch * 0.2);
        ctx.lineTo(cw * 0.1, ch * 0.2);
        ctx.stroke();

        // Heavy bracket plate at tail end
        ctx.fillStyle = '#334155';
        ctx.fillRect(-cw / 2 - 5, -ch / 2 + 3, 5, ch - 6);
      } else if (model === 'spectre') {
        // --- SPECTRE F1 (Pointy Needle Speedster) ---
        // Main sharp triangular nose body
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-cw / 2, -ch * 0.42);
        ctx.lineTo(cw / 2 - 4, -ch * 0.15);
        ctx.lineTo(cw / 2 + 10, 0); // sharp pointed aerodynamic tip!
        ctx.lineTo(cw / 2 - 4, ch * 0.15);
        ctx.lineTo(-cw / 2, ch * 0.42);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Racing decal accent swooshes
        ctx.fillStyle = car.colorSecondary;
        ctx.beginPath();
        ctx.moveTo(-cw * 0.2, -ch * 0.24);
        ctx.lineTo(cw * 0.2, -ch * 0.08);
        ctx.lineTo(cw * 0.2, ch * 0.08);
        ctx.lineTo(-cw * 0.2, ch * 0.24);
        ctx.closePath();
        ctx.fill();

        // Cockpit Windshield (Long streamlined glass teardrop bubble)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(cw * 0.02, 0, cw * 0.25, ch * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = car.colorSecondary;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Reflection highlight on bubble cockpit
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.ellipse(cw * 0.04, -ch * 0.06, 5, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Sweeping F1 Wing side intakes (pods)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-cw * 0.35, -ch / 2 - 3, cw * 0.2, 4);
        ctx.fillRect(-cw * 0.35, ch / 2 - 1, cw * 0.2, 4);

        // Huge triple rear racing wing stabilizer (extended size)
        ctx.fillStyle = '#111827';
        ctx.fillRect(-cw / 2 - 6, -ch / 2 - 6, 5, ch + 12);
        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw / 2 - 9, -ch / 2 - 6, 3, 6);
        ctx.fillRect(-cw / 2 - 9, ch / 2, 3, 6);
      } else if (model === 'cyber') {
        // --- CYBERSPACE (Brutalist Exoskeleton Polygon) ---
        // Exoskeleton facet-like blunt body
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-cw / 2, -ch / 2 + 3);
        ctx.lineTo(-cw * 0.2, -ch / 2);
        ctx.lineTo(cw / 2 - 5, -ch * 0.32);
        ctx.lineTo(cw / 2 + 5, 0); // angular nose landing
        ctx.lineTo(cw / 2 - 5, ch * 0.32);
        ctx.lineTo(-cw * 0.2, ch / 2);
        ctx.lineTo(-cw / 2, ch / 2 - 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing solar polymer light decal lines (exoskeleton outline panels)
        ctx.strokeStyle = car.colorSecondary;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(-cw * 0.35, -ch * 0.22);
        ctx.lineTo(cw * 0.15, -ch * 0.22);
        ctx.lineTo(cw * 0.35, 0);
        ctx.lineTo(cw * 0.15, ch * 0.22);
        ctx.lineTo(-cw * 0.35, ch * 0.22);
        ctx.stroke();

        // Cockpit Glass (Angular Diamond prism glass)
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.moveTo(-cw * 0.08, 0);
        ctx.lineTo(cw * 0.08, -ch * 0.18);
        ctx.lineTo(cw * 0.24, 0);
        ctx.lineTo(cw * 0.08, ch * 0.18);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = car.colorSecondary;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Star tech reflection on futuristic glass
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(cw * 0.08, -ch * 0.05);
        ctx.lineTo(cw * 0.12, 0);
        ctx.lineTo(cw * 0.08, ch * 0.05);
        ctx.closePath();
        ctx.fill();

        // Winglets or laser lightbars splitters on side panels
        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw * 0.15, -ch / 2 - 2, 8, 2);
        ctx.fillRect(-cw * 0.15, ch / 2, 8, 2);

        // Rear futuristic composite solar split wing stabilizer
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-cw / 2 - 5, -ch * 0.3, 4, ch * 0.6);
        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw / 2 - 8, -ch * 0.2, 3, ch * 0.4);
      } else if (model === 'phantom') {
        // --- PHANTOM GT (Quantum Stealth Speedster) ---
        // Sleek aerodynamic body with faceted dual-wing rear splitters
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#2e1065';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-cw / 2, -ch * 0.35);
        ctx.lineTo(-cw * 0.1, -ch * 0.35);
        ctx.lineTo(cw / 2 - 8, -ch * 0.22);
        ctx.lineTo(cw / 2 + 12, 0); // hyper-pointed nose
        ctx.lineTo(cw / 2 - 8, ch * 0.22);
        ctx.lineTo(-cw * 0.1, ch * 0.35);
        ctx.lineTo(-cw / 2, ch * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Neon active vector lines
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-cw * 0.2, -ch * 0.15);
        ctx.lineTo(cw * 0.25, 0);
        ctx.lineTo(-cw * 0.2, ch * 0.15);
        ctx.stroke();

        // Holographic Glass (neon violet glass canopy)
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.roundRect(-cw * 0.1, -ch * 0.16, cw * 0.32, ch * 0.32, 5);
        ctx.fill();
        ctx.strokeStyle = car.colorSecondary;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dual glowing stabilizer energy bars at the wings
        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw / 2 - 4, -ch / 2 - 3, 5, 4);
        ctx.fillRect(-cw / 2 - 4, ch / 2 - 1, 5, 4);
      } else if (model === 'phoenix') {
        // --- PHOENIX VTOL (Atmospheric Jet-Engine Hypercar) ---
        // Delta-wing style high-speed jet layout
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-cw / 2 + 6, -ch * 0.45);
        ctx.lineTo(cw * 0.1, -ch * 0.45);
        ctx.lineTo(cw / 2 + 15, 0); // supersonic nose probe
        ctx.lineTo(cw * 0.1, ch * 0.45);
        ctx.lineTo(-cw / 2 + 6, ch * 0.45);
        ctx.lineTo(-cw / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Gold flame sweeping decals
        ctx.fillStyle = car.colorSecondary;
        ctx.beginPath();
        ctx.moveTo(-cw * 0.15, -ch * 0.32);
        ctx.lineTo(cw * 0.2, 0);
        ctx.lineTo(-cw * 0.15, ch * 0.32);
        ctx.lineTo(-cw * 0.28, 0);
        ctx.closePath();
        ctx.fill();

        // Supersonic Jet Canopy Glass
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(cw * 0.08, 0, cw * 0.22, ch * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = car.colorSecondary;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Wingtip light indicators
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-cw / 2 + 6, -ch * 0.45, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-cw / 2 + 6, ch * 0.45, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (model === 'apex') {
        // --- APEX INTERCEPTOR ---
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#0f171a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-cw / 2, -ch * 0.42, cw, ch * 0.84, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw * 0.15, -ch * 0.25, cw * 0.4, ch * 0.5);

        // Glass
        ctx.fillStyle = '#0f171a';
        ctx.beginPath();
        ctx.roundRect(cw * 0.12, -ch * 0.18, cw * 0.2, ch * 0.36, 4);
        ctx.fill();
        ctx.strokeStyle = car.colorSecondary;
        ctx.stroke();
      } else if (model === 'glacier') {
        // --- GLACIER WOLF ---
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-cw / 2, -ch * 0.35);
        ctx.lineTo(-cw * 0.1, -ch * 0.45);
        ctx.lineTo(cw / 2 - 4, -ch * 0.25);
        ctx.lineTo(cw / 2 + 10, 0);
        ctx.lineTo(cw / 2 - 4, ch * 0.25);
        ctx.lineTo(-cw * 0.1, ch * 0.45);
        ctx.lineTo(-cw / 2, ch * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = car.colorSecondary;
        ctx.beginPath();
        ctx.moveTo(-cw * 0.2, -ch * 0.2);
        ctx.lineTo(cw * 0.2, 0);
        ctx.lineTo(-cw * 0.2, ch * 0.2);
        ctx.fill();

        // Icy core
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (model === 'reaper') {
        // --- GRIM REAPER ---
        ctx.fillStyle = '#090514';
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-cw / 2, -ch / 2 + 4);
        ctx.lineTo(cw / 2 - 10, -ch / 2);
        ctx.lineTo(cw / 2 + 12, 0);
        ctx.lineTo(cw / 2 - 10, ch / 2);
        ctx.lineTo(-cw / 2, ch / 2 - 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = car.colorSecondary;
        ctx.beginPath();
        ctx.moveTo(-cw * 0.1, -ch * 0.2);
        ctx.lineTo(cw * 0.25, 0);
        ctx.lineTo(-cw * 0.1, ch * 0.2);
        ctx.fill();
      } else if (model === 'void') {
        // --- INFINITY VOID ---
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#311042';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-cw / 2, -ch * 0.4, cw, ch * 0.8, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#030712';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = car.colorSecondary;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (model === 'centurion') {
        // --- CENTURION GT-X ---
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-cw / 2, -ch * 0.4);
        ctx.lineTo(cw / 2 - 6, -ch * 0.35);
        ctx.lineTo(cw / 2 + 12, 0);
        ctx.lineTo(cw / 2 - 6, ch * 0.35);
        ctx.lineTo(-cw / 2, ch * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw * 0.2, -ch * 0.15, cw * 0.5, ch * 0.3);
      } else if (model === 'spectre') {
        // --- SPECTRE ELECTRO (High-voltage pulse supercar) ---
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.5;
        
        // Main sharp wedge body
        ctx.beginPath();
        ctx.moveTo(-cw / 2, -ch * 0.32);
        ctx.lineTo(-cw * 0.1, -ch * 0.45);
        ctx.lineTo(cw * 0.25, -ch * 0.36);
        ctx.lineTo(cw / 2 + 6, 0); // nose cone
        ctx.lineTo(cw * 0.25, ch * 0.36);
        ctx.lineTo(-cw * 0.1, ch * 0.45);
        ctx.lineTo(-cw / 2, ch * 0.32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Accent wings / capacitors
        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw / 2, -ch * 0.16, cw * 0.25, ch * 0.08);
        ctx.fillRect(-cw / 2, ch * 0.08, cw * 0.25, ch * 0.08);

        // Cockpit
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(cw * 0.05, 0, cw * 0.2, ch * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // High voltage capacitor glow
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(-cw * 0.3, -ch * 0.12, 3, 0, Math.PI * 2);
        ctx.arc(-cw * 0.3, ch * 0.12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (model === 'classified') {
        // --- CLASSIFIED X (Fully Solid High-Performance Aerospace Jet Hybrid) ---
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-cw / 2 - 4, -ch * 0.36);
        ctx.lineTo(-cw * 0.2, -ch * 0.48);
        ctx.lineTo(cw * 0.2, -ch * 0.32);
        ctx.lineTo(cw / 2 + 15, 0); // sleek rocket nose
        ctx.lineTo(cw * 0.2, ch * 0.32);
        ctx.lineTo(-cw * 0.2, ch * 0.48);
        ctx.lineTo(-cw / 2 - 4, ch * 0.36);
        ctx.lineTo(-cw / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw futuristic chrome/neon stripes and aerospace engine structures inside car
        ctx.fillStyle = car.colorSecondary;
        ctx.beginPath();
        ctx.moveTo(-cw * 0.15, -ch * 0.2);
        ctx.lineTo(cw * 0.2, 0);
        ctx.lineTo(-cw * 0.15, ch * 0.2);
        ctx.closePath();
        ctx.fill();

        // Secondary panels / wings on sides
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(cw * 0.05, 0, cw * 0.2, ch * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glowing nodes and propulsion trails on wings
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#d946ef';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(-cw * 0.25, -ch * 0.25, 4, 0, Math.PI * 2);
        ctx.arc(-cw * 0.25, ch * 0.25, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      } else {
        // --- INTERSTELLAR (Classic Championship Speedster Default) ---
        ctx.fillStyle = car.colorPrimary;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8);
        ctx.fill();
        ctx.stroke();

        // Accent stripe
        ctx.fillStyle = car.colorSecondary;
        ctx.fillRect(-cw * 0.35, -ch * 0.15, cw * 0.55, ch * 0.3);

        // Cockpit Glass Visor (dark cyan / black oval)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cw * 0.1, 0, ch * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = car.colorSecondary;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Spotlight reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(cw * 0.12, -ch * 0.08, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Spoiler / Wing
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-cw / 2 - 4, -ch / 2 + 2, 4, ch - 4);
        ctx.fillStyle = car.colorPrimary;
        ctx.fillRect(-cw / 2 - 6, -ch / 2 - 1, 3, ch + 2);
      }

      // 6.5 Draw Custom Decals
      const decal = car.decal || 'none';
      if (decal && decal !== 'none') {
        ctx.save();
        if (decal === 'stripes') {
          // Dual Racing Stripes
          ctx.fillStyle = car.colorSecondary || '#ffffff';
          ctx.fillRect(-cw / 2, -ch * 0.18, cw, ch * 0.07);
          ctx.fillRect(-cw / 2, ch * 0.11, cw, ch * 0.07);
        } else if (decal === 'flames') {
          // Sweeping Hot Rod Fire Flames from the front side
          ctx.fillStyle = '#f97316'; // Vivid orange
          ctx.beginPath();
          ctx.moveTo(cw * 0.1, -ch * 0.18);
          ctx.lineTo(-cw * 0.35, -ch * 0.18);
          ctx.lineTo(-cw * 0.1, -ch * 0.06);
          ctx.lineTo(-cw * 0.45, 0);
          ctx.lineTo(-cw * 0.1, ch * 0.06);
          ctx.lineTo(-cw * 0.35, ch * 0.18);
          ctx.lineTo(cw * 0.1, ch * 0.18);
          ctx.lineTo(cw * 0.35, 0);
          ctx.closePath();
          ctx.fill();

          // Yellow core flame highlight
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(cw * 0.05, -ch * 0.09);
          ctx.lineTo(-cw * 0.25, -ch * 0.09);
          ctx.lineTo(-cw * 0.08, -ch * 0.03);
          ctx.lineTo(-cw * 0.35, 0);
          ctx.lineTo(-cw * 0.08, ch * 0.03);
          ctx.lineTo(-cw * 0.25, ch * 0.09);
          ctx.lineTo(cw * 0.05, ch * 0.09);
          ctx.lineTo(cw * 0.25, 0);
          ctx.closePath();
          ctx.fill();
        } else if (decal === 'lightning') {
          // Zigzag electric shock bolt
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(-cw * 0.35, -ch * 0.1);
          ctx.lineTo(-cw * 0.05, -ch * 0.2);
          ctx.lineTo(-cw * 0.15, 0);
          ctx.lineTo(cw * 0.15, -ch * 0.1);
          ctx.lineTo(0, ch * 0.1);
          ctx.lineTo(cw * 0.35, 0);
          ctx.stroke();
        } else if (decal === 'tech_grid') {
          // Cyber Circuit Overlay lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          // Horizontal bus lines
          ctx.moveTo(-cw / 2, -ch * 0.2);
          ctx.lineTo(cw / 2, -ch * 0.2);
          ctx.moveTo(-cw / 2, ch * 0.2);
          ctx.lineTo(cw / 2, ch * 0.2);
          // Diagonal connector paths
          ctx.moveTo(-cw * 0.3, -ch * 0.2);
          ctx.lineTo(-cw * 0.1, 0);
          ctx.lineTo(cw * 0.2, 0);
          ctx.lineTo(cw * 0.3, ch * 0.2);
          ctx.stroke();

          // Draw little electronic connection nodes (dots)
          ctx.fillStyle = car.colorSecondary || '#38bdf8';
          const drawNode = (x: number, y: number) => {
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          };
          drawNode(-cw * 0.1, 0);
          drawNode(cw * 0.2, 0);
          drawNode(cw * 0.3, ch * 0.2);
          drawNode(-cw * 0.3, -ch * 0.2);
        } else if (decal === 'stars') {
          // Cosmic Constellation Sparkles
          ctx.fillStyle = '#ffffff';
          const drawStar = (x: number, y: number, r: number) => {
            ctx.beginPath();
            ctx.moveTo(x, y - r);
            ctx.lineTo(x + r / 3, y - r / 3);
            ctx.lineTo(x + r, y);
            ctx.lineTo(x + r / 3, y + r / 3);
            ctx.lineTo(x, y + r);
            ctx.lineTo(x - r / 3, y + r / 3);
            ctx.lineTo(x - r, y);
            ctx.lineTo(x - r / 3, y - r / 3);
            ctx.closePath();
            ctx.fill();
          };
          drawStar(-cw * 0.25, -ch * 0.22, 5);
          drawStar(-cw * 0.1, ch * 0.22, 4);
          drawStar(cw * 0.2, -ch * 0.15, 6);
          drawStar(cw * 0.15, ch * 0.15, 4.5);
          drawStar(-cw * 0.3, 0, 3);
        } else if (decal === 'honeycomb') {
          // Hexagon Lattice Tech Decals
          ctx.strokeStyle = car.colorSecondary || '#38bdf8';
          ctx.lineWidth = 1.2;
          const drawHex = (x: number, y: number, r: number) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
            }
            ctx.closePath();
            ctx.stroke();
          };
          drawHex(-cw * 0.2, -ch * 0.12, 6);
          drawHex(-cw * 0.2, ch * 0.12, 6);
          drawHex(0, 0, 7);
          drawHex(cw * 0.2, -ch * 0.12, 6);
          drawHex(cw * 0.2, ch * 0.12, 6);
        } else if (decal === 'waves') {
          // Neon Hydro Waves
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-cw / 2, -ch * 0.1);
          ctx.bezierCurveTo(-cw * 0.2, -ch * 0.3, cw * 0.1, ch * 0.1, cw / 2, -ch * 0.1);
          ctx.moveTo(-cw / 2, 0);
          ctx.bezierCurveTo(-cw * 0.2, -ch * 0.2, cw * 0.1, ch * 0.2, cw / 2, 0);
          ctx.moveTo(-cw / 2, ch * 0.1);
          ctx.bezierCurveTo(-cw * 0.2, -ch * 0.1, cw * 0.1, ch * 0.3, cw / 2, ch * 0.1);
          ctx.stroke();
        } else if (decal === 'vortex') {
          // Cosmic Spiral Vortex
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, cw * 0.3, ch * 0.2, Math.PI / 6, 0, Math.PI * 2);
          ctx.ellipse(0, 0, cw * 0.2, ch * 0.12, -Math.PI / 12, 0, Math.PI * 2);
          ctx.ellipse(0, 0, cw * 0.1, ch * 0.05, Math.PI / 4, 0, Math.PI * 2);
          ctx.stroke();
        } else if (decal === 'gold_leaf') {
          // Deluxe Golden Laurel Leaves
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.6;
          ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.beginPath();
          // Draw left side leaves
          ctx.ellipse(-cw * 0.15, -ch * 0.2, cw * 0.12, ch * 0.05, -Math.PI / 8, 0, Math.PI * 2);
          ctx.ellipse(cw * 0.1, -ch * 0.16, cw * 0.1, ch * 0.04, -Math.PI / 12, 0, Math.PI * 2);
          // Draw right side leaves
          ctx.ellipse(-cw * 0.15, ch * 0.2, cw * 0.12, ch * 0.05, Math.PI / 8, 0, Math.PI * 2);
          ctx.ellipse(cw * 0.1, ch * 0.16, cw * 0.1, ch * 0.04, Math.PI / 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fill();
        } else if (decal === 'cyber_circuit') {
          // Glowing electric semiconductor circuit tracks
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1.4;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          // Left track
          ctx.moveTo(-cw * 0.35, -ch * 0.15);
          ctx.lineTo(-cw * 0.15, -ch * 0.15);
          ctx.lineTo(0, 0);
          ctx.lineTo(cw * 0.25, 0);
          // Right track
          ctx.moveTo(-cw * 0.35, ch * 0.15);
          ctx.lineTo(-cw * 0.15, ch * 0.15);
          ctx.lineTo(0, 0);
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
          // Nodes
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(-cw * 0.35, -ch * 0.15, 2.5, 0, Math.PI * 2);
          ctx.arc(-cw * 0.35, ch * 0.15, 2.5, 0, Math.PI * 2);
          ctx.arc(cw * 0.25, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (decal === 'carbon') {
          // Sleek Tech Carbon Fiber Hatch pattern
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let offset = -cw; offset < cw; offset += 5) {
            ctx.moveTo(offset, -ch / 2);
            ctx.lineTo(offset + ch, ch / 2);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 7. Dynamic Boost flame/tail indicator inside engine exhaust
      if (car.isBoosting || car.boostTimeLeft > 0) {
        ctx.save();
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        const flameGrad = ctx.createLinearGradient(-cw / 2, 0, -cw / 2 - 30, 0);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.3, '#f59e0b');
        flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-cw / 2 - 1, -ch * 0.2);
        ctx.lineTo(-cw / 2 - 25 - (Math.random() * 12), 0);
        ctx.lineTo(-cw / 2 - 1, ch * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    });


    // I. Draw Goalpost Circles on top of field line (glowing lights)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    const posts = [
      { x: 0, y: minGoalY }, { x: 0, y: maxGoalY },
      { x: w, y: minGoalY }, { x: w, y: maxGoalY }
    ];
    posts.forEach((post, i) => {
      ctx.fillStyle = i < 2 ? '#3b82f6' : '#ef4444';
      ctx.beginPath();
      ctx.arc(post.x, post.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#050505] font-sans select-none overflow-hidden text-white relative">
      
      {/* 1. MAIN MENU STAGE */}
      {phase === 'MENU' && !winner && (
        <MainMenu 
          onStartGame={startGame} 
          isMuted={isMuted} 
          onToggleMute={toggleMute} 
          savedReplays={savedReplays}
          onPlayReplay={handlePlayReplay}
          onDeleteReplay={handleDeleteReplay}
          coins={coins}
          onBuyCar={(modelId, price) => {
            setCoins((prev) => Math.max(0, prev - price));
            setUnlockedModels((prev) => [...prev, modelId]);
          }}
          unlockedModels={unlockedModels}
          blueConfig={blueConfig}
          redConfig={redConfig}
          onUpdateBlueConfig={handleUpdateBlueConfig}
          onUpdateRedConfig={handleUpdateRedConfig}
          unlockedPalettes={unlockedPalettes}
          onBuyPalette={(paletteName, price) => {
            setCoins((prev) => Math.max(0, prev - price));
            setUnlockedPalettes((prev) => [...prev, paletteName]);
          }}
          unlockedDecals={unlockedDecals}
          onBuyDecal={(decalId, price) => {
            setCoins((prev) => Math.max(0, prev - price));
            setUnlockedDecals((prev) => [...prev, decalId]);
          }}
          selectedStadium={selectedStadium}
          onSelectStadium={setSelectedStadium}
        />
      )}

      {/* 2. CORE GAME HUD OVERLAYS */}
      {(phase !== 'MENU' || winner) && phase !== 'REPLAY' && (
        <ScoreOverlay
          blueScore={blueScore}
          redScore={redScore}
          matchTimer={matchTimer}
          countdown={countdown}
          goalScored={goalScored}
          winner={winner}
          isPaused={isPaused}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onTogglePause={togglePause}
          onRestart={restartMatch}
          onExit={exitToMenu}
          onSaveReplay={handleSaveReplay}
          blueModel={blueConfig.model}
          redModel={redConfig.model}
        />
      )}

      {/* 3. REPLAY PLAYHEAD TIMELINE HUD Overlay */}
      {phase === 'REPLAY' && selectedReplay && (
        <ReplayHUD
          replay={selectedReplay}
          currentIndex={Math.floor(replayFrameIndex)}
          isPlaying={isReplayPlaying}
          playbackSpeed={replaySpeed}
          isLooping={isReplayLooping}
          onSetIndex={handleSetReplayIndex}
          onTogglePlay={() => setIsReplayPlaying(!isReplayPlaying)}
          onSetSpeed={setReplaySpeed}
          onToggleLoop={() => setIsReplayLooping(!isReplayLooping)}
          onExit={handleExitReplay}
        />
      )}

      {/* 3. HTML5 CANVAS STAGE CONTAINER */}
      <div 
        id="canvas-viewport"
        className="w-full h-full flex items-center justify-center p-3 sm:p-6"
        style={{ pointerEvents: 'none' }}
      >
        <div 
          className="relative rounded-2xl overflow-hidden shadow-3xl border border-slate-800 bg-slate-900 transition-transform duration-200"
          style={{
            width: `${CONFIG.arenaWidth}px`,
            height: `${CONFIG.arenaHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <canvas
            ref={canvasRef}
            width={CONFIG.arenaWidth}
            height={CONFIG.arenaHeight}
            className="block"
          />
        </div>
      </div>
    </div>
  );
}
