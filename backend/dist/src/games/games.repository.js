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
exports.GamesRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let GamesRepository = class GamesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async settleSlotSpin(params) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: params.userId },
                select: {
                    id: true,
                    balance: true,
                    version: true,
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const betAmount = new client_1.Prisma.Decimal(params.betAmount);
            if (user.balance.lt(betAmount)) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            const multiplier = new client_1.Prisma.Decimal(params.outcome.multiplier);
            const winAmount = betAmount.mul(multiplier);
            const nextBalance = user.balance.minus(betAmount).plus(winAmount);
            const updateResult = await tx.user.updateMany({
                where: {
                    id: user.id,
                    version: user.version,
                    balance: {
                        gte: betAmount,
                    },
                },
                data: {
                    balance: nextBalance,
                    version: {
                        increment: 1,
                    },
                },
            });
            if (updateResult.count !== 1) {
                throw new common_1.ConflictException('Balance changed during spin; retry request');
            }
            const bet = await tx.bet.create({
                data: {
                    userId: user.id,
                    amount: betAmount,
                    multiplier,
                    winAmount,
                    seed: params.outcome.seed,
                    metadata: {
                        reels: params.outcome.reels,
                    },
                },
            });
            await tx.transaction.create({
                data: {
                    userId: user.id,
                    type: 'DEBIT',
                    amount: betAmount,
                    reference: bet.id,
                },
            });
            if (winAmount.gt(0)) {
                await tx.transaction.create({
                    data: {
                        userId: user.id,
                        type: 'WIN',
                        amount: winAmount,
                        reference: bet.id,
                    },
                });
            }
            await tx.leaderboardEntry.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    score: Math.floor(winAmount.toNumber()),
                },
                update: {
                    score: {
                        increment: Math.floor(winAmount.toNumber()),
                    },
                },
            });
            return {
                betId: bet.id,
                betAmount: betAmount.toFixed(2),
                winAmount: winAmount.toFixed(2),
                balance: nextBalance.toFixed(2),
                reels: params.outcome.reels,
                seed: params.outcome.seed,
                multiplier: params.outcome.multiplier,
            };
        });
    }
};
exports.GamesRepository = GamesRepository;
exports.GamesRepository = GamesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamesRepository);
//# sourceMappingURL=games.repository.js.map