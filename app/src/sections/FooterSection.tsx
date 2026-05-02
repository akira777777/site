import { Mail, MessageCircle, ShieldCheck } from 'lucide-react';

interface FooterSectionProps {
  onReserve?: () => void;
}

export default function FooterSection({ onReserve }: FooterSectionProps) {
  return (
    <footer id="contact" className="relative z-[100] bg-casino-charcoal">
      <div className="mx-auto max-w-7xl px-[6vw] py-14">
        <div className="grid grid-cols-1 gap-10 border-b border-casino-ivory/10 pb-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-casino-cyber">Cyber Slots</p>
            <h2 className="mt-3 font-serif text-4xl uppercase text-casino-ivory md:text-5xl">
              Keep The Lobby Open
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-casino-muted">
              A focused slot landing page with clear bonus entry, playable demo, and live ranking hooks.
            </p>
            <button
              onClick={onReserve}
              className="mt-7 inline-flex items-center gap-2 bg-casino-cyber px-5 py-3 font-mono text-sm uppercase tracking-widest text-casino-ink transition hover:bg-casino-gold"
            >
              <ShieldCheck className="h-4 w-4" />
              Claim Starter Credits
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="mailto:support@cyberslots.club"
              className="border border-casino-ivory/10 bg-casino-ink/55 p-5 text-casino-muted transition hover:border-casino-cyber/40 hover:text-casino-ivory"
            >
              <Mail className="h-5 w-5 text-casino-cyber" />
              <p className="mt-4 font-mono text-xs uppercase tracking-widest">Support</p>
              <p className="mt-2 break-all text-sm">support@cyberslots.club</p>
            </a>
            <a
              href="#top"
              className="border border-casino-ivory/10 bg-casino-ink/55 p-5 text-casino-muted transition hover:border-casino-gold/40 hover:text-casino-ivory"
            >
              <MessageCircle className="h-5 w-5 text-casino-gold" />
              <p className="mt-4 font-mono text-xs uppercase tracking-widest">Lobby</p>
              <p className="mt-2 text-sm">Return to the first screen</p>
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 pt-7 text-casino-muted/70 md:flex-row md:items-center">
          <p className="font-mono text-xs">© 2026 Cyber Slots. Demo entertainment experience. 18+ only.</p>
          <div className="flex gap-5">
            <a href="#" className="font-mono text-xs uppercase tracking-widest transition hover:text-casino-ivory">
              Privacy
            </a>
            <a href="#" className="font-mono text-xs uppercase tracking-widest transition hover:text-casino-ivory">
              Terms
            </a>
            <a href="#" className="font-mono text-xs uppercase tracking-widest transition hover:text-casino-ivory">
              Responsible Play
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
