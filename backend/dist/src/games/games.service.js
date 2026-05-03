"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const games_repository_1 = require("./games.repository");
const SLOT_SYMBOLS = ['BAR', 'BELL', 'CHERRY', 'SEVEN', 'WILD'];
let GamesService = class GamesService {
    gamesRepository;
    constructor(gamesRepository) {
        this.gamesRepository = gamesRepository;
    }
    spinSlots(userId, input) {
        return this.gamesRepository.settleSlotSpin({
            userId,
            betAmount: input.betAmount,
            outcome: this.generateSlotOutcome(),
        });
    }
    generateSlotOutcome() {
        const reels = Array.from({ length: 3 }, () => SLOT_SYMBOLS[(0, crypto_1.randomInt)(0, SLOT_SYMBOLS.length)]);
        const [first, second, third] = reels;
        const seed = (0, crypto_1.randomBytes)(32).toString('hex');
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
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [games_repository_1.GamesRepository])
], GamesService);
//# sourceMappingURL=games.service.js.map