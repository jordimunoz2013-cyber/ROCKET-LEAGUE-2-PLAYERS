import { CONFIG, CarState, BallState, BoostPad, Particle, GameMode } from './types';
import { sounds } from './audio';

export interface CarProfile {
  maxBaseSpeed: number;
  maxBoostSpeed: number;
  accel: number;
  rotSpeed: number;
  weight: number;
  driftGrip: number;
  boostEfficiency: number;
  ramForceBonus: number;
}

export const CAR_PROFILES: Record<string, CarProfile> = {
  beast: {
    maxBaseSpeed: 8.0,
    maxBoostSpeed: 12.0,
    accel: 0.20,
    rotSpeed: 0.045,
    weight: 1.85,
    driftGrip: 0.94,
    boostEfficiency: 1.15,
    ramForceBonus: 1.6,
  },
  spectre: {
    maxBaseSpeed: 9.5,
    maxBoostSpeed: 14.2,
    accel: 0.25,
    rotSpeed: 0.062,
    weight: 0.75,
    driftGrip: 0.86,
    boostEfficiency: 0.9,
    ramForceBonus: 0.8,
  },
  cyber: {
    maxBaseSpeed: 8.8,
    maxBoostSpeed: 13.0,
    accel: 0.22,
    rotSpeed: 0.054,
    weight: 1.25,
    driftGrip: 0.90,
    boostEfficiency: 1.35,
    ramForceBonus: 1.15,
  },
  phantom: {
    maxBaseSpeed: 9.0,
    maxBoostSpeed: 13.5,
    accel: 0.23,
    rotSpeed: 0.057,
    weight: 1.05,
    driftGrip: 0.92,
    boostEfficiency: 1.1,
    ramForceBonus: 1.0,
  },
  phoenix: {
    maxBaseSpeed: 9.2,
    maxBoostSpeed: 13.8,
    accel: 0.25,
    rotSpeed: 0.055,
    weight: 1.45,
    driftGrip: 0.89,
    boostEfficiency: 1.25,
    ramForceBonus: 1.25,
  },
  interstellar: {
    maxBaseSpeed: 8.8,
    maxBoostSpeed: 13.5,
    accel: 0.22,
    rotSpeed: 0.052,
    weight: 1.0,
    driftGrip: 0.91,
    boostEfficiency: 1.0,
    ramForceBonus: 1.0,
  },
  void: {
    maxBaseSpeed: 9.8,
    maxBoostSpeed: 14.8,
    accel: 0.28,
    rotSpeed: 0.065,
    weight: 1.15,
    driftGrip: 0.95,
    boostEfficiency: 1.4,
    ramForceBonus: 1.3,
  },
  centurion: {
    maxBaseSpeed: 8.5,
    maxBoostSpeed: 12.8,
    accel: 0.21,
    rotSpeed: 0.050,
    weight: 1.5,
    driftGrip: 0.93,
    boostEfficiency: 1.1,
    ramForceBonus: 1.35,
  },
  spectre_electro: {
    maxBaseSpeed: 9.6,
    maxBoostSpeed: 14.5,
    accel: 0.26,
    rotSpeed: 0.064,
    weight: 0.85,
    driftGrip: 0.88,
    boostEfficiency: 1.25,
    ramForceBonus: 0.9,
  },
  classified: {
    maxBaseSpeed: 10.2,
    maxBoostSpeed: 15.5,
    accel: 0.30,
    rotSpeed: 0.068,
    weight: 1.35,
    driftGrip: 0.94,
    boostEfficiency: 1.5,
    ramForceBonus: 1.4,
  },
  apex: {
    maxBaseSpeed: 9.0,
    maxBoostSpeed: 13.5,
    accel: 0.23,
    rotSpeed: 0.056,
    weight: 1.3,
    driftGrip: 0.91,
    boostEfficiency: 1.05,
    ramForceBonus: 1.2,
  },
  glacier: {
    maxBaseSpeed: 9.2,
    maxBoostSpeed: 13.8,
    accel: 0.24,
    rotSpeed: 0.058,
    weight: 1.1,
    driftGrip: 0.96,
    boostEfficiency: 1.15,
    ramForceBonus: 1.05,
  },
  reaper: {
    maxBaseSpeed: 9.4,
    maxBoostSpeed: 14.0,
    accel: 0.26,
    rotSpeed: 0.062,
    weight: 1.2,
    driftGrip: 0.85,
    boostEfficiency: 1.3,
    ramForceBonus: 1.1,
  },
  nemesis: {
    maxBaseSpeed: 9.5,
    maxBoostSpeed: 14.2,
    accel: 0.27,
    rotSpeed: 0.064,
    weight: 1.15,
    driftGrip: 0.92,
    boostEfficiency: 1.35,
    ramForceBonus: 1.15,
  }
};

export const WHEEL_MULTIPLIERS: Record<string, { speed: number; accel: number }> = {
  classic: { speed: 1.0, accel: 1.0 },
  cyber: { speed: 1.05, accel: 1.05 },
  magma: { speed: 1.10, accel: 1.10 },
  frost: { speed: 1.15, accel: 1.15 },
  gold_star: { speed: 1.22, accel: 1.22 },
  classified_drive: { speed: 1.30, accel: 1.30 },
};

export class GameEngine {
  public ball: BallState;
  public cars: { blue: CarState; red: CarState };
  public extraBlueCars: CarState[] = [];
  public extraRedCars: CarState[] = [];
  public matchFormat: '1v1' | '2v2' | '3v3' = '1v1';
  public difficulty: 'easy' | 'normal' | 'hard' | 'pro' = 'normal';
  public particles: Particle[] = [];
  public boostPads: BoostPad[] = [];
  
  public screenShake: number = 0;
  public goalScoredThisFrame: 'blue' | 'red' | null = null;
  public scoreTriggered: boolean = false;
  public currentMode: GameMode = 'same_laptop';
  
  public machineTimer: number = 0;
  public machineAimAngle: number = 0;
  public machinePivotX: number = CONFIG.arenaWidth * 0.75;
  public machinePivotY: number = CONFIG.arenaHeight / 2;

