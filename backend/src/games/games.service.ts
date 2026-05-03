import { Injectable } from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';
import type { SlotSpinDto } from './dto/slot-spin.schemas';
import { GamesRepository } from './games.repository';
import type { SlotOutcome, SlotSpinResult } from './games.types';

const SLOT_SYMBOLS = ['BAR', 'BELL', 'CHERRY', 'SEVEN', 'WILD'] as const;

@Injectable()
export class GamesService {
  constructor(private readonly gamesRepository: GamesRepository) {}

  spinSlots(userId: string, input: SlotSpinDto): Promise<SlotSpinResult> {
    return this.gamesRepository.settleSlotSpin({
      userId,
      betAmount: input.betAmount,
      outcome: this.generateSlotOutcome(),
    });
  }

  private generateSlotOutcome(): SlotOutcome {
    const reels = Array.from(
      { length: 3 },
      () => SLOT_SYMBOLS[randomInt(0, SLOT_SYMBOLS.length)],
    );
    const [first, second, third] = reels;
    const seed = randomBytes(32).toString('hex');

    if (first === 'SEVEN' && second === 'SEVEN' && third === 'SEVEN') {
      return { reels, seed, multiplier: 25 };
    }

    if (first === 'WILD' && second === 'WILD' && third === 'WILD') {
      return { reels, seed, multiplier: 10 };
    }

    if (first === second && second === third) {
      return { reels, seed, multiplier: 5 };
    }

    if (first === second || first === third || second === third) {
      return { reels, seed, multiplier: 1.5 };
    }

    return { reels, seed, multiplier: 0 };
  }
}
