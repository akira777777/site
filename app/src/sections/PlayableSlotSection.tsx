import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import { Gem, Crown, Bell, Star, Flame, Coins } from 'lucide-react';

// Using Lucide React Icons for a premium vector look
const SYMBOLS_DATA = [
  { id: 'coins', icon: Coins, color: '#facc15', weight: 40, payout: 2 },   // Casino Gold
  { id: 'flame', icon: Flame, color: '#ff4500', weight: 30, payout: 3 },   // Ember
  { id: 'bell', icon: Bell, color: '#38bdf8', weight: 15, payout: 5 },     // Cyber Teal
  { id: 'star', icon: Star, color: '#c084fc', weight: 10, payout: 10 },    // Neon Purple
  { id: 'crown', icon: Crown, color: '#fbbf24', weight: 4, payout: 25 },   // Bright Gold
  { id: 'gem', icon: Gem, color: '#ffffff', weight: 1, payout: 100 },      // Diamond White
];

const REEL_SPIN_DURATION_BASE = 1000; // base time for reel 1
const REEL_STOP_DELAY = 500; // ms delay between each reel stopping

// Helper to get random symbol based on weight
const getRandomSymbol = () => {
  const totalWeight = SYMBOLS_DATA.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  for (const symbol of SYMBOLS_DATA) {
    if (random < symbol.weight) return symbol;
    random -= symbol.weight;
  }
  return SYMBOLS_DATA[0];
};

// Generate initial 3x3 grid
const getInitialGrid = () => Array(3).fill(null).map(() => Array(3).fill(null).map(() => getRandomSymbol().id));

// The 5 Paylines definition (row, col)
const PAYLINES = [
  [[0,0], [0,1], [0,2]], // Top
  [[1,0], [1,1], [1,2]], // Middle
  [[2,0], [2,1], [2,2]], // Bottom
  [[0,0], [1,1], [2,2]], // Diag Down
  [[2,0], [1,1], [0,2]], // Diag Up
];