  private width = CONFIG.arenaWidth;
  private height = CONFIG.arenaHeight;

  constructor() {
    this.ball = this.getResetBall();
    this.cars = {
      blue: this.getResetCar('blue'),
      red: this.getResetCar('red'),
    };
    this.initBoostPads();
  }

  public getAllCars(): CarState[] {
    return [this.cars.blue, ...this.extraBlueCars, this.cars.red, ...this.extraRedCars];
  }

  public resetMatch() {
    this.cars.blue.score = 0;
    this.cars.red.score = 0;
    this.extraBlueCars.forEach(c => c.score = 0);
    this.extraRedCars.forEach(c => c.score = 0);
    this.resetPositions();
  }

  public resetPositions(goalScoredReset: boolean = false) {
    this.matchFormat = '1v1';
    this.ball = this.getResetBall();
    this.cars.blue = { ...this.cars.blue, ...this.getResetCar('blue', 0) };
    this.cars.red = { ...this.cars.red, ...this.getResetCar('red', 0) };

    // Limit maximum players in all modes to 2 (1v1 duel format)
    this.extraBlueCars = [];
    this.extraRedCars = [];

    if (this.currentMode === 'free_practice' || this.currentMode === 'machine_practice') {
      this.cars.red.x = 9999;
      this.cars.red.y = 9999;
      this.cars.red.vx = 0;
      this.cars.red.vy = 0;
      this.extraBlueCars = [];
      this.extraRedCars = [];
    }
    if (this.currentMode === 'machine_practice' && !goalScoredReset) {
      this.machineTimer = 0;
      // Pre-position ball nicely at the barrel of the automatic launcher
      this.ball.x = this.machinePivotX + Math.cos(this.machineAimAngle) * 55;
      this.ball.y = this.machinePivotY + Math.sin(this.machineAimAngle) * 55;
      this.ball.vx = 0;
      this.ball.vy = 0;
    }
    this.particles = [];
    this.goalScoredThisFrame = null;
    this.scoreTriggered = false;
  }

  private getResetBall(): BallState {
    return {
      x: this.width / 2,
      y: this.height / 2,
      vx: 0,
      vy: 0,
      radius: CONFIG.ballRadius,
    };
  }

  private getResetCar(
    id: 'blue' | 'red',
    indexOffset: number = 0,
    customName?: string,
    role?: 'striker' | 'defender' | 'hybrid' | 'goalkeeper'
  ): CarState {
    const isBlue = id === 'blue';
    let initialX = isBlue ? this.width * 0.22 : this.width * 0.78;
    let initialY = this.height / 2;

    if (indexOffset === 1) {
      initialX = isBlue ? this.width * 0.15 : this.width * 0.85;
      initialY = this.height / 2 - 130;
    } else if (indexOffset === 2) {
      initialX = isBlue ? this.width * 0.15 : this.width * 0.85;
      initialY = this.height / 2 + 130;
    }

    return {
      id,
      team: id,
      x: initialX,
      y: initialY,
      vx: 0,
      vy: 0,
      angle: isBlue ? 0 : Math.PI, // Face centre
      boostTimeLeft: 0,
      isBoosting: false,
      score: (this.cars && this.cars[id]) ? this.cars[id].score : 0,
      colorPrimary: (this.cars && this.cars[id]) ? this.cars[id].colorPrimary : (isBlue ? '#3b82f6' : '#ef4444'),
      colorSecondary: (this.cars && this.cars[id]) ? this.cars[id].colorSecondary : (isBlue ? '#60a5fa' : '#f87171'),
      carModel: (this.cars && this.cars[id]) ? this.cars[id].carModel : 'interstellar',
      decal: (this.cars && this.cars[id]) ? this.cars[id].decal : 'none',
      wheels: (this.cars && this.cars[id]) ? this.cars[id].wheels : 'classic',
      role: role || 'hybrid',
      playerName: customName || (isBlue ? 'Player Blue' : 'Rival Bot'),
    };
  }

  private initBoostPads() {
    const margins = 200;
    this.boostPads = [
      { id: 1, x: margins, y: margins, radius: 24, active: true, cooldownTimer: 0 },
      { id: 2, x: this.width - margins, y: margins, radius: 24, active: true, cooldownTimer: 0 },
      { id: 3, x: margins, y: this.height - margins, radius: 24, active: true, cooldownTimer: 0 },
      { id: 4, x: this.width - margins, y: this.height - margins, radius: 24, active: true, cooldownTimer: 0 },
      { id: 5, x: this.width / 2, y: 150, radius: 24, active: true, cooldownTimer: 0 },
      { id: 6, x: this.width / 2, y: this.height - 150, radius: 24, active: true, cooldownTimer: 0 },
    ];
  }

  // Generate three overlapping circles that represent the car for collisions.
  public getCarCollisionSpheres(car: CarState) {
    const halfLen = CONFIG.carWidth / 2;
    const radius = 17; // Approximate collision sphere radius
    const cX = car.x;
    const cY = car.y;
    const dirX = Math.cos(car.angle);
    const dirY = Math.sin(car.angle);

    // Front, Middle, Rear spheres
    return [
      { x: cX + dirX * (halfLen - 7), y: cY + dirY * (halfLen - 7), r: radius },
      { x: cX, y: cY, r: radius },
      { x: cX - dirX * (halfLen - 7), y: cY - dirY * (halfLen - 7), r: radius },
    ];
  }

