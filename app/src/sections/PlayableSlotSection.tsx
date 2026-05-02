import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Weighted symbols (higher weight = more common)
const SYMBOLS_DATA = [
  { char: '🍒', weight: 40, payout: 2 },
  { char: '🍋', weight: 30, payout: 3 },
  { char: '🔔', weight: 15, payout: 5 },
  { char: '🃏', weight: 10, payout: 10 },
  { char: '7️⃣', weight: 4, payout: 25 },
  { char: '💎', weight: 1, payout: 100 },
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
const getInitialGrid = () => Array(3).fill(null).map(() => Array(3).fill(null).map(() => getRandomSymbol().char));

// The 5 Paylines definition (row, col)
const PAYLINES = [
  // Horizontal
  [[0,0], [0,1], [0,2]], // Top
  [[1,0], [1,1], [1,2]], // Middle
  [[2,0], [2,1], [2,2]], // Bottom
  // Diagonal
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
  const [displayCredits, setDisplayCredits] = useState(1000); // For count up animation
  const [bet, setBet] = useState(10);
  const [lastWin, setLastWin] = useState(0);
  const [message, setMessage] = useState("SPIN TO WIN!");
  const [winningLines, setWinningLines] = useState<number[][]>([]); // Array of lines (each line is an array of 3 [r,c] coords)

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
        // Start immediately if turning on
        setTimeout(() => performSpin(), 100);
      }
      return next;
    });
  };

  const performSpin = useCallback(() => {
    if (credits < bet) {
      setMessage("INSUFFICIENT CREDITS");
      setIsAutoSpining(false);
      return;
    }

    setIsSpinning(true);
    setWinningLines([]);
    setCredits((prev) => prev - bet);
    setLastWin(0);
    setMessage("SPINNING...");

    // Start spin animations
    reelsRef.current.forEach((reel, i) => {
      if (reel) {
        gsap.to(reel, {
          y: '+=100%',
          duration: 0.1,
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
          const symbolData = SYMBOLS_DATA.find(s => s.char === sym1);
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
        } else {
          setMessage(`WINNER! +${totalWin}`);
        }
      } else {
        setMessage("TRY AGAIN!");
      }

      setIsSpinning(false);

      // Check auto spin continuation
      if (autoSpinRef.current) {
        setTimeout(() => {
          if (autoSpinRef.current) performSpin();
        }, 1500); // Wait 1.5s before next auto spin
      }

    }, REEL_SPIN_DURATION_BASE + (2 * REEL_STOP_DELAY) + 100);

  }, [bet, credits]);

  // Check if a cell is part of a winning line
  const isCellWinning = (r: number, c: number) => {
    return winningLines.some(line => line.some(coord => coord[0] === r && coord[1] === c));
  };

  return (
    <section
      ref={sectionRef}
      id="play"
      className="relative w-full min-h-screen bg-casino-ink py-[10vh] flex flex-col items-center justify-center overflow-hidden"
      style={{ zIndex: 90 }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 60%)' }} />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-[6vw] flex flex-col items-center">
        
        <div className="text-center mb-8">
          <h2 className="font-serif text-5xl md:text-7xl text-casino-ivory uppercase" style={{ textShadow: '0 0 20px rgba(176,38,255,0.6)' }}>
            Neon Slots
          </h2>
          <p className={`font-mono mt-4 text-xl h-8 tracking-widest uppercase transition-colors duration-300 ${winningLines.length > 0 ? 'text-casino-ember animate-bounce' : 'text-casino-gold animate-pulse'}`}>
            {message}
          </p>
        </div>

        {/* Slot Machine Container */}
        <div className={`bg-casino-charcoal p-6 md:p-8 rounded-3xl border transition-all duration-500 w-full max-w-3xl ${winningLines.length > 0 ? 'shadow-[0_0_80px_rgba(255,0,127,0.5)] border-casino-ember' : 'shadow-[0_0_50px_rgba(176,38,255,0.3)] border-casino-neon/30'}`}>
          
          {/* Top Display */}
          <div className="flex justify-between items-center mb-6 px-4 font-mono text-lg md:text-xl bg-black/40 py-3 rounded-lg border border-white/5">
            <div className="flex flex-col">
              <span className="text-casino-muted text-xs uppercase mb-1">Credits</span>
              <span className="text-casino-ivory font-bold">{displayCredits.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-casino-muted text-xs uppercase mb-1">Bet</span>
              <button 
                onClick={toggleBet} 
                disabled={isSpinning || isAutoSpining}
                className={`text-casino-gold font-bold px-4 py-1 rounded-md transition-colors ${!isSpinning && !isAutoSpining ? 'hover:bg-white/10 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                {bet}
              </button>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-casino-muted text-xs uppercase mb-1">Win</span>
              <span className="text-casino-ember font-bold">{lastWin > 0 ? `+${lastWin.toLocaleString()}` : '0'}</span>
            </div>
          </div>

          {/* Reels Area */}
          <div className="relative bg-casino-ink rounded-xl border-[4px] border-casino-ivory/10 overflow-hidden h-[300px] flex justify-center items-center gap-2 md:gap-6 p-4">
            
            {/* Horizontal Payline Indicators (Visual flair) */}
            <div className="absolute left-2 top-[50%] -translate-y-1/2 flex flex-col justify-between h-full py-12 pointer-events-none opacity-20">
              <div className="w-2 h-2 rounded-full bg-casino-neon" />
              <div className="w-2 h-2 rounded-full bg-casino-neon" />
              <div className="w-2 h-2 rounded-full bg-casino-neon" />
            </div>
            <div className="absolute right-2 top-[50%] -translate-y-1/2 flex flex-col justify-between h-full py-12 pointer-events-none opacity-20">
              <div className="w-2 h-2 rounded-full bg-casino-neon" />
              <div className="w-2 h-2 rounded-full bg-casino-neon" />
              <div className="w-2 h-2 rounded-full bg-casino-neon" />
            </div>

            {/* Columns */}
            {[0, 1, 2].map((colIndex) => (
              <div key={colIndex} className="relative w-1/3 h-full overflow-hidden bg-black/60 rounded-lg shadow-inner border border-white/5">
                <div 
                  ref={(el) => { reelsRef.current[colIndex] = el; }}
                  className={`absolute top-0 left-0 w-full h-full flex flex-col`}
                >
                  <div className="h-full flex flex-col justify-between py-4">
                    {[0, 1, 2].map((rowIndex) => {
                      const isWinning = isCellWinning(rowIndex, colIndex);
                      // Determine if this reel is still spinning
                      // The animation tweaks the transform of the container, but we also blur the content.
                      // GSAP is modifying the parent div.
                      return (
                        <div 
                          key={rowIndex} 
                          className={`flex justify-center items-center h-[80px] text-5xl md:text-6xl lg:text-7xl transition-all duration-300 ${
                            isWinning ? 'scale-125 z-20 drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]' : 
                            (winningLines.length > 0 ? 'opacity-20 grayscale' : 'opacity-90')
                          }`}
                        >
                          <span style={{ textShadow: isWinning ? '0 0 30px currentColor' : '0 0 10px currentColor' }}>
                            {grid[rowIndex][colIndex]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* Controls */}
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-4 w-full md:w-auto">
              <button 
                onClick={toggleAutoSpin}
                className={`flex-1 md:flex-none px-6 py-3 rounded-full font-mono text-sm border transition-colors cursor-pointer ${
                  isAutoSpining ? 'bg-casino-neon/20 text-casino-neon border-casino-neon' : 'bg-casino-ink text-casino-ivory/50 border-casino-ivory/10 hover:text-casino-ivory hover:border-casino-ivory/30'
                }`}
              >
                {isAutoSpining ? 'STOP AUTO' : 'AUTO SPIN'}
              </button>
              <button 
                onClick={setMaxBet}
                disabled={isSpinning || isAutoSpining}
                className="flex-1 md:flex-none px-6 py-3 bg-casino-ink text-casino-ivory/50 rounded-full font-mono text-sm border border-casino-ivory/10 hover:text-casino-ivory hover:border-casino-ivory/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                MAX BET
              </button>
            </div>
            
            <button 
              onClick={isAutoSpining ? toggleAutoSpin : performSpin}
              disabled={(!isAutoSpining && (isSpinning || credits < bet))}
              className={`w-full md:w-auto px-16 py-4 rounded-full font-serif text-2xl uppercase tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(255,0,127,0.4)] ${
                (!isAutoSpining && (isSpinning || credits < bet))
                ? 'bg-casino-ink text-casino-muted cursor-not-allowed opacity-50 shadow-none' 
                : 'bg-casino-ember text-casino-ivory hover:scale-105 hover:bg-casino-ember/80 hover:shadow-[0_0_50px_rgba(255,0,127,0.8)] cursor-pointer'
              }`}
            >
              {isAutoSpining ? 'STOP' : (isSpinning ? 'SPINNING' : 'SPIN')}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
