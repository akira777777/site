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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const reservation_schemas_1 = require("./dto/reservation.schemas");
const reservations_service_1 = require("./reservations.service");
let ReservationsController = class ReservationsController {
    reservationsService;
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    async create(body) {
        const reservation = await this.reservationsService.create(body);
        return {
            data: {
                id: reservation.id,
                status: reservation.status,
            },
        };
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(reservation_schemas_1.createReservationSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "create", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map