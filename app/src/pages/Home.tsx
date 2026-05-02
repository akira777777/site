import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Crown,
  Dice5,
  Gift,
  LockKeyhole,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import ReservationModal from '../components/ReservationModal';
import PlayableSlotSection from '../sections/PlayableSlotSection';
import LeaderboardSection from '../sections/LeaderboardSection';
import FooterSection from '../sections/FooterSection';

const featuredGames = [
  {
    title: 'Neon Reels',
    image: '/images/slot_neon.png',
    tag: '96.8% RTP',
    copy: 'Fast rounds, bright symbols, and volatile bonus ladders.',
  },
  {
    title: 'Gold Vault',
    image: '/images/slot_jackpot.png',
    tag: 'Mega Drops',
    copy: 'Stacked wilds, vault multipliers, and jackpot chases.',
  },
  {
    title: 'Cyber Fruits',
    image: '/images/slot_symbols.png',
    tag: 'New',
    copy: 'Classic slot rhythm with modern boosts and free spins.',
  },
];

const perks = [
  { icon: Gift, title: 'Welcome Boost', value: '1,000 credits', copy: 'Start with a clean balance and bonus picks.' },
  { icon: Zap, title: 'Instant Play', value: 'No download', copy: 'Open the lobby and spin from any modern browser.' },
  { icon: LockKeyhole, title: 'Secure Wallet', value: 'Protected', copy: 'Session storage, clear controls, and visible balances.' },
];

const steps = [
  'Create a player name',
  'Choose a bonus',
  'Spin the demo cabinet',
  'Climb the leaderboard',
];

