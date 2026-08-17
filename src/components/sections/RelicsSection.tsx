'use client';

import React from 'react';
import { Eye, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RELICS_DATA } from '@/lib/constants';
import { RelicData } from '@/lib/types';
import { TiltCard } from '@/components/ui/TiltCard';
import { GothicDivider, GothicCorner } from '@/components/ui/Filigree';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { sound } from '@/components/audio/SoundEngine';

import { BorderBeam } from '@/components/ui/BorderBeam';
import { SparklesText } from '@/components/ui/SparklesText';

interface RelicsSectionProps {
  onSelectRelic: (relic: RelicData) => void;
}

export function RelicsSection({ onSelectRelic }: RelicsSectionProps) {
  return (
    <section id="crypt" className="relative min-h-screen w-full py-32 px-6 flex flex-col items-center z-10">
      {/* Chapter Tag */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="relative overflow-hidden flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0e0e12]/80 border border-red-500/30 text-[#c5b396] text-[11px] font-mono tracking-[0.3em] backdrop-blur-md">
          <span className="text-red-500">✦</span>
          <span>CHAMBER II // THE CRYPT OF SINS</span>
          <span className="text-red-500">✦</span>
          <BorderBeam size={100} duration={10} colorFrom="#e63946" colorTo="#d4973b" />
        </div>
        <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider uppercase text-center mt-2">
          <SparklesText text="FORBIDDEN ARTIFACTS" colors={{ first: '#e2d5be', second: '#d4973b' }} />
        </h2>
        <GothicDivider title="VESSELS OF PRIMORDIAL POWER" subtitle="TOUCH NOT WITH UNBLESSED HANDS" />
      </div>

      {/* Relics 4-Card Grid with BorderBeam */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        {RELICS_DATA.map((relic, i) => {
          return (
            <TiltCard
              key={relic.id}
              onClick={() => onSelectRelic(relic)}
              className="relative overflow-hidden flex flex-col justify-between h-full bg-[#0d0d12]/90 border-[#c5b396]/20 hover:border-amber-500/60 transition-all duration-300"
            >
              <BorderBeam size={160} duration={12 + i * 2} delay={i * 3} colorFrom={relic.rarity === 'Forbidden' ? '#e63946' : '#d4973b'} colorTo="#681313" />
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest border ${
                      relic.rarity === 'Forbidden'
                        ? 'bg-red-950/60 border-red-500/50 text-red-400'
                        : relic.rarity === 'Abyssal'
                        ? 'bg-blue-950/60 border-blue-500/50 text-blue-400'
                        : relic.rarity === 'Mythic'
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                        : 'bg-neutral-900 border-neutral-700 text-[#c5b396]'
                    }`}
                  >
                    {relic.rarity}
                  </span>
                  <span className="text-[10px] font-mono text-[#c5b396]/50">
                    {relic.era}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-cinzel text-xl md:text-2xl font-bold text-[#e2d5be] tracking-wide mb-1 group-hover:text-amber-300 transition-colors">
                  <ScrambleText text={relic.name} />
                </h3>
                <p className="text-xs font-serif italic text-amber-500/70 mb-4">
                  {relic.title}
                </p>

                {/* Description */}
                <p className="text-xs md:text-sm text-[#c5b396]/80 leading-relaxed font-sans font-light mb-6">
                  {relic.description}
                </p>

                {/* Curse Callout */}
                <div className="p-3 rounded bg-red-950/20 border border-red-900/30 mb-6">
                  <div className="flex items-center gap-1.5 text-red-400 text-[11px] font-mono mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>CURSE PROFILE</span>
                  </div>
                  <p className="text-[11px] text-red-200/70 font-sans">
                    {relic.curse}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400/80">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SANCTITY: {relic.purity}%</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-cinzel tracking-wider text-amber-400 group-hover:text-amber-300">
                  <span>INSPECT IN 3D</span>
                  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
