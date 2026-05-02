import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function PhilosophySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const text = textRef.current;
    const ticker = tickerRef.current;
    if (!section || !image || !text || !ticker) return;

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
      { scale: 1.10, opacity: 0 },
      { scale: 1, opacity: 1, ease: 'none' },
      0
    );

    // Micro drift during settle
    tl.fromTo(
      image,
      { y: 0 },
      { y: '-3vh', ease: 'none' },
      0.25
    );

    // Text entrance
    tl.fromTo(
      text,
      { y: '16vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.08
    );

    // EXIT
    tl.fromTo(
      image,
      { scale: 1, opacity: 1 },
      { scale: 1.05, opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      text,
      { y: 0, opacity: 1 },
      { y: '12vh', opacity: 0, ease: 'power2.in' },
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
      style={{ zIndex: 70 }}
    >
      {/* Full-bleed background */}
      <img
        ref={imageRef}
        src="/images/slot_win.png"
        alt="Mega win celebration"
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 hover:brightness-110"
      />

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,15,0.75) 0%, rgba(10,10,15,0) 60%)',
        }}
      />

      {/* Text block */}
      <div
        ref={textRef}
        className="absolute left-[6vw] bottom-[10vh] w-[64vw]"
      >
        <p className="font-mono text-xs text-casino-muted mb-3 tracking-widest uppercase">
          Max Payout
        </p>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-casino-gold uppercase leading-[1.1]" style={{ textShadow: '0 0 15px rgba(255, 215, 0, 0.4)' }}>
          The Mega Win Awaits.
        </h2>
      </div>

      {/* Caption */}
      <p className="absolute right-[6vw] bottom-[10vh] font-mono text-xs text-casino-muted/80">
        Volatility / Extreme
      </p>

      {/* Ticker */}
      <div
        ref={tickerRef}
        className="absolute bottom-[30vh] left-0 w-[200%] font-serif text-4xl md:text-6xl text-casino-gold/[0.1] whitespace-nowrap pointer-events-none"
      >
        The Mega Win Awaits — The Mega Win Awaits — The Mega Win Awaits — The Mega Win Awaits —
      </div>
    </section>
  );
}
