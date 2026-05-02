import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function LifestyleSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const panel = panelRef.current;
    const headline = headlineRef.current;
    const ticker = tickerRef.current;
    if (!section || !image || !panel || !headline || !ticker) return;

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

    // Image from left
    tl.fromTo(
      image,
      { x: '-40vw', scale: 1.06, opacity: 0 },
      { x: 0, scale: 1, opacity: 1, ease: 'none' },
      0
    );

    // Panel from right
    tl.fromTo(
      panel,
      { x: '40vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0
    );

    // Headline lines
    tl.fromTo(
      headline,
      { y: '12vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.08
    );

    // EXIT
    tl.fromTo(
      image,
      { x: 0, opacity: 1 },
      { x: '-18vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      panel,
      { x: 0, opacity: 1 },
      { x: '18vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      headline,
      { y: 0, opacity: 1 },
      { y: '10vh', opacity: 0, ease: 'power2.in' },
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
      className=" z-[]"
    >
      {/* Left image */}
      <img
        ref={imageRef}
        src="/images/slot_machine.png"
        alt="Slot machine spinning"
        loading="lazy"
        decoding="async"
        className="absolute left-0 top-0 w-[62vw] h-full object-cover transition-all duration-700 hover:brightness-110"
      />

      {/* Right dark panel */}
      <div
        ref={panelRef}
        className="absolute left-[62vw] top-0 w-[38vw] h-full bg-casino-ink shadow-panel"
      />

      {/* Headline on right panel */}
      <h2
        ref={headlineRef}
        className="absolute left-[70vw] top-[30vh] w-[24vw] font-serif text-4xl md:text-5xl lg:text-6xl text-casino-cyber uppercase leading-[1.1]"
      >
        Spin<br />
        Boldly.<br />
        Win<br />
        Big.
      </h2>

      {/* Caption */}
      <p className="absolute left-[4vw] bottom-[6vh] font-mono text-xs text-casino-muted/80">
        RTP / 96.5%
      </p>

      {/* Ticker */}
      <div
        ref={tickerRef}
        className="absolute bottom-[3vh] left-0 w-[200%] font-serif text-4xl md:text-6xl text-casino-cyber/[0.08] whitespace-nowrap pointer-events-none"
      >
        Spin Boldly — Spin Boldly — Spin Boldly — Spin Boldly —
      </div>
    </section>
  );
}
