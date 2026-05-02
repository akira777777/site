import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function PeopleSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const portrait = portraitRef.current;
    const headline = headlineRef.current;
    const ticker = tickerRef.current;
    if (!section || !portrait || !headline || !ticker) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=90%',
        pin: true,
        scrub: prefersReducedMotion ? false : 0.6,
      },
    });

    // Portrait from right
    tl.fromTo(
      portrait,
      { x: '50vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0
    );

    // Portrait micro parallax during settle
    tl.fromTo(
      portrait,
      { y: 0 },
      { y: '-2vh', ease: 'none' },
      0.25
    );

    // Headline from bottom
    tl.fromTo(
      headline,
      { y: '18vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.06
    );

    // EXIT
    tl.fromTo(
      portrait,
      { x: 0, opacity: 1 },
      { x: '20vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      headline,
      { x: 0, opacity: 1 },
      { x: '-10vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    // Ticker
    tl.fromTo(
      ticker,
      { x: '0%' },
      { x: '-12%', ease: 'none' },
      0
    );

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-casino-ink"
      style={{ zIndex: 60 }}
    >
      {/* Top half: Dark space with headline */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-casino-charcoal flex flex-col justify-center items-center">
        <h2
          ref={headlineRef}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-casino-neon uppercase text-center max-w-[80vw]"
          style={{ textShadow: '0 0 20px rgba(176,38,255,0.6)' }}
        >
          The Bonus Round
        </h2>
        <p className="mt-6 font-mono text-sm text-casino-ivory/80 max-w-md text-center">
          Unlock mystery chests, multiply your wins, and ride the adrenaline.
        </p>
      </div>

      {/* Bottom half: Full width image */}
      <img
        ref={portraitRef}
        src="/images/slot_bonus.png"
        alt="Bonus chest opening"
        loading="lazy"
        decoding="async"
        className="absolute top-[50vh] left-0 w-full h-[50vh] object-cover transition-all duration-1000 hover:brightness-125 hover:scale-[1.02]"
      />

      {/* Micro captions */}
      <p className="absolute bottom-[6vh] left-[6vw] font-mono text-xs text-casino-ivory drop-shadow-md">
        Feature / Mystery Chests
      </p>

      {/* Ticker */}
      <div
        ref={tickerRef}
        className="absolute bottom-[2vh] left-0 w-[200%] font-serif text-4xl md:text-6xl text-casino-ivory/[0.2] whitespace-nowrap pointer-events-none drop-shadow-lg"
      >
        The Bonus Round — The Bonus Round — The Bonus Round — The Bonus Round —
      </div>
    </section>
  );
}
