import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import {
  BadgePlus,
  Bell,
  CircleDollarSign,
  Coins,
  Crown,
  Flame,
  Gem,
  LockKeyhole,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';

gsap.registerPlugin(ScrollTrigger);

type SlotGameId = 'neon' | 'cascade' | 'vault';

interface SlotSymbol {
  id: string;
  icon: LucideIcon;
  color: string;
  weight: number;
  payout: number;
  label: string;
  role?: 'standard' | 'scatter' | 'wild' | 'cash' | 'lock';
  cashValue?: number;
}

interface SlotGameConfig {
  id: SlotGameId;
  title: string;
  subtitle: string;
  imageBase: string;
  accent: string;
  layout: string;
  rows: number;
  cols: number;
  betOptions: number[];
  volatility: string;
  bonusHook: string;
  symbols: SlotSymbol[];
  paytable: string[];
}

interface BonusState {
  mystery: number;
  freeSpinTickets: number;
  multiplierPasses: number;
  streak: number;
  activeBoost: number;
  vaultRespins: number;
}

interface SpinResult {
  grid: string[][];
  win: number;
  message: string;
  matchedCells: string[];
  cascadeCount: number;
  scatterCount: number;
  bonusTriggered?: string;
  freeSpinAward?: number;
  creditAward?: number;
  lockedCells?: string[];
  vaultRespins?: number;
  settledGrid?: string[][];
  vaultFilled?: boolean;
}

interface PlayableSlotSectionProps {
  sectionId?: string;
}

const PAYLINES = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[2, 0], [1, 1], [0, 2]],
];

const BASE_SYMBOLS = {
  coins: { id: 'coins', icon: Coins, color: '#facc15', weight: 40, payout: 2, label: 'Coins' },
  flame: { id: 'flame', icon: Flame, color: '#ff4500', weight: 30, payout: 3, label: 'Flame' },
  bell: { id: 'bell', icon: Bell, color: '#38bdf8', weight: 17, payout: 5, label: 'Bell' },
  star: { id: 'star', icon: Star, color: '#c084fc', weight: 10, payout: 10, label: 'Star Wild', role: 'wild' as const },
  crown: { id: 'crown', icon: Crown, color: '#fbbf24', weight: 5, payout: 25, label: 'Crown Scatter', role: 'scatter' as const },
  gem: { id: 'gem', icon: Gem, color: '#ffffff', weight: 2, payout: 100, label: 'Gem Jackpot' },
  lock: { id: 'lock', icon: LockKeyhole, color: '#00f3ff', weight: 10, payout: 8, label: 'Vault Lock', role: 'lock' as const },
  cash: { id: 'cash', icon: CircleDollarSign, color: '#22c55e', weight: 14, payout: 1, label: 'Cash Orb', role: 'cash' as const, cashValue: 80 },
};

const SLOT_GAMES: SlotGameConfig[] = [
  {
    id: 'neon',
    title: 'Neon Reels',
    subtitle: '5-line classic with streak wilds',
    imageBase: 'slot_neon',
    accent: '#00f3ff',
    layout: '3x3 / 5 lines',
    rows: 3,
    cols: 3,
    betOptions: [10, 50, 100],
    volatility: 'Fast',
    bonusHook: 'Crowns trigger tickets. A 3-win streak upgrades Stars into active wilds.',
    symbols: [BASE_SYMBOLS.coins, BASE_SYMBOLS.flame, BASE_SYMBOLS.bell, BASE_SYMBOLS.star, BASE_SYMBOLS.crown, BASE_SYMBOLS.gem],
    paytable: ['3 matching symbols on any line pay symbol x bet', '3+ Crowns award 8 free-spin tickets', '3-win streak activates a 2x wild boost'],
  },
  {
    id: 'cascade',
    title: 'Cascade Nexus',
    subtitle: 'Cluster wins and rising tumble multipliers',
    imageBase: 'slot_symbols',
    accent: '#b026ff',
    layout: '5x5 clusters',
    rows: 5,
    cols: 5,
    betOptions: [10, 25, 50],
    volatility: 'Swingy',
    bonusHook: 'Clusters pop, the chain multiplier rises, and 3 scatters unlock free drops.',
    symbols: [BASE_SYMBOLS.coins, BASE_SYMBOLS.flame, BASE_SYMBOLS.bell, BASE_SYMBOLS.star, BASE_SYMBOLS.crown, BASE_SYMBOLS.gem],
    paytable: ['5+ connected symbols form a cluster win', 'Each cascade chain adds +1x to the tumble multiplier', '3+ Crowns award 6 free-drop tickets'],
  },
  {
    id: 'vault',
    title: 'Vault Lock',
    subtitle: 'Hold-and-spin cash chamber',
    imageBase: 'slot_jackpot',
    accent: '#ffd700',
    layout: '3x5 hold board',
    rows: 3,
    cols: 5,
    betOptions: [20, 50, 100],
    volatility: 'Bonus heavy',
    bonusHook: 'Cash and locks stick. New locked symbols reset respins. Fill the vault for a mega jackpot.',
    symbols: [BASE_SYMBOLS.coins, BASE_SYMBOLS.flame, BASE_SYMBOLS.bell, BASE_SYMBOLS.cash, BASE_SYMBOLS.lock, BASE_SYMBOLS.gem],
    paytable: ['Cash Orbs lock and add instant credit value', '6+ locked cells starts hold-and-spin respins', 'Filling all 15 cells awards a 250x mega jackpot'],
  },
];

