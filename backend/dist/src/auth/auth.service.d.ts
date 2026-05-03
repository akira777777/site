import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './repositories/auth.repository';
import type { LoginDto, RegisterDto } from './dto/auth.schemas';
import type { AuthResponse, AuthResponseUser } from './types/auth.types';
import { UsersRepository } from '../users/users.repository';
export declare class AuthService {
    private readonly authRepository;
    private readonly configService;
    private readonly jwtService;
    private readonly usersRepository;
    constructor(authRepository: AuthRepository, configService: ConfigService, jwtService: JwtService, usersRepository: UsersRepository);
    register(input: RegisterDto): Promise<AuthResponse>;
    login(input: LoginDto): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<AuthResponse>;
    getMe(userId: string): Promise<AuthResponseUser>;
    private createAuthResponse;
    private signAccessToken;
    private hashToken;
    private toAuthUser;
}
