import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ClosingStatementSectionProps {
  onReserve?: () => void;
}

export default function ClosingStatementSection({ onReserve }: ClosingStatementSectionProps) {
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

    // Image from left
    tl.fromTo(
      image,
      { x: '-40vw', opacity: 0 },
      { x: 0, opacity: 1, ease: 'none' },
      0
    );

    // Headline entrance
    tl.fromTo(
      text.querySelector('h2'),
      { y: '18vh', opacity: 0 },
      { y: 0, opacity: 1, ease: 'none' },
      0.06
    );

    // Body + CTA entrance
    tl.fromTo(
      text.querySelectorAll('.cta-animate'),
      { y: '10vh', opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.04, ease: 'none' },
      0.12
    );

    // EXIT
    tl.fromTo(
      image,
      { y: 0, opacity: 1 },
      { y: '16vh', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      text.querySelector('h2'),
      { x: 0, opacity: 1 },
      { x: '10vw', opacity: 0, ease: 'power2.in' },
      0.7
    );

    tl.fromTo(
      text.querySelectorAll('.cta-animate'),
      { opacity: 1 },
      { opacity: 0, ease: 'power2.in' },
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
      style={{ zIndex: 80 }}
    >
      {/* Left image */}
      <img
        ref={imageRef}
        src="/images/slot_neon.png"
        alt="Neon slots"
        className="absolute left-[6vw] top-[18vh] w-[34vw] h-[46vh] object-cover rounded-xl shadow-card transition-all duration-700 hover:brightness-110"
      />

      {/* Right text block */}
      <div
        ref={textRef}
        className="absolute left-[46vw] top-[22vh] w-[48vw]"
      >
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-casino-gold uppercase leading-[1.1] mb-6" style={{ textShadow: '0 0 15px rgba(255, 215, 0, 0.4)' }}>
          Are You Ready<br />
          To Spin?
        </h2>
        <p className="cta-animate text-base md:text-lg text-casino-muted mb-8 max-w-md leading-relaxed">
          Claim your welcome bonus and start spinning our premium slots today.
        </p>
        <button
          onClick={onReserve}
          className="cta-animate inline-block px-7 py-3 bg-casino-ember text-casino-ivory rounded-full font-mono text-sm hover:bg-casino-ember/80 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,127,0.4)] transition-all duration-300 cursor-pointer"
        >
          Play Now
        </button>
      </div>

      {/* Ticker */}
      <div
        ref={tickerRef}
        className="absolute bottom-[5vh] left-0 w-[200%] font-serif text-4xl md:text-6xl text-casino-gold/[0.15] whitespace-nowrap pointer-events-none"
      >
        Are You Ready To Spin? — Are You Ready To Spin? — Are You Ready To Spin? — Are You Ready To Spin? —
      </div>
    </section>
  );
}