const FAKE_WINNERS = [
  { name: 'Alex_K', amount: 4200, symbol: 'Gem', game: 'Neon Reels' },
  { name: 'NeonKing', amount: 1500, symbol: 'Crown', game: 'Cascade Nexus' },
  { name: 'SpinMaster', amount: 9900, symbol: 'Vault', game: 'Vault Lock' },
  { name: 'CyberLuck7', amount: 750, symbol: 'Star', game: 'Neon Reels' },
  { name: 'Phantom_X', amount: 3300, symbol: 'Cash', game: 'Vault Lock' },
];

const DEFAULT_BONUS_STATE: BonusState = {
  mystery: 0,
  freeSpinTickets: 0,
  multiplierPasses: 0,
  streak: 0,
  activeBoost: 1,
  vaultRespins: 0,
};

const getStoredCredits = () => {
  try {
    const saved = localStorage.getItem('casino_credits');
    const parsed = parseInt(saved || '1000', 10);
    return !Number.isNaN(parsed) && parsed >= 0 ? parsed : 1000;
  } catch {
    return 1000;
  }
};

const getStoredBonusState = (): BonusState => {
  try {
    const saved = localStorage.getItem('casino_bonus_state');
    if (!saved) return DEFAULT_BONUS_STATE;
    const parsed = JSON.parse(saved) as Partial<BonusState>;
    return { ...DEFAULT_BONUS_STATE, ...parsed };
  } catch {
    return DEFAULT_BONUS_STATE;
  }
};

const getStoredActiveSlot = (): SlotGameId => {
  try {
    const saved = localStorage.getItem('casino_active_slot') as SlotGameId | null;
    return saved && SLOT_GAMES.some((game) => game.id === saved) ? saved : 'neon';
  } catch {
    return 'neon';
  }
};

const getStoredActiveGame = () =>
  SLOT_GAMES.find((game) => game.id === getStoredActiveSlot()) || SLOT_GAMES[0];

const getRandomSymbol = (symbols: SlotSymbol[]) => {
  const total = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
  let roll = Math.random() * total;
  for (const symbol of symbols) {
    if (roll < symbol.weight) return symbol;
    roll -= symbol.weight;
  }
  return symbols[0];
};

const createGrid = (game: SlotGameConfig) =>
  Array.from({ length: game.rows }, () =>
    Array.from({ length: game.cols }, () => getRandomSymbol(game.symbols).id)
  );

const cellKey = (row: number, col: number) => `${row}-${col}`;

const findSymbol = (game: SlotGameConfig, id: string) =>
  game.symbols.find((symbol) => symbol.id === id) || game.symbols[0];

const evaluateNeon = (game: SlotGameConfig, grid: string[][], bet: number, bonus: BonusState): SpinResult => {
  let win = 0;
  const matchedCells = new Set<string>();
  const scatterCount = grid.flat().filter((id) => id === 'crown').length;
  const wildsActive = bonus.streak >= 2 || bonus.activeBoost > 1;

  PAYLINES.forEach((line) => {
    const ids = line.map(([row, col]) => grid[row][col]);
    const target = ids.find((id) => id !== 'star') || 'star';
    const isMatch = ids.every((id) => id === target || (wildsActive && id === 'star'));
    if (!isMatch) return;

    const symbol = findSymbol(game, target);
    win += symbol.payout * bet;
    line.forEach(([row, col]) => matchedCells.add(cellKey(row, col)));
  });

  return {
    grid,
    win,
    matchedCells: [...matchedCells],
    cascadeCount: 0,
    scatterCount,
    freeSpinAward: scatterCount >= 3 ? 8 : 0,
    bonusTriggered: scatterCount >= 3 ? '8 free-spin tickets from Crown scatters' : undefined,
    message: win > 0 ? `Neon line hit: +${win}` : 'Neon reels are warming up',
  };
};

