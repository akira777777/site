import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function CollageSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const rouletteRef = useRef<HTMLImageElement>(null);
  const cardsRef = useRef<HTMLImageElement>(null);
  const chipsRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const roulette = rouletteRef.current;
    const cards = cardsRef.current;
    const chips = chipsRef.current;
    const headline = headlineRef.current;
    const ticker = tickerRef.current;
    if (!section || !roulette || !cards || !chips || !headline || !ticker) return;

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

    // Roulette from left
    tl.fromTo(
      roulette,
      { x: '-60vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0
    );

    // Cards from right
    tl.fromTo(
      cards,
      { x: '60vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0
    );

    // Chips from bottom
    tl.fromTo(
      chips,
      { y: '60vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.08
    );

    // Headline from left
    tl.fromTo(
      headline,
      { x: '-20vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0.06
    );

    // EXIT
    tl.fromTo(
      roulette,
      { x: 0, opacity: 1 },
      { x: '-30vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      cards,
      { x: 0, opacity: 1 },
      { x: '30vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      chips,
      { y: 0, opacity: 1 },
      { y: '30vh', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      headline,
      { y: 0, opacity: 1 },
      { y: '12vh', opacity: 0, ease: 'power2.in' },
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
      id="experience"
      className=" z-[]"
    >
      {/* Left top image - roulette */}
      <img
        ref={rouletteRef}
        src="/images/slot_symbols.png"
        alt="Slot symbols"
        loading="lazy"
        decoding="async"
        className="absolute left-[6vw] top-[10vh] w-[38vw] h-[30vh] object-cover rounded-xl shadow-card transition-all duration-700 hover:brightness-110"
      />

      {/* Left bottom headline */}
      <h2
        ref={headlineRef}
        className="absolute left-[6vw] top-[54vh] w-[42vw] font-serif text-5xl md:text-6xl lg:text-7xl text-casino-gold uppercase leading-tight"
      >
        Wilds &<br />Scatters.
      </h2>

      {/* Right top image - cards portrait */}
      <img
        ref={cardsRef}
        src="/images/slot_neon.png"
        alt="Neon multipliers"
        loading="lazy"
        decoding="async"
        className="absolute right-[6vw] top-[10vh] w-[44vw] h-[34vh] object-cover rounded-xl shadow-card transition-all duration-700 hover:brightness-110"
      />

      {/* Right bottom image - chips */}
      <img
        ref={chipsRef}
        src="/images/slot_coins.png"
        alt="Golden coins"
        loading="lazy"
        decoding="async"
        className="absolute right-[6vw] top-[52vh] w-[44vw] h-[36vh] object-cover rounded-xl shadow-card transition-all duration-700 hover:brightness-110"
      />

      {/* Caption */}
      <p className="absolute right-[8vw] top-[90vh] font-mono text-xs text-casino-muted/80">
        Multipliers / Active
      </p>

      {/* Ticker */}
      <div
        ref={tickerRef}
        className="absolute top-[44vh] left-0 w-[200%] font-serif text-4xl md:text-6xl text-casino-gold/[0.1] whitespace-nowrap pointer-events-none"
      >
        Wilds & Scatters — Wilds & Scatters — Wilds & Scatters — Wilds & Scatters —
      </div>
    </section>
  );
}