  private getBotInputs(car: CarState, opponent: CarState): Record<string, boolean> {
    const keys: Record<string, boolean> = {};
    const ball = this.ball;

    const isBlueSide = car.id === 'blue' || car.team === 'blue';
    const isRedSide = car.id === 'red' || car.team === 'red';

    let tx = ball.x;
    let ty = ball.y;

    // --- Predictive Target Forecasting based on AI Difficulty coefficient ---
    if (this.difficulty === 'pro') {
      // Forecast velocity projections
      tx = ball.x + ball.vx * 15;
      ty = ball.y + ball.vy * 15;
    } else if (this.difficulty === 'hard') {
      tx = ball.x + ball.vx * 8;
      ty = ball.y + ball.vy * 8;
    }

    const distToBall = Math.sqrt(Math.pow(ball.x - car.x, 2) + Math.pow(ball.y - car.y, 2));

    // --- Dynamic Positioning Adaptation based on Signed Roster Role ---
    if (car.role === 'goalkeeper') {
      const goalX = isBlueSide ? 65 : this.width - 65;
      const isBallDangerous = isBlueSide ? ball.x < this.width * 0.35 : ball.x > this.width * 0.65;
      
      if (!isBallDangerous) {
        // Return to protector guard position near mid-goal line
        tx = goalX + (isBlueSide ? 40 : -40);
        ty = Math.max(180, Math.min(520, ball.y));
      }
    } else if (car.role === 'defender') {
      const midPoint = this.width / 2;
      const ballInOppComponent = isBlueSide ? ball.x > midPoint : ball.x < midPoint;
      
      if (ballInOppComponent && distToBall > 350) {
        // Guard defensive central half
        tx = isBlueSide ? this.width * 0.35 : this.width * 0.65;
        ty = ball.y;
      }
    }

    // 1. Kickoff Phase (ball is static in the exact center)
    const isKickoff = ball.x === this.width / 2 && ball.y === this.height / 2 && Math.abs(ball.vx) < 0.1 && Math.abs(ball.vy) < 0.1;

    if (isKickoff) {
      if (isBlueSide) {
        tx = ball.x - 25;
        ty = ball.y - 40;
      } else {
        tx = ball.x + 25;
        ty = ball.y + 40;
      }
    } else {
      // 2. Standard Active Gameplay
      if (isBlueSide) {
        // BLUE attacks RIGHT (towards x=1200)
        const ballBehindCar = ball.x < car.x + 45;
        const isDefending = ball.x < this.width * 0.42;

        if (ballBehindCar && car.role !== 'goalkeeper') {
          // Circle around cleanly to avoid pushing it backwards
          tx = ball.x - 100;
          ty = car.y > ball.y ? ball.y - 130 : ball.y + 130;
        } else if (isDefending && ball.x < 180 && car.role !== 'striker') {
          // Severe local goal line defense
          tx = 50;
          ty = Math.max(160, Math.min(540, ball.y));
        } else {
          // Attack path: target slightly behind the ball angled toward opponent's goal center
          if (car.role !== 'goalkeeper' && car.role !== 'defender') {
            tx = ball.x - 22;
            ty = ball.y + (350 - ball.y) * 0.22;
          }
        }

        // Active boost pad collection
        const boostThreshold = car.boostPriority ? (350 - car.boostPriority * 150) : 320;
        if (distToBall > boostThreshold && car.boostTimeLeft <= 0 && car.role !== 'goalkeeper') {
          const activePads = this.boostPads.filter(p => p.active);
          let closestPad = null;
          let minPadDist = 220;
          for (const pad of activePads) {
            const d = Math.sqrt(Math.pow(pad.x - car.x, 2) + Math.pow(pad.y - car.y, 2));
            if (d < minPadDist) {
              minPadDist = d;
              closestPad = pad;
            }
          }
          if (closestPad) {
            tx = closestPad.x;
            ty = closestPad.y;
          }
        }
      } else {
        // RED attacks LEFT (towards x=0)
        const ballBehindCar = ball.x > car.x - 45;
        const isDefending = ball.x > this.width * 0.58;

        if (ballBehindCar && car.role !== 'goalkeeper') {
          // Ball is behind red car, circle around cleanly
          tx = ball.x + 100;
          ty = car.y > ball.y ? ball.y - 130 : ball.y + 130;
        } else if (isDefending && ball.x > this.width - 180 && car.role !== 'striker') {
          // Severe local goal line defense
          tx = this.width - 50;
          ty = Math.max(160, Math.min(540, ball.y));
        } else {
          if (car.role !== 'goalkeeper' && car.role !== 'defender') {
            tx = ball.x + 22;
            ty = ball.y + (350 - ball.y) * 0.22;
          }
        }

        // Active boost pad collection
        const boostThreshold = car.boostPriority ? (350 - car.boostPriority * 150) : 320;
        if (distToBall > boostThreshold && car.boostTimeLeft <= 0 && car.role !== 'goalkeeper') {
          const activePads = this.boostPads.filter(p => p.active);
          let closestPad = null;
          let minPadDist = 220;
          for (const pad of activePads) {
            const d = Math.sqrt(Math.pow(pad.x - car.x, 2) + Math.pow(pad.y - car.y, 2));
            if (d < minPadDist) {
              minPadDist = d;
              closestPad = pad;
            }
          }
          if (closestPad) {
            tx = closestPad.x;
            ty = closestPad.y;
          }
        }
      }
    }

    // --- Noise injection for Easy AI coefficient difficulty ---
    if (this.difficulty === 'easy') {
      tx += Math.sin(Date.now() * 0.003) * 65;
      ty += Math.cos(Date.now() * 0.003) * 65;
    }

    // Keep targets strictly inside arena boundary limits
    tx = Math.max(50, Math.min(this.width - 50, tx));
    ty = Math.max(50, Math.min(this.height - 50, ty));

    // Calculate steering angle
    const dx = tx - car.x;
    const dy = ty - car.y;
    const targetAngle = Math.atan2(dy, dx);

    let angleDiff = targetAngle - car.angle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    const absDiff = Math.abs(angleDiff);

    // Apply simulated key presses
    if (angleDiff > 0.06) {
      keys['right'] = true; // Turn right
    } else if (angleDiff < -0.06) {
      keys['left'] = true; // Turn left
    }

    // Drive forward if facing target path
    const steerLimit = this.difficulty === 'easy' ? Math.PI * 0.3 : Math.PI * 0.45;
    if (absDiff < steerLimit) {
      keys['up'] = true;
    } else if (absDiff > Math.PI * 0.8 && distToBall < 100) {
      keys['down'] = true;
    }

    // 3. Wall Stuck Mitigation Logic:
    const touchWallX = car.x < 65 || car.x > this.width - 65;
    const touchWallY = car.y < 55 || car.y > this.height - 55;
    const currentSpd = Math.sqrt(car.vx * car.vx + car.vy * car.vy);
    const isStationary = currentSpd < 0.35;

    if (touchWallX || touchWallY || (car.stuckFrames && car.stuckFrames > 15)) {
      if (isStationary && (!car.escapeTimer || car.escapeTimer <= 0)) {
        car.escapeTimer = 45;
        car.escapeDir = Math.random() < 0.5 ? 'left' : 'right';
      }
    }

    // Run active escape sequence if timer is ticking
    if (car.escapeTimer && car.escapeTimer > 0) {
      car.escapeTimer--;
      keys['up'] = false;
      keys['down'] = true;
      if (car.escapeDir === 'left') {
        keys['left'] = true;
        keys['right'] = false;
      } else {
        keys['right'] = true;
        keys['left'] = false;
      }
    } else {
      car.escapeTimer = 0;
      car.escapeDir = undefined;
    }

    return keys;
  }

