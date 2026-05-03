import { Injectable } from '@nestjs/common';
import type { Reservation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateReservationDto } from './dto/reservation.schemas';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReservationDto): Promise<Reservation> {
    return this.prisma.reservation.create({ data });
  }
}
