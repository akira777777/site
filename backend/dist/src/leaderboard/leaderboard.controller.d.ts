import { LeaderboardService } from './leaderboard.service';
import type { LeaderboardResponse } from './leaderboard.types';
export declare class LeaderboardController {
    private readonly leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getGlobal(query: {
        limit: number;
    }): Promise<{
        data: LeaderboardResponse;
    }>;
}