export default function PlayableSlotSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // States
  const [grid, setGrid] = useState<string[][]>(getInitialGrid());
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAutoSpining, setIsAutoSpining] = useState(false);
  const [credits, setCredits] = useState(1000);
  const [displayCredits, setDisplayCredits] = useState(1000);
  const [bet, setBet] = useState(10);
  const [lastWin, setLastWin] = useState(0);
  const [message, setMessage] = useState("SPIN TO WIN!");
  const [winningLines, setWinningLines] = useState<number[][]>([]);

  const reelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const autoSpinRef = useRef(isAutoSpining);

  // Sync ref for auto spin
  useEffect(() => {
    autoSpinRef.current = isAutoSpining;
  }, [isAutoSpining]);

  // Load credits on mount
  useEffect(() => {
    const saved = localStorage.getItem('casino_credits');
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val)) {
        setCredits(val);
        setDisplayCredits(val);
      }
    }

    const section = sectionRef.current;
    if (!section) return;

    gsap.fromTo(
      section,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);

  // Save credits
  useEffect(() => {
    localStorage.setItem('casino_credits', credits.toString());
  }, [credits]);

  // Count up animation for credits
  useEffect(() => {
    if (displayCredits !== credits) {
      gsap.to({ val: displayCredits }, {
        val: credits,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: function() {
          setDisplayCredits(Math.round(this.targets()[0].val));
        }
      });
    }
  }, [credits]);

  const toggleBet = () => {
    if (isSpinning) return;
    setBet(prev => prev === 10 ? 50 : prev === 50 ? 100 : 10);
  };

  const setMaxBet = () => {
    if (isSpinning) return;
    setBet(100);
  };

  const toggleAutoSpin = () => {
    setIsAutoSpining(prev => {
      const next = !prev;
      if (next && !isSpinning) {
        setTimeout(() => performSpin(), 100);
      }
      return next;
    });
  };

  const performSpin = useCallback(() => {
    if (credits < bet) {
      setMessage("INSUFFICIENT FUNDS");
      setIsAutoSpining(false);
      return;
    }

    setIsSpinning(true);
    setWinningLines([]);
    setCredits((prev) => prev - bet);
    setLastWin(0);
    setMessage("SPINNING...");

    // Start spin animations (Simulate motion blur and rapid scrolling)
    reelsRef.current.forEach((reel, i) => {
      if (reel) {
        gsap.to(reel, {
          y: '+=100%',
          duration: 0.08, // faster
          repeat: -1,
          ease: 'none',
          modifiers: {
            y: gsap.utils.unitize((y) => parseFloat(y) % 100)
          }
        });
      }
    });

    const newGrid = getInitialGrid();
    
    // Stop reels sequentially
    [0, 1, 2].forEach((colIndex) => {
      setTimeout(() => {
        const reel = reelsRef.current[colIndex];
        if (reel) gsap.killTweensOf(reel);
        
        // Update grid visually column by column
        setGrid(prev => {
          const updated = [...prev];
          updated[0] = [...updated[0]];
          updated[1] = [...updated[1]];
          updated[2] = [...updated[2]];
          updated[0][colIndex] = newGrid[0][colIndex];
          updated[1][colIndex] = newGrid[1][colIndex];
          updated[2][colIndex] = newGrid[2][colIndex];
          return updated;
        });

        // Add a slight "bounce" effect when a reel stops
        if (reel) {
            gsap.fromTo(reel, { y: '-10%' }, { y: '0%', duration: 0.3, ease: 'bounce.out' });
        }

      }, REEL_SPIN_DURATION_BASE + (colIndex * REEL_STOP_DELAY));
    });

    // Final evaluation after last reel stops
    setTimeout(() => {
      let totalWin = 0;
      let matchedLines: number[][] = [];

      PAYLINES.forEach(line => {
        const sym1 = newGrid[line[0][0]][line[0][1]];
        const sym2 = newGrid[line[1][0]][line[1][1]];
        const sym3 = newGrid[line[2][0]][line[2][1]];

        if (sym1 === sym2 && sym2 === sym3) {
          const symbolData = SYMBOLS_DATA.find(s => s.id === sym1);
          if (symbolData) {
            totalWin += symbolData.payout * bet;
            matchedLines.push(line);
          }
        }
      });

      if (totalWin > 0) {
        setCredits(prev => prev + totalWin);
        setLastWin(totalWin);
        setWinningLines(matchedLines);
        
        if (totalWin >= bet * 25) {
          setMessage(`MEGA WIN! +${totalWin}`);
          fireConfetti();
        } else {
          setMessage(`WINNER! +${totalWin}`);
        }
      } else {
        setMessage("PLACE YOUR BETS");
      }

      setIsSpinning(false);

      // Check auto spin continuation
      if (autoSpinRef.current) {
        setTimeout(() => {
          if (autoSpinRef.current) performSpin();
        }, 1500); 
      }

    }, REEL_SPIN_DURATION_BASE + (2 * REEL_STOP_DELAY) + 100);

  }, [bet, credits]);

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#b026ff', '#ffd700', '#00f3ff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#b026ff', '#ffd700', '#00f3ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const isCellWinning = (r: number, c: number) => {
    return winningLines.some(line => line.some(coord => coord[0] === r && coord[1] === c));
  };

  const renderSymbol = (id: string, isWinning: boolean, isBoardWinning: boolean) => {
    const sym = SYMBOLS_DATA.find(s => s.id === id) || SYMBOLS_DATA[0];
    const IconComponent = sym.icon;
    
    // Dim symbols if the board is in a winning state but this symbol didn't win
    const opacityClass = isBoardWinning && !isWinning ? 'opacity-20 grayscale' : 'opacity-100';
    const scaleClass = isWinning ? 'scale-125 z-20' : '';
    const glowStyle = isWinning 
        ? { filter: `drop-shadow(0 0 15px ${sym.color}) drop-shadow(0 0 30px ${sym.color})` }
        : { filter: `drop-shadow(0 0 5px ${sym.color}80)` };

    return (
        <div className={`transition-all duration-300 flex items-center justify-center w-full h-full ${opacityClass} ${scaleClass}`}>
            <IconComponent 
                size={isWinning ? 64 : 48} 
                color={sym.color} 
                style={glowStyle} 
                strokeWidth={isWinning ? 2.5 : 1.5}
            />
        </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="play"
      className="relative w-full min-h-screen bg-casino-ink py-[10vh] flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 90 }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(176,38,255,0.05) 0%, transparent 60%)' }} />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-[6vw] flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-5xl md:text-7xl text-casino-ivory uppercase" style={{ textShadow: '0 0 30px rgba(176,38,255,0.8)' }}>
            Cyber Slots
          </h2>
          <div className="mt-6 bg-black/40 px-8 py-2 rounded-full border border-casino-neon/30 inline-block shadow-[0_0_20px_rgba(176,38,255,0.2)]">
             <p className={`font-mono text-xl tracking-widest uppercase transition-colors duration-300 ${winningLines.length > 0 ? 'text-casino-gold animate-bounce' : 'text-casino-neon animate-pulse'}`}>
               {message}
             </p>
          </div>
        </div>

        {/* Arcade Cabinet Container */}
        <div className={`relative bg-casino-ink/80 backdrop-blur-xl p-8 rounded-[2.5rem] transition-all duration-500 w-full max-w-4xl border-2 ${
            winningLines.length > 0 ? 'shadow-[0_0_100px_rgba(255,215,0,0.3)] border-casino-gold' : 'shadow-[0_0_80px_rgba(0,0,0,0.8)] border-casino-ivory/10'
            }`}>
          
          {/* Glassmorphic Top Display (Balance, Bet, Win) */}
          <div className="flex justify-between items-center mb-8 px-8 py-4 rounded-2xl bg-black/60 shadow-inner border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-casino-muted text-[10px] tracking-widest uppercase mb-1">Balance</span>
              <span className="text-casino-ivory font-mono text-2xl" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                {displayCredits.toLocaleString()}
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-casino-muted text-[10px] tracking-widest uppercase mb-1">Current Bet</span>
              <button 
                onClick={toggleBet} 
                disabled={isSpinning || isAutoSpining}
                className={`font-mono text-2xl text-casino-neon font-bold px-6 py-1 rounded-lg transition-all ${
                  !isSpinning && !isAutoSpining ? 'hover:bg-casino-neon/10 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ textShadow: '0 0 15px rgba(0,243,255,0.8)' }}
              >
                {bet}
              </button>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-casino-muted text-[10px] tracking-widest uppercase mb-1">Last Win</span>
              <span className="text-casino-gold font-mono text-2xl" style={{ textShadow: '0 0 15px rgba(255,215,0,0.8)' }}>
                {lastWin > 0 ? `+${lastWin.toLocaleString()}` : '0'}
              </span>
            </div>
          </div>

          {/* Reels Screen (Glassmorphic) */}
          <div className="relative bg-[#050505] rounded-3xl border-4 border-[#1a1a1a] overflow-hidden h-[360px] flex justify-center items-center gap-4 p-6 shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
            
            {/* Screen Glare Overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-30" />

            {/* Payline Guides (Visual only) */}
            <div className="absolute left-4 top-[50%] -translate-y-1/2 flex flex-col justify-between h-full py-16 pointer-events-none opacity-30 z-10">
              <div className="w-1 h-8 rounded-full bg-casino-neon" />
              <div className="w-1 h-8 rounded-full bg-casino-ember" />
              <div className="w-1 h-8 rounded-full bg-casino-neon" />
            </div>
            <div className="absolute right-4 top-[50%] -translate-y-1/2 flex flex-col justify-between h-full py-16 pointer-events-none opacity-30 z-10">
              <div className="w-1 h-8 rounded-full bg-casino-neon" />
              <div className="w-1 h-8 rounded-full bg-casino-ember" />
              <div className="w-1 h-8 rounded-full bg-casino-neon" />
            </div>

            {/* Columns */}
            {[0, 1, 2].map((colIndex) => (
              <div key={colIndex} className="relative w-1/3 h-full overflow-hidden bg-black/40 rounded-xl border border-white/[0.02] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                <div 
                  ref={(el) => { reelsRef.current[colIndex] = el; }}
                  className={`absolute top-0 left-0 w-full h-full flex flex-col`}
                >
                  <div className="h-full flex flex-col justify-between py-2">
                    {[0, 1, 2].map((rowIndex) => {
                      const isWinning = isCellWinning(rowIndex, colIndex);
                      const isBoardWinning = winningLines.length > 0;
                      return (
                        <div key={rowIndex} className="flex justify-center items-center h-[100px] w-full">
                          {renderSymbol(grid[rowIndex][colIndex], isWinning, isBoardWinning)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* Hardware Control Buttons */}
          <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 px-4">
            
            <div className="flex gap-4 w-full md:w-auto">
              {/* Auto Spin Button */}
              <button 
                onClick={toggleAutoSpin}
                className={`flex-1 md:flex-none relative overflow-hidden px-8 py-4 rounded-xl font-mono text-sm tracking-widest transition-all duration-300 cursor-pointer ${
                  isAutoSpining 
                  ? 'bg-casino-neon/20 text-casino-neon border-b-2 border-casino-neon translate-y-1 shadow-[inset_0_5px_15px_rgba(0,0,0,0.5),0_0_15px_rgba(0,243,255,0.4)]' 
                  : 'bg-[#151515] text-casino-ivory/50 border-b-4 border-[#0a0a0a] hover:bg-[#1a1a1a] hover:text-casino-ivory hover:border-[#111] active:translate-y-1 active:border-b-0'
                }`}
              >
                <span className="relative z-10">{isAutoSpining ? 'STOP AUTO' : 'AUTO SPIN'}</span>
              </button>
              
              {/* Max Bet Button */}
              <button 
                onClick={setMaxBet}
                disabled={isSpinning || isAutoSpining || bet === 100}
                className={`flex-1 md:flex-none relative overflow-hidden px-8 py-4 rounded-xl font-mono text-sm tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    bet === 100 && !isSpinning && !isAutoSpining
                    ? 'bg-casino-gold/20 text-casino-gold border-b-2 border-casino-gold translate-y-1 shadow-[inset_0_5px_15px_rgba(0,0,0,0.5),0_0_15px_rgba(255,215,0,0.4)]'
                    : 'bg-[#151515] text-casino-ivory/50 border-b-4 border-[#0a0a0a] hover:bg-[#1a1a1a] hover:text-casino-ivory cursor-pointer active:translate-y-1 active:border-b-0'
                }`}
              >
                MAX BET
              </button>
            </div>
            
            {/* Main Spin Button */}
            <button 
              onClick={isAutoSpining ? toggleAutoSpin : performSpin}
              disabled={(!isAutoSpining && (isSpinning || credits < bet))}
              className={`w-full md:w-auto px-16 py-5 rounded-2xl font-serif text-3xl tracking-widest transition-all duration-200 uppercase relative overflow-hidden group ${
                (!isAutoSpining && (isSpinning || credits < bet))
                ? 'bg-[#1a1a1a] text-casino-muted cursor-not-allowed border-b-4 border-[#0a0a0a]' 
                : 'bg-casino-ember text-casino-ivory cursor-pointer border-b-8 border-rose-900 active:border-b-0 active:translate-y-2 shadow-[0_10px_30px_rgba(255,0,127,0.4)] hover:shadow-[0_15px_40px_rgba(255,0,127,0.6)] hover:bg-rose-600'
              }`}
            >
                {/* Glow effect on hover */}
               {(!isSpinning && credits >= bet && !isAutoSpining) && (
                  <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shine_1.5s_infinite]" />
               )}
              <span className="relative z-10" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {isAutoSpining ? 'STOP' : (isSpinning ? 'SPINNING' : 'SPIN')}
              </span>
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes shine {
          100% { left: 200%; }
        }
      `}</style>
    </section>
  );
}
