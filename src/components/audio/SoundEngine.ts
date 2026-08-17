'use client';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  // Ambient nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneOsc3: OscillatorNode | null = null;
  private windNode: AudioNode | null = null;
  private lfoFilter: BiquadFilterNode | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch {
      // Audio not supported or blocked
    }
  }

  private ensureContext(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return !!this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.08);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // --- Procedural Ambient Dark Drone & Wind ---
  public startAmbient() {
    if (this.isAmbientPlaying || !this.ensureContext() || !this.ctx || !this.ambientGain) return;
    this.isAmbientPlaying = true;

    try {
      const now = this.ctx.currentTime;

      // Deep Sub Drone (38Hz C#0 + 55Hz A1 + 65.4Hz C2)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sawtooth';
      this.droneOsc1.frequency.setValueAtTime(38.89, now); // D#1

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(58.27, now); // A#1 detuned

      this.droneOsc3 = this.ctx.createOscillator();
      this.droneOsc3.type = 'sine';
      this.droneOsc3.frequency.setValueAtTime(77.78, now); // D#2

      // Lowpass resonant filter for ominous dark cavern feel
      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(160, now);
      droneFilter.Q.setValueAtTime(3.5, now);

      // Slow LFO to modulate filter frequency (cavern breath)
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(60, now);
      lfo.connect(lfoGain);
      lfoGain.connect(droneFilter.frequency);
      lfo.start(now);

      const droneSubGain = this.ctx.createGain();
      droneSubGain.gain.setValueAtTime(0.25, now);

      this.droneOsc1.connect(droneFilter);
      this.droneOsc2.connect(droneFilter);
      this.droneOsc3.connect(droneFilter);
      droneFilter.connect(droneSubGain);
      droneSubGain.connect(this.ambientGain);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
      this.droneOsc3.start(now);

      // Wind sweep generator (Filtered noise)
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02; // Pink-ish noise filter
        lastOut = output[i];
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(240, now);
      windFilter.Q.setValueAtTime(2.0, now);

      // Wind gust modulation LFO
      const windLFO = this.ctx.createOscillator();
      windLFO.frequency.setValueAtTime(0.15, now);
      const windLFOGain = this.ctx.createGain();
      windLFOGain.gain.setValueAtTime(180, now);
      windLFO.connect(windLFOGain);
      windLFOGain.connect(windFilter.frequency);
      windLFO.start(now);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.12, now);

      whiteNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.ambientGain);
      whiteNoise.start(now);

      this.windNode = whiteNoise;
    } catch {
      // Audio playback handling
    }
  }

  public stopAmbient() {
    this.isAmbientPlaying = false;
    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      this.droneOsc3?.stop();
      (this.windNode as AudioBufferSourceNode)?.stop();
    } catch {}
  }

  // --- UI & Interaction Sound Effects ---

  // Subtle metallic / runic hover click
  public playHover() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Deep resonant metallic click
  public playClick() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Metallic strike oscillator
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(860, now);
    osc2.frequency.exponentialRampToValueAtTime(220, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  // Stone grinding friction for scrolling / chamber transition
  public playStoneScrape() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(65, now + 0.4);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    filter.Q.setValueAtTime(5.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Ethereal choral rune activation
  public playRuneGlow() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const freqs = [220, 277.18, 329.63, 440]; // A Minor chord
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.05 / (idx + 1), now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7 + idx * 0.1);

      osc.connect(g);
      g.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.85);
    });
  }

  // Sizzling blade enchantment ignition (Crimson / Frost / Ember)
  public playBladeEnchant(element: 'blood' | 'frost' | 'ember' = 'ember') {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const baseFreq = element === 'blood' ? 180 : element === 'frost' ? 680 : 340;

    const osc = this.ctx.createOscillator();
    osc.type = element === 'frost' ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.4);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 1.5, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Subterranean Blood Covenant Bell / Gong
  public playCovenantRitual() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub-bass drop
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 1.6);

    // Resonant Temple Gong chime
    const freqs = [174.61, 233.08, 349.23, 523.25]; // F minor gong
    freqs.forEach((f) => {
      if (!this.ctx || !this.sfxGain) return;
      const gong = this.ctx.createOscillator();
      gong.type = 'triangle';
      gong.frequency.setValueAtTime(f, now);

      const gGain = this.ctx.createGain();
      gGain.gain.setValueAtTime(0.12, now);
      gGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      gong.connect(gGain);
      gGain.connect(this.sfxGain);
      gong.start(now);
      gong.stop(now + 2.5);
    });
  }

  public playGong() {
    this.playCovenantRitual();
  }

  public playChime() {
    this.playRuneGlow();
  }
}

export const sound = new SoundEngine();