  public update(keys: Record<string, boolean>, gameMode: GameMode = 'same_laptop') {
    this.currentMode = gameMode;
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.9;
      if (this.screenShake < 0.1) this.screenShake = 0;
    }

    // Update boost pads
    this.boostPads.forEach(pad => {
      if (!pad.active) {
        pad.cooldownTimer -= 1;
        if (pad.cooldownTimer <= 0) {
          pad.active = true;
          pad.cooldownTimer = 0;
        }
      }
    });

    // Update cars with respect to gameMode controls
    if (gameMode === 'same_laptop') {
      // P1 (Blue) = WASD, P2 (Red) = Arrows
      this.updateCar(this.cars.blue, keys, 'w', 's', 'a', 'd');
      this.updateCar(this.cars.red, keys, 'arrowup', 'arrowdown', 'arrowleft', 'arrowright');
    } else if (gameMode === 'vs_bot' || gameMode === 'career') {
      // Player (Blue) = WASD, Bot (Red) = AI Bot
      const redBotKeys = this.getBotInputs(this.cars.red, this.cars.blue);
      this.updateCar(this.cars.blue, keys, 'w', 's', 'a', 'd');
      this.updateCar(this.cars.red, redBotKeys, 'up', 'down', 'left', 'right');
    } else if (gameMode === 'bot_vs_bot') {
      // Both are Bots! (Spectator Mode)
      const blueBotKeys = this.getBotInputs(this.cars.blue, this.cars.red);
      const redBotKeys = this.getBotInputs(this.cars.red, this.cars.blue);
      this.updateCar(this.cars.blue, blueBotKeys, 'up', 'down', 'left', 'right');
      this.updateCar(this.cars.red, redBotKeys, 'up', 'down', 'left', 'right');
    }

    // UPDATE EXTRA TEAMMATES/OPPONENTS
    if (this.matchFormat === '2v2' || this.matchFormat === '3v3') {
      this.extraBlueCars.forEach(car => {
        const keysBot = this.getBotInputs(car, this.cars.red);
        this.updateCar(car, keysBot, 'up', 'down', 'left', 'right');
      });
      this.extraRedCars.forEach(car => {
        const keysBot = this.getBotInputs(car, this.cars.blue);
        this.updateCar(car, keysBot, 'up', 'down', 'left', 'right');
      });
    } else if (gameMode === 'free_practice' || gameMode === 'machine_practice') {
      // Free Practice & Machine Practice: Blue Car is controlled via WASD
      this.updateCar(this.cars.blue, keys, 'w', 's', 'a', 'd');
      
      // Park red car outside limits to disable interaction
      this.cars.red.x = 9999;
      this.cars.red.y = 9999;
      this.cars.red.vx = 0;
      this.cars.red.vy = 0;

      // Handle Machine Practice shot timer and physical launcher trigger
      if (gameMode === 'machine_practice') {
        this.machineTimer += 1;
        
        // Machine aims toward player's blue car
        const dx = this.cars.blue.x - this.machinePivotX;
        const dy = this.cars.blue.y - this.machinePivotY;
        const targetAngle = Math.atan2(dy, dx);
        
        // Smoothly adjust machine rotation
        let angleDiff = targetAngle - this.machineAimAngle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        this.machineAimAngle += angleDiff * 0.04;

        // Firing sequence:
        // Slow pass is launched at machineTimer === 45 (~0.75 seconds) and subsequent shots every 280 frames
        const isLaunchTime = this.machineTimer === 45 || (this.machineTimer > 120 && this.machineTimer % 280 === 0);
        
        if (isLaunchTime) {
          // Relocate ball and fire it slowly towards the user's car
          this.ball.x = this.machinePivotX + Math.cos(this.machineAimAngle) * 55;
          this.ball.y = this.machinePivotY + Math.sin(this.machineAimAngle) * 55;
          
          // Slow Setup Pass Speed: 4.5 makes it perfect and easy to score!
          const speed = 4.5;
          this.ball.vx = Math.cos(this.machineAimAngle) * speed;
          this.ball.vy = Math.sin(this.machineAimAngle) * speed;
          
          this.screenShake = 45; // custom feedback
          this.screenShake = 4;
          sounds.playBoost();
          
          // Spawn glowing shockwave particles at machine mouth
          for (let i = 0; i < 15; i++) {
            const pAngle = this.machineAimAngle + (Math.random() - 0.5) * 0.5;
            const pSpeed = 2 + Math.random() * 4;
            this.particles.push({
              x: this.ball.x,
              y: this.ball.y,
              vx: Math.cos(pAngle) * pSpeed,
              vy: Math.sin(pAngle) * pSpeed,
              color: '#f59e0b', // Glowing amber fire particles
              radius: 2 + Math.random() * 3,
              life: 1.0,
              decay: 0.03 + Math.random() * 0.03
            });
          }
        } else if (this.machineTimer < 45) {
          // Pin the ball to the mouth of the launcher, waiting to be released!
          this.ball.x = this.machinePivotX + Math.cos(this.machineAimAngle) * 55;
          this.ball.y = this.machinePivotY + Math.sin(this.machineAimAngle) * 55;
          this.ball.vx = 0;
          this.ball.vy = 0;
        }
      }
    }

