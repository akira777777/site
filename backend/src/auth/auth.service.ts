import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { AuthRepository } from './repositories/auth.repository';
import type { LoginDto, RegisterDto } from './dto/auth.schemas';
import type {
  AuthResponse,
  AuthResponseUser,
  JwtPayload,
} from './types/auth.types';
import { UsersRepository } from '../users/users.repository';

const parseTokenTtlSeconds = (value: string): number => {
  const match = /^(\d+)([smhd])$/.exec(value);

  if (!match) {
    return 15 * 60;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return amount * multipliers[unit];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async register(input: RegisterDto): Promise<AuthResponse> {
    const existingEmail = await this.usersRepository.findByEmail(input.email);

    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    const existingUsername = await this.usersRepository.findByUsername(
      input.username,
    );

    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.usersRepository.create({
      email: input.email,
      username: input.username,
      passwordHash,
    });

    return this.createAuthResponse(user);
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken =
      await this.authRepository.findActiveRefreshToken(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersRepository.findById(storedToken.userId);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.authRepository.revokeRefreshToken(storedToken.id);

    return this.createAuthResponse(user);
  }

  async getMe(userId: string): Promise<AuthResponseUser> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toAuthUser(user);
  }

  private async createAuthResponse(user: User): Promise<AuthResponse> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = randomBytes(48).toString('hex');
    const refreshTokenTtlDays = this.configService.get<number>(
      'auth.refreshTokenTtlDays',
      7,
    );

    await this.authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(
        Date.now() + refreshTokenTtlDays * 24 * 60 * 60 * 1000,
      ),
    });

    return {
      user: this.toAuthUser(user),
      accessToken,
      refreshToken,
    };
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const expiresIn = parseTokenTtlSeconds(
      this.configService.get<string>('auth.accessTokenTtl', '15m'),
    );

    return this.jwtService.signAsync(payload, { expiresIn });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toAuthUser(user: User): AuthResponseUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      balance: user.balance.toFixed(2),
      roles: user.roles,
    };
  }
}
