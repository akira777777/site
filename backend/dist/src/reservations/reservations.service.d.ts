import type { Reservation } from '@prisma/client';
import type { CreateReservationDto } from './dto/reservation.schemas';
import { ReservationsRepository } from './reservations.repository';
export declare class ReservationsService {
    private readonly reservationsRepository;
    constructor(reservationsRepository: ReservationsRepository);
    create(input: CreateReservationDto): Promise<Reservation>;
}
