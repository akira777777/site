import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  CircleDollarSign,
  Crown,
  Dice5,
  Gamepad2,
  Gift,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import FooterSection from '../sections/FooterSection';

const loadPlayableSlotSection = () => import('../sections/PlayableSlotSection');
const loadLeaderboardSection = () => import('../sections/LeaderboardSection');
const PlayableSlotSection = lazy(loadPlayableSlotSection);
const LeaderboardSection = lazy(loadLeaderboardSection);
const ReservationModal = lazy(() => import('../components/ReservationModal'));

const responsiveWidths = [480, 768, 1024];

const webpSrcSet = (imageBase: string) =>
  responsiveWidths
    .map((width) => `/images/generated/${imageBase}-${width}.webp ${width}w`)
    .join(', ');

const avifSrcSet = (imageBase: string) =>
  responsiveWidths
    .map((width) => `/images/generated/${imageBase}-${width}.avif ${width}w`)
    .join(', ');

const scrollBehavior = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

const featuredGames = [
  {
    id: 'egypt',
    title: 'Egypt Fire Demo',
    imageBase: 'slot_bonus',
    fallback: '/images/slot_bonus.png',
    tag: 'Hold & Win',
    category: 'Egypt',
    rating: '4.9',
    copy: 'Fireball cash symbols, scarab power, respins, and a Royal demo jackpot chase.',
    layout: '5x4 / 20 lines',
    volatility: 'High',
    bonus: '6+ Fireballs trigger Hold & Win, new cash resets respins to 3, and Scarab Power can multiply collected values.',
  },
  {
    id: 'neon',
    title: 'Neon Reels',
    imageBase: 'slot_neon',
    fallback: '/images/slot_neon.png',
    tag: 'Hot',
    category: 'Slots',
    rating: '4.9',
    copy: 'Crown tickets, streak wilds, and fast three-reel rhythm.',
    layout: '3x3 reels',
    volatility: 'Fast',
    bonus: '3 Crowns award free-spin tickets; streak wins activate 2x wild mode.',
  },
  {
    id: 'cascade',
    title: 'Cascade Nexus',
    imageBase: 'slot_symbols',
    fallback: '/images/slot_symbols.png',
    tag: 'New',
    category: 'Cluster',
    rating: '4.8',
    copy: 'A 5x5 grid where clusters pop into rising cascade multipliers.',
    layout: '5x5 cluster board',
    volatility: 'Swingy',
    bonus: '5+ connected symbols pay, cascades climb, and 3 Crowns unlock free drops.',
  },
  {
    id: 'vault',
    title: 'Vault Lock',
    imageBase: 'slot_jackpot',
    fallback: '/images/slot_jackpot.png',
    tag: 'Jackpot',
    category: 'Hold',
    rating: '4.9',
    copy: 'Cash symbols stick, respins reset, and full boards chase a mega payout.',
    layout: '3x5 hold board',
    volatility: 'Bonus heavy',
    bonus: 'Cash and locks stick; 6 locked cells start respins; 15 cells trigger mega payout.',
  },
];

const arcadeCards = [
  ...featuredGames,
  {
    id: 'coins',
    title: 'Gold Rush 99',
    imageBase: 'slot_coins',
    fallback: '/images/slot_coins.png',
    tag: 'Daily',
    category: 'Coins',
    rating: '4.7',
    copy: 'A coin-heavy bonus chase built for quick demo rounds.',
  },
  {
    id: 'spins',
    title: 'Free Spin Lab',
    imageBase: 'slot_spins',
    fallback: '/images/slot_spins.png',
    tag: 'Promo',
    category: 'Bonus',
    rating: '4.8',
    copy: 'Ticket rewards and multiplier passes feed the playable cabinet.',
  },
  {
    id: 'win',
    title: 'Treasure Cave',
    imageBase: 'slot_win',
    fallback: '/images/slot_win.png',
    tag: 'VIP',
    category: 'Adventure',
    rating: '4.6',
    copy: 'A darker jackpot route with big-win presentation and trophy energy.',
  },
];

const liveFeatures = [
  { icon: Video, title: 'HD Streaming', copy: 'Crystal-clear cabinet action' },
  { icon: Users, title: 'Live Crowd', copy: 'Rotating wins and rankings' },
  { icon: Zap, title: 'Real-Time', copy: 'Immediate spin feedback' },
  { icon: ShieldCheck, title: 'Fair Demo', copy: 'Visible credits and reset' },
];

