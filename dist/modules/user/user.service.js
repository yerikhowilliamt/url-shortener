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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const prisma_service_1 = require("../../common/prisma.service");
const validation_service_1 = require("../../common/validation.service");
const winston_1 = require("winston");
const user_validation_1 = require("./user.validation");
const bcrypt = require("bcryptjs");
const zod_1 = require("zod");
let UserService = class UserService {
    constructor(logger, prismaService, validationService) {
        this.logger = logger;
        this.prismaService = prismaService;
        this.validationService = validationService;
    }
    async get(user) {
        try {
            this.logger.info(`USER SERVICE | GET : User with email: ${user.email}, access_token: ${user.accessToken}`);
            const currentUser = await this.prismaService.user.findUnique({
                where: { email: user.email },
            });
            if (!currentUser) {
                throw new common_1.UnauthorizedException('User not found');
            }
            if (!currentUser.accessToken) {
                throw new common_1.UnauthorizedException('Token must be provided');
            }
            return this.toUserResponse(currentUser);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async update(user, request) {
        try {
            this.logger.info(`USER SERVICE | UPDATE : User ${user.email} trying to update their profile`);
            const updateRequest = await this.validationService.validate(user_validation_1.UserValidation.UPDATE, request);
            const existingUser = await this.prismaService.user.findUnique({
                where: { email: user.email },
            });
            if (!existingUser) {
                throw new common_1.NotFoundException('User not found');
            }
            if (updateRequest.password) {
                existingUser.password = await bcrypt.hash(updateRequest.password, 10);
            }
            const updatedUser = await this.prismaService.user.update({
                where: { email: user.email },
                data: {
                    name: updateRequest.name,
                    password: updateRequest.password,
                },
            });
            return this.toUserResponse(updatedUser);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async logout(user) {
        try {
            await this.prismaService.user.update({
                where: { email: user.email },
                data: { accessToken: null, refreshToken: null },
            });
            this.logger.info(`USER SERVICE | LOGOUT : User with email: ${user.email} has logged out`);
            return {
                message: 'Log out successful',
                success: true,
            };
        }
        catch (error) {
            this.handleError(error);
        }
    }
    toUserResponse(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.toString(),
            updatedAt: user.updatedAt.toString(),
        };
    }
    handleError(error) {
        if (error instanceof zod_1.ZodError) {
            throw new common_1.BadRequestException(error.message);
        }
        else if (error instanceof common_1.NotFoundException ||
            error instanceof common_1.UnauthorizedException ||
            error instanceof common_1.BadRequestException) {
            throw error;
        }
        else {
            this.logger.error('Internal Server Error:', error);
            throw new common_1.InternalServerErrorException(error);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [winston_1.Logger,
        prisma_service_1.PrismaService,
        validation_service_1.ValidationService])
], UserService);
//# sourceMappingURL=user.service.js.map