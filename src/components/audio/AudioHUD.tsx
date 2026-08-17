'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sound } from './SoundEngine';

export function AudioHUD() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const toggleSound = () => {
    sound.init();
    if (!isPlaying) {
      sound.startAmbient();
      setIsPlaying(true);
      setIsMuted(false);
      sound.setMuted(false);
      sound.playRuneGlow();
    } else {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      sound.setMuted(nextMute);
      if (!nextMute) sound.playClick();
    }
  };

  // Allow first user click anywhere on page to awaken audio if user desires
  useEffect(() => {
    const handleFirstGesture = () => {
      sound.init();
      window.removeEventListener('click', handleFirstGesture);
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    return () => window.removeEventListener('click', handleFirstGesture);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Volume Slider popup */}
      {showVolumeSlider && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0a0a0c]/90 border border-amber-500/30 backdrop-blur-md animate-in fade-in slide-in-from-right-4 duration-200">
          <span className="text-[10px] font-mono text-[#c5b396]/60">VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              sound.setVolume(val);
            }}
            className="w-20 accent-amber-500 cursor-pointer h-1 bg-neutral-800 rounded appearance-none"
          />
          <span className="text-[10px] font-mono text-amber-500/80">{Math.round(volume * 100)}%</span>
        </div>
      )}

      {/* Main Audio Pill */}
      <button
        onClick={toggleSound}
        onMouseEnter={() => {
          sound.playHover();
          setShowVolumeSlider(true);
        }}
        onMouseLeave={() => setShowVolumeSlider(false)}
        className="magnetic group relative flex items-center gap-3 px-4 py-2.5 rounded-sm bg-[#0c0c10]/85 border border-[#c5b396]/20 backdrop-blur-md hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(212,151,59,0.2)] transition-all duration-300 cursor-pointer"
        aria-label={isMuted || !isPlaying ? 'Unmute Gothic Soundscape' : 'Mute Soundscape'}
      >
        <div className="flex items-center gap-1.5 text-amber-500">
          {isMuted || !isPlaying ? (
            <VolumeX className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
          ) : (
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
          )}

          {/* Equalizer Bars */}
          <div className="flex items-end gap-0.5 h-3.5 w-4.5 px-0.5">
            {[0.4, 0.9, 0.6, 1.0, 0.7].map((height, i) => (
              <span
                key={i}
                style={{
                  height: isPlaying && !isMuted ? `${height * 100}%` : '20%',
                  animationDuration: `${0.6 + i * 0.2}s`,
                }}
                className={`w-0.5 bg-amber-500/80 rounded-full transition-all duration-300 ${
                  isPlaying && !isMuted ? 'animate-bounce' : 'opacity-40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col text-left">
          <span className="font-cinzel text-[10px] tracking-widest text-[#c5b396] group-hover:text-amber-300 transition-colors">
            {isPlaying && !isMuted ? 'DARK CHRYSALIS' : 'SOUNDSCAPE'}
          </span>
          <span className="font-mono text-[8px] tracking-wider text-[#c5b396]/40">
            {isPlaying && !isMuted ? 'PROCEDURAL 432HZ' : 'MUTED (CLICK TO UNLEASH)'}
          </span>
        </div>

        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500/40 animate-ping opacity-75" />
      </button>
    </div>
  );
}
