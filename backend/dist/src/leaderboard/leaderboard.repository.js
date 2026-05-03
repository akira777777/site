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
exports.LeaderboardRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let LeaderboardRepository = class LeaderboardRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGlobal(limit) {
        const rows = await this.prisma.leaderboardEntry.findMany({
            orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });
        return rows.map((row, index) => ({
            rank: index + 1,
            userId: row.user.id,
            username: row.user.username,
            score: row.score,
        }));
    }
    async getRecentWins(limit) {
        const rows = await this.prisma.bet.findMany({
            where: {
                winAmount: {
                    gt: new client_1.Prisma.Decimal(0),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });
        return rows.map((row) => ({
            id: row.id,
            username: row.user.username,
            winAmount: row.winAmount.toFixed(2),
            multiplier: row.multiplier.toFixed(2),
            createdAt: row.createdAt.toISOString(),
        }));
    }
};
exports.LeaderboardRepository = LeaderboardRepository;
exports.LeaderboardRepository = LeaderboardRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaderboardRepository);
//# sourceMappingURL=leaderboard.repository.js.map