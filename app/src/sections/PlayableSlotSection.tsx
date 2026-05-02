import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import { Gem, Crown, Bell, Star, Flame, Coins, Volume2, VolumeX, RotateCcw, Trophy } from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';

const SYMBOLS_DATA = [
  { id: 'coins',  icon: Coins,  color: '#facc15', weight: 40, payout: 2,   label: 'Coins'  },
  { id: 'flame',  icon: Flame,  color: '#ff4500', weight: 30, payout: 3,   label: 'Flame'  },
  { id: 'bell',   icon: Bell,   color: '#38bdf8', weight: 15, payout: 5,   label: 'Bell'   },
  { id: 'star',   icon: Star,   color: '#c084fc', weight: 10, payout: 10,  label: 'Star'   },
  { id: 'crown',  icon: Crown,  color: '#fbbf24', weight: 4,  payout: 25,  label: 'Crown ★ BONUS' },
  { id: 'gem',    icon: Gem,    color: '#ffffff', weight: 1,  payout: 100, label: 'Gem 💎 JACKPOT' },
];

const PAYLINES = [
  [[0,0],[0,1],[0,2]],
  [[1,0],[1,1],[1,2]],
  [[2,0],[2,1],[2,2]],
  [[0,0],[1,1],[2,2]],
  [[2,0],[1,1],[0,2]],
];

const FAKE_WINNERS = [
  { name: 'Alex_K', amount: 4200, symbol: '💎' },
  { name: 'NeonKing', amount: 1500, symbol: '👑' },
  { name: 'SpinMaster', amount: 9900, symbol: '💎' },
  { name: 'CyberLuck7', amount: 750, symbol: '⭐' },
  { name: 'Phantom_X', amount: 3300, symbol: '👑' },
  { name: 'GoldRush99', amount: 2100, symbol: '🔔' },
  { name: 'LuckyAce', amount: 5500, symbol: '💎' },
];

const getRandomSymbol = () => {
  const total = SYMBOLS_DATA.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const s of SYMBOLS_DATA) { if (r < s.weight) return s; r -= s.weight; }
  return SYMBOLS_DATA[0];
};

const getInitialGrid = () => Array(3).fill(null).map(() => Array(3).fill(null).map(() => getRandomSymbol().id));

