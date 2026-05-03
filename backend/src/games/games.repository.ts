import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SlotOutcome, SlotSpinResult } from './games.types';

@Injectable()
export class GamesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async settleSlotSpin(params: {
    userId: string;
    betAmount: number;
    outcome: SlotOutcome;
  }): Promise<SlotSpinResult> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: params.userId },
        select: {
          id: true,
          balance: true,
          version: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const betAmount = new Prisma.Decimal(params.betAmount);

      if (user.balance.lt(betAmount)) {
        throw new BadRequestException('Insufficient balance');
      }

      const multiplier = new Prisma.Decimal(params.outcome.multiplier);
      const winAmount = betAmount.mul(multiplier);
      const nextBalance = user.balance.minus(betAmount).plus(winAmount);
      const updateResult = await tx.user.updateMany({
        where: {
          id: user.id,
          version: user.version,
          balance: {
            gte: betAmount,
          },
        },
        data: {
          balance: nextBalance,
          version: {
            increment: 1,
          },
        },
      });

      if (updateResult.count !== 1) {
        throw new ConflictException(
          'Balance changed during spin; retry request',
        );
      }

      const bet = await tx.bet.create({
        data: {
          userId: user.id,
          amount: betAmount,
          multiplier,
          winAmount,
          seed: params.outcome.seed,
          metadata: {
            reels: params.outcome.reels,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'DEBIT',
          amount: betAmount,
          reference: bet.id,
        },
      });

      if (winAmount.gt(0)) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'WIN',
            amount: winAmount,
            reference: bet.id,
          },
        });
      }

      await tx.leaderboardEntry.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          score: Math.floor(winAmount.toNumber()),
        },
        update: {
          score: {
            increment: Math.floor(winAmount.toNumber()),
          },
        },
      });

      return {
        betId: bet.id,
        betAmount: betAmount.toFixed(2),
        winAmount: winAmount.toFixed(2),
        balance: nextBalance.toFixed(2),
        reels: params.outcome.reels,
        seed: params.outcome.seed,
        multiplier: params.outcome.multiplier,
      };
    });
  }
}
