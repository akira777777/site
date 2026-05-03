import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesRepository } from './games.repository';
import { GamesService } from './games.service';
import { RngService } from './rng.service';
import { CacheModule } from '../cache/cache.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CacheModule, PrismaModule],
  controllers: [GamesController],
  providers: [GamesRepository, GamesService, RngService],
})
export class GamesModule {}
