import type { Request } from 'express';
import { AuthService } from './auth.service';
import { type LoginDto, type RefreshDto, type RegisterDto } from './dto/auth.schemas';
import type { AuthResponse } from './types/auth.types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<AuthResponse>;
    login(body: LoginDto): Promise<AuthResponse>;
    refresh(body: RefreshDto): Promise<AuthResponse>;
    me(request: Request): ReturnType<AuthService['getMe']>;
}
