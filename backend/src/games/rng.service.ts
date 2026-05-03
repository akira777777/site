import { Injectable } from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';

interface RngSymbol {
  id: string;
  weight: number;
  payout: number;
  role?: string;
}

interface GameRngConfig {
  rows: number;
  cols: number;
  symbols: RngSymbol[];
  theoreticalRTP: number;
}

const GAME_CONFIGS: Record<string, GameRngConfig> = {
  neon: {
    rows: 3,
    cols: 3,
    symbols: [
      { id: 'coins', weight: 45, payout: 2 },
      { id: 'flame', weight: 40, payout: 3 },
      { id: 'bell', weight: 25, payout: 5 },
      { id: 'star', weight: 18, payout: 10, role: 'wild' },
      { id: 'crown', weight: 12, payout: 25, role: 'scatter' },
      { id: 'gem', weight: 10, payout: 100, role: 'jackpot' },
    ],
    theoreticalRTP: 0.96,
  },
  cascade: {
    rows: 5,
    cols: 5,
    symbols: [
      { id: 'coins', weight: 48, payout: 2 },
      { id: 'flame', weight: 42, payout: 3 },
      { id: 'bell', weight: 28, payout: 5 },
      { id: 'star', weight: 20, payout: 10, role: 'wild' },
      { id: 'crown', weight: 14, payout: 25, role: 'scatter' },
      { id: 'gem', weight: 10, payout: 100, role: 'jackpot' },
    ],
    theoreticalRTP: 0.96,
  },
  vault: {
    rows: 3,
    cols: 5,
    symbols: [
      { id: 'coins', weight: 38, payout: 2 },
      { id: 'flame', weight: 35, payout: 3 },
      { id: 'bell', weight: 22, payout: 5 },
      { id: 'cash', weight: 42, payout: 1, role: 'cash' },
      { id: 'lock', weight: 18, payout: 8, role: 'lock' },
      { id: 'gem', weight: 10, payout: 100, role: 'jackpot' },
    ],
    theoreticalRTP: 0.96,
  },
  egypt: {
    rows: 4,
    cols: 5,
    symbols: [
      { id: 'coins', weight: 35, payout: 2 },
      { id: 'flame', weight: 32, payout: 3 },
      { id: 'ankh', weight: 28, payout: 4 },
      { id: 'pharaoh', weight: 22, payout: 12 },
      { id: 'fireball', weight: 40, payout: 1, role: 'cash' },
      { id: 'scarab', weight: 15, payout: 0, role: 'power' },
      { id: 'temple', weight: 12, payout: 0, role: 'scatter' },
      { id: 'royal', weight: 10, payout: 1000, role: 'jackpot' },
    ],
    theoreticalRTP: 0.96,
  },
};

@Injectable()
export class RngService {
  private readonly NEAR_MISS_RATE = 1200;
  private readonly BASE_RTP = 0.96;

  generateReels(
    gameId: string,
    effectiveRTP = 0.96,
    beta = 0.95,
  ): { grid: string[][]; seed: string; nearMiss: boolean; multiplier: number } {
    const cfg = GAME_CONFIGS[gameId] || GAME_CONFIGS.neon;
    const scale = Math.max(
      0.7,
      Math.min(1.1, effectiveRTP / cfg.theoreticalRTP),
    );
    const symbols = cfg.symbols.map((s) => ({
      ...s,
      weight: Math.max(
        1,
        Math.floor(s.weight * (s.payout > 8 ? beta * scale : scale)),
      ),
    }));
    const grid: string[][] = Array.from({ length: cfg.rows }, () =>
      Array.from({ length: cfg.cols }, () => this.sampleSymbol(symbols).id),
    );
    const seed = randomBytes(16).toString('hex');
    const nearMiss = randomInt(0, 10000) < this.NEAR_MISS_RATE;
    if (nearMiss) {
      this.applyNearMissBias(grid, symbols, cfg);
    }
    let multiplier = 0;
    const reelsForMatch = grid[0] || [];
    if (reelsForMatch.length >= 3) {
      const [first, second, third] = reelsForMatch;
      if (first === second && second === third) {
        if (first === 'royal' || first === 'gem') multiplier = 250;
        else if (first === 'crown') multiplier = 25;
        else multiplier = 5;
      } else if (first === second || first === third || second === third) {
        multiplier = 1.5;
      }
    }
    if (nearMiss) multiplier = 0;
    return { grid, seed, nearMiss, multiplier };
  }

  private sampleSymbol(symbols: RngSymbol[]): RngSymbol {
    const total = symbols.reduce((sum, s) => sum + s.weight, 0);
    let roll = randomInt(0, total);
    for (const s of symbols) {
      if (roll < s.weight) return s;
      roll -= s.weight;
    }
    return symbols[0];
  }

  private applyNearMissBias(
    grid: string[][],
    symbols: RngSymbol[],
    cfg: GameRngConfig,
  ) {
    const highPayoutIds = symbols
      .filter((s) => s.payout >= 25)
      .map((s) => s.id);
    if (highPayoutIds.length === 0 || cfg.cols < 3) return;
    const target = highPayoutIds[randomInt(0, highPayoutIds.length)];
    const row = randomInt(0, cfg.rows);
    grid[row][0] = target;
    grid[row][1] = target;
    let third: string;
    do {
      third = this.sampleSymbol(symbols).id;
    } while (third === target);
    grid[row][2] = third;
    if (cfg.cols > 3) {
      for (let c = 3; c < cfg.cols; c++) {
        if (randomInt(0, 10) < 3) grid[row][c] = target;
      }
    }
    if (symbols.some((s) => s.role === 'cash' || s.role === 'lock')) {
      const cashIds = symbols
        .filter((s) => s.role === 'cash' || s.role === 'lock')
        .map((s) => s.id);
      if (cashIds.length > 0) {
        let lockCount = 0;
        for (let r = 0; r < cfg.rows; r++)
          for (let c = 0; c < cfg.cols; c++)
            if (cashIds.includes(grid[r][c])) lockCount++;
        if (lockCount >= 6) {
          for (let r = 0; r < cfg.rows && lockCount >= 6; r++) {
            for (let c = 0; c < cfg.cols && lockCount >= 6; c++) {
              if (cashIds.includes(grid[r][c]) && randomInt(0, 2) === 0) {
                grid[r][c] = this.sampleSymbol(
                  symbols.filter((s) => !cashIds.includes(s.id)),
                ).id;
                lockCount--;
              }
            }
          }
        }
      }
    }
  }
}
