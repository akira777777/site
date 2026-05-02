export const AudioEngine = (() => {
  let ctx: AudioContext | null = null;
  let muted = false;
  let ambientGain: GainNode | null = null;
  let hasStartedAmbient = false;

  const getCtx = () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const startAmbient = () => {
    if (hasStartedAmbient || muted) return;
    try {
      const ac = getCtx();
      ambientGain = ac.createGain();
      ambientGain.connect(ac.destination);
      ambientGain.gain.value = 0.05; // very low volume

      // Create a chord for the drone
      const freqs = [65.41, 98.00, 130.81]; // C2, G2, C3
      freqs.forEach(freq => {
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        // Slow LFO for volume modulation
        const lfo = ac.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1 + (Math.random() * 0.05); // very slow
        const lfoGain = ac.createGain();
        lfoGain.gain.value = 0.5;
        lfo.connect(lfoGain.gain);
        
        osc.connect(lfoGain);
        lfoGain.connect(ambientGain!);
        
        osc.start();
        lfo.start();
      });
      hasStartedAmbient = true;
    } catch {
      // Ignore audio context errors before user interaction
    }
  };

  const playTone = (freq: number, type: OscillatorType, duration: number, volume = 0.3, detune = 0) => {
    if (muted) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      osc.detune.setValueAtTime(detune, ac.currentTime);
      gain.gain.setValueAtTime(volume, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch { /* user hasn't interacted yet */ }
  };

  return {
    setMuted: (m: boolean) => { 
      muted = m; 
      if (ambientGain) {
        ambientGain.gain.setTargetAtTime(m ? 0 : 0.05, getCtx().currentTime, 0.5);
      }
    },

    spinStart: () => {
      startAmbient();
      // Whirring reel sound - rapid descending tones
      [0, 60, 120].forEach(delay => {
        setTimeout(() => playTone(200 + Math.random() * 100, 'sawtooth', 0.08, 0.08), delay);
      });
    },

    reelStop: (reelIndex: number) => {
      // Thud per reel
      const freqs = [180, 160, 140];
      playTone(freqs[reelIndex], 'square', 0.12, 0.15);
      setTimeout(() => playTone(freqs[reelIndex] * 0.5, 'sine', 0.1, 0.08), 30);
    },

    smallWin: () => {
      // Ascending coin chime
      [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => playTone(f, 'sine', 0.18, 0.2), i * 80));
    },

    bigWin: () => {
      // Fanfare
      [523, 659, 784, 1047, 1319].forEach((f, i) =>
        setTimeout(() => playTone(f, 'sine', 0.25, 0.25), i * 100));
      setTimeout(() => [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => playTone(f, 'triangle', 0.3, 0.2), i * 80)), 600);
    },

    freeSpinsUnlocked: () => {
      // Special ascending fanfare
      [392, 523, 659, 784, 1047, 1319].forEach((f, i) =>
        setTimeout(() => playTone(f, 'sine', 0.3, 0.3), i * 120));
    },

    coinClink: () => {
      playTone(1200, 'sine', 0.06, 0.1);
      setTimeout(() => playTone(1400, 'sine', 0.04, 0.08), 40);
    },
  };
})();
