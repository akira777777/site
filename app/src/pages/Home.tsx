import { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '../components/Navigation';
import ReservationModal from '../components/ReservationModal';
import Preloader from '../components/Preloader';
import HeroSection from '../sections/HeroSection';
import BetSection from '../sections/BetSection';
import NightUnfoldsSection from '../sections/NightUnfoldsSection';
import CollageSection from '../sections/CollageSection';
import LifestyleSection from '../sections/LifestyleSection';
import PeopleSection from '../sections/PeopleSection';
import PhilosophySection from '../sections/PhilosophySection';
import ClosingStatementSection from '../sections/ClosingStatementSection';
import PlayableSlotSection from '../sections/PlayableSlotSection';
import LeaderboardSection from '../sections/LeaderboardSection';
import FooterSection from '../sections/FooterSection';

export default function Home() {
  const [reserveOpen, setReserveOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let snapTrigger: ScrollTrigger | null = null;

    // Wait for all ScrollTriggers to be created
    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter((st) => st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map((st) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      // Global snap for pinned sections only
      snapTrigger = ScrollTrigger.create({
        snap: {
          snapTo: (value) => {
            const inPinned = pinnedRanges.some(
              (r) => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            if (!inPinned) return value; // flowing section: free scroll

            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.18, max: 0.45 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      snapTrigger?.kill();
    };
  }, []);

  return (
    <div className="relative bg-casino-ink min-h-screen">
      {!loaded && <Preloader onDone={() => setLoaded(true)} />}

      <Navigation onReserve={() => setReserveOpen(true)} />
      <ReservationModal open={reserveOpen} onOpenChange={setReserveOpen} />

      {/* Pinned sections with z-index stacking */}
      <HeroSection />
      <BetSection />
      <NightUnfoldsSection />
      <CollageSection />
      <LifestyleSection />
      <PeopleSection />
      <PhilosophySection />
      <ClosingStatementSection onReserve={() => setReserveOpen(true)} />

      {/* Flowing sections */}
      <PlayableSlotSection />
      <LeaderboardSection />
      <FooterSection onReserve={() => setReserveOpen(true)} />

      {/* Global ambient background glow to reduce static black feeling */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(176,38,255,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Global noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[999] opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
