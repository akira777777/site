"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    username: zod_1.z
        .string()
        .min(3)
        .max(32)
        .regex(/^[a-zA-Z0-9_-]+$/),
    password: zod_1.z.string().min(8).max(128),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().max(255),
    password: zod_1.z.string().min(8).max(128),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(20),
});
//# sourceMappingURL=auth.schemas.js.map