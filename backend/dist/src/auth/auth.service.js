"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
const auth_repository_1 = require("./repositories/auth.repository");
const users_repository_1 = require("../users/users.repository");
const parseTokenTtlSeconds = (value) => {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
        return 15 * 60;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 24 * 60 * 60,
    };
    return amount * multipliers[unit];
};
let AuthService = class AuthService {
    authRepository;
    configService;
    jwtService;
    usersRepository;
    constructor(authRepository, configService, jwtService, usersRepository) {
        this.authRepository = authRepository;
        this.configService = configService;
        this.jwtService = jwtService;
        this.usersRepository = usersRepository;
    }
    async register(input) {
        const existingEmail = await this.usersRepository.findByEmail(input.email);
        if (existingEmail) {
            throw new common_1.ConflictException('Email is already registered');
        }
        const existingUsername = await this.usersRepository.findByUsername(input.username);
        if (existingUsername) {
            throw new common_1.ConflictException('Username is already taken');
        }
        const passwordHash = await bcrypt.hash(input.password, 12);
        const user = await this.usersRepository.create({
            email: input.email,
            username: input.username,
            passwordHash,
        });
        return this.createAuthResponse(user);
    }
    async login(input) {
        const user = await this.usersRepository.findByEmail(input.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return this.createAuthResponse(user);
    }
    async refresh(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await this.authRepository.findActiveRefreshToken(tokenHash);
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.usersRepository.findById(storedToken.userId);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        await this.authRepository.revokeRefreshToken(storedToken.id);
        return this.createAuthResponse(user);
    }
    async getMe(userId) {
        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.toAuthUser(user);
    }
    async createAuthResponse(user) {
        const accessToken = await this.signAccessToken(user);
        const refreshToken = (0, crypto_1.randomBytes)(48).toString('hex');
        const refreshTokenTtlDays = this.configService.get('auth.refreshTokenTtlDays', 7);
        await this.authRepository.createRefreshToken({
            userId: user.id,
            tokenHash: this.hashToken(refreshToken),
            expiresAt: new Date(Date.now() + refreshTokenTtlDays * 24 * 60 * 60 * 1000),
        });
        return {
            user: this.toAuthUser(user),
            accessToken,
            refreshToken,
        };
    }
    async signAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles,
        };
        const expiresIn = parseTokenTtlSeconds(this.configService.get('auth.accessTokenTtl', '15m'));
        return this.jwtService.signAsync(payload, { expiresIn });
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    toAuthUser(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            balance: user.balance.toFixed(2),
            roles: user.roles,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        config_1.ConfigService,
        jwt_1.JwtService,
        users_repository_1.UsersRepository])
], AuthService);
//# sourceMappingURL=auth.service.js.map