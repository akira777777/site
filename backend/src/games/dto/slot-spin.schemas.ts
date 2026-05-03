import { z } from 'zod';

export const slotSpinSchema = z.object({
  betAmount: z.coerce.number().positive().max(10000),
  gameId: z.enum(['neon', 'cascade', 'vault', 'egypt']).default('neon'),
  idempotencyKey: z.string().uuid().optional(),
});

export type SlotSpinDto = z.infer<typeof slotSpinSchema>;
