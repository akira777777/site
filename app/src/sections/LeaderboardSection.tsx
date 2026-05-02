import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, TrendingUp, Star } from 'lucide-react';

const LEADERBOARD = [
  { rank: 1, name: 'SpinMaster',   total: 99400, wins: 47, badge: '👑', color: '#ffd700' },
  { rank: 2, name: 'LuckyAce',     total: 77200, wins: 38, badge: '💎', color: '#c0c0c0' },
  { rank: 3, name: 'NeonKing',     total: 61800, wins: 31, badge: '🔥', color: '#cd7f32' },
  { rank: 4, name: 'CyberLuck7',   total: 44500, wins: 24, badge: '⭐', color: '#c084fc' },
  { rank: 5, name: 'GoldRush99',   total: 38100, wins: 19, badge: '🔔', color: '#38bdf8' },
  { rank: 6, name: 'Phantom_X',    total: 29300, wins: 15, badge: '🎰', color: '#facc15' },
  { rank: 7, name: 'Alex_K',       total: 21700, wins: 11, badge: '🃏', color: '#ff4500' },
];

const RECENT_WINS = [
  { name: 'SpinMaster', amount: 9900, symbol: '💎', time: '2m ago' },
  { name: 'CyberLuck7', amount: 4500, symbol: '👑', time: '5m ago' },
  { name: 'NeonKing',   amount: 1800, symbol: '⭐', time: '8m ago' },
  { name: 'LuckyAce',   amount: 7700, symbol: '💎', time: '11m ago' },
  { name: 'Phantom_X',  amount: 2200, symbol: '🔔', time: '14m ago' },
];

export default function LeaderboardSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [highlightRank, setHighlightRank] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.fromTo(section, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: prefersReducedMotion ? 0 : 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' },
    });

    // Stagger rows in
    gsap.fromTo(section.querySelectorAll('.lb-row'), { x: -30, opacity: 0 }, {
      x: 0, opacity: 1, duration: prefersReducedMotion ? 0 : 0.5, stagger: prefersReducedMotion ? 0 : 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none none' },
    });

    return () => { ScrollTrigger.getAll().forEach(st => { if (st.vars.trigger === section) st.kill(); }); };
  }, []);

  // Cycle highlight — pause when off-screen
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let id: ReturnType<typeof setInterval>;
    const startInterval = () => {
      id = setInterval(() => {
        setHighlightRank(r => r === null ? 1 : r >= 7 ? null : r! + 1);
      }, 2000);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startInterval();
        } else {
          clearInterval(id);
        }
      },
      { threshold: 0 }
    );
    observer.observe(section);

    return () => {
      clearInterval(id);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} id="jackpots"
      className=" z-[]">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(ellipse_at_50%_0%,_rgba(176,38,255,0.08)_0%,_transparent_60%)]" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-[6vw]">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-mono text-xs text-casino-muted uppercase tracking-widest mb-2">Global Rankings</p>
            <h2 className="font-serif text-4xl md:text-5xl text-casino-ivory uppercase [text-shadow:0_0_20px_rgba(255,215,0,0.3)]">
              Hall of Fame
            </h2>
          </div>
          <Trophy className="w-14 h-14 text-casino-gold opacity-60 [filter:drop-shadow(0_0_15px_#ffd700)]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Leaderboard table */}
          <div className="lg:col-span-2 space-y-3">
            {LEADERBOARD.map((player) => {
              const isHighlighted = highlightRank === player.rank;
              const pct = (player.total / LEADERBOARD[0].total) * 100;
              return (
                <div key={player.rank}
                  className={`lb-row group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 cursor-default ${
                    isHighlighted
                      ? 'bg-casino-neon/10 border-casino-neon/50 shadow-[0_0_20px_rgba(0,243,255,0.15)]'
                      : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10'
                  }`}>

                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 text-center">
                    {player.rank <= 3 ? (
                      <span className="text-2xl">{player.badge}</span>
                    ) : (
                      <span className="font-mono text-casino-muted text-sm">#{player.rank}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-casino-ivory font-bold truncate" style={{ color: player.rank <= 3 ? player.color : undefined }}>
                        {player.name}
                      </span>
                      <span className="font-mono text-xs text-casino-muted ml-2 flex-shrink-0">{player.wins} wins</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${player.color}80, ${player.color})` }} />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex-shrink-0 text-right">
                    <span className="font-mono font-bold text-lg" style={{ color: player.color, textShadow: `0 0 8px ${player.color}60` }}>
                      {player.total.toLocaleString()}
                    </span>
                    <p className="font-mono text-[10px] text-casino-muted uppercase tracking-widest">credits</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Wins sidebar */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-mono text-xs text-casino-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-casino-neon" /> Recent Big Wins
              </p>
            </div>
            {RECENT_WINS.map((win, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 hover:border-casino-gold/30 transition-all">
                <span className="text-2xl flex-shrink-0">{win.symbol}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-casino-ivory font-bold truncate">{win.name}</p>
                  <p className="font-mono text-[10px] text-casino-muted">{win.time}</p>
                </div>
                <span className="font-mono text-casino-gold font-bold flex-shrink-0">+{win.amount.toLocaleString()}</span>
              </div>
            ))}

            {/* CTA */}
            <div className="mt-2 p-5 rounded-2xl bg-casino-neon/5 border border-casino-neon/20 text-center">
              <Star className="w-8 h-8 text-casino-neon mx-auto mb-2 opacity-70" />
              <p className="font-mono text-xs text-casino-muted mb-1">Your current rank</p>
              <p className="font-serif text-2xl text-casino-neon [text-shadow:0_0_10px_rgba(0,243,255,0.6)]">#—</p>
              <p className="font-mono text-xs text-casino-muted mt-1">Spin to claim your spot</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
