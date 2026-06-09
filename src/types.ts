export interface GameConfig {
  arenaWidth: number;
  arenaHeight: number;
  goalWidth: number;
  goalHeight: number;
  ballRadius: number;
  carWidth: number;
  carHeight: number;
  maxScore: number;
  gameSpeed?: number;
  ballBounciness?: number;
  carPhysicsFriction?: number;
  boostStrengthLevel?: number;
  matchDurationSeconds?: number;
}

export const CONFIG: GameConfig = {
  arenaWidth: 1200,
  arenaHeight: 700,
  goalWidth: 80,
  goalHeight: 220,
  ballRadius: 32,
  carWidth: 55,
  carHeight: 32,
  maxScore: 5,
  gameSpeed: 1.0,
  ballBounciness: 0.72,
  carPhysicsFriction: 0.985,
  boostStrengthLevel: 1.0,
  matchDurationSeconds: 300,
};

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface CarState {
  id: 'blue' | 'red';
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  boostTimeLeft: number;
  isBoosting: boolean;
  score: number;
  colorPrimary: string;
  colorSecondary: string;
  carModel?: string;
  decal?: 'none' | 'stripes' | 'flames' | 'lightning' | 'tech_grid' | 'stars' | 'carbon' | 'honeycomb' | 'waves' | 'vortex' | 'gold_leaf' | 'cyber_circuit';
  wheels?: string;
  stuckFrames?: number;
  escapeTimer?: number;
  escapeDir?: 'left' | 'right';
  role?: 'striker' | 'defender' | 'hybrid' | 'goalkeeper';
  aggression?: number;
  riskLevel?: number;
  boostPriority?: number;
  rotationStrictness?: number;
  playerName?: string;
  team?: 'blue' | 'red';
}

export interface BoostPad {
  id: number;
  x: number;
  y: number;
  radius: number;
  active: boolean;
  cooldownTimer: number; // in frames
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number; // from 1.0 down to 0.0
  decay: number;
}

export type GamePhase = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'GOAL_SCORD' | 'GAME_OVER' | 'REPLAY';

export interface ReplayFrame {
  ball: { x: number; y: number; vx: number; vy: number };
  blue: { x: number; y: number; vx: number; vy: number; angle: number; isBoosting: boolean; carModel?: string; colorPrimary?: string; colorSecondary?: string; decal?: string; wheels?: string };
  red: { x: number; y: number; vx: number; vy: number; angle: number; isBoosting: boolean; carModel?: string; colorPrimary?: string; colorSecondary?: string; decal?: string; wheels?: string };
  boostPadsActive: boolean[]; // active state of the 6 pads
  scores: { blue: number; red: number };
}

export interface ReplayEvent {
  frameIndex: number;
  type: 'goal' | 'heavy_hit' | 'boost_pickup';
  team?: 'blue' | 'red';
  x: number;
  y: number;
}

export interface SavedReplay {
  id: string;
  name: string;
  timestamp: string;
  durationSeconds: number;
  finalScore: { blue: number; red: number };
  frames: ReplayFrame[];
  events: ReplayEvent[];
}

export type GameMode = 'same_laptop' | 'vs_bot' | 'bot_vs_bot' | 'free_practice' | 'machine_practice' | 'career';


