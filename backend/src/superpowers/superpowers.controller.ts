import { Controller, Get } from '@nestjs/common';
import { SuperpowersService } from './superpowers.service';
import type { Superpower } from './superpowers.types';

@Controller('superpowers')
export class SuperpowersController {
  constructor(private readonly superpowersService: SuperpowersService) {}

  @Get()
  findAll(): { data: Superpower[] } {
    return {
      data: this.superpowersService.findAll(),
    };
  }
}
