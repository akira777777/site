import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequestUser } from '../auth/types/auth.types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { slotSpinSchema, type SlotSpinDto } from './dto/slot-spin.schemas';
import { GamesService } from './games.service';
import type { SlotOutcome, SlotSpinResult } from './games.types';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('slots/spin')
  async spinSlots(
    @Req() request: Request,
    @Body(new ZodValidationPipe(slotSpinSchema)) body: SlotSpinDto,
  ): Promise<{ data: SlotSpinResult }> {
    const user = request.user as AuthenticatedRequestUser;

    return {
      data: await this.gamesService.spinSlots(user.userId, body),
    };
  }

  @Post('slots/demo-spin')
  demoSpin(@Body(new ZodValidationPipe(slotSpinSchema)) body: SlotSpinDto): {
    data: SlotOutcome;
  } {
    return {
      data: this.gamesService.generateDemoOutcome(body.gameId),
    };
  }
}