const collectClusters = (game: SlotGameConfig, grid: string[][]) => {
  const visited = new Set<string>();
  const clusters: string[][] = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (let row = 0; row < game.rows; row += 1) {
    for (let col = 0; col < game.cols; col += 1) {
      const startKey = cellKey(row, col);
      if (visited.has(startKey)) continue;

      const symbolId = grid[row][col];
      if (findSymbol(game, symbolId).role === 'scatter') {
        visited.add(startKey);
        continue;
      }

      const queue = [[row, col]];
      const cluster: string[] = [];
      visited.add(startKey);

      while (queue.length > 0) {
        const [currentRow, currentCol] = queue.shift()!;
        cluster.push(cellKey(currentRow, currentCol));
        directions.forEach(([rowDelta, colDelta]) => {
          const nextRow = currentRow + rowDelta;
          const nextCol = currentCol + colDelta;
          const nextKey = cellKey(nextRow, nextCol);
          if (nextRow < 0 || nextRow >= game.rows || nextCol < 0 || nextCol >= game.cols) return;
          if (visited.has(nextKey) || grid[nextRow][nextCol] !== symbolId) return;
          visited.add(nextKey);
          queue.push([nextRow, nextCol]);
        });
      }

      if (cluster.length >= 5) clusters.push(cluster);
    }
  }

  return clusters;
};

const evaluateCascade = (game: SlotGameConfig, startingGrid: string[][], bet: number): SpinResult => {
  let grid = startingGrid;
  let displayGrid = startingGrid;
  let totalWin = 0;
  let cascadeCount = 0;
  let lastMatched: string[] = [];
  const scatterCount = startingGrid.flat().filter((id) => id === 'crown').length;

  for (let chain = 1; chain <= 4; chain += 1) {
    const clusters = collectClusters(game, grid);
    if (clusters.length === 0) break;

    cascadeCount = chain;
    lastMatched = clusters.flat();
    displayGrid = grid;
    const chainWin = clusters.reduce((sum, cluster) => {
      const [row, col] = cluster[0].split('-').map(Number);
      const symbol = findSymbol(game, grid[row][col]);
      return sum + Math.round(cluster.length * symbol.payout * bet * 0.35 * chain);
    }, 0);
    totalWin += chainWin;
    grid = createGrid(game);
  }

  return {
    grid: displayGrid,
    win: totalWin,
    matchedCells: lastMatched,
    cascadeCount,
    scatterCount,
    settledGrid: cascadeCount > 0 ? grid : undefined,
    freeSpinAward: scatterCount >= 3 ? 6 : 0,
    bonusTriggered: scatterCount >= 3 ? '6 free-drop tickets from Nexus scatters' : undefined,
    message: cascadeCount > 0 ? `${cascadeCount} cascade chain: +${totalWin}` : 'No cluster formed yet',
  };
};

const evaluateVault = (
  game: SlotGameConfig,
  grid: string[][],
  bet: number,
  previousLocks: string[],
  previousRespins: number
): SpinResult => {
  const locked = new Set(previousLocks);
  let newLocks = 0;
  let cashWin = 0;

  grid.forEach((row, rowIndex) => {
    row.forEach((id, colIndex) => {
      const symbol = findSymbol(game, id);
      const key = cellKey(rowIndex, colIndex);
      if (locked.has(key)) {
        grid[rowIndex][colIndex] = id === 'cash' || id === 'lock' ? id : 'cash';
        return;
      }
      if (symbol.role === 'cash' || symbol.role === 'lock') {
        locked.add(key);
        newLocks += 1;
        cashWin += Math.round((symbol.cashValue || 60) + bet * symbol.payout);
      }
    });
  });

  const lockedCells = [...locked];
  const vaultFilled = lockedCells.length === game.rows * game.cols;
  const respins = lockedCells.length >= 6 ? (newLocks > 0 ? 3 : Math.max(0, previousRespins - 1)) : 0;
  const megaWin = vaultFilled ? bet * 250 : 0;

  return {
    grid,
    win: cashWin + megaWin,
    matchedCells: lockedCells,
    cascadeCount: 0,
    scatterCount: lockedCells.length,
    lockedCells,
    vaultRespins: respins,
    vaultFilled,
    bonusTriggered: vaultFilled ? 'Mega jackpot vault filled' : newLocks > 0 ? 'New cash locked. Respins reset.' : undefined,
    message: vaultFilled ? `Vault filled: +${cashWin + megaWin}` : newLocks > 0 ? `${newLocks} vault symbols locked` : 'Vault respin missed',
  };
};