const promotions = [
  {
    icon: Gift,
    title: 'Welcome Package',
    value: '1,000 credits',
    copy: 'Claim a starter wallet and enter the arcade with a clean balance.',
    accent: 'text-casino-gold',
  },
  {
    icon: Dice5,
    title: 'Free Tickets',
    value: '10 spins',
    copy: 'Choose arcade tickets at signup or earn them from Crown scatters.',
    accent: 'text-casino-ember',
  },
  {
    icon: CircleDollarSign,
    title: 'Multiplier Pass',
    value: '2x boosts',
    copy: 'Multiplier passes double upcoming demo wins inside the cabinet.',
    accent: 'text-casino-cyber',
  },
  {
    icon: Trophy,
    title: 'Mystery Meter',
    value: '0-100%',
    copy: 'Losing spins build toward tickets, credit bursts, or boosts.',
    accent: 'text-casino-neon',
  },
];

const vipTiers = [
  { tier: 'Bronze', points: '0 - 999 pts', color: 'text-amber-600', perks: ['Welcome bonus', 'Weekly cashback 5%', 'Standard support'] },
  { tier: 'Silver', points: '1,000 - 4,999 pts', color: 'text-slate-300', perks: ['All Bronze perks', 'Weekly cashback 8%', 'Priority payouts'] },
  { tier: 'Gold', points: '5,000 - 24,999 pts', color: 'text-casino-gold', perks: ['All Silver perks', 'Personal manager', 'Custom missions'] },
  { tier: 'Diamond', points: '25,000+ pts', color: 'text-casino-cyber', perks: ['All Gold perks', 'VIP events', 'Bespoke bonuses'] },
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
      <source type="image/avif" srcSet={avifSrcSet(imageBase)} sizes={sizes} />
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
      <div className="relative z-10 h-8 w-8 animate-spin rounded-full border-2 border-casino-gold/25 border-t-casino-gold" />
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
    void loadPlayableSlotSection();
    document.getElementById('play')?.scrollIntoView({ behavior: scrollBehavior() });
  };

  const scrollToJackpots = () => {
    void loadLeaderboardSection();
    document.getElementById('jackpots')?.scrollIntoView({ behavior: scrollBehavior() });
  };

  const selectFeaturedGame = (gameId: string) => {
    setActivePreview(gameId);
    void loadPlayableSlotSection();
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
      {reserveOpen && (
        <Suspense fallback={null}>
          <ReservationModal open={reserveOpen} onOpenChange={setReserveOpen} />
        </Suspense>
      )}

      <main>
        <section id="top" className="relative min-h-screen overflow-hidden">
          <ResponsiveImage
            imageBase="slot_hero"
            fallback="/images/slot_hero.png"
            alt="Neon casino arcade lobby"
            sizes="100vw"
            pictureClassName="absolute inset-0 block h-full w-full"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,6,18,0.94)_0%,rgba(8,6,18,0.64)_40%,rgba(8,6,18,0.14)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(255,215,0,0.13),transparent_28%),radial-gradient(circle_at_35%_70%,rgba(255,0,127,0.12),transparent_32%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#080612_0%,rgba(8,6,18,0)_100%)]" />

          <div className="relative z-20 flex min-h-screen max-w-7xl flex-col justify-end px-[6vw] pb-24 pt-28 md:pb-28">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-casino-muted">
                Lobby / Online Slots
              </p>
              <h1 className="mt-5 max-w-4xl font-serif text-[clamp(3.1rem,13vw,8.7rem)] uppercase leading-[0.88] text-casino-gold [text-shadow:0_0_30px_rgba(255,215,0,0.28)]">
                The Ultimate
                <span className="block">Slot</span>
                <span className="block">Experience.</span>
              </h1>
              <p className="mt-7 max-w-md text-base leading-7 text-casino-muted md:text-lg">
                Spin the reels, trigger arcade bonuses, and chase live leaderboard energy from a glossy demo lobby.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={scrollToPlay}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-casino-ember px-7 py-3 font-mono text-sm text-casino-ivory transition hover:bg-casino-ember/80 hover:shadow-[0_0_24px_rgba(255,0,127,0.35)] focus:outline-none focus:ring-2 focus:ring-casino-ember"
                >
                  Start Spinning
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={scrollToJackpots}
                  className="inline-flex items-center justify-center gap-2 font-mono text-sm text-casino-gold underline underline-offset-4 transition hover:text-casino-ivory focus:outline-none focus:ring-2 focus:ring-casino-gold"
                >
                  View Jackpots
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 overflow-hidden">
            <div className="flex w-max animate-ticker items-center gap-10 whitespace-nowrap font-serif text-[clamp(3.5rem,8vw,7.8rem)] uppercase leading-none text-casino-ivory/12">
              {[0, 1].map((item) => (
                <span key={item}>
                  Mega Win - Jackpot - Free Spins - Mega Win - Jackpot - Free Spins -
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="games" className="relative bg-casino-ink px-[6vw] py-20 [contain-intrinsic-size:1000px] [content-visibility:auto]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-casino-ember">Featured Collection</p>
                <h2 className="mt-3 font-serif text-4xl uppercase text-casino-ivory md:text-6xl">
                  Trending Games
                </h2>
              </div>
              <button
                onClick={scrollToPlay}
                className="inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-widest text-casino-muted transition hover:text-casino-gold md:self-auto"
              >
                View All Games
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {arcadeCards.map((game) => {
                const isPlayable = featuredGames.some((item) => item.id === game.id);
                const isActive = activePreview === game.id;
                return (
                  <article
                    key={game.title}
                    className={`group overflow-hidden border bg-casino-charcoal/45 transition ${
                      isActive
                        ? 'border-casino-gold shadow-[0_0_34px_rgba(255,215,0,0.16)]'
                        : 'border-casino-ivory/10 hover:border-casino-gold/40'
                    }`}
                  >
                    <div
                      role={isPlayable ? 'button' : undefined}
                      tabIndex={isPlayable ? 0 : undefined}
                      onClick={() => {
                        if (isPlayable) selectFeaturedGame(game.id);
                      }}
                      onKeyDown={(event) => {
                        if (!isPlayable || (event.key !== 'Enter' && event.key !== ' ')) return;
                        event.preventDefault();
                        selectFeaturedGame(game.id);
                      }}
                      className="block w-full text-left"
                    >
                      <div className="relative aspect-[5/4] overflow-hidden bg-black">
                        <ResponsiveImage
                          imageBase={game.imageBase}
                          fallback={game.fallback}
                          alt={`${game.title} game preview`}
                          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                          pictureClassName="block h-full w-full"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,6,18,0.92)_0%,rgba(8,6,18,0.1)_62%)]" />
                        <div className="absolute left-4 top-4 rounded-full bg-casino-ember px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-casino-ivory">
                          {game.tag}
                        </div>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            if (isPlayable) selectFeaturedGame(game.id);
                            scrollToPlay();
                          }}
                          className="absolute left-4 top-1/2 inline-flex -translate-y-1/2 items-center gap-2 rounded-full bg-casino-gold px-5 py-3 font-mono text-sm text-casino-ink opacity-0 shadow-[0_0_30px_rgba(255,215,0,0.45)] transition group-hover:opacity-100"
                        >
                          Play Now
                          <Play className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-4 p-5">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">{game.category}</p>
                        <h3 className="mt-2 font-serif text-2xl text-casino-ivory transition group-hover:text-casino-gold">
                          {game.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-casino-muted">{game.copy}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="inline-flex items-center gap-1 text-casino-gold">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-mono text-xs">{game.rating}</span>
                        </div>
                        {isPlayable && <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-casino-cyber">Playable</p>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 border border-casino-gold/25 bg-casino-ink/80 p-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-casino-gold">Selected Cabinet</p>
                  <h3 className="mt-2 font-serif text-3xl uppercase text-casino-ivory">{selectedGame.title}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-casino-muted">{selectedGame.bonus}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    ['Layout', selectedGame.layout],
                    ['Volatility', selectedGame.volatility],
                    ['Mode', selectedGame.tag],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-[8rem] border border-casino-ivory/10 bg-black/30 p-3">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">{label}</p>
                      <p className="mt-1 text-sm text-casino-ivory">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <LazyLandingSection
          sectionId="play"
          label="Loading playable slot"
          minHeightClassName="min-h-screen bg-casino-ink"
          rootMargin="900px 0px"
        >
          <PlayableSlotSection sectionId="play" />
        </LazyLandingSection>

        <section id="live" className="relative overflow-hidden bg-[#0d0918] px-[6vw] py-20 [contain-intrinsic-size:900px] [content-visibility:auto]">
          <div className="absolute inset-0 pointer-events-none [background:radial-gradient(circle_at_75%_30%,rgba(176,38,255,0.13),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-casino-cyber">Live Experience</p>
              <h2 className="mt-3 font-serif text-4xl uppercase leading-tight text-casino-ivory md:text-6xl">
                Real Thrills.
                <span className="block">Demo Control.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-casino-muted">
                The lobby keeps the cinematic energy of a live casino while the playable cabinet stays demo-only, fast, and transparent.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {liveFeatures.map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="flex gap-4 border border-casino-ivory/10 bg-casino-ink/55 p-4">
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-casino-gold" />
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-casino-ivory">{title}</p>
                      <p className="mt-1 text-sm text-casino-muted">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={scrollToPlay}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-casino-neon px-7 py-3 font-mono text-sm text-casino-ivory transition hover:bg-casino-neon/80 hover:shadow-[0_0_22px_rgba(176,38,255,0.34)]"
              >
                Enter Live Lobby
                <Radio className="h-4 w-4" />
              </button>
            </div>

            <div className="relative overflow-hidden border border-casino-cyber/20 bg-casino-charcoal/60">
              <ResponsiveImage
                imageBase="slot_machine"
                fallback="/images/slot_machine.png"
                alt="Live arcade cabinet"
                sizes="(min-width: 1024px) 48vw, 100vw"
                pictureClassName="block aspect-[4/3] w-full"
                className="h-full w-full object-cover opacity-80"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,6,18,0.86)_0%,rgba(8,6,18,0.06)_58%)]" />
              <div className="absolute left-5 top-5 rounded-full bg-casino-ember px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-casino-ivory">
                Live
              </div>
              <div className="absolute inset-x-5 bottom-5 grid grid-cols-2 gap-3">
                {[
                  ['Players Online', '12,847'],
                  ['Tables Open', '186'],
                ].map(([label, value]) => (
                  <div key={label} className="border border-white/10 bg-black/45 p-4 backdrop-blur">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">{label}</p>
                    <p className="mt-1 font-serif text-3xl text-casino-gold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="rewards" className="relative bg-casino-ink px-[6vw] py-20 [contain-intrinsic-size:760px] [content-visibility:auto]">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-casino-ember">Exclusive Offers</p>
              <h2 className="mt-3 font-serif text-4xl uppercase text-casino-ivory md:text-6xl">
                Epic Promotions
              </h2>
              <p className="mt-4 text-base leading-7 text-casino-muted">
                Bonus choices are functional: credits hit the wallet, spin tickets power free rounds, and multiplier passes alter wins.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {promotions.map(({ icon: Icon, title, value, copy, accent }) => (
                <article key={title} className="group border border-casino-ivory/10 bg-casino-charcoal/55 p-6 transition hover:border-casino-gold/40">
                  <Icon className={`h-7 w-7 ${accent}`} />
                  <h3 className="mt-7 font-serif text-2xl text-casino-ivory transition group-hover:text-casino-gold">{title}</h3>
                  <p className={`mt-2 font-mono text-sm ${accent}`}>{value}</p>
                  <p className="mt-4 text-sm leading-6 text-casino-muted">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LazyLandingSection
          sectionId="jackpots"
          label="Loading leaderboard"
          minHeightClassName="min-h-[70vh] bg-casino-charcoal"
        >
          <LeaderboardSection sectionId="jackpots" />
        </LazyLandingSection>

        <section id="vip" className="relative bg-[#0d0918] px-[6vw] py-20 [contain-intrinsic-size:820px] [content-visibility:auto]">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-casino-gold">Loyalty Program</p>
              <h2 className="mt-3 font-serif text-4xl uppercase text-casino-ivory md:text-6xl">
                The VIP Experience
              </h2>
              <p className="mt-4 text-base leading-7 text-casino-muted">
                Every spin and mission pushes the demo profile closer to a more theatrical arcade status.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {vipTiers.map((tier) => (
                <article key={tier.tier} className="border border-casino-ivory/10 bg-casino-ink/70 p-6">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h3 className={`font-serif text-3xl ${tier.color}`}>{tier.tier}</h3>
                    <Crown className={`h-5 w-5 ${tier.color}`} />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">{tier.points}</p>
                  <div className="mt-6 space-y-3">
                    {tier.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-3 text-sm text-casino-muted">
                        <Sparkles className="h-4 w-4 text-casino-gold" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-7 border-t border-casino-ivory/10 pt-4 font-mono text-[10px] uppercase tracking-widest text-casino-muted">
                    Tier Level
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-casino-ink px-[6vw] py-20 [contain-intrinsic-size:360px] [content-visibility:auto]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 border border-casino-gold/25 bg-casino-charcoal/45 p-6 md:grid-cols-[1fr_auto] md:p-8">
            <div>
              <div className="mb-3 flex items-center gap-3 text-casino-gold">
                <Gamepad2 className="h-6 w-6" />
                <span className="font-mono text-xs uppercase tracking-widest">Final call</span>
              </div>
              <h2 className="font-serif text-4xl uppercase text-casino-ivory md:text-6xl">
                Enter The Lobby
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-casino-muted">
                Claim the starter bonus, pick a cabinet, and test the mechanics in the playable demo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReserveOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-casino-gold px-7 py-3 font-mono text-sm uppercase tracking-widest text-casino-ink transition hover:bg-casino-cyber focus:outline-none focus:ring-2 focus:ring-casino-gold"
            >
              Join Now
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
