import { Crown, LockKeyhole, Mail, MessageCircle, ShieldCheck } from 'lucide-react';

interface FooterSectionProps {
  onReserve?: () => void;
}

export default function FooterSection({ onReserve }: FooterSectionProps) {
  return (
    <footer id="contact" className="relative z-[100] border-t border-casino-ivory/10 bg-[#0b0714]">
      <div className="mx-auto max-w-7xl px-[6vw] py-16">
         <div className="grid grid-cols-1 gap-6 border-b border-casino-ivory/10 pb-8 lg:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr] lg:gap-10 lg:pb-12">
          <div>
            <div className="inline-flex items-center gap-2 font-serif text-2xl text-casino-ivory">
              <Crown className="h-5 w-5 text-casino-gold" />
              <span>Cyber<span className="text-casino-gold">Slots</span></span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-casino-muted">
              The ultimate high-stakes demo entertainment experience. Play responsibly, win spectacularly.
            </p>
             <button
               onClick={onReserve}
               className="mt-5 inline-flex items-center gap-2 rounded-full bg-casino-ember px-4 py-2 font-mono text-xs uppercase tracking-widest text-casino-ivory transition hover:shadow-[0_0_20px_rgba(255,0,127,0.32)] sm:px-5 sm:py-3"
             >
               <ShieldCheck className="h-4 w-4" />
              Join Now
            </button>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-casino-ivory">Games</h3>
            <div className="mt-5 flex flex-col gap-3">
              {['Slots', 'Live Casino', 'Jackpots', 'New Releases', 'Demo Cabinet'].map((item) => (
                <a key={item} href={item === 'Demo Cabinet' ? '#play' : '#games'} className="text-sm text-casino-muted transition hover:text-casino-gold">
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-casino-ivory">Support</h3>
            <div className="mt-5 flex flex-col gap-3">
              {['Help Center', 'Contact Us', 'Responsible Gaming', 'FAQ', 'Live Chat'].map((item) => (
                <a key={item} href={item === 'Contact Us' ? 'mailto:support@cyberslots.club' : '#contact'} className="text-sm text-casino-muted transition hover:text-casino-gold">
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-casino-ivory">Legal</h3>
            <div className="mt-5 flex flex-col gap-3">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Licenses', 'AML Policy'].map((item) => (
                <a key={item} href="#contact" className="text-sm text-casino-muted transition hover:text-casino-gold">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

         <div className="flex flex-col justify-between gap-4 pt-6 text-casino-muted/70 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-5">
            {[
              { icon: LockKeyhole, text: 'SSL Encrypted' },
              { icon: ShieldCheck, text: 'Demo Only' },
              { icon: MessageCircle, text: 'Live Chat' },
              { icon: Mail, text: '18+ Only' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-2 font-mono text-xs">
                <Icon className="h-4 w-4" />
                {text}
              </span>
            ))}
          </div>
          <p className="font-mono text-xs">© 2026 CyberSlots. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
