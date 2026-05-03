import { Injectable } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';
import { LeaderboardRepository } from './leaderboard.repository';
import type { LeaderboardResponse, LeaderboardRow } from './leaderboard.types';

const LEADERBOARD_CACHE_KEY_PREFIX = 'leaderboard:global:v1';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly redisService: RedisService,
  ) {}

  async getGlobal(limit = 10): Promise<LeaderboardResponse> {
    const leaders = await this.getCachedLeaders(limit);
    const recentWins = await this.leaderboardRepository.getRecentWins(8);

    return {
      leaders,
      recentWins,
    };
  }

  private async getCachedLeaders(limit: number): Promise<LeaderboardRow[]> {
    const redis = this.redisService.getClient();
    const cacheKey = `${LEADERBOARD_CACHE_KEY_PREFIX}:${limit}`;

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);

        if (cached) {
          return JSON.parse(cached) as LeaderboardRow[];
        }
      } catch {
        // Redis is an optimization; the database remains source of truth.
      }
    }

    const leaders = await this.leaderboardRepository.getGlobal(limit);

    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(leaders), 'EX', 60);
      } catch {
        // Cache write failures must not fail the user request.
      }
    }

    return leaders;
  }
}
