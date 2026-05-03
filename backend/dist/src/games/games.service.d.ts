import type { SlotSpinDto } from './dto/slot-spin.schemas';
import { GamesRepository } from './games.repository';
import type { SlotSpinResult } from './games.types';
export declare class GamesService {
    private readonly gamesRepository;
    constructor(gamesRepository: GamesRepository);
    spinSlots(userId: string, input: SlotSpinDto): Promise<SlotSpinResult>;
    private generateSlotOutcome;
}
