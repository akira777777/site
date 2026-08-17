'use client';

import React, { useState } from 'react';
import { Flame, Snowflake, Droplets, Sparkles, Swords, Eye } from 'lucide-react';
import { WEAPONS_DATA } from '@/lib/constants';
import { WeaponData, ElementType } from '@/lib/types';
import { GothicDivider, GothicCorner } from '@/components/ui/Filigree';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { sound } from '@/components/audio/SoundEngine';

interface ForgeSectionProps {
  activeElement: ElementType;
  onElementChange: (element: ElementType) => void;
  onSelectWeapon: (weapon: WeaponData) => void;
}

export function ForgeSection({
  activeElement,
  onElementChange,
  onSelectWeapon,
}: ForgeSectionProps) {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponData>(WEAPONS_DATA[0]);

  const handleWeaponChange = (w: WeaponData) => {
    sound.playClick();
    sound.playBladeEnchant(activeElement);
    setSelectedWeapon(w);
  };

  const handleElementChange = (elem: ElementType) => {
    sound.playBladeEnchant(elem);
    onElementChange(elem);
  };

  return (
    <section id="forge" className="relative min-h-screen w-full py-32 px-6 flex flex-col items-center z-10">
      {/* Chapter Tag */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center gap-3 px-4 py-1 rounded bg-[#0e0e12]/80 border border-amber-500/40 text-[#c5b396] text-[11px] font-mono tracking-[0.3em]">
          <span className="text-amber-500">✦</span>
          <span>CHAMBER IV // THE ABYSSAL FORGE</span>
          <span className="text-amber-500">✦</span>
        </div>
        <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-[#e2d5be] tracking-wider uppercase text-center mt-2">
          SANCTUARY ARSENAL
        </h2>
        <GothicDivider title="ARMAMENTS OF THE EXECUTOR" subtitle="QUENCHED IN DRAGON BLOOD & CINDERS" />
      </div>

      {/* Main Weapon Interface */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
        {/* Left: Weapon Selector & Elemental Forge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Elemental Infusion Switcher */}
          <div className="p-5 rounded-sm bg-[#101015]/85 border border-neutral-800 backdrop-blur-md">
            <span className="block text-[11px] font-cinzel tracking-widest text-[#c5b396]/70 uppercase mb-3">
              SELECT ELEMENTAL INFUSION
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleElementChange('blood')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-sm border text-xs font-cinzel tracking-wider transition-all cursor-pointer ${
                  activeElement === 'blood'
                    ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_20px_rgba(230,57,70,0.4)]'
                    : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-red-900/60'
                }`}
              >
                <Droplets className="w-4 h-4 text-red-500" />
                <span>BLOOD</span>
              </button>

              <button
                onClick={() => handleElementChange('frost')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-sm border text-xs font-cinzel tracking-wider transition-all cursor-pointer ${
                  activeElement === 'frost'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(72,202,228,0.4)]'
                    : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-cyan-900/60'
                }`}
              >
                <Snowflake className="w-4 h-4 text-cyan-400" />
                <span>FROST</span>
              </button>

              <button
                onClick={() => handleElementChange('ember')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-sm border text-xs font-cinzel tracking-wider transition-all cursor-pointer ${
                  activeElement === 'ember'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-black/60 border-neutral-800 text-neutral-400 hover:border-amber-900/60'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>EMBER</span>
              </button>
            </div>
          </div>

          {/* Weapon List */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-cinzel tracking-widest text-[#c5b396]/70 uppercase">
              SELECT ARMAMENT
            </span>
            {WEAPONS_DATA.map((weapon) => {
              const isSelected = selectedWeapon.id === weapon.id;
              return (
                <button
                  key={weapon.id}
                  onClick={() => handleWeaponChange(weapon)}
                  onMouseEnter={() => sound.playHover()}
                  className={`magnetic text-left p-4 rounded-sm border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-[#181822] border-amber-500 shadow-[0_0_20px_rgba(212,151,59,0.2)]'
                      : 'bg-[#0d0d12]/80 border-[#c5b396]/20 hover:border-[#c5b396]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-cinzel font-bold text-[#e2d5be]">
                      {weapon.name}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      DMG {weapon.damage}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#c5b396]/50">
                    {weapon.type} // {weapon.scaling}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Weapon Display & Stat Inspector (7 cols) */}
        <div className="lg:col-span-7 relative p-8 md:p-10 rounded-sm bg-[#121218]/90 border border-amber-500/30 backdrop-blur-md flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.85)]">
          <GothicCorner className="absolute top-2 left-2 rotate-0 text-amber-500/80" />
          <GothicCorner className="absolute top-2 right-2 rotate-90 text-amber-500/80" />
          <GothicCorner className="absolute bottom-2 right-2 rotate-180 text-amber-500/80" />
          <GothicCorner className="absolute bottom-2 left-2 -rotate-90 text-amber-500/80" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 tracking-widest uppercase">
                {selectedWeapon.type}
              </span>
              <span className="text-[10px] font-mono text-[#c5b396]/60">
                WEIGHT: {selectedWeapon.weight}
              </span>
            </div>

            <h3 className="font-cinzel text-2xl md:text-3xl font-bold text-[#e2d5be] tracking-wide mb-1">
              <ScrambleText text={selectedWeapon.name} />
            </h3>
            <p className="text-xs font-serif italic text-amber-400/80 mb-4">
              {selectedWeapon.subname}
            </p>

            <blockquote className="text-xs font-serif italic text-[#c5b396]/70 my-3 p-3 bg-black/40 border-l border-amber-500/50">
              {selectedWeapon.quote}
            </blockquote>

            <p className="text-xs md:text-sm text-[#c5b396]/80 font-sans font-light leading-relaxed my-4">
              {selectedWeapon.lore}
            </p>

            {/* Special Ability */}
            <div className="p-3.5 rounded bg-amber-950/20 border border-amber-500/30 my-4">
              <div className="flex items-center gap-2 text-amber-400 font-cinzel text-xs mb-1">
                <Swords className="w-4 h-4" />
                <span>ASH OF WAR / ABILITY</span>
              </div>
              <p className="text-xs text-amber-200/80 font-sans">
                {selectedWeapon.ability}
              </p>
            </div>

            {/* Stat Bars */}
            <div className="space-y-2.5 my-6 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[#c5b396]/80 mb-1">
                  <span>PHYSICAL ATK</span>
                  <span className="text-amber-400 font-bold">{selectedWeapon.stats.physical} / 400</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(selectedWeapon.stats.physical / 400) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#c5b396]/80 mb-1">
                  <span>MAGIC POTENCY</span>
                  <span className="text-cyan-400 font-bold">{selectedWeapon.stats.magic} / 300</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${(selectedWeapon.stats.magic / 300) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#c5b396]/80 mb-1">
                  <span>BLEED BUILDUP</span>
                  <span className="text-red-400 font-bold">{selectedWeapon.stats.bleed} / 100</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(selectedWeapon.stats.bleed / 100) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inspect Button */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#c5b396]/50">
              SCALING: {selectedWeapon.scaling}
            </span>
            <button
              onClick={() => onSelectWeapon(selectedWeapon)}
              className="magnetic flex items-center gap-2 px-5 py-2.5 rounded-sm bg-gradient-to-r from-amber-950/80 to-red-950/80 border border-amber-500/60 text-amber-300 font-cinzel text-xs tracking-widest hover:border-amber-400 hover:shadow-[0_0_25px_rgba(212,151,59,0.3)] transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>3D INSPECT & ROTATE</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
