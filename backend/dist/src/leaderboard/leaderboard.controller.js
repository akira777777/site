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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardController = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const leaderboard_service_1 = require("./leaderboard.service");
const leaderboardQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
});
let LeaderboardController = class LeaderboardController {
    leaderboardService;
    constructor(leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
    async getGlobal(query) {
        return {
            data: await this.leaderboardService.getGlobal(query.limit),
        };
    }
};
exports.LeaderboardController = LeaderboardController;
__decorate([
    (0, common_1.Get)('global'),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(leaderboardQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getGlobal", null);
exports.LeaderboardController = LeaderboardController = __decorate([
    (0, common_1.Controller)('leaderboard'),
    __metadata("design:paramtypes", [leaderboard_service_1.LeaderboardService])
], LeaderboardController);
//# sourceMappingURL=leaderboard.controller.js.map