    // Handle car-car collision
    this.resolveCarCarCollision();

    // Update ball
    this.updateBall();

    // Check goals
    this.checkGoalLogic();

    // Update particles
    this.particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.life -= p.decay;
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  public resolveCornersCollision(obj: { x: number; y: number; vx: number; vy: number; radius?: number }) {
    const cornerSize = 110;
    const r = obj.radius || 22; // default radius
    const bRes = 0.65;
    let collided = false;

    // 1. Top-Left Corner
    let nx = 0.7071;
    let ny = 0.7071;
    let D = cornerSize * 0.7071;
    let p = obj.x * nx + obj.y * ny;
    let penetration = (D + r) - p;
    if (penetration > 0 && obj.x < cornerSize + 30 && obj.y < cornerSize + 30) {
      obj.x += nx * penetration;
      obj.y += ny * penetration;
      const dot = obj.vx * nx + obj.vy * ny;
      if (dot < 0) {
        obj.vx = (obj.vx - 2 * dot * nx) * bRes;
        obj.vy = (obj.vy - 2 * dot * ny) * bRes;
      }
      collided = true;
    }

    // 2. Top-Right Corner
    nx = -0.7071;
    ny = 0.7071;
    D = -this.width * 0.7071 + cornerSize * 0.7071;
    p = obj.x * nx + obj.y * ny;
    penetration = (D + r) - p;
    if (penetration > 0 && obj.x > this.width - cornerSize - 30 && obj.y < cornerSize + 30) {
      obj.x += nx * penetration;
      obj.y += ny * penetration;
      const dot = obj.vx * nx + obj.vy * ny;
      if (dot < 0) {
        obj.vx = (obj.vx - 2 * dot * nx) * bRes;
        obj.vy = (obj.vy - 2 * dot * ny) * bRes;
      }
      collided = true;
    }

    // 3. Bottom-Left Corner
    nx = 0.7071;
    ny = -0.7071;
    D = -this.height * 0.7071 + cornerSize * 0.7071;
    p = obj.x * nx + obj.y * ny;
    penetration = (D + r) - p;
    if (penetration > 0 && obj.x < cornerSize + 30 && obj.y > this.height - cornerSize - 30) {
      obj.x += nx * penetration;
      obj.y += ny * penetration;
      const dot = obj.vx * nx + obj.vy * ny;
      if (dot < 0) {
        obj.vx = (obj.vx - 2 * dot * nx) * bRes;
        obj.vy = (obj.vy - 2 * dot * ny) * bRes;
      }
      collided = true;
    }

    // 4. Bottom-Right Corner
    nx = -0.7071;
    ny = -0.7071;
    D = -this.width * 0.7071 - this.height * 0.7071 + cornerSize * 0.7071;
    p = obj.x * nx + obj.y * ny;
    penetration = (D + r) - p;
    if (penetration > 0 && obj.x > this.width - cornerSize - 30 && obj.y > this.height - cornerSize - 30) {
      obj.x += nx * penetration;
      obj.y += ny * penetration;
      const dot = obj.vx * nx + obj.vy * ny;
      if (dot < 0) {
        obj.vx = (obj.vx - 2 * dot * nx) * bRes;
        obj.vy = (obj.vy - 2 * dot * ny) * bRes;
      }
      collided = true;
    }

    return collided;
  }

