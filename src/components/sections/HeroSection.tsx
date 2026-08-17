'use client';

import React from 'react';
import { ArrowDown, Flame, Shield, Skull, Sparkles } from 'lucide-react';
import { GothicDivider } from '@/components/ui/Filigree';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { Spotlight } from '@/components/ui/Spotlight';
import { BorderBeam } from '@/components/ui/BorderBeam';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { SparklesText } from '@/components/ui/SparklesText';
import { Marquee } from '@/components/ui/Marquee';
import { sound } from '@/components/audio/SoundEngine';

interface HeroSectionProps {
  onExplore: () => void;
}

export function HeroSection({ onExplore }: HeroSectionProps) {
  const litanies = [
    'IN SANGUINE VERITAS',
    'ᚠᚢᚦᚨᚱᚲᚷᚹ // ELDER RUNES AWAKENED',
    'ET LUX IN TENEBRIS LUCET',
    'THE ASHEN VIGIL ENDURES',
    'SOLVE ET COAGULA',
    'DEPTH -480M // PETRIFIED SANCTUARY',
  ];

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between items-center text-center px-6 pt-28 pb-8 z-10 overflow-hidden">
      {/* Aceternity UI Spotlights */}
      <Spotlight className="-top-40 left-0 md:left-40 md:-top-20" fill="#d4973b" />
      <Spotlight className="top-10 left-full md:left-2/3 h-[80vh] w-[50vw]" fill="#681313" />

      {/* Top Chapter Badge with Magic UI BorderBeam */}
      <div className="relative group flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="relative overflow-hidden flex items-center gap-3 px-5 py-1.5 rounded-full bg-[#0d0d12]/90 border border-amber-500/30 text-[#c5b396] text-[11px] font-mono tracking-[0.3em] backdrop-blur-md shadow-[0_0_20px_rgba(212,151,59,0.15)]">
          <span className="text-amber-500">✦</span>
          <span>CHAMBER I // THE SUNKEN RELIQUARY</span>
          <span className="text-amber-500">✦</span>
          <BorderBeam size={120} duration={8} colorFrom="#f59e0b" colorTo="#e63946" />
        </div>
        <span className="text-[10px] font-mono text-red-400/80 tracking-widest uppercase">
          DEPTH -480M // THRESHOLD OF OBSIDIAN
        </span>
      </div>

      {/* Main Title Hero Banner */}
      <div className="max-w-5xl my-auto py-8 flex flex-col items-center">
        <span className="font-cinzel text-xs md:text-sm tracking-[0.5em] text-amber-400/90 uppercase mb-3 block">
          <ScrambleText text="ᚦᛖ ᛋᚢᚾᚲᛖᚾ ᛋᚨᚾᚲᛏᚢᚨᚱᛁ // ANCIENT TESTAMENT" />
        </span>

        <h1 className="font-cinzel-decorative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight uppercase leading-[1.05] drop-shadow-[0_10px_40px_rgba(0,0,0,0.95)]">
          <SparklesText text="MORBIDIUM" colors={{ first: '#d4973b', second: '#f59e0b' }} />
        </h1>

        <div className="relative my-5 max-w-xl">
          <GothicDivider title="WHERE CINDERS NEVER DIE" />
        </div>

        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-[#c5b396]/90 font-sans font-light leading-relaxed mb-8 px-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          Descend into the subterranean cathedral of the forgotten clergy. Unearth forbidden relics, forge abyssal armaments, and bind your soul to the eternal Blood Covenant beneath the petrified vaults.
        </p>

        {/* Action CTA with Magic UI ShimmerButton */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ShimmerButton
            onClick={() => {
              sound.playStoneScrape();
              onExplore();
            }}
            className="rounded-sm border-amber-500/60 shadow-[0_0_35px_rgba(212,151,59,0.35)]"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>DESCEND THE CATACOMBS</span>
            <ArrowDown className="w-4 h-4 text-amber-400 group-hover:translate-y-1 transition-transform" />
          </ShimmerButton>
        </div>
      </div>

      {/* Magic UI Infinite Marquee */}
      <div className="w-full max-w-5xl my-4 py-2 border-y border-amber-500/20 bg-[#0a0a0e]/60 backdrop-blur-sm overflow-hidden">
        <Marquee duration="30s" pauseOnHover className="text-xs font-mono tracking-[0.25em] text-[#c5b396]/70">
          {litanies.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 mx-4">
              <span className="text-amber-500">✦</span>
              <span className="hover:text-amber-300 transition-colors cursor-default">{item}</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Bottom Telemetry Bar with Magic UI BorderBeam Cards */}
      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-3 text-left font-mono text-[11px] pt-4">
        {[
          { label: 'SANCTUARY STATUS', val: 'CORRUPTED VEIL ACTIVE', color: 'text-amber-400' },
          { label: 'LUMEN RADIANCE', val: '432 LUX // CANDLELIGHT', color: 'text-[#e2d5be]' },
          { label: 'ARCHON GUARDIANS', val: 'FOUR SEALED HORRORS', color: 'text-red-400' },
          { label: 'OATH BEARING', val: 'IRON & BLOOD COVENANT', color: 'text-amber-300' },
        ].map((stat, i) => (
          <div
            key={i}
            className="relative p-3 rounded bg-[#0d0d12]/80 border border-[#c5b396]/15 backdrop-blur-md overflow-hidden hover:border-amber-500/40 transition-colors"
          >
            <span className="block text-[9px] text-[#c5b396]/50 mb-1">{stat.label}</span>
            <span className={`block font-semibold ${stat.color}`}>{stat.val}</span>
            <BorderBeam size={80} duration={14} delay={i * 2} colorFrom="#f59e0b" colorTo="#681313" />
          </div>
        ))}
      </div>
    </section>
  );
}
