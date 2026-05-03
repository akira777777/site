import type { Request } from 'express';
import { type SlotSpinDto } from './dto/slot-spin.schemas';
import { GamesService } from './games.service';
import type { SlotSpinResult } from './games.types';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    spinSlots(request: Request, body: SlotSpinDto): Promise<{
        data: SlotSpinResult;
    }>;
}