  private updateCar(
    car: CarState,
    keys: Record<string, boolean>,
    kUp: string,
    kDown: string,
    kLeft: string,
    kRight: string
  ) {
    const isUp = keys[kUp] || false;
    const isDown = keys[kDown] || false;
    const isLeft = keys[kLeft] || false;
    const isRight = keys[kRight] || false;

    const profile = CAR_PROFILES[car.carModel || 'interstellar'] || CAR_PROFILES.interstellar;

    // Handle turning
    const rotSpeed = profile.rotSpeed; // Rads per frame
    if (isLeft) car.angle -= rotSpeed;
    if (isRight) car.angle += rotSpeed;
    
    // Normalise angle
    car.angle = (car.angle + Math.PI * 2) % (Math.PI * 2);

    // Boost timer
    if (car.boostTimeLeft > 0) {
      car.boostTimeLeft -= 1 / 60; // 60fps countdown
      car.isBoosting = true;
      if (car.boostTimeLeft <= 0) {
        car.isBoosting = false;
        car.boostTimeLeft = 0;
      }
    }

    // Physics parameters from profile
    const wheelId = car.wheels || 'classic';
    const wheelMult = WHEEL_MULTIPLIERS[wheelId] || WHEEL_MULTIPLIERS.classic;

    const baseAccel = profile.accel * wheelMult.accel;
    const boostAccel = profile.accel * 2.375 * wheelMult.accel;
    const accel = car.isBoosting ? boostAccel : baseAccel;

    const maxBaseSpeed = profile.maxBaseSpeed * wheelMult.speed;
    const maxBoostSpeed = profile.maxBoostSpeed * wheelMult.speed;
    const maxSpeed = car.isBoosting ? maxBoostSpeed : maxBaseSpeed;

    const friction = 0.985;

    // Forward/Backward acceleration
    if (isUp) {
      car.vx += Math.cos(car.angle) * accel;
      car.vy += Math.sin(car.angle) * accel;
    } else if (isDown) {
      // Reverse is slower
      car.vx -= Math.cos(car.angle) * accel * 0.52;
      car.vy -= Math.sin(car.angle) * accel * 0.52;
    }

    // Drift physics: Extract forward and lateral speed, and apply friction heavily to side motion!
    const forwardX = Math.cos(car.angle);
    const forwardY = Math.sin(car.angle);
    
    // Dot product to get projection
    const fSpeed = car.vx * forwardX + car.vy * forwardY;
    
    // Lateral vector (perpendicular to forward vector)
    const lateralX = -forwardY;
    const lateralY = forwardX;
    const lSpeed = car.vx * lateralX + car.vy * lateralY;

    // Damp lateral sliding heavily to give perfect crisp car drift controls!
    const driftGrip = profile.driftGrip; // Lower equals tighter turn grip
    const newLSpeed = lSpeed * driftGrip;

    // Reconstruct velocity from forward and lateral components
    car.vx = forwardX * fSpeed + lateralX * newLSpeed;
    car.vy = forwardY * fSpeed + lateralY * newLSpeed;

    // Friction
    car.vx *= friction;
    car.vy *= friction;

    // Speed Cap
    const currentSpeed = Math.sqrt(car.vx * car.vx + car.vy * car.vy);
    if (currentSpeed > maxSpeed) {
      car.vx = (car.vx / currentSpeed) * maxSpeed;
      car.vy = (car.vy / currentSpeed) * maxSpeed;
    }

    // Stuck Watchdog Failsafe
    const isMovingInput = isUp || isDown;
    const isStuck = isMovingInput && currentSpeed < 0.22;
    if (isStuck) {
      car.stuckFrames = (car.stuckFrames || 0) + 1;
    } else {
      car.stuckFrames = 0;
    }

    if (car.stuckFrames > 45) {
      // Gently nudge toward the center of the arena
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const pushX = centerX - car.x;
      const pushY = centerY - car.y;
      const pushLen = Math.sqrt(pushX * pushX + pushY * pushY);
      if (pushLen > 0) {
        car.vx = (pushX / pushLen) * 3;
        car.vy = (pushY / pushLen) * 3;
        // Jiggle angle back
        car.angle = Math.atan2(pushY, pushX);
      }
      car.stuckFrames = 0;
    }

    // Move
    car.x += car.vx;
    car.y += car.vy;

    // Boost Pad Collisions
    this.boostPads.forEach(pad => {
      if (pad.active) {
         const dx = car.x - pad.x;
         const dy = car.y - pad.y;
         const dist = Math.sqrt(dx * dx + dy * dy);
         if (dist < pad.radius + 15) {
           pad.active = false;
           pad.cooldownTimer = 300; // 5 seconds at 60fps
           car.boostTimeLeft = 2.0 * profile.boostEfficiency; // boost duration from profile!
           car.isBoosting = true;
           sounds.playBoost();
           
           // Boost particles
           this.spawnBoostParticles(pad.x, pad.y, car.colorPrimary);
         }
      }
    });

    // Solve custom diagonal corner rebounding inside game engine for the car!
    this.resolveCornersCollision({ x: car.x, y: car.y, vx: car.vx, vy: car.vy, radius: 22 });

    // Wall Collision inside Pitch & Goals
    const cWidth = CONFIG.carWidth / 2;
    const cHeight = CONFIG.carHeight / 2;

    const minGoalY = (this.height - CONFIG.goalHeight) / 2;
    const maxGoalY = (this.height + CONFIG.goalHeight) / 2;

    const inYGoalRange = car.y >= minGoalY && car.y <= maxGoalY;

    // Handle Left/Right boundaries of pitch vs inside goals
    if (inYGoalRange) {
      // Inside Goal region: Left goal goes to -CONFIG.goalWidth, Right goes to width + CONFIG.goalWidth
      if (car.x < -CONFIG.goalWidth + cWidth) {
        car.x = -CONFIG.goalWidth + cWidth;
        car.vx *= -0.4;
      }
      if (car.x > this.width + CONFIG.goalWidth - cWidth) {
        car.x = this.width + CONFIG.goalWidth - cWidth;
        car.vx *= -0.4;
      }

      // Inside goals top/bottom walls
      if (car.x < 0 || car.x > this.width) {
        if (car.y < minGoalY + cHeight) {
          car.y = minGoalY + cHeight;
          car.vy *= -0.4;
        }
        if (car.y > maxGoalY - cHeight) {
          car.y = maxGoalY - cHeight;
          car.vy *= -0.4;
        }
      }
    } else {
      // Normal Field boundary
      if (car.x < cWidth) {
        car.x = cWidth;
        car.vx *= -0.4;
      }
      if (car.x > this.width - cWidth) {
        car.x = this.width - cWidth;
        car.vx *= -0.4;
      }
    }

    // Top/Bottom pitch boundaries
    if (car.y < cHeight) {
      car.y = cHeight;
      car.vy *= -0.4;
    }
    if (car.y > this.height - cHeight) {
      car.y = this.height - cHeight;
      car.vy *= -0.4;
    }

    // Tail boost flow particles
    if (car.isBoosting && Math.random() < 0.4) {
      const bAngle = car.angle + Math.PI + (Math.random() - 0.5) * 0.5;
      const bDist = cWidth - 5;
      this.particles.push({
        x: car.x - Math.cos(car.angle) * bDist,
        y: car.y - Math.sin(car.angle) * bDist,
        vx: Math.cos(bAngle) * 3 + car.vx * 0.4,
        vy: Math.sin(bAngle) * 3 + car.vy * 0.4,
        color: car.colorPrimary,
        radius: Math.random() * 4 + 3,
        life: 1.0,
        decay: 0.04,
      });
    }
  }

