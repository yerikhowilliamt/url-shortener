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
exports.UrlService = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const prisma_service_1 = require("../../common/prisma.service");
const validation_service_1 = require("../../common/validation.service");
const winston_1 = require("winston");
const crypto = require("crypto");
const url_validation_1 = require("./url.validation");
const zod_1 = require("zod");
let UrlService = class UrlService {
    constructor(logger, prismaService, validationService) {
        this.logger = logger;
        this.prismaService = prismaService;
        this.validationService = validationService;
    }
    async findUrlByShortened(shortenedUrl, userId) {
        return this.prismaService.url.findFirst({
            where: { shortenedUrl, userId },
        });
    }
    async shortenUrl(user, request) {
        try {
            const createRequest = await this.validationService.validate(url_validation_1.UrlValidation.CREATE, request);
            let shortened;
            shortened =
                createRequest.customUrl || crypto.randomBytes(3).toString('hex');
            if (shortened) {
                const existingUrl = await this.findUrlByShortened(shortened, user.id);
                if (existingUrl) {
                    throw new common_1.BadRequestException('Custom URL already in use');
                }
            }
            const expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 5);
            const url = await this.prismaService.url.create({
                data: {
                    originalUrl: createRequest.originalUrl,
                    shortenedUrl: shortened,
                    customUrl: createRequest.customUrl,
                    userId: user.id,
                    expiresAt: expirationDate,
                },
            });
            this.logger.info('URL shortened successfully', {
                original: url.originalUrl,
                shortened: url.shortenedUrl,
            });
            return this.toUrlResponse(url);
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async redirectOriginalUrl(shortenedUrl) {
        try {
            const url = await this.prismaService.url.findUnique({
                where: { shortenedUrl },
            });
            if (!url) {
                throw new common_1.NotFoundException('Short URL not found');
            }
            if (new Date() > url.expiresAt) {
                throw new common_1.BadRequestException('URL has expired');
            }
            return url.originalUrl;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    toUrlResponse(url) {
        return {
            id: url.id,
            originalUrl: url.originalUrl,
            shortenedUrl: url.shortenedUrl,
            expiresAt: url.expiresAt.toISOString(),
            createdAt: url.createdAt.toISOString(),
            updatedAt: url.updatedAt.toISOString(),
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
            this.logger.error('Internal Server Error:', {
                message: error.message,
                stack: error.stack,
            });
            throw new common_1.InternalServerErrorException('Something went wrong, please try again later');
        }
    }
};
exports.UrlService = UrlService;
exports.UrlService = UrlService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [winston_1.Logger,
        prisma_service_1.PrismaService,
        validation_service_1.ValidationService])
], UrlService);
//# sourceMappingURL=url.service.js.map