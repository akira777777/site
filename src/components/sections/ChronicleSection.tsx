'use client';

import React, { useState } from 'react';
import { BookOpen, Scroll, Feather, ChevronRight } from 'lucide-react';
import { LORE_ENTRIES } from '@/lib/constants';
import { LoreEntry } from '@/lib/types';
import { GothicDivider, GothicCorner } from '@/components/ui/Filigree';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { sound } from '@/components/audio/SoundEngine';

export function ChronicleSection() {
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry>(LORE_ENTRIES[0]);

  const handleSelect = (entry: LoreEntry) => {
    sound.playClick();
    sound.playRuneGlow();
    setSelectedEntry(entry);
  };

  return (
    <section id="chronicle" className="relative min-h-screen w-full py-32 px-6 flex flex-col items-center z-10">
      {/* Chapter Tag */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center gap-3 px-4 py-1 rounded bg-[#0e0e12]/80 border border-[#c5b396]/30 text-[#c5b396] text-[11px] font-mono tracking-[0.3em]">
          <span className="text-amber-500">✦</span>
          <span>CHAMBER III // THE GRIM CHRONICLE</span>
          <span className="text-amber-500">✦</span>
        </div>
        <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-[#e2d5be] tracking-wider uppercase text-center mt-2">
          CODEX MORBIDIUM
        </h2>
        <GothicDivider title="TESTAMENTS OF ASH & BLOOD" subtitle="FOLIOS OF THE FOUR GREAT ERAS" />
      </div>

      {/* Main Chronicle Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
        {/* Left Side: Era Selector Timeline (4 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <span className="text-xs font-cinzel tracking-widest text-[#c5b396]/60 uppercase mb-1">
            SELECT CHRONOLOGICAL FOLIO
          </span>

          {LORE_ENTRIES.map((entry, idx) => {
            const isSelected = selectedEntry.id === entry.id;
            return (
              <button
                key={entry.id}
                onClick={() => handleSelect(entry)}
                onMouseEnter={() => sound.playHover()}
                className={`magnetic relative text-left p-5 rounded-sm border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[#181822]/90 border-amber-500/80 shadow-[0_0_25px_rgba(212,151,59,0.15)] scale-[1.02]'
                    : 'bg-[#0e0e12]/75 border-[#c5b396]/20 hover:border-[#c5b396]/40 hover:bg-[#14141a]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-amber-500/80 tracking-widest uppercase">
                    {entry.year}
                  </span>
                  <span className="text-[9px] font-mono text-[#c5b396]/40">
                    FOLIO 0{idx + 1}
                  </span>
                </div>

                <div className="font-cinzel text-base font-bold text-[#e2d5be] mb-1">
                  <ScrambleText text={entry.title} />
                </div>

                <span className="font-serif text-xs text-[#c5b396]/60 italic line-clamp-1">
                  {entry.excerpt}
                </span>

                {isSelected && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: Illuminated Scripture Parchment Viewer (7 cols) */}
        <div className="lg:col-span-7 relative p-8 md:p-10 rounded-sm bg-[#121114]/90 border border-amber-500/30 backdrop-blur-md flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <GothicCorner className="absolute top-2 left-2 rotate-0 text-amber-500/80" />
          <GothicCorner className="absolute top-2 right-2 rotate-90 text-amber-500/80" />
          <GothicCorner className="absolute bottom-2 right-2 rotate-180 text-amber-500/80" />
          <GothicCorner className="absolute bottom-2 left-2 -rotate-90 text-amber-500/80" />

          <div>
            {/* Parchment Header */}
            <div className="flex items-center justify-between gap-2 border-b border-[#c5b396]/20 pb-4 mb-6">
              <div className="flex items-center gap-2 text-amber-500 font-cinzel text-xs tracking-widest">
                <Scroll className="w-4 h-4" />
                <span>{selectedEntry.era}</span>
              </div>
              <span className="text-[10px] font-mono text-[#c5b396]/50">
                {selectedEntry.scriptureRef}
              </span>
            </div>

            {/* Ancient Runic Inscription */}
            <div className="text-amber-400/90 text-base md:text-lg font-mono tracking-[0.3em] mb-4">
              {selectedEntry.runicTitle}
            </div>

            {/* Title */}
            <h3 className="font-cinzel text-2xl md:text-3xl font-bold text-[#f0e6d6] tracking-wide mb-4">
              {selectedEntry.title}
            </h3>

            {/* Lead Excerpt */}
            <blockquote className="p-4 my-4 bg-amber-950/20 border-l-2 border-amber-500 text-sm md:text-base font-serif italic text-amber-200/90 leading-relaxed">
              “{selectedEntry.excerpt}”
            </blockquote>

            {/* Full Scripture Text */}
            <p className="text-sm md:text-base text-[#c5b396]/90 font-sans leading-relaxed font-light mt-4">
              {selectedEntry.fullText}
            </p>
          </div>

          {/* Footer Seals */}
          <div className="pt-8 border-t border-[#c5b396]/15 mt-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#c5b396]/50">
            <span>SEALED BY ORDER OF SAINT ELEANOR</span>
            <div className="flex items-center gap-2 text-amber-400">
              <Feather className="w-3.5 h-3.5" />
              <span>INK: OXIDIZED METEORIC SLAG</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
