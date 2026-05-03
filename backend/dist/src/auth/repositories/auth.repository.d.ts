import type { RefreshToken } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createRefreshToken(params: {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<RefreshToken>;
    findActiveRefreshToken(tokenHash: string): Promise<RefreshToken | null>;
    revokeRefreshToken(id: string): Promise<void>;
}
