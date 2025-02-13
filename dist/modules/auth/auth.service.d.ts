import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { Logger } from 'winston';
import { UserResponse } from '../../model/user.model';
import { RegisterUserRequest } from './dto/register-auth.dto';
import { LoginUserRequest } from './dto/login-auth.dto';
export declare class AuthService {
    private logger;
    private prismaService;
    private validationService;
    private jwtService;
    constructor(logger: Logger, prismaService: PrismaService, validationService: ValidationService, jwtService: JwtService);
    register(request: RegisterUserRequest): Promise<UserResponse>;
    login(request: LoginUserRequest): Promise<UserResponse>;
    private checkExistingUser;
    private generateAccessToken;
    private generateRefreshToken;
    findUserByEmail(email: string): Promise<{
        accessToken: string | null;
        id: number;
        name: string;
        email: string;
        password: string | null;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private handleError;
}
