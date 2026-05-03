import { SuperpowersService } from './superpowers.service';
import type { Superpower } from './superpowers.types';
export declare class SuperpowersController {
    private readonly superpowersService;
    constructor(superpowersService: SuperpowersService);
    findAll(): {
        data: Superpower[];
    };
}
