"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const nest_winston_1 = require("nest-winston");
const prisma_service_1 = require("../../common/prisma.service");
const validation_service_1 = require("../../common/validation.service");
const winston_1 = require("winston");
const zod_1 = require("zod");
const bcrypt = require("bcryptjs");
const auth_validation_1 = require("./auth.validation");
let AuthService = class AuthService {
    constructor(logger, prismaService, validationService, jwtService) {
        this.logger = logger;
        this.prismaService = prismaService;
        this.validationService = validationService;
        this.jwtService = jwtService;
    }
    async register(request) {
        try {
            this.logger.info('Creating new user', { email: request.email });
            const validatedRequest = await this.validationService.validate(auth_validation_1.AuthValidation.REGISTER, request);
            await this.checkExistingUser(validatedRequest.email);
            const hashedPassword = await bcrypt.hash(validatedRequest.password, 10);
            validatedRequest.password = hashedPassword;
            const user = await this.prismaService.user.create({
                data: validatedRequest,
            });
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            };
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async login(request) {
        try {
            this.logger.info(`AUTH SERVICE | User login attempt: ${request.email}`);
            const validatedRequest = await this.validationService.validate(auth_validation_1.AuthValidation.LOGIN, request);
            const user = await this.findUserByEmail(validatedRequest.email);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            const isPasswordValid = await bcrypt.compare(validatedRequest.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            const accessToken = this.generateAccessToken(user.id, user.email);
            const refreshToken = this.generateRefreshToken(user.id, user.email);
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
            await this.prismaService.user.update({
                where: { email: user.email },
                data: { accessToken, refreshToken: hashedRefreshToken },
            });
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                accessToken,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            };
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async checkExistingUser(email) {
        try {
            const userExists = await this.prismaService.user.count({
                where: { email },
            });
            if (userExists) {
                this.logger.warn('Email already registered');
                throw new common_1.BadRequestException('This email is already registered.');
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error checking if email exists', { error });
            throw new common_1.InternalServerErrorException(error);
        }
    }
    generateAccessToken(userId, email) {
        return this.jwtService.sign({ id: userId, email }, { expiresIn: '2h' });
    }
    generateRefreshToken(userId, email) {
        return this.jwtService.sign({ id: userId, email }, { expiresIn: '30d' });
    }
    async findUserByEmail(email) {
        return this.prismaService.user.findUnique({ where: { email } });
    }
    handleError(error) {
        if (error instanceof zod_1.ZodError) {
            throw new common_1.BadRequestException(error.message);
        }
        else if (error instanceof common_1.BadRequestException ||
            error instanceof common_1.UnauthorizedException) {
            throw error;
        }
        else {
            this.logger.error('Internal Server Error:', error);
            throw new common_1.InternalServerErrorException(error);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [winston_1.Logger,
        prisma_service_1.PrismaService,
        validation_service_1.ValidationService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map