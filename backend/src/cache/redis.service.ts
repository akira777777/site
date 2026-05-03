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
}
