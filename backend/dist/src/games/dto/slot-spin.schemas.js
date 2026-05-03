"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotSpinSchema = void 0;
const zod_1 = require("zod");
exports.slotSpinSchema = zod_1.z.object({
    betAmount: zod_1.z.coerce.number().positive().max(10000),
    idempotencyKey: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=slot-spin.schemas.js.map