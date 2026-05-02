import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Instagram, Twitter } from 'lucide-react';

interface FooterSectionProps {
  onReserve?: () => void;
}

export default function FooterSection({ onReserve }: FooterSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const footerLine = footerLineRef.current;
    if (!section || !content || !footerLine) return;

    gsap.fromTo(
      content,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    gsap.fromTo(
      footerLine,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerLine,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section || st.vars.trigger === footerLine) st.kill();
      });
    };
  }, []);

  return (
    <footer
      ref={sectionRef}
      id="contact"
      className="relative w-full bg-casino-charcoal"
      style={{ zIndex: 100 }}
    >
      <div ref={contentRef} className="px-[6vw] py-[8vh]">
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Left: CTA */}
          <div id="reserve">
            <h2 className="font-serif text-4xl md:text-5xl text-casino-ivory uppercase mb-4" style={{ textShadow: '0 0 20px rgba(176,38,255,0.4)' }}>
              Start Spinning Today
            </h2>
            <p className="text-casino-muted text-base max-w-md mb-8 leading-relaxed">
              Join the ultimate high-stakes online experience. Claim your welcome bonus and hit the jackpot.
            </p>
            <button
              onClick={onReserve}
              className="inline-block px-8 py-4 bg-casino-neon/20 border border-casino-neon text-casino-neon rounded-full font-mono text-sm hover:bg-casino-neon hover:text-casino-ink hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all cursor-pointer tracking-widest uppercase"
            >
              Claim Bonus
            </button>
          </div>

          {/* Right: Contact */}
          <div className="md:pl-12">
            <div className="space-y-4">
              <a
                href="mailto:support@cyberslots.club"
                className="flex items-center gap-3 text-casino-muted hover:text-casino-ivory transition-colors"
              >
                <Mail className="w-4 h-4 text-casino-neon" />
                <span className="font-mono text-sm">support@cyberslots.club</span>
              </a>
              <a
                href="tel:+12135550199"
                className="flex items-center gap-3 text-casino-muted hover:text-casino-ivory transition-colors"
              >
                <Phone className="w-4 h-4 text-casino-ember" />
                <span className="font-mono text-sm">+1 (213) 555-0199</span>
              </a>
              <div className="flex items-center gap-3 text-casino-muted">
                <MapPin className="w-4 h-4 text-casino-neon" />
                <span className="font-mono text-sm">Global Online Platform</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-4 mt-8">
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-casino-ivory/20 flex items-center justify-center text-casino-muted hover:text-casino-ivory hover:border-casino-ember transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full border border-casino-ivory/20 flex items-center justify-center text-casino-muted hover:text-casino-ivory hover:border-casino-ember transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer line */}
        <div
          ref={footerLineRef}
          className="h-px bg-casino-ivory/10 mb-8 origin-left"
        />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-casino-muted/60">
            © 2025 Cyber Slots. All rights reserved. 18+ Only.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-mono text-xs text-casino-muted/60 hover:text-casino-ivory transition-colors">
              Privacy
            </a>
            <a href="#" className="font-mono text-xs text-casino-muted/60 hover:text-casino-ivory transition-colors">
              Terms
            </a>
            <a href="#" className="font-mono text-xs text-casino-muted/60 hover:text-casino-ivory transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}
