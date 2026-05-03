import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { unifiedConfig } from './config/unifiedConfig';
import { GamesModule } from './games/games.module';
import { HealthModule } from './health/health.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SuperpowersModule } from './superpowers/superpowers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [unifiedConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    CacheModule,
    AuthModule,
    GamesModule,
    HealthModule,
    LeaderboardModule,
    ReservationsModule,
    SuperpowersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
