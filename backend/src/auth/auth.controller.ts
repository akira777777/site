import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  type LoginDto,
  type RefreshDto,
  type RegisterDto,
} from './dto/auth.schemas';
import { JwtAuthGuard } from './jwt-auth.guard';
import type {
  AuthResponse,
  AuthenticatedRequestUser,
} from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterDto,
  ): Promise<AuthResponse> {
    return this.authService.register(body);
  }

  @Post('login')
  login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginDto,
  ): Promise<AuthResponse> {
    return this.authService.login(body);
  }

  @Post('refresh')
  refresh(
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshDto,
  ): Promise<AuthResponse> {
    return this.authService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: Request): ReturnType<AuthService['getMe']> {
    const user = request.user as AuthenticatedRequestUser;

    return this.authService.getMe(user.userId);
  }
}
