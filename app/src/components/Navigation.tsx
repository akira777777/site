import { useEffect, useState } from 'react';
import { Crown, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

interface NavigationProps {
  onReserve: () => void;
}

interface NavItem {
  label: string;
  id: string;
  href?: string;
}

const navItems: NavItem[] = [
  { label: 'Games', id: 'games' },
  { label: 'Live', id: 'live' },
  { label: 'Promos', id: 'rewards' },
  { label: 'VIP', id: 'vip' },
];

const scrollBehavior = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

export default function Navigation({ onReserve }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, href?: string) => {
    setMobileOpen(false);

    if (href) return;

    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior() }), 60);
      return;
    }

    document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior() });
  };

  return (
    <nav
      className={`fixed left-0 top-0 z-[1000] w-full transition ${
        scrolled ? 'border-b border-casino-ivory/10 bg-casino-ink/88 backdrop-blur-xl' : 'bg-casino-ink/5 backdrop-blur-sm'
      }`}
    >
      <div className="flex items-center justify-between px-[6vw] py-5">
        <a
          href="/"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: scrollBehavior() });
            }
            setMobileOpen(false);
          }}
          className="group inline-flex items-center gap-2 font-serif text-2xl text-casino-ivory"
        >
          <Crown className="h-5 w-5 text-casino-gold transition group-hover:scale-110" />
          <span>Cyber<span className="text-casino-gold">Slots</span></span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => {
            const isActive = item.href && location.pathname === item.href;
            return (
              <a
                key={item.id}
                href={item.href || `/#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id, item.href)}
                className={`font-mono text-xs uppercase tracking-widest transition ${
                  isActive ? 'text-casino-gold' : 'text-casino-muted hover:text-casino-gold'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={onReserve}
            className="font-mono text-xs uppercase tracking-widest text-casino-muted transition hover:text-casino-ivory"
          >
            Sign In
          </button>
          <button
            onClick={onReserve}
            className="inline-flex items-center gap-2 rounded-full bg-casino-ember px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-casino-ivory transition hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,127,0.36)]"
          >
            Join Now
          </button>
        </div>

        <button
          className="text-casino-ivory lg:hidden"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-casino-ivory/10 bg-casino-ink/96 transition-all lg:hidden ${
          mobileOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1 px-[6vw] py-4">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href || `/#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id, item.href)}
              className="py-3 font-mono text-sm uppercase tracking-widest text-casino-muted transition hover:text-casino-ivory"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              onReserve();
            }}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-casino-ember px-4 py-3 font-mono text-sm uppercase tracking-widest text-casino-ivory"
          >
            Join Now
          </button>
        </div>
      </div>
    </nav>
  );
}
