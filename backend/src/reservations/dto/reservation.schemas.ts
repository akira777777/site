import { z } from 'zod';

export const createReservationSchema = z.object({
  email: z.string().email().max(255),
  bonusType: z.string().min(2).max(80),
});

export type CreateReservationDto = z.infer<typeof createReservationSchema>;
