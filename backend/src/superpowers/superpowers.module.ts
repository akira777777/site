import { Module } from '@nestjs/common';
import { SuperpowersController } from './superpowers.controller';
import { SuperpowersService } from './superpowers.service';

@Module({
  controllers: [SuperpowersController],
  providers: [SuperpowersService],
})
export class SuperpowersModule {}
