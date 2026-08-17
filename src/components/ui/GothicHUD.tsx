'use client';

import React, { useState, useEffect } from 'react';
import { CHAMBERS } from '@/lib/constants';
import { CrestEmblem } from './Filigree';
import { ScrambleText } from './ScrambleText';
import { sound } from '@/components/audio/SoundEngine';

interface GothicHUDProps {
  activeChamber: string;
  scrollProgress: number;
  onNavigate: (chamberId: string) => void;
}

export function GothicHUD({ activeChamber, scrollProgress, onNavigate }: GothicHUDProps) {
  const [fps, setFps] = useState(60);
  const [depth, setDepth] = useState('-480M');

  // FPS calculation
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const calculateFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calculateFps);
    };

    animId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update depth according to active chamber
  useEffect(() => {
    const current = CHAMBERS.find((c) => c.id === activeChamber);
    if (current) {
      setDepth(current.depth);
    }
  }, [activeChamber]);

  return (
    <>
      {/* Top Header HUD */}
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none px-6 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('reliquary');
            }}
            className="magnetic flex items-center gap-3 group text-left cursor-pointer"
          >
            <CrestEmblem className="transition-transform duration-500 group-hover:rotate-45 text-amber-500" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-sm font-bold tracking-[0.25em] text-[#e2d5be] group-hover:text-amber-400 transition-colors">
                  MORBIDIUM
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-400 font-mono">
                  SANCTUARY
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-[#c5b396]/50 block">
                DEPTH: {depth} // CODEX 1384
              </span>
            </div>
          </button>
        </div>

        {/* Chapter Quick Navigation */}
        <nav className="pointer-events-auto hidden md:flex items-center gap-1 p-1 rounded-sm bg-[#0a0a0c]/85 border border-[#c5b396]/20 backdrop-blur-md">
          {CHAMBERS.map((ch) => {
            const isActive = ch.id === activeChamber;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  sound.playClick();
                  onNavigate(ch.id);
                }}
                onMouseEnter={() => sound.playHover()}
                className={`magnetic relative px-3 py-1.5 text-[11px] font-cinzel tracking-wider rounded-sm transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-amber-300 bg-amber-500/20 border border-amber-500/50 shadow-[0_0_12px_rgba(212,151,59,0.3)]'
                    : 'text-[#c5b396]/60 hover:text-[#c5b396] hover:bg-neutral-800/40'
                }`}
              >
                <span className="opacity-60 mr-1 font-mono text-[9px]">{ch.num}.</span>
                {ch.name.replace('THE ', '')}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rotate-45" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Telemetry / Status */}
        <div className="pointer-events-auto flex items-center gap-4 text-[11px] font-mono text-[#c5b396]/70 bg-[#0a0a0c]/80 px-3.5 py-1.5 rounded-sm border border-[#c5b396]/20 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">ENGINE: </span>
            <span className="text-emerald-400 font-bold">{fps} FPS</span>
          </div>
          <div className="h-3 w-px bg-neutral-700" />
          <div className="text-amber-500/90 font-bold">
            {Math.round(scrollProgress * 100)}% DESCENT
          </div>
        </div>
      </header>

      {/* Global Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-neutral-900">
        <div
          className="h-full bg-gradient-to-r from-red-800 via-amber-500 to-amber-300 transition-all duration-75 shadow-[0_0_8px_#f59e0b]"
          style={{ width: `${Math.max(2, scrollProgress * 100)}%` }}
        />
      </div>

      {/* Left Vertical Chapter Indicator Line */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4 pointer-events-none">
        <div className="h-16 w-px bg-gradient-to-b from-transparent to-amber-500/40" />
        {CHAMBERS.map((ch, idx) => {
          const isActive = ch.id === activeChamber;
          return (
            <div key={ch.id} className="group relative pointer-events-auto flex items-center">
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate(ch.id);
                }}
                className={`w-3 h-3 rotate-45 border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-amber-400 bg-amber-400 scale-125 shadow-[0_0_12px_#f59e0b]'
                    : 'border-neutral-600 bg-black/80 hover:border-amber-500/70 hover:scale-110'
                }`}
                aria-label={ch.name}
              />
              <span className="absolute left-6 whitespace-nowrap text-[10px] font-cinzel tracking-widest text-[#c5b396] opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-2 py-0.5 border border-amber-500/40 rounded">
                {ch.num}. {ch.name}
              </span>
            </div>
          );
        })}
        <div className="h-16 w-px bg-gradient-to-t from-transparent to-amber-500/40" />
      </div>
    </>
  );
}
