import { Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LeaderboardService } from './leaderboard.service';
import type { LeaderboardResponse } from './leaderboard.types';

const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('global')
  async getGlobal(
    @Query(new ZodValidationPipe(leaderboardQuerySchema))
    query: {
      limit: number;
    },
  ): Promise<{ data: LeaderboardResponse }> {
    return {
      data: await this.leaderboardService.getGlobal(query.limit),
    };
  }
}