export default function Home() {
  const [reserveOpen, setReserveOpen] = useState(false);

  const scrollToPlay = () => {
    document.getElementById('play')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-casino-ink text-casino-ivory">
      <Navigation onReserve={() => setReserveOpen(true)} />
      <ReservationModal open={reserveOpen} onOpenChange={setReserveOpen} />

      <main>
        <section id="top" className="relative min-h-[92vh] overflow-hidden">
          <img
            src="/images/slot_hero.png"
            alt="Cyber Slots jackpot cabinet"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,6,18,0.96)_0%,rgba(8,6,18,0.78)_44%,rgba(8,6,18,0.22)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(0deg,#080612_0%,rgba(8,6,18,0)_100%)]" />

          <div className="relative z-10 flex min-h-[92vh] max-w-7xl flex-col justify-end px-[6vw] pb-10 pt-32 md:pb-14">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 border border-casino-cyber/30 bg-casino-cyber/10 px-3 py-2 text-xs uppercase tracking-widest text-casino-cyber">
                <Sparkles className="h-4 w-4" />
                Live demo lobby
              </div>
              <h1 className="max-w-4xl font-serif text-[clamp(3.7rem,9vw,8.8rem)] uppercase leading-[0.9] text-casino-ivory [text-shadow:0_0_34px_rgba(176,38,255,0.4)]">
                Cyber Slots
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-casino-muted md:text-xl">
                A sharper casino landing experience with a playable slot, live win energy, and a reward path that feels immediate from the first click.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setReserveOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-casino-cyber px-6 py-4 font-mono text-sm uppercase tracking-widest text-casino-ink transition hover:bg-casino-gold focus:outline-none focus:ring-2 focus:ring-casino-cyber"
                >
                  Claim Bonus
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={scrollToPlay}
                  className="inline-flex items-center justify-center gap-2 border border-casino-ivory/20 bg-casino-ink/45 px-6 py-4 font-mono text-sm uppercase tracking-widest text-casino-ivory backdrop-blur transition hover:border-casino-gold hover:text-casino-gold focus:outline-none focus:ring-2 focus:ring-casino-gold"
                >
                  Play Demo
                  <Dice5 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-12 grid max-w-4xl grid-cols-1 border border-casino-ivory/12 bg-casino-ink/70 backdrop-blur md:grid-cols-3">
              {[
                ['Demo balance', '1,000', 'Free credits on signup'],
                ['Featured games', '12+', 'Slots, jackpots, and bonuses'],
                ['Big-win feed', 'Live', 'Rotating leaderboard action'],
              ].map(([label, value, copy]) => (
                <div key={label} className="border-b border-casino-ivory/12 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                  <p className="font-mono text-xs uppercase tracking-widest text-casino-muted">{label}</p>
                  <p className="mt-2 font-serif text-4xl text-casino-gold">{value}</p>
                  <p className="mt-1 text-sm text-casino-muted">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="games" className="relative bg-casino-ink px-[6vw] py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-casino-cyber">Featured Lobby</p>
                <h2 className="mt-3 font-serif text-4xl uppercase text-casino-ivory md:text-6xl">
                  Games With A Pulse
                </h2>
              </div>
              <p className="max-w-md text-base leading-7 text-casino-muted">
                The page now sells the actual experience first: glossy game art, readable value, and a direct path into the playable cabinet.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {featuredGames.map((game) => (
                <article key={game.title} className="group overflow-hidden border border-casino-ivory/12 bg-casino-charcoal/70">
                  <div className="aspect-[4/3] overflow-hidden bg-black">
                    <img
                      src={game.image}
                      alt={`${game.title} slot preview`}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-serif text-3xl uppercase text-casino-ivory">{game.title}</h3>
                      <span className="shrink-0 border border-casino-gold/40 px-2 py-1 font-mono text-[11px] uppercase tracking-widest text-casino-gold">
                        {game.tag}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-casino-muted">{game.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="rewards" className="relative bg-[#0d0918] px-[6vw] py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-casino-ember">Rewards</p>
              <h2 className="mt-3 font-serif text-4xl uppercase text-casino-ivory md:text-6xl">
                Built For The First Spin
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-casino-muted">
                Every CTA points somewhere useful: claim a bonus, test the game, or inspect live rankings. The landing page now behaves like a product, not a poster.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {steps.map((step, index) => (
                  <div key={step} className="border border-casino-ivory/12 bg-casino-ink/60 p-4">
                    <p className="font-mono text-xs text-casino-gold">0{index + 1}</p>
                    <p className="mt-2 text-sm font-medium text-casino-ivory">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {perks.map(({ icon: Icon, title, value, copy }) => (
                <article key={title} className="border border-casino-ivory/12 bg-casino-ink p-5">
                  <Icon className="h-8 w-8 text-casino-cyber" />
                  <p className="mt-6 font-mono text-xs uppercase tracking-widest text-casino-muted">{title}</p>
                  <h3 className="mt-2 font-serif text-3xl text-casino-gold">{value}</h3>
                  <p className="mt-3 text-sm leading-6 text-casino-muted">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-casino-ink px-[6vw] py-16">
          <div className="mx-auto grid max-w-7xl grid-cols-1 border border-casino-ivory/12 md:grid-cols-4">
            {[
              { icon: BadgeCheck, label: 'Fair demo flow', copy: 'Transparent credits and reset controls' },
              { icon: Clock3, label: 'Fast rounds', copy: 'Short spins with clear win feedback' },
              { icon: Trophy, label: 'Rank chase', copy: 'Live table keeps the page moving' },
              { icon: CircleDollarSign, label: 'Bonus clarity', copy: 'No buried first action' },
            ].map(({ icon: Icon, label, copy }) => (
              <div key={label} className="border-b border-casino-ivory/12 p-5 md:border-b-0 md:border-r md:last:border-r-0">
                <Icon className="h-6 w-6 text-casino-gold" />
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-casino-ivory">{label}</p>
                <p className="mt-2 text-sm leading-6 text-casino-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <PlayableSlotSection />
        <LeaderboardSection />

        <section className="relative bg-[#0d0918] px-[6vw] py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 border border-casino-neon/25 bg-casino-ink/80 p-6 md:grid-cols-[1fr_auto] md:p-8">
            <div>
              <div className="mb-3 flex items-center gap-3 text-casino-gold">
                <Crown className="h-6 w-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Final call</span>
              </div>
              <h2 className="font-serif text-4xl uppercase text-casino-ivory md:text-6xl">
                Enter The Lobby
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-casino-muted">
                Claim the starter bonus, spin the playable cabinet, and use the leaderboard as the next reason to keep exploring.
              </p>
            </div>
            <button
              onClick={() => setReserveOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-casino-gold px-6 py-4 font-mono text-sm uppercase tracking-widest text-casino-ink transition hover:bg-casino-cyber focus:outline-none focus:ring-2 focus:ring-casino-gold"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <FooterSection onReserve={() => setReserveOpen(true)} />

      <div className="pointer-events-none fixed inset-0 z-[999] opacity-[0.045] noise-overlay" />
    </div>
  );
}