export default function PlayableSlotSection({ sectionId = 'play' }: PlayableSlotSectionProps) {
  const [initialGame] = useState<SlotGameConfig>(getStoredActiveGame);
  const sectionRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const autoSpinRef = useRef(false);
  const isSpinningRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const creditTweenRef = useRef<ReturnType<typeof gsap.to> | null>(null);
  const activeGameRef = useRef<SlotGameConfig>(initialGame);
  const bonusRef = useRef<BonusState>(getStoredBonusState());
  const creditsRef = useRef(getStoredCredits());
  const performSpinRef = useRef(() => {});

  const [activeGameId, setActiveGameId] = useState<SlotGameId>(initialGame.id);
  const activeGame = useMemo(
    () => SLOT_GAMES.find((game) => game.id === activeGameId) || SLOT_GAMES[0],
    [activeGameId]
  );
  const [grid, setGrid] = useState(() => createGrid(initialGame));
  const [matchedCells, setMatchedCells] = useState<string[]>([]);
  const [vaultLockedCells, setVaultLockedCells] = useState<string[]>([]);
  const [bonusState, setBonusState] = useState<BonusState>(getStoredBonusState);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [credits, setCredits] = useState(getStoredCredits);
  const [displayCredits, setDisplayCredits] = useState(getStoredCredits);
  const [bet, setBet] = useState(initialGame.betOptions[0]);
  const [lastWin, setLastWin] = useState(0);
  const [message, setMessage] = useState('CHOOSE A SLOT AND SPIN');
  const [muted, setMuted] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState(0);

  const clearSpinTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    if (boardRef.current) gsap.killTweensOf(boardRef.current);
  }, []);

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((timeoutId) => timeoutId !== id);
      callback();
    }, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const fireConfetti = useCallback((colors: string[]) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.72 }, colors });
  }, []);

  useEffect(() => { activeGameRef.current = activeGame; }, [activeGame]);
  useEffect(() => { bonusRef.current = bonusState; }, [bonusState]);
  useEffect(() => { autoSpinRef.current = isAutoSpin; }, [isAutoSpin]);
  useEffect(() => { isSpinningRef.current = isSpinning; }, [isSpinning]);
  useEffect(() => { creditsRef.current = credits; }, [credits]);
  useEffect(() => { AudioEngine.setMuted(muted); }, [muted]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.fromTo(section, { opacity: 0, y: 50 }, {
      opacity: 1,
      y: 0,
      duration: prefersReducedMotion ? 0 : 1,
      scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' },
    });

    return () => {
      clearSpinTimeouts();
      creditTweenRef.current?.kill();
      AudioEngine.stopAmbient();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) trigger.kill();
      });
    };
  }, [clearSpinTimeouts]);

  useEffect(() => {
    try {
      localStorage.setItem('casino_credits', credits.toString());
    } catch {
      // localStorage unavailable
    }
  }, [credits]);

  useEffect(() => {
    try {
      localStorage.setItem('casino_bonus_state', JSON.stringify(bonusState));
    } catch {
      // localStorage unavailable
    }
  }, [bonusState]);

  useEffect(() => {
    if (displayCredits === credits) return;
    const count = { value: displayCredits };
    creditTweenRef.current?.kill();
    creditTweenRef.current = gsap.to(count, {
      value: credits,
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => setDisplayCredits(Math.round(count.value)),
    });

    return () => {
      creditTweenRef.current?.kill();
    };
  }, [credits, displayCredits]);

  useEffect(() => {
    const id = setInterval(() => setWinnerIdx((index) => (index + 1) % FAKE_WINNERS.length), 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!tickerRef.current) return;
    gsap.fromTo(tickerRef.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, [winnerIdx]);

  const activateGame = useCallback((gameId: SlotGameId) => {
    if (isSpinningRef.current) return;
    clearSpinTimeouts();
    autoSpinRef.current = false;
    setIsAutoSpin(false);

    const nextGame = SLOT_GAMES.find((game) => game.id === gameId) || SLOT_GAMES[0];
    activeGameRef.current = nextGame;
    setActiveGameId(nextGame.id);
    setGrid(createGrid(nextGame));
    setMatchedCells([]);
    setLastWin(0);
    setShowPaytable(false);
    setMessage(`${nextGame.title.toUpperCase()} READY`);
    setBet((currentBet) => nextGame.betOptions.includes(currentBet) ? currentBet : nextGame.betOptions[0]);
    if (nextGame.id !== 'vault') setVaultLockedCells([]);
    try {
      localStorage.setItem('casino_active_slot', nextGame.id);
    } catch {
      // localStorage unavailable
    }
  }, [clearSpinTimeouts]);

  useEffect(() => {
    const refreshRewards = () => {
      setCredits(getStoredCredits());
      setBonusState(getStoredBonusState());
      setMessage('WELCOME BONUS LOADED');
    };
    const handleSlotSelected = (event: Event) => {
      const detail = (event as CustomEvent<{ slotId?: SlotGameId }>).detail;
      if (detail?.slotId && SLOT_GAMES.some((game) => game.id === detail.slotId)) {
        activateGame(detail.slotId);
      }
    };

    window.addEventListener('casino:bonus-awarded', refreshRewards);
    window.addEventListener('casino:slot-selected', handleSlotSelected);
    window.addEventListener('storage', refreshRewards);
    return () => {
      window.removeEventListener('casino:bonus-awarded', refreshRewards);
      window.removeEventListener('casino:slot-selected', handleSlotSelected);
      window.removeEventListener('storage', refreshRewards);
    };
  }, [activateGame]);

  const updateBonusState = useCallback((updater: (current: BonusState) => BonusState) => {
    setBonusState((current) => {
      const next = updater(current);
      bonusRef.current = next;
      return next;
    });
  }, []);

  const resetCredits = () => {
    if (isSpinning) return;
    setCredits(1000);
    setBonusState(DEFAULT_BONUS_STATE);
    setVaultLockedCells([]);
    setMessage('DEMO WALLET RESET');
  };

  const setActiveGameSafely = (gameId: SlotGameId) => {
    if (isSpinning) return;
    activateGame(gameId);
  };

  const cycleBet = () => {
    if (isSpinning || isAutoSpin) return;
    const options = activeGame.betOptions;
    const currentIndex = options.indexOf(bet);
    setBet(options[(currentIndex + 1) % options.length]);
  };

  const setMaxBet = () => {
    if (isSpinning || isAutoSpin) return;
    setBet(activeGame.betOptions[activeGame.betOptions.length - 1]);
  };

  const resolveMysteryMeter = useCallback((current: BonusState, hasWin: boolean) => {
    const next = { ...current };
    if (hasWin) {
      next.mystery = Math.min(100, next.mystery + 7);
      return { state: next, message: '' };
    }

    next.mystery = Math.min(130, next.mystery + 24 + Math.floor(Math.random() * 11));
    if (next.mystery < 100) return { state: next, message: '' };

    const prize = Math.floor(Math.random() * 3);
    next.mystery = 0;
    if (prize === 0) {
      next.freeSpinTickets += 5;
      return { state: next, message: 'Mystery meter awarded 5 tickets' };
    }
    if (prize === 1) {
      next.multiplierPasses += 2;
      return { state: next, message: 'Mystery meter awarded 2 multiplier passes' };
    }
    return { state: next, message: 'Mystery meter burst paid 500 credits', creditAward: 500 };
  }, []);

  const performSpin = useCallback(() => {
    clearSpinTimeouts();
    const game = activeGameRef.current;
    const currentBonus = bonusRef.current;
    const currentCredits = creditsRef.current;
    const usesTicket = currentBonus.freeSpinTickets > 0;

    if (!usesTicket && currentCredits < bet) {
      setMessage('INSUFFICIENT DEMO CREDITS');
      setIsAutoSpin(false);
      return;
    }

    setIsSpinning(true);
    setMatchedCells([]);
    setLastWin(0);
    setMessage(usesTicket ? `FREE TICKET SPIN (${currentBonus.freeSpinTickets} LEFT)` : `${game.title.toUpperCase()} SPINNING`);
    if (!usesTicket) setCredits((value) => value - bet);
    AudioEngine.spinStart();

    if (boardRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      gsap.fromTo(
        boardRef.current,
        { scale: 0.985, filter: 'brightness(1.8)' },
        { scale: 1, filter: 'brightness(1)', duration: prefersReducedMotion ? 0 : 0.9, ease: 'elastic.out(1, 0.55)' }
      );
    }

    scheduleTimeout(() => {
      const spinGrid = createGrid(game);
      let result: SpinResult;
      if (game.id === 'neon') {
        result = evaluateNeon(game, spinGrid, bet, currentBonus);
      } else if (game.id === 'cascade') {
        result = evaluateCascade(game, spinGrid, bet);
      } else {
        result = evaluateVault(game, spinGrid, bet, vaultLockedCells, currentBonus.vaultRespins);
        setVaultLockedCells(result.lockedCells || []);
      }

      const multiplier = currentBonus.multiplierPasses > 0 ? 2 : currentBonus.activeBoost;
      const boostedWin = Math.round(result.win * multiplier);
      const hasWin = boostedWin > 0;
      const mystery = resolveMysteryMeter(currentBonus, hasWin);
      const ticketCost = usesTicket ? 1 : 0;
      const nextStreak = hasWin ? currentBonus.streak + 1 : 0;
      const creditAward = (mystery.creditAward || 0) + (result.creditAward || 0);

      updateBonusState((current) => ({
        ...mystery.state,
        freeSpinTickets: Math.max(0, mystery.state.freeSpinTickets - ticketCost + (result.freeSpinAward || 0)),
        multiplierPasses: Math.max(0, mystery.state.multiplierPasses - (current.multiplierPasses > 0 ? 1 : 0)),
        streak: nextStreak,
        activeBoost: nextStreak >= 3 ? 2 : 1,
        vaultRespins: game.id === 'vault' ? (result.vaultRespins || 0) : current.vaultRespins,
      }));

      setGrid(result.grid);
      setMatchedCells(result.matchedCells);
      setLastWin(boostedWin + creditAward);

      if (game.id === 'cascade' && result.settledGrid) {
        scheduleTimeout(() => {
          setGrid(result.settledGrid!);
          setMatchedCells([]);
        }, 650);
      }

      if (boostedWin + creditAward > 0) {
        setCredits((value) => value + boostedWin + creditAward);
        AudioEngine.smallWin();
      }
      if (boostedWin >= bet * 20 || result.vaultFilled) {
        AudioEngine.bigWin();
        fireConfetti([game.accent, '#ffd700', '#ffffff']);
      } else if (result.freeSpinAward || mystery.message) {
        AudioEngine.freeSpinsUnlocked();
        fireConfetti([game.accent, '#00f3ff', '#ffd700']);
      }

      const boostLabel = multiplier > 1 ? ` x${multiplier}` : '';
      const bonusLabel = result.bonusTriggered ? ` · ${result.bonusTriggered}` : '';
      const mysteryLabel = mystery.message ? ` · ${mystery.message}` : '';
      setMessage(hasWin ? `${result.message}${boostLabel}${bonusLabel}${mysteryLabel}` : `${result.message}${bonusLabel}${mysteryLabel}`);
      setIsSpinning(false);

      if (autoSpinRef.current) {
        scheduleTimeout(() => {
          if (autoSpinRef.current) performSpinRef.current();
        }, 1400);
      }
    }, 900);
  }, [bet, clearSpinTimeouts, fireConfetti, resolveMysteryMeter, scheduleTimeout, updateBonusState, vaultLockedCells]);

  useEffect(() => {
    performSpinRef.current = performSpin;
  }, [performSpin]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isSpinning && !isAutoSpin) {
        event.preventDefault();
        performSpin();
      }
      if (event.code === 'Escape' && showPaytable) setShowPaytable(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutoSpin, isSpinning, performSpin, showPaytable]);

  const renderSymbol = (id: string, row: number, col: number) => {
    const symbol = findSymbol(activeGame, id);
    const Icon = symbol.icon;
    const key = cellKey(row, col);
    const isMatched = matchedCells.includes(key);
    const isMuted = matchedCells.length > 0 && !isMatched;

    return (
      <div
        className={`flex h-full w-full items-center justify-center transition duration-300 ${isMatched ? 'scale-110' : ''} ${isMuted ? 'opacity-30 grayscale' : 'opacity-100'}`}
        aria-label={symbol.label}
      >
        <Icon
          className="h-9 w-9 md:h-11 md:w-11"
          color={symbol.color}
          strokeWidth={isMatched ? 2.7 : 1.7}
          style={{
            filter: isMatched
              ? `drop-shadow(0 0 16px ${symbol.color}) drop-shadow(0 0 26px ${symbol.color})`
              : `drop-shadow(0 0 7px ${symbol.color}85)`,
          }}
        />
      </div>
    );
  };

  const liveWinner = FAKE_WINNERS[winnerIdx];
  const canSpin = bonusState.freeSpinTickets > 0 || credits >= bet;

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="relative z-[90] flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-casino-ink py-[10vh]"
    >
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(circle_at_50%_50%,_rgba(176,38,255,0.06)_0%,_transparent_60%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-[6vw]">
        <div className="flex w-full max-w-3xl items-center gap-3 rounded-full border border-casino-gold/30 bg-black/50 px-5 py-2">
          <Trophy className="h-4 w-4 shrink-0 text-casino-gold" />
          <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-casino-muted">Live Win</span>
          <div ref={tickerRef} className="truncate font-mono text-sm text-casino-gold">
            <span className="font-bold text-casino-ivory">{liveWinner.name}</span>
            <span className="mx-2 text-casino-muted">hit</span>
            <span className="font-bold">{liveWinner.symbol} {liveWinner.amount.toLocaleString()}</span>
            <span className="ml-2 text-casino-muted">on {liveWinner.game}</span>
          </div>
        </div>

        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-casino-cyber">Cyber Arcade Lobby</p>
          <h2 className="mt-3 font-serif text-5xl uppercase text-casino-ivory [text-shadow:0_0_30px_rgba(176,38,255,0.8)] md:text-7xl">
            Active Slots
          </h2>
          <div className="mt-4 inline-block rounded-full border border-casino-neon/30 bg-black/40 px-6 py-2 shadow-[0_0_20px_rgba(176,38,255,0.2)]">
            <p className="font-mono text-base uppercase tracking-widest text-casino-neon md:text-xl">{message}</p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
          {SLOT_GAMES.map((game) => {
            const isActive = game.id === activeGame.id;
            return (
              <button
                key={game.id}
                onClick={() => setActiveGameSafely(game.id)}
                disabled={isSpinning}
                className={`group min-h-[132px] border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive ? 'bg-white/[0.08] shadow-[0_0_28px_rgba(0,243,255,0.16)]' : 'bg-white/[0.025] hover:bg-white/[0.05]'
                }`}
                style={{ borderColor: isActive ? game.accent : 'rgba(255,255,255,0.12)' }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="font-serif text-2xl uppercase text-casino-ivory">{game.title}</span>
                  <span className="border px-2 py-1 font-mono text-[10px] uppercase tracking-widest" style={{ borderColor: `${game.accent}80`, color: game.accent }}>
                    {game.volatility}
                  </span>
                </div>
                <p className="text-sm leading-6 text-casino-muted">{game.subtitle}</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest" style={{ color: game.accent }}>{game.layout}</p>
              </button>
            );
          })}
        </div>

        <div className="grid w-full grid-cols-1 gap-5 border border-casino-ivory/12 bg-black/30 p-4 md:grid-cols-4">
          {[
            { icon: Sparkles, label: 'Mystery Meter', value: `${Math.min(100, bonusState.mystery)}%` },
            { icon: BadgePlus, label: 'Free Tickets', value: bonusState.freeSpinTickets.toString() },
            { icon: Zap, label: 'Multiplier Pass', value: `${bonusState.multiplierPasses} left` },
            { icon: Shield, label: activeGame.id === 'vault' ? 'Vault Respins' : 'Win Streak', value: activeGame.id === 'vault' ? bonusState.vaultRespins.toString() : `${bonusState.streak}x` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 border border-white/8 bg-casino-ink/60 p-4">
              <Icon className="h-5 w-5 text-casino-gold" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">{label}</p>
                <p className="mt-1 font-serif text-2xl text-casino-ivory">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`relative w-full max-w-5xl border-2 bg-casino-ink/80 p-5 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-xl transition md:p-8 ${
            lastWin > 0 ? 'border-casino-gold' : 'border-casino-ivory/10'
          }`}
        >
          <div className="mb-6 grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-black/55 p-4 shadow-inner">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">Balance</span>
              <p className="font-mono text-xl text-casino-ivory md:text-2xl">{displayCredits.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">Bet</span>
              <button
                onClick={cycleBet}
                disabled={isSpinning || isAutoSpin}
                className="block w-full font-mono text-xl font-bold text-casino-neon disabled:opacity-50 md:text-2xl"
              >
                {bonusState.freeSpinTickets > 0 ? 'TICKET' : bet}
              </button>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] uppercase tracking-widest text-casino-muted">Last Win</span>
              <p className="font-mono text-xl text-casino-gold md:text-2xl">{lastWin > 0 ? `+${lastWin.toLocaleString()}` : '0'}</p>
            </div>
          </div>

          <div
            ref={boardRef}
            className="relative mx-auto grid min-h-[300px] w-full max-w-[760px] gap-2 overflow-hidden rounded-3xl border-4 border-[#171717] bg-[#050505] p-4 shadow-[inset_0_0_50px_rgba(0,0,0,1)] md:gap-3 md:p-6"
            style={{ gridTemplateColumns: `repeat(${activeGame.cols}, minmax(0, 1fr))` }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent" />
            {grid.map((row, rowIndex) =>
              row.map((id, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="flex aspect-square min-h-0 items-center justify-center rounded-xl border border-white/[0.04] bg-black/45 shadow-[inset_0_0_18px_rgba(0,0,0,0.75)]"
                >
                  {renderSymbol(id, rowIndex, colIndex)}
                </div>
              ))
            )}
          </div>

          <div className="mt-8 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setIsAutoSpin((value) => {
                  const next = !value;
                  if (next && !isSpinning) scheduleTimeout(performSpin, 100);
                  return next;
                })}
                aria-pressed={isAutoSpin}
                className={`px-4 py-4 font-mono text-xs uppercase tracking-widest transition ${isAutoSpin ? 'bg-casino-neon/20 text-casino-neon' : 'bg-[#151515] text-casino-ivory/60 hover:text-casino-ivory'}`}
              >
                {isAutoSpin ? 'Stop Auto' : 'Auto Spin'}
              </button>
              <button
                onClick={setMaxBet}
                disabled={isSpinning || isAutoSpin}
                className="bg-[#151515] px-4 py-4 font-mono text-xs uppercase tracking-widest text-casino-ivory/60 transition hover:text-casino-gold disabled:opacity-40"
              >
                Max Bet
              </button>
              <button
                onClick={() => setShowPaytable((value) => !value)}
                aria-expanded={showPaytable}
                className={`px-4 py-4 font-mono text-xs uppercase tracking-widest transition ${showPaytable ? 'bg-casino-ember/20 text-casino-ember' : 'bg-[#151515] text-casino-ivory/60 hover:text-casino-ivory'}`}
              >
                Paytable
              </button>
            </div>

            <button
              onClick={isAutoSpin ? () => setIsAutoSpin(false) : performSpin}
              disabled={!isAutoSpin && (isSpinning || !canSpin)}
              className={`relative overflow-hidden px-12 py-5 font-serif text-3xl uppercase tracking-widest transition ${
                !isAutoSpin && (isSpinning || !canSpin)
                  ? 'bg-[#1a1a1a] text-casino-muted'
                  : 'bg-casino-ember text-casino-ivory shadow-[0_10px_30px_rgba(255,0,127,0.4)] hover:bg-rose-600'
              }`}
            >
              <span className="relative z-10">{isAutoSpin ? 'Stop' : isSpinning ? 'Spinning' : bonusState.freeSpinTickets > 0 ? `Ticket x${bonusState.freeSpinTickets}` : 'Spin'}</span>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setMuted((value) => !value)}
              aria-pressed={muted}
              className="flex items-center gap-2 border border-white/5 bg-[#111] px-4 py-2 text-casino-muted transition hover:text-casino-ivory"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span className="font-mono text-xs">{muted ? 'Muted' : 'Sound On'}</span>
            </button>
            <button
              onClick={resetCredits}
              disabled={isSpinning}
              className="flex items-center gap-2 border border-white/5 bg-[#111] px-4 py-2 text-casino-muted transition hover:text-casino-ember disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="font-mono text-xs">Reset Demo</span>
            </button>
          </div>
        </div>

        {showPaytable && (
          <div className="relative w-full max-w-5xl border border-casino-ivory/10 bg-black/65 p-6 backdrop-blur-xl md:p-8">
            <button
              onClick={() => setShowPaytable(false)}
              aria-label="Close paytable"
              className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-casino-muted transition hover:bg-white/10 hover:text-casino-ivory"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-2xl uppercase text-casino-gold">{activeGame.title} Paytable</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-casino-muted">{activeGame.bonusHook}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {activeGame.symbols.map((symbol) => {
                const Icon = symbol.icon;
                return (
                  <div key={symbol.id} className="flex items-center gap-3 border border-white/5 bg-white/[0.04] p-4">
                    <Icon className="h-8 w-8 shrink-0" color={symbol.color} />
                    <div>
                      <p className="font-mono text-xs text-casino-muted">{symbol.label}</p>
                      <p className="font-mono text-lg font-bold" style={{ color: symbol.color }}>{symbol.role === 'cash' ? 'locks cash' : `${symbol.payout}x`}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {activeGame.paytable.map((line) => (
                <p key={line} className="border border-casino-neon/15 bg-casino-neon/5 p-3 font-mono text-xs uppercase leading-5 tracking-widest text-casino-muted">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