  private updateBall() {
    const ball = this.ball;
    const frict = 0.99; // Pitch friction on ball
    ball.vx *= frict;
    ball.vy *= frict;

    // Speed limit on ball so it doesn't break boundaries
    const bSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const maxBSpeed = 18;
    if (bSpeed > maxBSpeed) {
      ball.vx = (ball.vx / bSpeed) * maxBSpeed;
      ball.vy = (ball.vy / bSpeed) * maxBSpeed;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    const minGoalY = (this.height - CONFIG.goalHeight) / 2;
    const maxGoalY = (this.height + CONFIG.goalHeight) / 2;
    const inYGoalRange = ball.y >= minGoalY && ball.y <= maxGoalY;

    const bRes = 0.72; // Bounce restitution

    // Goal Post Bounces: Top and Bottom Posts for both Left and Right Goals
    const posts = [
      { x: 0, y: minGoalY }, // Left upper post
      { x: 0, y: maxGoalY }, // Left lower post
      { x: this.width, y: minGoalY }, // Right upper post
      { x: this.width, y: maxGoalY }  // Right lower post
    ];

    posts.forEach(post => {
      const dx = ball.x - post.x;
      const dy = ball.y - post.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ball.radius) {
        // Resolve circle collision
        const overlap = ball.radius - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        ball.x += nx * overlap;
        
        // Reflect velocity vector
        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx = (ball.vx - 2 * dot * nx) * bRes;
        ball.vy = (ball.vy - 2 * dot * ny) * bRes;
        sounds.playHit(true);
        this.screenShake = 6;
        this.spawnCollisionParticles(post.x, post.y, '#f59e0b');
      }
    });

    if (inYGoalRange) {
      // Inside Goal posts: check outer walls of the goal nets
      if (ball.x < -CONFIG.goalWidth + ball.radius) {
        ball.x = -CONFIG.goalWidth + ball.radius;
        ball.vx *= -bRes;
        sounds.playHit();
      }
      if (ball.x > this.width + CONFIG.goalWidth - ball.radius) {
        ball.x = this.width + CONFIG.goalWidth - ball.radius;
        ball.vx *= -bRes;
        sounds.playHit();
      }

      // Goal horizontal top/bottom lines
      if (ball.x < 0 || ball.x > this.width) {
        if (ball.y < minGoalY + ball.radius) {
          ball.y = minGoalY + ball.radius;
          ball.vy *= -bRes;
          sounds.playHit();
        }
        if (ball.y > maxGoalY - ball.radius) {
          ball.y = maxGoalY - ball.radius;
          ball.vy *= -bRes;
          sounds.playHit();
        }
      }
    } else {
      // Standard pitch boundaries
      if (ball.x < ball.radius) {
        ball.x = ball.radius;
        ball.vx *= -bRes;
        sounds.playHit(false);
      }
      if (ball.x > this.width - ball.radius) {
        ball.x = this.width - ball.radius;
        ball.vx *= -bRes;
        sounds.playHit(false);
      }
    }

    if (ball.y < ball.radius) {
      ball.y = ball.radius;
      ball.vy *= -bRes;
      sounds.playHit(false);
    }
    if (ball.y > this.height - ball.radius) {
      ball.y = this.height - ball.radius;
      ball.vy *= -bRes;
      sounds.playHit(false);
    }

    // Solve custom diagonal corner rebounding inside game engine for the ball!
    const cornerHit = this.resolveCornersCollision(ball);
    if (cornerHit) {
      sounds.playHit(true);
      // Spawn vibrant emerald colored dust sparks
      this.spawnCollisionParticles(ball.x, ball.y, '#10b981');
    }

    // Car-to-Ball collisions for all active cars
    this.getAllCars().forEach(car => {
      this.resolveCarBallCollision(car);
    });
  }

  private resolveCarBallCollision(car: CarState) {
    const spheres = this.getCarCollisionSpheres(car);
    const ball = this.ball;

    const profile = CAR_PROFILES[car.carModel || 'interstellar'] || CAR_PROFILES.interstellar;

    spheres.forEach(sphere => {
      const dx = ball.x - sphere.x;
      const dy = ball.y - sphere.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = ball.radius + sphere.r;

      if (dist < minDist) {
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        // Separate them
        ball.x += nx * overlap * 0.6;
        // Keep car slightly stable or push back slightly
        car.x -= nx * overlap * 0.4;

        // Elastic momentum exchange based on relative velocities
        // Ball mass is 0.8, Car mass is 1.4 scaled by profile weight
        const mBall = 0.8;
        const mCar = 1.4 * (profile.weight || 1.0);

        const relVx = ball.vx - car.vx;
        const relVy = ball.vy - car.vy;

        // Relative velocity along collision normal
        const normalVelocity = relVx * nx + relVy * ny;

        if (normalVelocity < 0) {
          // Extra kickoff kick force. When driving fast, the shot is super clean!
          const restitution = 1.05;
          const impulseScalar = (-(1 + restitution) * normalVelocity) / (1 / mBall + 1 / mCar);

          const ramBonus = profile.ramForceBonus || 1.0;

          ball.vx += (impulseScalar / mBall) * nx * ramBonus;
          ball.vy += (impulseScalar / mBall) * ny * ramBonus;

          car.vx -= (impulseScalar / mCar) * nx;
          car.vy -= (impulseScalar / mCar) * ny;

          // Impact magnitude
          const magnitude = Math.abs(normalVelocity);
          if (magnitude > 1.5) {
            sounds.playHit(magnitude > 4.5);
            this.screenShake = Math.min(magnitude * 1.5 * ramBonus, 12);
            this.spawnCollisionParticles(
              (ball.x + sphere.x) / 2,
              (ball.y + sphere.y) / 2,
              car.colorPrimary
            );
          }
        }
      }
    });
  }

