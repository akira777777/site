import { type CreateReservationDto } from './dto/reservation.schemas';
import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(body: CreateReservationDto): Promise<{
        data: {
            id: string;
            status: string;
        };
    }>;
}
