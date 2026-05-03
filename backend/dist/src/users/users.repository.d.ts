import type { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.UserCreateInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}
