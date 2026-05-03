"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationSchema = void 0;
const zod_1 = require("zod");
exports.createReservationSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    bonusType: zod_1.z.string().min(2).max(80),
});
//# sourceMappingURL=reservation.schemas.js.map