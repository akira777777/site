import { z } from 'zod';
export declare const slotSpinSchema: z.ZodObject<{
    betAmount: z.ZodCoercedNumber<unknown>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SlotSpinDto = z.infer<typeof slotSpinSchema>;
