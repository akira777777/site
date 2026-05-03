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
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../cache/redis.service");
const leaderboard_repository_1 = require("./leaderboard.repository");
const LEADERBOARD_CACHE_KEY = 'leaderboard:global:v1';
let LeaderboardService = class LeaderboardService {
    leaderboardRepository;
    redisService;
    constructor(leaderboardRepository, redisService) {
        this.leaderboardRepository = leaderboardRepository;
        this.redisService = redisService;
    }
    async getGlobal(limit = 10) {
        const leaders = await this.getCachedLeaders(limit);
        const recentWins = await this.leaderboardRepository.getRecentWins(8);
        return {
            leaders,
            recentWins,
        };
    }
    async getCachedLeaders(limit) {
        const redis = this.redisService.getClient();
        if (redis) {
            try {
                const cached = await redis.get(LEADERBOARD_CACHE_KEY);
                if (cached) {
                    return JSON.parse(cached);
                }
            }
            catch {
            }
        }
        const leaders = await this.leaderboardRepository.getGlobal(limit);
        if (redis) {
            try {
                await redis.set(LEADERBOARD_CACHE_KEY, JSON.stringify(leaders), 'EX', 60);
            }
            catch {
            }
        }
        return leaders;
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leaderboard_repository_1.LeaderboardRepository,
        redis_service_1.RedisService])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map