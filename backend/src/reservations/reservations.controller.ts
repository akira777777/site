import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createReservationSchema,
  type CreateReservationDto,
} from './dto/reservation.schemas';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createReservationSchema))
    body: CreateReservationDto,
  ): Promise<{ data: { id: string; status: string } }> {
    const reservation = await this.reservationsService.create(body);

    return {
      data: {
        id: reservation.id,
        status: reservation.status,
      },
    };
  }
}
