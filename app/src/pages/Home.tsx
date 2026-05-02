import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
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
import FooterSection from '../sections/FooterSection';

const PlayableSlotSection = lazy(() => import('../sections/PlayableSlotSection'));
const LeaderboardSection = lazy(() => import('../sections/LeaderboardSection'));

const responsiveWidths = [480, 768, 1024];

const webpSrcSet = (imageBase: string) =>
  responsiveWidths
    .map((width) => `/images/generated/${imageBase}-${width}.webp ${width}w`)
    .join(', ');

const scrollBehavior = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

const featuredGames = [
  {
    id: 'neon',
    title: 'Neon Reels',
    imageBase: 'slot_neon',
    fallback: '/images/slot_neon.png',
    tag: '5 Lines',
    copy: 'Classic 3x3 energy with Crown tickets, streak meter, and Star wild upgrades.',
    layout: '3x3 reels',
    volatility: 'Fast',
    bonus: '3 Crowns award free-spin tickets; streak wins activate 2x wild mode.',
  },
  {
    id: 'cascade',
    title: 'Cascade Nexus',
    imageBase: 'slot_symbols',
    fallback: '/images/slot_symbols.png',
    tag: 'Clusters',
    copy: 'A 5x5 arcade grid where symbol clusters pop into rising cascade multipliers.',
    layout: '5x5 cluster board',
    volatility: 'Swingy',
    bonus: '5+ connected symbols pay, cascades climb, and 3 Crowns unlock free drops.',
  },
  {
    id: 'vault',
    title: 'Vault Lock',
    imageBase: 'slot_jackpot',
    fallback: '/images/slot_jackpot.png',
    tag: 'Hold & Spin',
    copy: 'Cash symbols lock into a vault board, respins reset, and full boards chase a mega jackpot.',
    layout: '3x5 hold board',
    volatility: 'Bonus heavy',
    bonus: 'Cash and locks stick; 6 locked cells start respins; 15 cells trigger mega payout.',
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

interface ResponsiveImageProps {
  imageBase: string;
  fallback: string;
  alt: string;
  sizes: string;
  className?: string;
  pictureClassName?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

function ResponsiveImage({
  imageBase,
  fallback,
  alt,
  sizes,
  className,
  pictureClassName,
  loading = 'lazy',
  fetchPriority = 'auto',
}: ResponsiveImageProps) {
  return (
    <picture className={pictureClassName}>
      <source type="image/webp" srcSet={webpSrcSet(imageBase)} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </picture>
  );
}

interface LazyLandingSectionProps {
  sectionId: string;
  label: string;
  children: ReactNode;
  minHeightClassName: string;
  rootMargin?: string;
}

function SectionPlaceholder({
  id,
  label,
  className,
}: {
  id?: string;
  label: string;
  className: string;
}) {
  return (
    <section
      id={id}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      aria-label={label}
    >
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(circle_at_50%_50%,_rgba(176,38,255,0.06)_0%,_transparent_60%)]" />
      <div className="relative z-10 h-8 w-8 animate-spin rounded-full border-2 border-casino-cyber/25 border-t-casino-cyber" />
    </section>
  );
}

function LazyLandingSection({
  sectionId,
  label,
  children,
  minHeightClassName,
  rootMargin = '700px 0px',
}: LazyLandingSectionProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(
    () => typeof window !== 'undefined' && !('IntersectionObserver' in window)
  );

  useEffect(() => {
    if (shouldLoad) return;

    const target = anchorRef.current;
    if (!target) return;

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [rootMargin, shouldLoad]);

  return (
    <div ref={anchorRef} id={!shouldLoad ? sectionId : undefined}>
      {shouldLoad ? (
        <Suspense
          fallback={
            <SectionPlaceholder
              id={sectionId}
              label={label}
              className={minHeightClassName}
            />
          }
        >
          {children}
        </Suspense>
      ) : (
        <SectionPlaceholder label={label} className={minHeightClassName} />
      )}
    </div>
  );
}

export default function Home() {
  const [reserveOpen, setReserveOpen] = useState(false);
  const [activePreview, setActivePreview] = useState(featuredGames[0].id);

  const selectedGame = featuredGames.find((game) => game.id === activePreview) || featuredGames[0];

  const scrollToPlay = () => {
    document.getElementById('play')?.scrollIntoView({ behavior: scrollBehavior() });
  };

  const selectFeaturedGame = (gameId: string) => {
    setActivePreview(gameId);
    try {
      localStorage.setItem('casino_active_slot', gameId);
    } catch {
      // localStorage unavailable
    }
    window.dispatchEvent(new CustomEvent('casino:slot-selected', { detail: { slotId: gameId } }));
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-casino-ink text-casino-ivory">
      <Navigation onReserve={() => setReserveOpen(true)} />
      <ReservationModal open={reserveOpen} onOpenChange={setReserveOpen} />

      <main>
        <section id="top" className="relative min-h-[92vh] overflow-hidden">
          <ResponsiveImage
            imageBase="slot_hero"
            fallback="/images/slot_hero.png"
            alt="Cyber Slots jackpot cabinet"
            sizes="100vw"
            pictureClassName="absolute inset-0 block h-full w-full"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
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
                ['Featured games', '3', 'Distinct playable slot modes'],
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

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr_1fr_1.15fr]">
              {featuredGames.map((game) => (
                <button
                  key={game.title}
                  onClick={() => selectFeaturedGame(game.id)}
                  className={`group overflow-hidden border bg-casino-charcoal/70 text-left transition ${
                    activePreview === game.id
                      ? 'border-casino-cyber shadow-[0_0_30px_rgba(0,243,255,0.14)]'
                      : 'border-casino-ivory/12 hover:border-casino-gold/40'
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-black">
                    <ResponsiveImage
                      imageBase={game.imageBase}
                      fallback={game.fallback}
                      alt={`${game.title} slot preview`}
                      sizes="(min-width: 768px) 31vw, 100vw"
                      pictureClassName="block h-full w-full"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-serif text-2xl uppercase text-casino-ivory">{game.title}</h3>
                      <span className="shrink-0 border border-casino-gold/40 px-2 py-1 font-mono text-[11px] uppercase tracking-widest text-casino-gold">
                        {game.tag}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-casino-muted">{game.copy}</p>
                  </div>
                </button>
              ))}
              <aside className="border border-casino-cyber/25 bg-casino-ink/80 p-5">
                <p className="font-mono text-xs uppercase tracking-widest text-casino-cyber">Active Preview</p>
                <h3 className="mt-3 font-serif text-3xl uppercase text-casino-ivory">{selectedGame.title}</h3>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="border border-casino-ivory/12 bg-black/30 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">Layout</p>
                    <p className="mt-1 text-sm text-casino-ivory">{selectedGame.layout}</p>
                  </div>
                  <div className="border border-casino-ivory/12 bg-black/30 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">Volatility</p>
                    <p className="mt-1 text-sm text-casino-ivory">{selectedGame.volatility}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-casino-muted">{selectedGame.bonus}</p>
                <button
                  onClick={scrollToPlay}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-casino-cyber px-5 py-3 font-mono text-xs uppercase tracking-widest text-casino-ink transition hover:bg-casino-gold focus:outline-none focus:ring-2 focus:ring-casino-cyber"
                >
                  Play This Slot
                  <ArrowRight className="h-4 w-4" />
                </button>
              </aside>
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
              { icon: BadgeCheck, label: 'Mission Streak', copy: 'Win streaks activate temporary boosts' },
              { icon: Clock3, label: 'Free Tickets', copy: 'Signup picks and scatters feed demo spins' },
              { icon: Trophy, label: 'Mystery Meter', copy: 'Losses build toward surprise rewards' },
              { icon: CircleDollarSign, label: 'Multiplier Pass', copy: 'Selected bonuses double upcoming wins' },
            ].map(({ icon: Icon, label, copy }) => (
              <div key={label} className="border-b border-casino-ivory/12 p-5 md:border-b-0 md:border-r md:last:border-r-0">
                <Icon className="h-6 w-6 text-casino-gold" />
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-casino-ivory">{label}</p>
                <p className="mt-2 text-sm leading-6 text-casino-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative bg-[#0d0918] px-[6vw] py-16">
          <div className="mx-auto max-w-7xl border border-casino-neon/20 bg-casino-ink/80 p-6 md:p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-casino-neon">Bonus Lab</p>
                <h2 className="mt-3 font-serif text-4xl uppercase text-casino-ivory md:text-5xl">
                  Rewards That Touch The Reels
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-casino-muted">
                Bonus choices are no longer cosmetic: credits hit the wallet, spin tickets power free rounds, and multiplier passes change the next playable results.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { title: 'Active Mission', value: '3-win streak', copy: 'Unlock 2x wild boost in Neon Reels.' },
                { title: 'Current Boost', value: '2x pass', copy: 'Signup multiplier passes apply inside the cabinet.' },
                { title: 'Free Tickets', value: '10 spins', copy: 'Pick the arcade spin bonus or earn scatters.' },
                { title: 'Mystery Meter', value: '0-100%', copy: 'Losing spins fill it toward tickets, boosts, or credits.' },
              ].map((item) => (
                <article key={item.title} className="border border-casino-ivory/12 bg-black/25 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">{item.title}</p>
                  <h3 className="mt-2 font-serif text-3xl text-casino-gold">{item.value}</h3>
                  <p className="mt-3 text-sm leading-6 text-casino-muted">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LazyLandingSection
          sectionId="play"
          label="Loading playable slot"
          minHeightClassName="min-h-screen bg-casino-ink"
        >
          <PlayableSlotSection sectionId="play" />
        </LazyLandingSection>
        <LazyLandingSection
          sectionId="jackpots"
          label="Loading leaderboard"
          minHeightClassName="min-h-[70vh] bg-casino-charcoal"
        >
          <LeaderboardSection sectionId="jackpots" />
        </LazyLandingSection>

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
