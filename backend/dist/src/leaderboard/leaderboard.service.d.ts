import { RedisService } from '../cache/redis.service';
import { LeaderboardRepository } from './leaderboard.repository';
import type { LeaderboardResponse } from './leaderboard.types';
export declare class LeaderboardService {
    private readonly leaderboardRepository;
    private readonly redisService;
    constructor(leaderboardRepository: LeaderboardRepository, redisService: RedisService);
    getGlobal(limit?: number): Promise<LeaderboardResponse>;
    private getCachedLeaders;
}