  private resolveCarCarCollision() {
    const cars = this.getAllCars();
    for (let i = 0; i < cars.length; i++) {
      for (let j = i + 1; j < cars.length; j++) {
        const carA = cars[i];
        const carB = cars[j];

        // Skip pairwise checks for parked practice units
        if (carA.x > 9000 || carB.x > 9000) continue;

        const spheresA = this.getCarCollisionSpheres(carA);
        const spheresB = this.getCarCollisionSpheres(carB);

        let colliding = false;
        let pushX = 0;
        let pushY = 0;
        let hitX = 0;
        let hitY = 0;

        spheresA.forEach(sA => {
          spheresB.forEach(sB => {
            const dx = sB.x - sA.x;
            const dy = sB.y - sA.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = sA.r + sB.r;

            if (dist < minDist) {
              colliding = true;
              const overlap = minDist - dist;
              pushX += (dx / dist) * overlap;
              pushY += (dy / dist) * overlap;
              hitX = (sA.x + sB.x) / 2;
              hitY = (sA.y + sB.y) / 2;
            }
          });
        });

        if (colliding) {
          const dist = Math.sqrt(pushX * pushX + pushY * pushY);
          if (dist > 0) {
            const nx = pushX / dist;
            const ny = pushY / dist;

            const pA = CAR_PROFILES[carA.carModel || 'interstellar'] || CAR_PROFILES.interstellar;
            const pB = CAR_PROFILES[carB.carModel || 'interstellar'] || CAR_PROFILES.interstellar;

            const wA = pA.weight || 1.0;
            const wB = pB.weight || 1.0;
            const totalW = wA + wB;

            const separationFracA = totalW > 0 ? (wB / totalW) : 0.5;
            const separationFracB = totalW > 0 ? (wA / totalW) : 0.5;

            carA.x -= nx * dist * separationFracA;
            carA.y -= ny * dist * separationFracA;

            carB.x += nx * dist * separationFracB;
            carB.y += ny * dist * separationFracB;

            const vANormal = carA.vx * nx + carA.vy * ny;
            const vBNormal = carB.vx * nx + carB.vy * ny;

            const ramA = pA.ramForceBonus || 1.0;
            const ramB = pB.ramForceBonus || 1.0;

            const isAHittingB = vANormal > 0;
            const isBHittingA = vBNormal < 0;

            let crashForce = 0;

            if (isAHittingB && isBHittingA) {
              const hitPowerA = Math.abs(vANormal);
              const hitPowerB = Math.abs(vBNormal);

              const throwPowerB = (hitPowerA * 1.8 + 6.0) * ramA / wB;
              const throwPowerA = (hitPowerB * 1.8 + 6.0) * ramB / wA;

              carB.vx += nx * throwPowerB;
              carB.vy += ny * throwPowerB;

              carA.vx -= nx * throwPowerA;
              carA.vy -= ny * throwPowerA;

              crashForce = hitPowerA + hitPowerB;
            } else if (isAHittingB) {
              const hitPower = Math.abs(vANormal);
              const throwPower = (hitPower * 1.8 + 6.0) * ramA / wB;

              carB.vx += nx * throwPower;
              carB.vy += ny * throwPower;

              carA.vx -= nx * (hitPower * 0.4);
              carA.vy -= ny * (hitPower * 0.4);

              crashForce = hitPower;
            } else if (isBHittingA) {
              const hitPower = Math.abs(vBNormal);
              const throwPower = (hitPower * 1.8 + 6.0) * ramB / wA;

              carA.vx -= nx * throwPower;
              carA.vy -= ny * throwPower;

              carB.vx -= nx * (vBNormal * 0.4);
              carB.vy -= ny * (vBNormal * 0.4);

              crashForce = hitPower;
            } else {
              carA.vx -= nx * 2.0 / wA;
              carA.vy -= ny * 2.0 / wA;
              carB.vx += nx * 2.0 / wB;
              carB.vy += ny * 2.0 / wB;
              crashForce = 1.0;
            }

            const bSpeed = Math.sqrt(carA.vx * carA.vx + carA.vy * carA.vy);
            const rSpeed = Math.sqrt(carB.vx * carB.vx + carB.vy * carB.vy);
            const capSpeed = 18.0;
            if (bSpeed > capSpeed) {
              carA.vx = (carA.vx / bSpeed) * capSpeed;
              carA.vy = (carA.vy / bSpeed) * capSpeed;
            }
            if (rSpeed > capSpeed) {
              carB.vx = (carB.vx / rSpeed) * capSpeed;
              carB.vy = (carB.vy / rSpeed) * capSpeed;
            }

            if (crashForce > 1.2) {
              sounds.playHit(crashForce > 4);
              this.screenShake = Math.min(crashForce * 1.8, 12);
              this.spawnCollisionParticles(hitX, hitY, '#ffffff');
            }
          }
        }
      }
    }
  }

  private checkGoalLogic() {
    if (this.scoreTriggered) return;

    // Check if the whole ball has entered left goal (x < 0) or right goal (x > width)
    const goalLineLeft = 0;
    const goalLineRight = this.width;

    if (this.ball.x < goalLineLeft - 10) {
      // Red scores! Right player earns scoring status
      this.cars.red.score += 1;
      this.goalScoredThisFrame = 'red';
      this.scoreTriggered = true;
      sounds.playGoal();
      this.screenShake = 16;
      this.spawnGoalParticles(0, this.height / 2, '#ef4444');
    } else if (this.ball.x > goalLineRight + 10) {
      // Blue scores! Left player earns scoring status
      this.cars.blue.score += 1;
      this.goalScoredThisFrame = 'blue';
      this.scoreTriggered = true;
      sounds.playGoal();
      this.screenShake = 16;
      this.spawnGoalParticles(this.width, this.height / 2, '#3b82f6');
    }
  }

  private spawnCollisionParticles(x: number, y: number, color: string) {
    const amt = 12;
    for (let i = 0; i < amt; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: Math.random() * 3.5 + 2,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
      });
    }
  }

  private spawnBoostParticles(x: number, y: number, color: string) {
    const amt = 18;
    for (let i = 0; i < amt; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: Math.random() * 4.5 + 2.5,
        life: 1.0,
        decay: 0.03,
      });
    }
  }

  private spawnGoalParticles(x: number, y: number, color: string) {
    const amt = 45;
    for (let i = 0; i < amt; i++) {
      const angle = (Math.random() - 0.5) * Math.PI + (x === 0 ? 0 : Math.PI); // blast away from the goal post
      const speed = Math.random() * 11 + 3;
      this.particles.push({
        x,
        y: y + (Math.random() - 0.5) * 160, // distribute along goal mouth
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? color : '#f59e0b',
        radius: Math.random() * 5.5 + 2.5,
        life: 1.0,
        decay: 0.015 + Math.random() * 0.01,
      });
    }
  }
}
