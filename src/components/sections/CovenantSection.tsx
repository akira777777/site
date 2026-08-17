'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Skull, Flame, CheckCircle, Shield, Copy, Sparkles } from 'lucide-react';
import { GothicDivider, GothicCorner, CrestEmblem } from '@/components/ui/Filigree';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { sound } from '@/components/audio/SoundEngine';
import { formatRunicTimestamp } from '@/lib/utils';

interface CovenantSectionProps {
  onPactSealed: (sealed: boolean) => void;
}

export function CovenantSection({ onPactSealed }: CovenantSectionProps) {
  const [initiateName, setInitiateName] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('Order of the Ashen Vigil');
  const [isSealed, setIsSealed] = useState(false);
  const [sealId, setSealId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSealPact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initiateName.trim()) return;

    sound.playCovenantRitual();
    setIsSealed(true);
    onPactSealed(true);

    const generatedId = `COV-${Math.random().toString(36).substring(2, 8).toUpperCase()}-1384`;
    setSealId(generatedId);

    // Trigger crimson & gold ember particle burst
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#e63946', '#d4973b', '#681313', '#f59e0b', '#000000'],
      shapes: ['circle', 'square'],
      scalar: 1.1,
    });
  };

  const copySeal = () => {
    sound.playClick();
    navigator.clipboard.writeText(
      `[MORBIDIUM COVENANT SEAL]\nInitiate: ${initiateName}\nOrder: ${selectedOrder}\nSeal ID: ${sealId}\nDepth: -2,040M\nDate: ${formatRunicTimestamp()}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="covenant" className="relative min-h-screen w-full py-32 px-6 flex flex-col items-center justify-center z-10">
      {/* Chapter Tag */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center gap-3 px-4 py-1 rounded bg-[#0e0e12]/80 border border-red-500/40 text-[#c5b396] text-[11px] font-mono tracking-[0.3em]">
          <span className="text-red-500">✦</span>
          <span>CHAMBER V // THE BLOOD COVENANT</span>
          <span className="text-red-500">✦</span>
        </div>
        <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-[#e2d5be] tracking-wider uppercase text-center mt-2">
          THE FINAL OATH
        </h2>
        <GothicDivider title="BIND THY SOUL TO THE CATACOMBS" subtitle="SURRENDER FLESH, INHERIT CINDERS" />
      </div>

      {/* Main Ritual Box */}
      <div className="w-full max-w-2xl relative p-8 md:p-12 rounded-sm bg-[#0e0e14]/90 border border-red-500/40 backdrop-blur-xl shadow-[0_0_60px_rgba(104,19,19,0.3)]">
        <GothicCorner className="absolute top-2 left-2 rotate-0 text-red-500/80" />
        <GothicCorner className="absolute top-2 right-2 rotate-90 text-red-500/80" />
        <GothicCorner className="absolute bottom-2 right-2 rotate-180 text-red-500/80" />
        <GothicCorner className="absolute bottom-2 left-2 -rotate-90 text-red-500/80" />

        {!isSealed ? (
          <form onSubmit={handleSealPact} className="flex flex-col gap-6">
            <div className="text-center">
              <span className="text-xs font-cinzel tracking-widest text-amber-400 block mb-2">
                INSCRIPTION OF THE PILGRIM
              </span>
              <p className="text-xs text-[#c5b396]/70 font-sans">
                Etch thy mortal name upon the petrified obsidian scroll. Once consecrated in blood, thy allegiance shall endure beyond mortality.
              </p>
            </div>

            {/* Initiate Name Input */}
            <div>
              <label className="block text-xs font-cinzel tracking-widest text-[#c5b396] mb-2">
                INITIATE NAME // COGNOMEN
              </label>
              <input
                type="text"
                required
                value={initiateName}
                onChange={(e) => setInitiateName(e.target.value)}
                placeholder="e.g. Eleanor the Ashen"
                className="w-full px-4 py-3 bg-black/60 border border-[#c5b396]/30 focus:border-red-500 focus:outline-none rounded text-sm text-[#e2d5be] font-sans placeholder-neutral-700 transition-colors"
              />
            </div>

            {/* Order Selection */}
            <div>
              <label className="block text-xs font-cinzel tracking-widest text-[#c5b396] mb-2">
                SELECT DEVOTION ORDER
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Order of the Ashen Vigil',
                  'The Sanguine Inquisition',
                  'Disciples of the Void',
                ].map((order) => (
                  <button
                    type="button"
                    key={order}
                    onClick={() => {
                      sound.playHover();
                      setSelectedOrder(order);
                    }}
                    className={`p-2.5 rounded text-[11px] font-cinzel tracking-wider border transition-all text-center cursor-pointer ${
                      selectedOrder === order
                        ? 'bg-red-950/70 border-red-500 text-red-300 shadow-[0_0_15px_rgba(230,57,70,0.3)]'
                        : 'bg-black/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {order}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onMouseEnter={() => sound.playHover()}
              className="magnetic group relative mt-4 py-4 px-8 bg-gradient-to-r from-red-950 via-red-900 to-amber-950 border border-red-500 text-[#f2e9dc] font-cinzel text-sm tracking-[0.3em] font-bold rounded hover:shadow-[0_0_35px_rgba(230,57,70,0.5)] transition-all cursor-pointer flex items-center justify-center gap-3"
            >
              <Flame className="w-5 h-5 text-red-400 group-hover:scale-125 transition-transform" />
              <span>SEAL BLOOD COVENANT</span>
              <Skull className="w-5 h-5 text-amber-400" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_30px_rgba(230,57,70,0.6)]">
              <CrestEmblem className="text-red-400 animate-spin" />
            </div>

            <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase mb-1">
              PACT CONSUMMATED IN ICHOR
            </span>
            <h3 className="font-cinzel text-2xl md:text-3xl font-bold text-[#e2d5be] mb-2">
              WELCOME, {initiateName.toUpperCase()}
            </h3>
            <p className="text-xs font-serif italic text-amber-400/90 mb-6">
              Consecrated Initiate of {selectedOrder}
            </p>

            {/* Pass Card */}
            <div className="w-full p-5 rounded bg-black/80 border border-amber-500/40 text-left font-mono text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-500">SEAL IDENTIFIER</span>
                <span className="text-red-400 font-bold">{sealId}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-500">SANCTUARY DEPTH</span>
                <span className="text-amber-400">-2,040 METERS (ABYSS CORE)</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-500">CONSECRATION DATE</span>
                <span className="text-[#c5b396]">{formatRunicTimestamp()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">VIGIL STATUS</span>
                <span className="text-emerald-400">UNDYING DEVOTION</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={copySeal}
                className="magnetic flex items-center gap-2 px-5 py-2.5 rounded bg-amber-500/20 border border-amber-500 text-amber-300 font-cinzel text-xs tracking-wider hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'OATH COPIED' : 'COPY SACRED SEAL'}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsSealed(false);
                  onPactSealed(false);
                }}
                className="px-4 py-2.5 rounded bg-neutral-900 border border-neutral-700 text-[#c5b396] text-xs font-mono hover:text-white cursor-pointer"
              >
                RE-COMMUNE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Colophon */}
      <footer className="w-full max-w-4xl mt-24 pt-8 border-t border-[#c5b396]/15 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4 font-mono text-[10px] text-[#c5b396]/50">
        <div>
          <span>MORBIDIUM SANCTUARY © 1384 OF THE ABYSS. ALL SOULS PRESERVED.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>CINZEL // SYNE // WEBGL</span>
          <span>•</span>
          <span className="text-amber-400">AWWWARDS SITE OF THE YEAR CANDIDATE</span>
        </div>
      </footer>
    </section>
  );
}
