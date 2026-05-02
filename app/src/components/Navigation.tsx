import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  onReserve: () => void;
}

export default function Navigation({ onReserve }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: 'Events', id: 'events' },
    { label: 'Experience', id: 'experience' },
    { label: 'Membership', id: 'membership' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-casino-ink/65 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-[6vw] py-5">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setMobileOpen(false);
          }}
          className="font-serif text-casino-ivory text-xl tracking-tight hover:opacity-100 opacity-80 transition-opacity"
        >
          Atriom
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className="font-mono text-xs text-casino-muted hover:text-casino-ivory transition-colors tracking-wide uppercase"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={onReserve}
            className="font-mono text-xs px-5 py-2 border border-casino-ember text-casino-ember rounded-full hover:bg-casino-ember hover:text-casino-ivory transition-all uppercase tracking-wide cursor-pointer"
          >
            Reserve
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-casino-ivory p-1 cursor-pointer"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-casino-ink/95 backdrop-blur-lg border-b border-casino-ivory/10 transition-all duration-300 overflow-hidden ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-6 py-8">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className="font-mono text-sm text-casino-muted hover:text-casino-ivory transition-colors tracking-wide uppercase"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              onReserve();
            }}
            className="font-mono text-sm px-6 py-2.5 border border-casino-ember text-casino-ember rounded-full hover:bg-casino-ember hover:text-casino-ivory transition-all uppercase tracking-wide cursor-pointer"
          >
            Reserve
          </button>
        </div>
      </div>
    </nav>
  );
}
