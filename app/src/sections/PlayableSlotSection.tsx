import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

type SlotGameId = 'neon' | 'cascade' | 'vault' | 'egypt';
type HoldGameId = 'vault' | 'egypt';

interface SlotSymbol {
  id: string;
  icon: LucideIcon;
  color: string;
  weight: number;
  payout: number;
  label: string;
  role?: 'standard' | 'scatter' | 'wild' | 'cash' | 'lock' | 'power' | 'jackpot';
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
  holdRespinsByGame: Record<HoldGameId, number>;
}

interface StoredBonusState extends Partial<Omit<BonusState, 'holdRespinsByGame'>> {
  holdRespinsByGame?: Partial<Record<HoldGameId, number>>;
  vaultRespins?: number;
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
  holdRespins?: number;
  settledGrid?: string[][];
  vaultFilled?: boolean;
  nearMiss?: boolean;
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
  ankh: { id: 'ankh', icon: Sparkles, color: '#ffd700', weight: 24, payout: 4, label: 'Ankh Relic' },
  pharaoh: { id: 'pharaoh', icon: Crown, color: '#f59e0b', weight: 10, payout: 12, label: 'Pharaoh Mask' },
  fireball: { id: 'fireball', icon: Flame, color: '#ff6b00', weight: 13, payout: 1, label: 'Fireball Cash', role: 'cash' as const, cashValue: 100 },
  scarab: { id: 'scarab', icon: Gem, color: '#00ffcc', weight: 4, payout: 0, label: 'Scarab Power', role: 'power' as const },
  temple: { id: 'temple', icon: Bell, color: '#f8fafc', weight: 5, payout: 0, label: 'Temple Scatter', role: 'scatter' as const },
  royal: { id: 'royal', icon: Crown, color: '#ffffff', weight: 1, payout: 1000, label: 'Royal Jackpot', role: 'jackpot' as const },
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
  {
    id: 'egypt',
    title: 'Egypt Fire Demo',
    subtitle: '5x4 Hold & Win with scarab power',
    imageBase: 'slot_bonus',
    accent: '#ff6b00',
    layout: '5x4 / 20 lines',
    rows: 4,
    cols: 5,
    betOptions: [20, 50, 100],
    volatility: 'High',
    bonusHook: 'Six Fireballs trigger Hold & Win. New cash resets respins to three. Scarabs add a power multiplier.',
    symbols: [
      BASE_SYMBOLS.coins,
      BASE_SYMBOLS.flame,
      BASE_SYMBOLS.ankh,
      BASE_SYMBOLS.pharaoh,
      BASE_SYMBOLS.fireball,
      BASE_SYMBOLS.scarab,
      BASE_SYMBOLS.temple,
      BASE_SYMBOLS.royal,
    ],
    paytable: [
      '5 reels x 4 rows with 20 fixed demo paylines',
      '6+ Fireballs trigger Hold & Win respins',
      'Scarab Power can award x2, x3, x5, or x10 on cash values',
      'Full 20-cell fire board awards the Royal demo jackpot',
    ],
  },
];

const FAKE_WINNERS = [
  { name: 'Alex_K', amount: 4200, symbol: 'Gem', game: 'Neon Reels' },
  { name: 'NeonKing', amount: 1500, symbol: 'Crown', game: 'Cascade Nexus' },
  { name: 'SpinMaster', amount: 9900, symbol: 'Vault', game: 'Vault Lock' },
  { name: 'CyberLuck7', amount: 750, symbol: 'Star', game: 'Neon Reels' },
  { name: 'Phantom_X', amount: 3300, symbol: 'Cash', game: 'Vault Lock' },
  { name: 'NileAce', amount: 12400, symbol: 'Scarab', game: 'Egypt Fire Demo' },
];

const createDefaultBonusState = (): BonusState => ({
  mystery: 0,
  freeSpinTickets: 0,
  multiplierPasses: 0,
  streak: 0,
  activeBoost: 1,
  holdRespinsByGame: { vault: 0, egypt: 0 },
});

const createEmptyHoldLocks = (): Record<HoldGameId, string[]> => ({ vault: [], egypt: [] });

