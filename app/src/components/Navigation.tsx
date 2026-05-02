import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface NavigationProps {
  onReserve: () => void;
}

export default function Navigation({ onReserve }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Active section tracking via ScrollTrigger
  useEffect(() => {
    const sectionIds = ['play', 'bet', 'philosophy', 'contact'];

    // Small delay to ensure DOM sections are mounted
    const timer = setTimeout(() => {
      triggersRef.current.forEach((st) => st.kill());
      triggersRef.current = [];

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => setActiveId(id),
          onEnterBack: () => setActiveId(id),
        });

        triggersRef.current.push(st);
      });
    }, 600);

    return () => {
      clearTimeout(timer);
      triggersRef.current.forEach((st) => st.kill());
      triggersRef.current = [];
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, href?: string) => {
    if (href) {
      // Allow default navigation for href links
      return;
    }
    
    e.preventDefault();
    setMobileOpen(false);
    
    // If we're not on the home page and trying to navigate to a section, go to home first
    if (window.location.pathname !== '/' && id) {
      window.location.href = `/#${id}`;
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  const navItems = [
    { label: 'Play Now', id: 'play' },
    { label: 'High Stakes', id: 'bet' },
    { label: 'Superpowers', id: 'superpowers', href: '/superpowers' },
    { label: 'Support', id: 'contact' },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-casino-ink/80 backdrop-blur-xl border-b border-casino-neon/10' : 'bg-transparent'
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent">
        <div
          className="h-full bg-casino-neon transition-[width] duration-100 ease-out [box-shadow:0_0_8px_rgba(176,38,255,0.8)]"
          style={{ width: `${progress * 100}%` } as React.CSSProperties}
        />
      </div>

      <div className="flex items-center justify-between px-[6vw] py-5">
        <a
          href="/"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
              setMobileOpen(false);
            }
          }}
          className="font-serif text-casino-ivory text-xl tracking-tight hover:opacity-100 opacity-80 transition-opacity uppercase [text-shadow:0_0_10px_rgba(176,38,255,0.8)]"
        >
          Cyber Slots
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={item.href || `/#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id, item.href)}
                className={`relative font-mono text-sm tracking-wide uppercase transition-all duration-300 ${
                  isActive ? 'text-casino-neon [text-shadow:0_0_10px_rgba(176,38,255,0.8)]' : 'text-casino-muted hover:text-casino-ivory hover:[text-shadow:0_0_8px_rgba(255,255,255,0.6)]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-px bg-casino-neon [box-shadow:0_0_6px_rgba(176,38,255,0.8)]" />
                )}
              </a>
            );
          })}
          <button
            onClick={onReserve}
            className="font-mono text-sm px-6 py-2 bg-casino-neon/10 border border-casino-neon text-casino-neon rounded-full hover:bg-casino-neon hover:text-casino-ink hover:shadow-[0_0_20px_rgba(176,38,255,0.8)] transition-all uppercase tracking-wide cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-casino-ivory p-1 cursor-pointer"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen ? 'true' : 'false'}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-casino-ink/95 backdrop-blur-lg border-b border-casino-ivory/10 transition-all duration-300 overflow-hidden ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!mobileOpen ? 'true' : 'false'}
      >
        <div className="flex flex-col items-center gap-6 py-8">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={item.href || `/#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id, item.href)}
                className={`font-mono text-sm tracking-wide uppercase transition-colors ${
                  isActive ? 'text-casino-neon' : 'text-casino-muted hover:text-casino-ivory'
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <button
            onClick={() => {
              setMobileOpen(false);
              onReserve();
            }}
            className="font-mono text-sm px-6 py-2.5 bg-casino-neon/10 border border-casino-neon text-casino-neon rounded-full hover:bg-casino-neon hover:text-casino-ink hover:shadow-[0_0_15px_rgba(0,243,255,0.6)] transition-all uppercase tracking-wide cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}
