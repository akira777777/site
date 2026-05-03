import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { LeaderboardRow, RecentWin } from './leaderboard.types';

@Injectable()
export class LeaderboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobal(limit: number): Promise<LeaderboardRow[]> {
    const rows = await this.prisma.leaderboardEntry.findMany({
      orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return rows.map((row, index) => ({
      rank: index + 1,
      userId: row.user.id,
      username: row.user.username,
      score: row.score,
    }));
  }

  async getRecentWins(limit: number): Promise<RecentWin[]> {
    const rows = await this.prisma.bet.findMany({
      where: {
        winAmount: {
          gt: new Prisma.Decimal(0),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      username: row.user.username,
      winAmount: row.winAmount.toFixed(2),
      multiplier: row.multiplier.toFixed(2),
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