const clampStoredCount = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
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
    if (!saved) return createDefaultBonusState();

    const parsed = JSON.parse(saved) as StoredBonusState;
    const holdRespinsByGame = {
      vault: clampStoredCount(parsed.holdRespinsByGame?.vault ?? parsed.vaultRespins),
      egypt: clampStoredCount(parsed.holdRespinsByGame?.egypt),
    };

    return {
      mystery: clampStoredCount(parsed.mystery),
      freeSpinTickets: clampStoredCount(parsed.freeSpinTickets),
      multiplierPasses: clampStoredCount(parsed.multiplierPasses),
      streak: clampStoredCount(parsed.streak),
      activeBoost: clampStoredCount(parsed.activeBoost, 1) || 1,
      holdRespinsByGame,
    };
  } catch {
    return createDefaultBonusState();
  }
};

const getStoredActiveSlot = (): SlotGameId => {
  try {
    const saved = localStorage.getItem('casino_active_slot') as SlotGameId | null;
    return saved && SLOT_GAMES.some((game) => game.id === saved) ? saved : 'egypt';
  } catch {
    return 'egypt';
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

const isValidGrid = (value: unknown, game: SlotGameConfig): value is string[][] => {
  const symbolIds = new Set(game.symbols.map((symbol) => symbol.id));

  return Array.isArray(value)
    && value.length === game.rows
    && value.every((row) => (
      Array.isArray(row)
      && row.length === game.cols
      && row.every((id) => typeof id === 'string' && symbolIds.has(id))
    ));
};

const cellKey = (row: number, col: number) => `${row}-${col}`;

const findSymbol = (game: SlotGameConfig, id: string) =>
  game.symbols.find((symbol) => symbol.id === id) || game.symbols[0];

const isHoldAndWinGame = (gameId: SlotGameId): gameId is HoldGameId => gameId === 'vault' || gameId === 'egypt';

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
    holdRespins: respins,
    vaultFilled,
    bonusTriggered: vaultFilled ? 'Mega jackpot vault filled' : newLocks > 0 ? 'New cash locked. Respins reset.' : undefined,
    message: vaultFilled ? `Vault filled: +${cashWin + megaWin}` : newLocks > 0 ? `${newLocks} vault symbols locked` : 'Vault respin missed',
  };
};

const evaluateEgypt = (
  game: SlotGameConfig,
  grid: string[][],
  bet: number,
  previousLocks: string[],
  previousRespins: number
): SpinResult => {
  const locked = new Set(previousLocks);
  const matchedCells = new Set<string>();
  let lineWin = 0;
  let cashWin = 0;
  let newLocks = 0;
  let powerCount = 0;

  grid.forEach((row, rowIndex) => {
    const first = row[0];
    let run = 1;
    for (let col = 1; col < row.length; col += 1) {
      if (row[col] === first || row[col] === 'scarab') run += 1;
    }
    if (run >= 3 && first !== 'fireball' && first !== 'temple') {
      const symbol = findSymbol(game, first);
      lineWin += Math.round(symbol.payout * bet * (run / 5));
      row.forEach((_, colIndex) => matchedCells.add(cellKey(rowIndex, colIndex)));
    }
  });

  grid.forEach((row, rowIndex) => {
    row.forEach((id, colIndex) => {
      const key = cellKey(rowIndex, colIndex);
      const symbol = findSymbol(game, id);
      if (locked.has(key)) {
        grid[rowIndex][colIndex] = id === 'fireball' || id === 'scarab' || id === 'royal' ? id : 'fireball';
        return;
      }
      if (symbol.role === 'cash' || symbol.role === 'power' || symbol.role === 'jackpot') {
        locked.add(key);
        matchedCells.add(key);
        newLocks += 1;
        if (symbol.role === 'power') {
          powerCount += 1;
        } else if (symbol.role === 'jackpot') {
          cashWin += bet * 1000;
        } else {
          const cashStep = [1, 2, 3, 5, 10][Math.floor(Math.random() * 5)];
          cashWin += bet * cashStep;
        }
      }
    });
  });

  const lockedCells = [...locked];
  const templeCount = grid.flat().filter((id) => id === 'temple').length;
  const holdTriggered = lockedCells.length >= 6;
  const boardFilled = lockedCells.length === game.rows * game.cols;
  const powerMultiplier = powerCount > 0 ? [2, 3, 5, 10][Math.floor(Math.random() * 4)] : 1;
  const respins = holdTriggered ? (newLocks > 0 ? 3 : Math.max(0, previousRespins - 1)) : 0;
  const royalWin = boardFilled ? bet * 10000 : 0;
  const totalCash = Math.round(cashWin * powerMultiplier);

  return {
    grid,
    win: lineWin + totalCash + royalWin,
    matchedCells: [...matchedCells],
    cascadeCount: 0,
    scatterCount: templeCount,
    lockedCells,
    holdRespins: respins,
    vaultFilled: boardFilled,
    freeSpinAward: templeCount >= 3 ? 5 : 0,
    bonusTriggered: boardFilled
      ? 'Royal demo jackpot: full Egypt Fire board'
      : powerMultiplier > 1
        ? `Scarab Power x${powerMultiplier} applied`
        : holdTriggered
          ? 'Hold & Win active: respins reset to 3'
          : templeCount >= 3
            ? 'Temple scatters awarded 5 tickets'
            : undefined,
    message: totalCash + royalWin > 0
      ? `Egypt Fire cash collect: +${totalCash + royalWin}`
      : lineWin > 0
        ? `Egypt 20-line hit: +${lineWin}`
        : 'Egypt Fire needs 6 Fireballs',
  };
};

