import { PrismaService } from '../prisma/prisma.service';
import type { SlotOutcome, SlotSpinResult } from './games.types';
export declare class GamesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    settleSlotSpin(params: {
        userId: string;
        betAmount: number;
        outcome: SlotOutcome;
    }): Promise<SlotSpinResult>;
}
