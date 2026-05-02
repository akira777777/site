import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function BetSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const headline = headlineRef.current;
    const rule = ruleRef.current;
    const ticker = tickerRef.current;
    if (!section || !image || !headline || !rule || !ticker) return;

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

    // Image entrance
    tl.fromTo(
      image,
      { y: '-60vh', scale: 1.08, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, ease: 'none' },
      0
    );

    // Horizontal rule
    tl.fromTo(
      rule,
      { scaleX: 0 },
      { scaleX: 1, ease: 'none' },
      0.05
    );

    // Headline entrance (word by word simulation)
    tl.fromTo(
      headline,
      { y: '18vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.08
    );

    // SETTLE at 25% - 70%: hold

    // EXIT phase
    tl.fromTo(
      image,
      { y: 0, opacity: 1 },
      { y: '-20vh', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      headline,
      { y: 0, opacity: 1 },
      { y: '12vh', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      rule,
      { scaleX: 1 },
      { scaleX: 0, ease: 'power2.in' },
      0.7
    );

    // Ticker continuous
    tl.fromTo(
      ticker,
      { x: '-6%' },
      { x: '-18%', ease: 'none' },
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
      style={{ zIndex: 20 }}
    >
      {/* Top image */}
      <img
        ref={imageRef}
        src="/images/slot_jackpot.png"
        alt="Jackpot win"
        loading="lazy"
        decoding="async"
        className="absolute top-0 left-0 w-full h-[52vh] object-cover transition-all duration-700 hover:brightness-110 hover:saturate-[1.2]"
      />

      {/* Horizontal rule */}
      <div
        ref={ruleRef}
        className="absolute top-[56vh] left-[10vw] w-[80vw] h-px bg-casino-gold/30 origin-center"
      />

      {/* Headline */}
      <h2
        ref={headlineRef}
        className="absolute top-[62vh] left-1/2 -translate-x-1/2 w-[92vw] text-center font-serif text-5xl md:text-7xl lg:text-8xl text-casino-ivory uppercase"
      >
        Hit the Jackpot
      </h2>

      {/* Micro captions */}
      <p className="absolute bottom-[6vh] left-[6vw] font-mono text-xs text-casino-muted/80">
        Game Provider / Neon Slots
      </p>
      <p className="absolute bottom-[6vh] right-[6vw] font-mono text-xs text-casino-muted/80">
        Volatility / High
      </p>

      {/* Ticker */}
      <div
        ref={tickerRef}
        className="absolute bottom-[2vh] left-0 w-[200%] font-serif text-4xl md:text-6xl text-casino-gold/[0.15] whitespace-nowrap pointer-events-none"
      >
        Hit the Jackpot — Hit the Jackpot — Hit the Jackpot — Hit the Jackpot — Hit the Jackpot —
      </div>
    </section>
  );
}
