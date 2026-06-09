// Synthesizer Audio Engine using standard Web Audio API

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private muted: boolean = false;
  private mVol: number = 0.5;
  private sVol: number = 0.7;

  constructor() {
    // Lazy initialisation to support browser gesture Policies
  }

  public setMusicVolume(vol: number) {
    this.mVol = vol;
  }

  public setSfxVolume(vol: number) {
    this.sVol = vol;
    if (this.masterVolume && this.ctx && !this.muted) {
      // Scale master gain based on SFX setting
      this.masterVolume.gain.setValueAtTime(vol * 0.45, this.ctx.currentTime);
    }
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(this.sVol * 0.45, this.ctx.currentTime);
      this.masterVolume.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.setValueAtTime(this.muted ? 0 : 0.35, this.ctx.currentTime);
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playHit(heavy: boolean = false) {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    
    // Synth a quick collision 'thud/clank'
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = heavy ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(heavy ? 120 : 180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + (heavy ? 0.25 : 0.12));

    gain.gain.setValueAtTime(heavy ? 0.8 : 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (heavy ? 0.3 : 0.15));

    osc.connect(gain);
    if (this.masterVolume) gain.connect(this.masterVolume);

    osc.start(now);
    osc.stop(now + (heavy ? 0.35 : 0.2));

    // Add high pitch snap noise
    const noiseOsc = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();
    noiseOsc.type = 'triangle';
    noiseOsc.frequency.setValueAtTime(heavy ? 600 : 900, now);
    noiseOsc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    noiseGain.gain.setValueAtTime(heavy ? 0.3 : 0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noiseOsc.connect(noiseGain);
    if (this.masterVolume) noiseGain.connect(this.masterVolume);

    noiseOsc.start(now);
    noiseOsc.stop(now + 0.1);
  }

  public playGoal() {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;

    // Sub-bass rumble
    const rumble = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(60, now);
    rumble.frequency.linearRampToValueAtTime(20, now + 0.8);
    rumbleGain.gain.setValueAtTime(0.8, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    rumble.connect(rumbleGain);
    if (this.masterVolume) rumbleGain.connect(this.masterVolume);
    rumble.start(now);
    rumble.stop(now + 0.82);

    // Rising siren effect
    const siren = this.ctx.createOscillator();
    const sirenGain = this.ctx.createGain();
    siren.type = 'triangle';
    siren.frequency.setValueAtTime(150, now);
    siren.frequency.exponentialRampToValueAtTime(1200, now + 0.7);
    sirenGain.gain.setValueAtTime(0.3, now);
    sirenGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
    siren.connect(sirenGain);
    if (this.masterVolume) sirenGain.connect(this.masterVolume);
    siren.start(now);
    siren.stop(now + 0.72);
  }

  public playCountdownBeep(high: boolean = false) {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(high ? 880 : 440, now); // A5 or A4

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    if (this.masterVolume) gain.connect(this.masterVolume);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playBoost() {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    if (this.masterVolume) gain.connect(this.masterVolume);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playWin() {
    this.init();
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major Arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.25, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.6);

      osc.connect(gain);
      if (this.masterVolume) gain.connect(this.masterVolume);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.65);
    });
  }
}

export const sounds = new SoundEngine();