export default function PlayableSlotSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const autoSpinRef = useRef(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  const [grid, setGrid] = useState<string[][]>(getInitialGrid());
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [credits, setCredits] = useState(1000);
  const [displayCredits, setDisplayCredits] = useState(1000);
  const [bet, setBet] = useState(10);
  const [lastWin, setLastWin] = useState(0);
  const [message, setMessage] = useState('SPIN TO WIN!');
  const [winningLines, setWinningLines] = useState<number[][][]>([]);
  const [freeSpins, setFreeSpins] = useState(0);
  const [isFreeSpinMode, setIsFreeSpinMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState(0);

  useEffect(() => { autoSpinRef.current = isAutoSpin; }, [isAutoSpin]);

  // Load credits
  useEffect(() => {
    try {
      const saved = localStorage.getItem('casino_credits');
      if (saved) { const v = parseInt(saved, 10); if (!isNaN(v)) { setCredits(v); setDisplayCredits(v); } }
    } catch {
      // localStorage unavailable
    }

    const section = sectionRef.current;
    if (!section) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.fromTo(section, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: prefersReducedMotion ? 0 : 1,
      scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' } });
    return () => { ScrollTrigger.getAll().forEach(st => { if (st.vars.trigger === section) st.kill(); }); };
  }, []);

  // Save credits
  useEffect(() => {
    try {
      localStorage.setItem('casino_credits', credits.toString());
    } catch {
      // localStorage unavailable
    }
  }, [credits]);

  // Count-up
  useEffect(() => {
    if (displayCredits === credits) return;
    const obj = { val: displayCredits };
    gsap.to(obj, { val: credits, duration: 1.2, ease: 'power2.out',
      onUpdate: () => { setDisplayCredits(Math.round(obj.val)); } });
  }, [credits, displayCredits]);

  // Sync muted state with AudioEngine
  useEffect(() => { AudioEngine.setMuted(muted); }, [muted]);

  // Keyboard shortcut: Space to spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && (credits >= bet || isFreeSpinMode) && !isAutoSpin) {
        e.preventDefault();
        performSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, credits, bet, isAutoSpin, isFreeSpinMode, performSpin]);
  useEffect(() => {
    const id = setInterval(() => setWinnerIdx(i => (i + 1) % FAKE_WINNERS.length), 3000);
    return () => clearInterval(id);
  }, []);

  // Animate ticker on change
  useEffect(() => {
    if (tickerRef.current) {
      gsap.fromTo(tickerRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  }, [winnerIdx]);

  const w = FAKE_WINNERS[winnerIdx];

  const toggleBet = () => { if (!isSpinning && !isFreeSpinMode) setBet(p => p === 10 ? 50 : p === 50 ? 100 : 10); };
  const setMaxBet = () => { if (!isSpinning && !isFreeSpinMode) setBet(100); };
  const resetCredits = () => { if (!isSpinning) { setCredits(1000); setMessage('CREDITS RESET!'); } };

  const performSpin = useCallback(() => {
    let currentCredits = 1000;
    try {
      currentCredits = parseInt(localStorage.getItem('casino_credits') || '1000', 10);
    } catch {
      // localStorage unavailable
    }
    const activeBet = isFreeSpinMode ? 0 : bet;

    if (!isFreeSpinMode && currentCredits < bet) {
      setMessage('INSUFFICIENT FUNDS'); setIsAutoSpin(false); return;
    }

    setIsSpinning(true);
    setWinningLines([]);
    if (!isFreeSpinMode) setCredits(p => p - bet);
    setLastWin(0);
    setMessage(isFreeSpinMode ? `FREE SPIN! (${freeSpins} left)` : 'SPINNING...');
    AudioEngine.spinStart();

    reelsRef.current.forEach((reel) => {
      if (reel) gsap.to(reel, { y: '+=100%', duration: 0.07, repeat: -1, ease: 'none',
        modifiers: { y: gsap.utils.unitize((y) => parseFloat(y) % 100) } });
    });

    const newGrid = getInitialGrid();

    [0, 1, 2].forEach((col) => {
      setTimeout(() => {
        const reel = reelsRef.current[col];
        if (reel) { gsap.killTweensOf(reel); gsap.fromTo(reel, { y: '-10%' }, { y: '0%', duration: 0.3, ease: 'bounce.out' }); }
        AudioEngine.reelStop(col);
        setGrid(prev => {
          const g = prev.map(r => [...r]);
          g[0][col] = newGrid[0][col]; g[1][col] = newGrid[1][col]; g[2][col] = newGrid[2][col];
          return g;
        });
      }, 1000 + col * 500);
    });

    setTimeout(() => {
      let totalWin = 0;
      const matched: number[][][] = [];
      let crownCount = 0;

      // Count crowns for free spins trigger
      newGrid.flat().forEach(id => { if (id === 'crown') crownCount++; });

      PAYLINES.forEach(line => {
        const [s1, s2, s3] = line.map(([r,c]) => newGrid[r][c]);
        if (s1 === s2 && s2 === s3) {
          const sym = SYMBOLS_DATA.find(s => s.id === s1);
          if (sym) { totalWin += sym.payout * (activeBet || bet); matched.push(line); }
        }
      });

      if (isFreeSpinMode) {
        const remaining = freeSpins - 1;
        setFreeSpins(remaining);
        if (remaining <= 0) { setIsFreeSpinMode(false); setMessage('FREE SPINS DONE!'); }
      }

      // Trigger Free Spins if 3+ crowns
      if (crownCount >= 3 && !isFreeSpinMode) {
        setFreeSpins(10); setIsFreeSpinMode(true);
        setMessage('🎉 10 FREE SPINS UNLOCKED!');
        fireConfetti();
        AudioEngine.freeSpinsUnlocked();
      } else if (totalWin > 0) {
        setCredits(p => p + totalWin); setLastWin(totalWin); setWinningLines(matched);
        if (totalWin >= bet * 25) { setMessage(`💎 MEGA WIN! +${totalWin}`); fireConfetti(); AudioEngine.bigWin(); }
        else { setMessage(`🎉 WINNER! +${totalWin}`); AudioEngine.smallWin(); }
      } else if (!isFreeSpinMode || freeSpins <= 1) {
        setMessage('PLACE YOUR BETS');
      }

      setIsSpinning(false);

      if (autoSpinRef.current || (isFreeSpinMode && freeSpins > 1)) {
        setTimeout(() => { if (autoSpinRef.current || isFreeSpinMode) performSpin(); }, 1500);
      }
    }, 2600);
  }, [bet, freeSpins, isFreeSpinMode]);

  const fireConfetti = () => {
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#b026ff','#ffd700','#00f3ff'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#b026ff','#ffd700','#00f3ff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const isCellWinning = (r: number, c: number) =>
    winningLines.some(line => line.some(([lr, lc]) => lr === r && lc === c));

  const renderSymbol = (id: string, winning: boolean, boardWin: boolean) => {
    const sym = SYMBOLS_DATA.find(s => s.id === id) || SYMBOLS_DATA[0];
    const Icon = sym.icon;
    return (
      <div className={`transition-all duration-300 flex items-center justify-center w-full h-full
        ${boardWin && !winning ? 'opacity-20 grayscale' : 'opacity-100'}
        ${winning ? 'scale-125 z-20' : ''}`}>
        <Icon size={winning ? 64 : 48} color={sym.color} strokeWidth={winning ? 2.5 : 1.5}
          style={{ filter: winning
            ? `drop-shadow(0 0 15px ${sym.color}) drop-shadow(0 0 30px ${sym.color})`
            : `drop-shadow(0 0 5px ${sym.color}80)` }} />
      </div>
    );
  };

  const isWin = winningLines.length > 0;

  return (
    <section ref={sectionRef} id="play"
      className="relative w-full min-h-screen bg-casino-ink py-[10vh] flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 90 }}>

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(176,38,255,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-[6vw] flex flex-col items-center gap-6">

        {/* Live Winners Ticker */}
        <div className="w-full max-w-2xl flex items-center gap-3 bg-black/50 border border-casino-gold/30 rounded-full px-5 py-2">
          <Trophy className="w-4 h-4 text-casino-gold flex-shrink-0" />
          <span className="text-casino-muted font-mono text-xs uppercase tracking-widest flex-shrink-0">Live Win</span>
          <div ref={tickerRef} className="font-mono text-sm text-casino-gold truncate">
            <span className="text-casino-ivory font-bold">{w.name}</span>
            <span className="text-casino-muted mx-2">just won</span>
            <span className="text-casino-gold font-bold">{w.symbol} {w.amount.toLocaleString()} credits</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-5xl md:text-7xl text-casino-ivory uppercase" style={{ textShadow: '0 0 30px rgba(176,38,255,0.8)' }}>
            Cyber Slots
          </h2>
          {isFreeSpinMode && (
            <div className="mt-3 inline-block px-6 py-1 rounded-full bg-casino-gold/20 border border-casino-gold animate-pulse">
              <span className="font-mono text-casino-gold text-sm tracking-widest">🎰 FREE SPINS: {freeSpins}</span>
            </div>
          )}
          <div className="mt-4 bg-black/40 px-8 py-2 rounded-full border border-casino-neon/30 inline-block shadow-[0_0_20px_rgba(176,38,255,0.2)]">
            <p className={`font-mono text-xl tracking-widest uppercase transition-colors duration-300 ${isWin ? 'text-casino-gold animate-bounce' : isFreeSpinMode ? 'text-casino-neon animate-pulse' : 'text-casino-neon animate-pulse'}`}>
              {message}
            </p>
          </div>
        </div>

        {/* Cabinet */}
        <div className={`relative bg-casino-ink/80 backdrop-blur-xl p-8 rounded-[2.5rem] transition-all duration-500 w-full max-w-4xl border-2 ${
          isFreeSpinMode ? 'shadow-[0_0_100px_rgba(255,215,0,0.4)] border-casino-gold' :
          isWin ? 'shadow-[0_0_100px_rgba(255,215,0,0.3)] border-casino-gold' :
          'shadow-[0_0_80px_rgba(0,0,0,0.8)] border-casino-ivory/10'}`}>

          {/* Display Row */}
          <div className="flex justify-between items-center mb-8 px-8 py-4 rounded-2xl bg-black/60 shadow-inner border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-casino-muted text-[10px] tracking-widest uppercase mb-1">Balance</span>
              <span className="text-casino-ivory font-mono text-2xl" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                {displayCredits.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-casino-muted text-[10px] tracking-widest uppercase mb-1">Bet</span>
              <button onClick={toggleBet} disabled={isSpinning || isAutoSpin || isFreeSpinMode}
                className={`font-mono text-2xl text-casino-neon font-bold px-6 py-1 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${!isSpinning && !isAutoSpin ? 'hover:bg-casino-neon/10 cursor-pointer' : ''}`}
                style={{ textShadow: '0 0 15px rgba(0,243,255,0.8)' }}>
                {isFreeSpinMode ? 'FREE' : bet}
              </button>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-casino-muted text-[10px] tracking-widest uppercase mb-1">Last Win</span>
              <span className="text-casino-gold font-mono text-2xl" style={{ textShadow: '0 0 15px rgba(255,215,0,0.8)' }}>
                {lastWin > 0 ? `+${lastWin.toLocaleString()}` : '0'}
              </span>
            </div>
          </div>

          {/* Reels Screen */}
          <div className="relative bg-[#050505] rounded-3xl border-4 border-[#1a1a1a] overflow-hidden h-[360px] flex justify-center items-center gap-4 p-6 shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-30" />
            {/* Payline guides */}
            {[{side:'left-4'},{side:'right-4'}].map(({side}, i) => (
              <div key={i} className={`absolute ${side} top-[50%] -translate-y-1/2 flex flex-col justify-between h-full py-16 pointer-events-none opacity-30 z-10`}>
                <div className="w-1 h-8 rounded-full bg-casino-neon" />
                <div className="w-1 h-8 rounded-full bg-casino-ember" />
                <div className="w-1 h-8 rounded-full bg-casino-neon" />
              </div>
            ))}
            {[0, 1, 2].map((col) => (
              <div key={col} className="relative w-1/3 h-full overflow-hidden bg-black/40 rounded-xl border border-white/[0.02] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                <div ref={(el) => { reelsRef.current[col] = el; }} className="absolute top-0 left-0 w-full h-full flex flex-col">
                  <div className="h-full flex flex-col justify-between py-2">
                    {[0, 1, 2].map((row) => (
                      <div key={row} className="flex justify-center items-center h-[100px] w-full">
                        {renderSymbol(grid[row][col], isCellWinning(row, col), winningLines.length > 0)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 px-4">
            <div className="flex gap-3 w-full md:w-auto flex-wrap">
              {/* Auto Spin */}
              <button onClick={() => { setIsAutoSpin(p => { const n = !p; if (n && !isSpinning) setTimeout(performSpin, 100); return n; }); }}
                aria-pressed={isAutoSpin}
                className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-mono text-sm tracking-widest transition-all cursor-pointer ${
                  isAutoSpin ? 'bg-casino-neon/20 text-casino-neon border-b-2 border-casino-neon translate-y-1 shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                  : 'bg-[#151515] text-casino-ivory/50 border-b-4 border-[#0a0a0a] hover:bg-[#1a1a1a] hover:text-casino-ivory active:translate-y-1 active:border-b-0'}`}>
                {isAutoSpin ? 'STOP AUTO' : 'AUTO SPIN'}
              </button>
              {/* Max Bet */}
              <button onClick={setMaxBet} disabled={isSpinning || isAutoSpin || isFreeSpinMode || bet === 100}
                className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-mono text-sm tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  bet === 100 && !isSpinning ? 'bg-casino-gold/20 text-casino-gold border-b-2 border-casino-gold translate-y-1'
                  : 'bg-[#151515] text-casino-ivory/50 border-b-4 border-[#0a0a0a] hover:bg-[#1a1a1a] hover:text-casino-ivory cursor-pointer active:translate-y-1 active:border-b-0'}`}>
                MAX BET
              </button>
              {/* Paytable */}
              <button onClick={() => setShowPaytable(p => !p)}
                className={`flex-1 md:flex-none px-6 py-4 rounded-xl font-mono text-sm tracking-widest transition-all cursor-pointer ${
                  showPaytable ? 'bg-casino-ember/20 text-casino-ember border-b-2 border-casino-ember translate-y-1'
                  : 'bg-[#151515] text-casino-ivory/50 border-b-4 border-[#0a0a0a] hover:bg-[#1a1a1a] hover:text-casino-ivory active:translate-y-1 active:border-b-0'}`}>
                PAYTABLE
              </button>
            </div>

            {/* SPIN Button */}
            <button onClick={isAutoSpin ? () => setIsAutoSpin(false) : performSpin}
              disabled={!isAutoSpin && (isSpinning || credits < bet) && !isFreeSpinMode}
              aria-label={isAutoSpin ? 'Stop auto spin' : isSpinning ? 'Spinning' : isFreeSpinMode ? 'Free spin' : 'Spin reels'}
              className={`w-full md:w-auto px-16 py-5 rounded-2xl font-serif text-3xl tracking-widest transition-all duration-200 uppercase relative overflow-hidden group ${
                (!isAutoSpin && (isSpinning || credits < bet) && !isFreeSpinMode)
                ? 'bg-[#1a1a1a] text-casino-muted cursor-not-allowed border-b-4 border-[#0a0a0a]'
                : isFreeSpinMode
                  ? 'bg-casino-gold text-casino-ink cursor-pointer border-b-8 border-yellow-700 active:border-b-0 active:translate-y-2 shadow-[0_10px_30px_rgba(255,215,0,0.5)] hover:shadow-[0_15px_40px_rgba(255,215,0,0.7)]'
                  : 'bg-casino-ember text-casino-ivory cursor-pointer border-b-8 border-rose-900 active:border-b-0 active:translate-y-2 shadow-[0_10px_30px_rgba(255,0,127,0.4)] hover:shadow-[0_15px_40px_rgba(255,0,127,0.6)] hover:bg-rose-600'}`}>
              {(!isSpinning && !isAutoSpin) && (
                <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shine_1.5s_infinite]" />
              )}
              <span className="relative z-10" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {isAutoSpin ? 'STOP' : isSpinning ? 'SPINNING' : isFreeSpinMode ? `FREE x${freeSpins}` : 'SPIN'}
              </span>
            </button>
          </div>

          {/* Secondary controls row */}
          <div className="flex justify-between items-center mt-5 px-4">
            {/* Sound toggle */}
            <button onClick={() => setMuted(p => !p)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111] border border-white/5 text-casino-muted hover:text-casino-ivory transition-all cursor-pointer">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="font-mono text-xs">{muted ? 'MUTED' : 'SOUND ON'}</span>
            </button>
            {/* Reset */}
            <button onClick={resetCredits} disabled={isSpinning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111] border border-white/5 text-casino-muted hover:text-casino-ember transition-all cursor-pointer disabled:opacity-50">
              <RotateCcw className="w-4 h-4" />
              <span className="font-mono text-xs">RESET (1,000)</span>
            </button>
          </div>
        </div>

        {/* Paytable Panel */}
        {showPaytable && (
          <div className="w-full max-w-4xl bg-black/60 backdrop-blur-xl border border-casino-ivory/10 rounded-3xl p-8 mt-2">
            <h3 className="font-serif text-2xl text-casino-gold uppercase mb-6 text-center" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
              Paytable — Match 3 in a Row
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SYMBOLS_DATA.map(sym => {
                const Icon = sym.icon;
                return (
                  <div key={sym.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/5 hover:border-casino-neon/30 transition-all">
                    <Icon size={32} color={sym.color} strokeWidth={1.5}
                      style={{ filter: `drop-shadow(0 0 8px ${sym.color}80)`, flexShrink: 0 }} />
                    <div>
                      <p className="font-mono text-xs text-casino-muted">{sym.label}</p>
                      <p className="font-mono text-lg font-bold" style={{ color: sym.color }}>{sym.payout}x bet</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-center font-mono text-xs text-casino-muted/60 mt-6">
              5 paylines · 3x Crown = 10 Free Spins · 3x Gem = JACKPOT
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shine { 100% { left: 200%; } }
      `}</style>
    </section>
  );
}
