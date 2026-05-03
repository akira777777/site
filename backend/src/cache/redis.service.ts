import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client?: Redis;

  constructor(configService: ConfigService) {
    const redisUrl = configService.get<string>('redis.url');

    if (redisUrl) {
      this.client = new Redis(redisUrl, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
      });
      this.client.on('error', () => undefined);
    }
  }

  getClient(): Redis | undefined {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }

  async incrementPoolWagered(amount: number): Promise<number> {
    if (!this.client) return 0;
    const res = await this.client.incrbyfloat('pool:totalWagered', amount);
    return parseFloat(res as any) || 0;
  }

  async incrementPoolPaid(amount: number): Promise<number> {
    if (!this.client) return 0;
    const res = await this.client.incrbyfloat('pool:totalPaid', amount);
    return parseFloat(res as any) || 0;
  }

  async getPoolStats(): Promise<{ totalWagered: number; totalPaid: number }> {
    if (!this.client) return { totalWagered: 0, totalPaid: 0 };
    const [w, p] = await Promise.all([
      this.client.get('pool:totalWagered'),
      this.client.get('pool:totalPaid'),
    ]);
    return {
      totalWagered: parseFloat(w || '0'),
      totalPaid: parseFloat(p || '0'),
    };
  }

  async recordPlayerSpinResult(userId: string, isWin: boolean): Promise<number> {
    const key = `player:${userId}:recentWins`;
    if (!this.client) return 0;
    await this.client.lpush(key, isWin ? '1' : '0');
    await this.client.ltrim(key, 0, 9);
    const list = await this.client.lrange(key, 0, -1);
    return list.filter((v) => v === '1').length;
  }

  async getRecentWinCount(userId: string): Promise<number> {
    const key = `player:${userId}:recentWins`;
    if (!this.client) return 0;
    const list = await this.client.lrange(key, 0, -1);
    return list.filter((v) => v === '1').length;
  }
}
