import { Injectable } from '@nestjs/common';
import { SUPERPOWERS } from './superpowers.constants';
import type { Superpower } from './superpowers.types';

@Injectable()
export class SuperpowersService {
  findAll(): Superpower[] {
    return SUPERPOWERS;
  }
}
