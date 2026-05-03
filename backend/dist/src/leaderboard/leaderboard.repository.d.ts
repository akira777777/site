import { PrismaService } from '../prisma/prisma.service';
import type { LeaderboardRow, RecentWin } from './leaderboard.types';
export declare class LeaderboardRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getGlobal(limit: number): Promise<LeaderboardRow[]>;
    getRecentWins(limit: number): Promise<RecentWin[]>;
}
