import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function NightUnfoldsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const headline = headlineRef.current;
    const ticker = tickerRef.current;
    if (!section || !image || !headline || !ticker) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=90%',
        pin: true,
        scrub: 0.6,
      },
    });

    // Image entrance
    tl.fromTo(
      image,
      { scale: 1.14, opacity: 0 },
      { scale: 1, opacity: 1, ease: 'none' },
      0
    );

    // Headline entrance
    tl.fromTo(
      headline,
      { y: '22vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0
    );

    // Micro parallax during settle
    tl.fromTo(
      image,
      { y: 0 },
      { y: '-3vh', ease: 'none' },
      0.25
    );

    // EXIT
    tl.fromTo(
      image,
      { scale: 1, opacity: 1 },
      { scale: 1.06, opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      headline,
      { y: 0, opacity: 1 },
      { y: '-14vh', opacity: 0, ease: 'power2.in' },
      0.7
    );

    // Ticker
    tl.fromTo(
      ticker,
      { x: '0%' },
      { x: '-10%', ease: 'none' },
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
      style={{ zIndex: 30 }}
    >
      {/* Full-bleed background */}
      <img
        ref={imageRef}
        src="/images/slot_spins.png"
        alt="Free Spins Bonus"
        className="absolute inset-0 w-full h-full object-cover transition-all duration-[2s] hover:brightness-125 hover:saturate-150"
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,15,0.75) 100%)',
        }}
      />

      {/* Centered headline */}
      <div
        ref={headlineRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-[70vw]"
      >
        <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-casino-neon uppercase mb-4" style={{ textShadow: '0 0 30px rgba(176,38,255,0.8)' }}>
          Endless Free Spins
        </h2>
        <p className="font-mono text-sm text-casino-ivory/90 tracking-wide">
          Trigger the bonus round and watch the multipliers grow.
        </p>
      </div>

      {/* Ticker */}
      <div
        ref={tickerRef}
        className="absolute bottom-[15vh] left-0 w-[200%] font-serif text-4xl md:text-6xl text-casino-neon/[0.15] whitespace-nowrap pointer-events-none"
      >
        Endless Free Spins — Endless Free Spins — Endless Free Spins — Endless Free Spins —
      </div>
    </section>
  );
}
