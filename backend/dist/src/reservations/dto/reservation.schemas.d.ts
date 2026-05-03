import { z } from 'zod';
export declare const createReservationSchema: z.ZodObject<{
    email: z.ZodString;
    bonusType: z.ZodString;
}, z.core.$strip>;
export type CreateReservationDto = z.infer<typeof createReservationSchema>;