export default function PlayableSlotSection({ sectionId = 'play' }: PlayableSlotSectionProps) {
  const [initialGame] = useState<SlotGameConfig>(getStoredActiveGame);
  const [initialBonus] = useState<BonusState>(getStoredBonusState);
  const [initialCredits] = useState(getStoredCredits);
  const sectionRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const autoSpinRef = useRef(false);
  const isSpinningRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const isMountedRef = useRef(true);
  const creditTweenRef = useRef<ReturnType<typeof gsap.to> | null>(null);
  const activeGameRef = useRef<SlotGameConfig>(initialGame);
  const bonusRef = useRef<BonusState>(initialBonus);
  const creditsRef = useRef(initialCredits);
  const displayCreditsRef = useRef(initialCredits);
  const holdLockedCellsRef = useRef<Record<HoldGameId, string[]>>(createEmptyHoldLocks());
  const autoSpinTimeoutRef = useRef<number | null>(null);
  const performSpinRef = useRef(() => {});

  const [activeGameId, setActiveGameId] = useState<SlotGameId>(initialGame.id);
  const activeGame = useMemo(
    () => SLOT_GAMES.find((game) => game.id === activeGameId) || SLOT_GAMES[0],
    [activeGameId]
  );
  const activeSymbolMap = useMemo(
    () => new Map(activeGame.symbols.map((symbol) => [symbol.id, symbol])),
    [activeGame]
  );
  const [grid, setGrid] = useState(() => createGrid(initialGame));
  const [matchedCells, setMatchedCells] = useState<string[]>([]);
  const matchedCellSet = useMemo(() => new Set(matchedCells), [matchedCells]);
  const [bonusState, setBonusState] = useState<BonusState>(initialBonus);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [credits, setCredits] = useState(initialCredits);
  const [displayCredits, setDisplayCredits] = useState(initialCredits);
  const [bet, setBet] = useState(initialGame.betOptions[0]);
  const [lastWin, setLastWin] = useState(0);
  const [message, setMessage] = useState('CHOOSE A SLOT AND SPIN');
  const [muted, setMuted] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState(0);
  const [sectionInView, setSectionInView] = useState(false);

  const clearSpinTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    if (autoSpinTimeoutRef.current !== null) {
      clearTimeout(autoSpinTimeoutRef.current);
      autoSpinTimeoutRef.current = null;
    }
    if (boardRef.current) gsap.killTweensOf(boardRef.current);
  }, []);

  const clearAutoSpinTimeout = useCallback(() => {
    if (autoSpinTimeoutRef.current === null) return;
    clearTimeout(autoSpinTimeoutRef.current);
    autoSpinTimeoutRef.current = null;
  }, []);

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((timeoutId) => timeoutId !== id);
      callback();
    }, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const scheduleAutoSpin = useCallback((callback: () => void, delay: number) => {
    clearAutoSpinTimeout();
    const id = window.setTimeout(() => {
      autoSpinTimeoutRef.current = null;
      callback();
    }, delay);
    autoSpinTimeoutRef.current = id;
    return id;
  }, [clearAutoSpinTimeout]);

  const fireConfetti = useCallback((colors: string[]) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    void import('canvas-confetti')
      .then(({ default: confetti }) => {
        confetti({ particleCount: 70, spread: 65, origin: { y: 0.72 }, colors });
      })
      .catch(() => {});
  }, []);

  useEffect(() => { activeGameRef.current = activeGame; }, [activeGame]);
  useEffect(() => { bonusRef.current = bonusState; }, [bonusState]);
  useEffect(() => { autoSpinRef.current = isAutoSpin; }, [isAutoSpin]);
  useEffect(() => { isSpinningRef.current = isSpinning; }, [isSpinning]);
  useEffect(() => { creditsRef.current = credits; }, [credits]);
  useEffect(() => { AudioEngine.setMuted(muted); }, [muted]);

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSectionInView(Boolean(entry?.isIntersecting)),
      { rootMargin: '120px 0px', threshold: 0.04 }
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, []);

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
    if (displayCreditsRef.current === credits) return;

    creditTweenRef.current?.kill();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      displayCreditsRef.current = credits;
      const frameId = window.requestAnimationFrame(() => setDisplayCredits(credits));
      return () => window.cancelAnimationFrame(frameId);
    }

    const count = { value: displayCreditsRef.current };
    creditTweenRef.current = gsap.to(count, {
      value: credits,
      duration: 0.65,
      ease: 'power2.out',
      onUpdate: () => {
        const nextValue = Math.round(count.value);
        displayCreditsRef.current = nextValue;
        setDisplayCredits(nextValue);
      },
    });

    return () => {
      creditTweenRef.current?.kill();
    };
  }, [credits]);

  useEffect(() => {
    if (!sectionInView) return;

    const id = setInterval(() => setWinnerIdx((index) => (index + 1) % FAKE_WINNERS.length), 3000);
    return () => clearInterval(id);
  }, [sectionInView]);

  useEffect(() => {
    if (!tickerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    try {
      localStorage.setItem('casino_active_slot', nextGame.id);
    } catch {
      // localStorage unavailable
    }
  }, [clearSpinTimeouts]);

  useEffect(() => {
    const refreshRewards = () => {
      const nextCredits = getStoredCredits();
      const nextBonusState = getStoredBonusState();
      creditsRef.current = nextCredits;
      bonusRef.current = nextBonusState;
      setCredits(nextCredits);
      setBonusState(nextBonusState);
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

  const stopAutoSpin = useCallback(() => {
    autoSpinRef.current = false;
    setIsAutoSpin(false);
    clearAutoSpinTimeout();
  }, [clearAutoSpinTimeout]);

  const startAutoSpin = useCallback(() => {
    if (isSpinningRef.current || autoSpinRef.current) return;
    autoSpinRef.current = true;
    setIsAutoSpin(true);
    scheduleAutoSpin(() => {
      if (autoSpinRef.current) performSpinRef.current();
    }, 100);
  }, [scheduleAutoSpin]);

  const resetCredits = () => {
    if (isSpinning) return;
    stopAutoSpin();
    const nextBonusState = createDefaultBonusState();
    creditsRef.current = 1000;
    bonusRef.current = nextBonusState;
    setCredits(1000);
    setBonusState(nextBonusState);
    holdLockedCellsRef.current = createEmptyHoldLocks();
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
    if (isSpinningRef.current) return;
    clearSpinTimeouts();
    const game = activeGameRef.current;
    const currentBonus = bonusRef.current;
    const currentCredits = creditsRef.current;
    const usesTicket = currentBonus.freeSpinTickets > 0;

    if (!usesTicket && currentCredits < bet) {
      setMessage('INSUFFICIENT DEMO CREDITS');
      stopAutoSpin();
      return;
    }

    isSpinningRef.current = true;
    setIsSpinning(true);
    setMatchedCells([]);
    setLastWin(0);
    setMessage(usesTicket ? `FREE TICKET SPIN (${currentBonus.freeSpinTickets} LEFT)` : `${game.title.toUpperCase()} SPINNING`);
    if (!usesTicket) {
      const nextCredits = currentCredits - bet;
      creditsRef.current = nextCredits;
      setCredits(nextCredits);
    }
    AudioEngine.spinStart();

    if (boardRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      gsap.fromTo(
        boardRef.current,
        { rotate: -0.15, scale: 0.985 },
        { rotate: 0, scale: 1, duration: prefersReducedMotion ? 0 : 0.9, ease: 'elastic.out(1, 0.55)' }
      );
    }

    scheduleTimeout(async () => {
      let spinGrid: string[][];
      let serverNearMiss = false;
      try {
        const res = await fetch('/api/v1/games/slots/demo-spin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ betAmount: bet, gameId: game.id }),
        });
        if (!res.ok) {
          throw new Error(`Demo spin failed with status ${res.status}`);
        }
        const json = await res.json();
        if (isValidGrid(json.data?.grid, game)) {
          spinGrid = json.data.grid;
          serverNearMiss = !!json.data.nearMiss;
        } else {
          spinGrid = createGrid(game);
        }
      } catch {
        spinGrid = createGrid(game);
      }
      if (!isMountedRef.current) return;
      let result: SpinResult;
      if (game.id === 'neon') {
        result = evaluateNeon(game, spinGrid, bet, currentBonus);
      } else if (game.id === 'cascade') {
        result = evaluateCascade(game, spinGrid, bet);
      } else if (game.id === 'vault') {
        result = evaluateVault(game, spinGrid, bet, holdLockedCellsRef.current.vault, currentBonus.holdRespinsByGame.vault);
        holdLockedCellsRef.current = { ...holdLockedCellsRef.current, vault: result.lockedCells || [] };
      } else {
        result = evaluateEgypt(game, spinGrid, bet, holdLockedCellsRef.current.egypt, currentBonus.holdRespinsByGame.egypt);
        holdLockedCellsRef.current = { ...holdLockedCellsRef.current, egypt: result.lockedCells || [] };
      }
      if (serverNearMiss) result.nearMiss = true;

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
        holdRespinsByGame: isHoldAndWinGame(game.id)
          ? { ...current.holdRespinsByGame, [game.id]: result.holdRespins || 0 }
          : current.holdRespinsByGame,
      }));

      setGrid(result.grid);
      setMatchedCells(result.matchedCells);
      setLastWin(boostedWin + creditAward);
      if (result.nearMiss && boardRef.current) {
        gsap.fromTo(boardRef.current, { boxShadow: '0 0 0 0 #ff0000' }, { boxShadow: '0 0 30px 10px #ff0000', duration: 0.6, yoyo: true, repeat: 1, ease: 'power2.inOut' });
      }

      if (game.id === 'cascade' && result.settledGrid) {
        scheduleTimeout(() => {
          setGrid(result.settledGrid!);
          setMatchedCells([]);
        }, 650);
      }

      if (boostedWin + creditAward > 0) {
        setCredits((value) => {
          const nextCredits = value + boostedWin + creditAward;
          creditsRef.current = nextCredits;
          return nextCredits;
        });
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
      isSpinningRef.current = false;
      setIsSpinning(false);

      if (autoSpinRef.current) {
        scheduleAutoSpin(() => {
          if (autoSpinRef.current) performSpinRef.current();
        }, 1400);
      }
    }, 900);
  }, [bet, clearSpinTimeouts, fireConfetti, resolveMysteryMeter, scheduleAutoSpin, scheduleTimeout, stopAutoSpin, updateBonusState]);

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
    const symbol = activeSymbolMap.get(id) || activeGame.symbols[0];
    const Icon = symbol.icon;
    const key = cellKey(row, col);
    const isMatched = matchedCellSet.has(key);
    const isMuted = matchedCells.length > 0 && !isMatched;

    return (
      <div
        className={`flex h-full w-full items-center justify-center transition duration-300 ${isMatched ? 'scale-110' : ''} ${isMuted ? 'opacity-30 grayscale' : 'opacity-100'}`}
        aria-label={symbol.label}
      >
              <Icon
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 lg:h-11 lg:w-11"
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
  const activeHoldRespins = isHoldAndWinGame(activeGame.id)
    ? bonusState.holdRespinsByGame[activeGame.id]
    : 0;

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
           <div ref={tickerRef} className="truncate font-mono text-sm sm:text-base text-casino-gold">
            <span className="font-bold text-casino-ivory">{liveWinner.name}</span>
            <span className="mx-2 text-casino-muted">hit</span>
            <span className="font-bold">{liveWinner.symbol} {liveWinner.amount.toLocaleString()}</span>
            <span className="ml-2 text-casino-muted">on {liveWinner.game}</span>
          </div>
        </div>

          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-casino-cyber">Cyber Arcade Lobby</p>
            <h2 className="mt-3 font-serif text-4xl uppercase text-casino-ivory [text-shadow:0_0_30px_rgba(176,38,255,0.8)] sm:text-5xl md:text-6xl lg:text-7xl">
              Active Slots
            </h2>
          <div className="mt-4 inline-block rounded-full border border-casino-neon/30 bg-black/40 px-6 py-2 shadow-[0_0_20px_rgba(176,38,255,0.2)]">
             <p
               data-testid="slot-message"
               aria-live="polite"
               className="font-mono text-sm sm:text-base uppercase tracking-widest text-casino-neon md:text-xl"
             >
              {message}
            </p>
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
                  className={`group min-h-[120px] sm:min-h-[132px] border p-3 sm:p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isActive ? 'bg-white/[0.08] shadow-[0_0_28px_rgba(0,243,255,0.16)]' : 'bg-white/[0.025] hover:bg-white/[0.05]'
                  }`}
                  style={{ borderColor: isActive ? game.accent : 'rgba(255,255,255,0.12)' }}
                >
                <div className="mb-4 flex items-center justify-between gap-3">
                   <span className="font-serif text-xl sm:text-2xl uppercase text-casino-ivory">{game.title}</span>
                  <span className="border px-2 py-1 font-mono text-[10px] uppercase tracking-widest" style={{ borderColor: `${game.accent}80`, color: game.accent }}>
                    {game.volatility}
                  </span>
                </div>
                  <p className="text-sm sm:text-base leading-6 text-casino-muted">{game.subtitle}</p>
                  <p className="mt-3 font-mono text-xs sm:text-[11px] uppercase tracking-widest" style={{ color: game.accent }}>{game.layout}</p>
              </button>
            );
          })}
        </div>

        <div className="grid w-full grid-cols-1 gap-5 border border-casino-ivory/12 bg-black/30 p-4 md:grid-cols-4">
          {[
            { icon: Sparkles, label: 'Mystery Meter', value: `${Math.min(100, bonusState.mystery)}%` },
            { icon: BadgePlus, label: 'Free Tickets', value: bonusState.freeSpinTickets.toString() },
            { icon: Zap, label: 'Multiplier Pass', value: `${bonusState.multiplierPasses} left` },
            { icon: Shield, label: isHoldAndWinGame(activeGame.id) ? 'Hold Respins' : 'Win Streak', value: isHoldAndWinGame(activeGame.id) ? activeHoldRespins.toString() : `${bonusState.streak}x` },
          ].map(({ icon: Icon, label, value }) => (
               <div
               key={label}
               data-testid={`bonus-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
               className="flex items-center gap-2 border border-white/8 bg-casino-ink/60 p-3"
             >
               <Icon className="h-4 w-4 text-casino-gold" />
              <div>
                 <p className="font-mono text-[9px] uppercase tracking-widest text-casino-muted">{label}</p>
                 <p className="mt-0.5 font-serif text-lg sm:text-xl md:text-2xl text-casino-ivory">{value}</p>
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
               <p className="font-mono text-xl text-casino-ivory sm:text-2xl md:text-2xl">{displayCredits.toLocaleString()}</p>
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
               <p className="font-mono text-lg text-casino-gold sm:text-xl md:text-2xl">{lastWin > 0 ? `+${lastWin.toLocaleString()}` : '0'}</p>
             </div>
          </div>

          <div
            ref={boardRef}
            className="relative mx-auto grid min-h-[240px] w-full max-w-[760px] transform-gpu gap-1 overflow-hidden rounded-3xl border-4 border-[#171717] bg-[#050505] p-3 shadow-[inset_0_0_50px_rgba(0,0,0,1)] will-change-transform sm:min-h-[280px] sm:gap-2 sm:p-4 md:min-h-[300px] md:gap-3 md:p-6"
            style={{ gridTemplateColumns: `repeat(${activeGame.cols}, minmax(0, 1fr))` }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent" />
            {grid.map((row, rowIndex) =>
              row.map((id, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="flex aspect-square min-h-0 min-w-0 items-center justify-center rounded-xl border border-white/[0.04] bg-black/45 shadow-[inset_0_0_18px_rgba(0,0,0,0.75)]"
                >
                  {renderSymbol(id, rowIndex, colIndex)}
                </div>
              ))
            )}
          </div>

        <div className="mt-8 flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
          <div className="grid grid-cols-3 gap-2 xs:gap-3">
            <button
              onClick={isAutoSpin ? stopAutoSpin : startAutoSpin}
              aria-pressed={isAutoSpin}
              className={`min-h-[44px] px-3 py-3 font-mono text-[11px] xs:text-xs uppercase tracking-widest transition ${isAutoSpin ? 'bg-casino-neon/20 text-casino-neon' : 'bg-[#151515] text-casino-ivory/60 hover:text-casino-ivory'}`}
            >
              {isAutoSpin ? 'Stop Auto' : 'Auto Spin'}
            </button>
            <button
              onClick={setMaxBet}
              disabled={isSpinning || isAutoSpin}
              className="min-h-[44px] bg-[#151515] px-3 py-3 font-mono text-[11px] xs:text-xs uppercase tracking-widest text-casino-ivory/60 transition hover:text-casino-gold disabled:opacity-40"
            >
              Max Bet
            </button>
            <button
              onClick={() => setShowPaytable((value) => !value)}
              aria-expanded={showPaytable}
              className={`min-h-[44px] px-3 py-3 font-mono text-[11px] xs:text-xs uppercase tracking-widest transition ${showPaytable ? 'bg-casino-ember/20 text-casino-ember' : 'bg-[#151515] text-casino-ivory/60 hover:text-casino-ivory'}`}
            >
              Paytable
            </button>
          </div>

          <button
            onClick={isAutoSpin ? stopAutoSpin : performSpin}
            disabled={!isAutoSpin && (isSpinning || !canSpin)}
            className={`relative overflow-hidden min-h-[44px] px-6 xs:px-8 py-3 xs:py-4 font-serif text-xl xs:text-2xl md:text-3xl uppercase tracking-widest transition ${
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
               className="flex min-h-[44px] items-center gap-2 border border-white/5 bg-[#111] px-3 py-2 text-casino-muted transition hover:text-casino-ivory"
             >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span className="font-mono text-xs">{muted ? 'Muted' : 'Sound On'}</span>
            </button>
             <button
               onClick={resetCredits}
               disabled={isSpinning}
               className="flex min-h-[44px] items-center gap-2 border border-white/5 bg-[#111] px-3 py-2 text-casino-muted transition hover:text-casino-ember disabled:opacity-50"
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
             <h3 className="font-serif text-xl sm:text-2xl uppercase text-casino-gold">{activeGame.title} Paytable</h3>
             <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-casino-muted">{activeGame.bonusHook}</p>
             <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3">
              {activeGame.symbols.map((symbol) => {
                const Icon = symbol.icon;
                return (
                   <div key={symbol.id} className="flex items-center gap-2 border border-white/5 bg-white/[0.04] p-3">
                     <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0" color={symbol.color} />
                    <div>
                       <p className="font-mono text-[10px] sm:text-xs text-casino-muted">{symbol.label}</p>
                       <p className="font-mono text-lg sm:text-xl font-bold" style={{ color: symbol.color }}>{symbol.role === 'cash' ? 'locks cash' : `${symbol.payout}x`}</p>
                    </div>
                  </div>
                );
              })}
            </div>
             <div className="mt-6 grid gap-2 md:grid-cols-3">
              {activeGame.paytable.map((line) => (
                 <p key={line} className="border border-casino-neon/15 bg-casino-neon/5 p-2 md:p-3 font-mono text-[10px] xs:text-xs uppercase leading-5 tracking-widest text-casino-muted">
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
