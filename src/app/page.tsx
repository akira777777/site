'use client';

import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { ElementType, RelicData, WeaponData } from '@/lib/types';
import { SceneCanvas } from '@/components/3d/SceneCanvas';
import { GothicHUD } from '@/components/ui/GothicHUD';
import { AudioHUD } from '@/components/audio/AudioHUD';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { InspectModal } from '@/components/ui/InspectModal';
import { HeroSection } from '@/components/sections/HeroSection';
import { RelicsSection } from '@/components/sections/RelicsSection';
import { ChronicleSection } from '@/components/sections/ChronicleSection';
import { ForgeSection } from '@/components/sections/ForgeSection';
import { CovenantSection } from '@/components/sections/CovenantSection';

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChamber, setActiveChamber] = useState('reliquary');
  const [activeElement, setActiveElement] = useState<ElementType>('blood');
  const [isCovenantSealed, setIsCovenantSealed] = useState(false);
  const [inspectItem, setInspectItem] = useState<(RelicData | WeaponData) | null>(null);

  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll and update progress
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      setScrollProgress(progress);

      // Determine active chamber
      if (progress < 0.18) {
        setActiveChamber('reliquary');
      } else if (progress < 0.42) {
        setActiveChamber('crypt');
      } else if (progress < 0.65) {
        setActiveChamber('chronicle');
      } else if (progress < 0.86) {
        setActiveChamber('forge');
      } else {
        setActiveChamber('covenant');
      }
    };

    lenis.on('scroll', onScroll);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Smooth scroll to target chamber
  const handleNavigate = (chamberId: string) => {
    let targetY = 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    switch (chamberId) {
      case 'reliquary':
        targetY = 0;
        break;
      case 'crypt':
        targetY = maxScroll * 0.25;
        break;
      case 'chronicle':
        targetY = maxScroll * 0.52;
        break;
      case 'forge':
        targetY = maxScroll * 0.74;
        break;
      case 'covenant':
        targetY = maxScroll;
        break;
      default:
        targetY = 0;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 1.8 });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[#060608] text-[#c5b396] overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* 3D WebGL Background Canvas */}
      <SceneCanvas
        scrollProgress={scrollProgress}
        activeElement={activeElement}
        isCovenantSealed={isCovenantSealed}
      />

      {/* Atmospheric Film Grain & Vignette Overlay */}
      <div className="pointer-events-none fixed inset-0 z-20 mix-blend-overlay opacity-30 bg-[radial-gradient(circle_at_center,transparent_30%,#000_100%)]" />
      <div
        className="pointer-events-none fixed inset-0 z-20 opacity-20"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Custom Particle Ember Cursor */}
      <CustomCursor />

      {/* Global Gothic Telemetry HUD */}
      <GothicHUD
        activeChamber={activeChamber}
        scrollProgress={scrollProgress}
        onNavigate={handleNavigate}
      />

      {/* Floating Audio Controller */}
      <AudioHUD />

      {/* Scrollytelling Sections Container */}
      <div className="relative z-10 flex flex-col">
        <HeroSection onExplore={() => handleNavigate('crypt')} />
        <RelicsSection onSelectRelic={(relic) => setInspectItem(relic)} />
        <ChronicleSection />
        <ForgeSection
          activeElement={activeElement}
          onElementChange={(elem) => setActiveElement(elem)}
          onSelectWeapon={(weapon) => setInspectItem(weapon)}
        />
        <CovenantSection
          onPactSealed={(sealed) => setIsCovenantSealed(sealed)}
        />
      </div>

      {/* 3D Interactive Inspect Modal */}
      {inspectItem && (
        <InspectModal
          item={inspectItem}
          onClose={() => setInspectItem(null)}
        />
      )}
    </main>
  );
}
