import { Injectable } from '@nestjs/common';
import type { Reservation } from '@prisma/client';
import type { CreateReservationDto } from './dto/reservation.schemas';
import { ReservationsRepository } from './reservations.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  create(input: CreateReservationDto): Promise<Reservation> {
    return this.reservationsRepository.create(input);
  }
}
