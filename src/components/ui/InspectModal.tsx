'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { X, Sparkles, Flame, ShieldAlert, Zap } from 'lucide-react';
import { RelicData, WeaponData, ElementType } from '@/lib/types';
import { SingleRelicViewer } from '@/components/3d/RelicsScene3D';
import { WeaponForge3D } from '@/components/3d/WeaponForge3D';
import { GothicCorner } from './Filigree';
import { ScrambleText } from './ScrambleText';
import { sound } from '@/components/audio/SoundEngine';

interface InspectModalProps {
  item: (RelicData | WeaponData) & { isWeapon?: boolean };
  onClose: () => void;
}

export function InspectModal({ item, onClose }: InspectModalProps) {
  const [element, setElement] = useState<ElementType>(
    (item as WeaponData).element || 'ember'
  );
  const [lightIntensity, setLightIntensity] = useState(2.2);

  const isWeapon = 'scaling' in item;
  const relic = !isWeapon ? (item as RelicData) : null;
  const weapon = isWeapon ? (item as WeaponData) : null;

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0c0c10] border border-amber-500/40 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col md:flex-row overflow-hidden">
        {/* Gothic Ornaments */}
        <GothicCorner className="absolute top-2 left-2 rotate-0 text-amber-500/80 pointer-events-none" />
        <GothicCorner className="absolute top-2 right-2 rotate-90 text-amber-500/80 pointer-events-none" />
        <GothicCorner className="absolute bottom-2 right-2 rotate-180 text-amber-500/80 pointer-events-none" />
        <GothicCorner className="absolute bottom-2 left-2 -rotate-90 text-amber-500/80 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="magnetic absolute top-4 right-4 z-50 p-2 rounded bg-black/80 border border-neutral-700 text-[#c5b396] hover:text-amber-400 hover:border-amber-400 transition-colors cursor-pointer"
          aria-label="Close Inspect Modal (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: 3D Interactive Orbit Canvas */}
        <div className="relative w-full md:w-3/5 h-1/2 md:h-full bg-gradient-to-b from-[#14141a] to-[#08080a] flex items-center justify-center">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 bg-black/70 border border-neutral-800 rounded text-[10px] font-mono text-[#c5b396]/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>ORBIT 360° // DRAG & ZOOM [ESC TO CLOSE]</span>
          </div>

          <Canvas camera={{ position: [0, 1, 3.8], fov: 45 }}>
            <ambientLight intensity={0.25} />
            <directionalLight position={[5, 10, 5]} intensity={lightIntensity * 0.7} color="#fff" />
            <pointLight position={[-4, -2, -4]} intensity={lightIntensity * 0.4} color="#681313" />

            <OrbitControls
              enablePan={false}
              minDistance={1.8}
              maxDistance={5.5}
              autoRotate={false}
            />

            {isWeapon ? (
              <WeaponForge3D
                weaponId={weapon!.id}
                element={element}
                scale={1.1}
                autoRotate={false}
              />
            ) : (
              <SingleRelicViewer relicId={relic!.id} scale={1.3} />
            )}
          </Canvas>

          {/* Bottom 3D Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto bg-black/70 backdrop-blur-md p-2 rounded border border-neutral-800 text-xs">
            {isWeapon ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#c5b396]/60">INFUSION:</span>
                {(['blood', 'frost', 'ember'] as ElementType[]).map((elem) => (
                  <button
                    key={elem}
                    onClick={() => {
                      sound.playBladeEnchant(elem);
                      setElement(elem);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      element === elem
                        ? elem === 'blood'
                          ? 'bg-red-900/60 border border-red-500 text-red-300'
                          : elem === 'frost'
                          ? 'bg-cyan-950/60 border border-cyan-400 text-cyan-300'
                          : 'bg-amber-950/60 border border-amber-500 text-amber-300'
                        : 'text-neutral-500 hover:text-neutral-300 bg-neutral-900'
                    }`}
                  >
                    {elem}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SANCTITY PURITY: {relic?.purity}%</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#c5b396]/60">AURA:</span>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.1"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                className="w-16 accent-amber-500 h-1 bg-neutral-800 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Lore & Weapon Stats */}
        <div className="w-full md:w-2/5 h-1/2 md:h-full p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#c5b396]/20 bg-[#0e0e14]/90">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase tracking-widest">
                {isWeapon ? weapon?.type : relic?.rarity}
              </span>
              <span className="text-[10px] font-mono text-[#c5b396]/50">
                {isWeapon ? 'ARSENAL CODEX' : relic?.era}
              </span>
            </div>

            <h3 className="font-cinzel text-xl md:text-2xl font-bold text-[#e2d5be] tracking-wide mb-1">
              <ScrambleText text={item.name} autoStart />
            </h3>

            {isWeapon && (
              <p className="text-xs font-serif italic text-amber-400/80 mb-4">
                {weapon?.subname}
              </p>
            )}

            <div className="h-px bg-gradient-to-r from-amber-500/40 via-amber-500/10 to-transparent my-3" />

            <p className="text-xs md:text-sm text-[#c5b396]/80 leading-relaxed font-sans mb-4">
              {relic ? relic.description : weapon?.lore}
            </p>

            {/* Curse or Special Ability */}
            <div className="p-3 rounded bg-red-950/20 border border-red-900/40 mb-4">
              <div className="flex items-center gap-1.5 text-red-400 font-cinzel text-xs mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isWeapon ? 'SPECIAL ASH OF WAR' : 'CURSE OF THE SANCTUM'}</span>
              </div>
              <p className="text-[11px] text-red-200/70 font-sans">
                {isWeapon ? weapon?.ability : relic?.curse}
              </p>
            </div>

            {/* Weapon Stats breakdown */}
            {isWeapon && weapon?.stats && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                <div className="p-2 bg-neutral-900/80 border border-neutral-800 rounded flex justify-between">
                  <span className="text-neutral-400">PHYSICAL</span>
                  <span className="text-amber-400 font-bold">{weapon.stats.physical}</span>
                </div>
                <div className="p-2 bg-neutral-900/80 border border-neutral-800 rounded flex justify-between">
                  <span className="text-neutral-400">MAGIC</span>
                  <span className="text-cyan-400 font-bold">{weapon.stats.magic}</span>
                </div>
                <div className="p-2 bg-neutral-900/80 border border-neutral-800 rounded flex justify-between">
                  <span className="text-neutral-400">BLEED</span>
                  <span className="text-red-400 font-bold">{weapon.stats.bleed}</span>
                </div>
                <div className="p-2 bg-neutral-900/80 border border-neutral-800 rounded flex justify-between">
                  <span className="text-neutral-400">STAGGER</span>
                  <span className="text-emerald-400 font-bold">{weapon.stats.stagger}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-[#c5b396]/60">
            <span>ORIGIN: {isWeapon ? 'HIGH SANCTUARY' : relic?.origin}</span>
            <button
              onClick={() => {
                sound.playRuneGlow();
              }}
              className="magnetic px-3 py-1.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              COMMUNE WITH RELIC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
