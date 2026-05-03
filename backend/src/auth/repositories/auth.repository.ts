import { Injectable } from '@nestjs/common';
import type { RefreshToken } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRefreshToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: params,
    });
  }

  async findActiveRefreshToken(
    tokenHash: string,
  ): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
