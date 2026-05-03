import { Injectable } from '@nestjs/common';
import type { SlotSpinDto } from './dto/slot-spin.schemas';
import { GamesRepository } from './games.repository';
import type { SlotOutcome, SlotSpinResult } from './games.types';
import { RngService } from './rng.service';
import { RedisService } from '../cache/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly rngService: RngService,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {}

  async spinSlots(userId: string, input: SlotSpinDto): Promise<SlotSpinResult> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { balance: true, initialBalance: true, currentRTPModifier: true },
    });
    if (!user) throw new Error('User not found');

    const initialBalance = user.initialBalance.toNumber() || 1000;
    const currentBalance = user.balance.toNumber();
    const recentWins = await this.redisService.getRecentWinCount(userId);
    const poolStats = await this.redisService.getPoolStats();
    const poolRatio =
      poolStats.totalWagered > 0
        ? poolStats.totalPaid / poolStats.totalWagered
        : 0.85;

    const balanceFactor = Math.max(
      0.85,
      Math.min(
        1.0,
        1 - (currentBalance - initialBalance) / (initialBalance * 2),
      ),
    );
    const poolFactor = Math.max(
      0.88,
      Math.min(1.0, 1 - (poolRatio - 0.85) * 0.8),
    );
    const winStreakFactor = Math.max(
      0.9,
      Math.min(1.0, 1 - (recentWins / 5) * 0.05),
    );
    let effectiveRTP = 0.96 * balanceFactor * poolFactor * winStreakFactor;
    let beta = 0.95;
    if (currentBalance > initialBalance * 2 || recentWins >= 3) {
      beta = 0.88;
      effectiveRTP = Math.min(effectiveRTP, 0.88);
    }

    const rngResult = this.rngService.generateReels(
      input.gameId,
      effectiveRTP,
      beta,
    );
    const outcome: SlotOutcome = {
      grid: rngResult.grid,
      seed: rngResult.seed,
      nearMiss: rngResult.nearMiss,
      multiplier: rngResult.multiplier,
      effectiveRTP,
    };

    const result = await this.gamesRepository.settleSlotSpin({
      userId,
      betAmount: input.betAmount,
      outcome,
    });
    return result;
  }

  generateDemoOutcome(gameId: string = 'neon'): SlotOutcome {
    const rngResult = this.rngService.generateReels(gameId, 0.96, 0.95);
    return {
      grid: rngResult.grid,
      seed: rngResult.seed,
      nearMiss: rngResult.nearMiss,
      multiplier: rngResult.multiplier,
      effectiveRTP: 0.96,
    };
  }
}
