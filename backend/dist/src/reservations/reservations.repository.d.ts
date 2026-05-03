import type { Reservation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateReservationDto } from './dto/reservation.schemas';
export declare class ReservationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateReservationDto): Promise<Reservation>;
}
