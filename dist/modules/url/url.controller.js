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
exports.UrlController = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const winston_1 = require("winston");
const url_service_1 = require("./url.service");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const url_model_1 = require("../../model/url.model");
const auth_decorator_1 = require("../../common/auth/auth.decorator");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const create_url_dto_1 = require("./dto/create-url.dto");
const redirect_response_dto_1 = require("./dto/redirect-response.dto");
let UrlController = class UrlController {
    constructor(logger, urlService) {
        this.logger = logger;
        this.urlService = urlService;
    }
    checkAuthorization(userId, user) {
        if (user.id !== userId) {
            this.logger.info(`URL CONTROLLER | CHECK AUTH: {user_id: ${JSON.stringify(userId)}}`);
            throw new common_1.UnauthorizedException(`You are not authorized to access this user's urls`);
        }
    }
    async shortenUrl(user, userId, request) {
        try {
            this.checkAuthorization(userId, user);
            const result = await this.urlService.shortenUrl(user, request);
            return {
                data: result,
                statusCode: 201,
                timestamp: new Date().toString(),
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw error;
        }
    }
    async redirectToUrlOriginal(shortened) {
        try {
            this.logger.info(`URL CONTROLLER | shortened_url : ${shortened}`);
            const result = await this.urlService.redirectOriginalUrl(shortened);
            if (!result) {
                throw new common_1.NotFoundException('Short URL not found');
            }
            return {
                url: result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to redirect URL: ${error.message}`);
            throw error;
        }
    }
};
exports.UrlController = UrlController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':userId/url/shorten'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 30 } }),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({ summary: 'Create short url' }),
    (0, swagger_1.ApiBody)({ type: create_url_dto_1.CreateUrlRequest }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Generate short url',
        type: url_model_1.UrlResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, auth_decorator_1.Auth)()),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, create_url_dto_1.CreateUrlRequest]),
    __metadata("design:returntype", Promise)
], UrlController.prototype, "shortenUrl", null);
__decorate([
    (0, common_1.Get)('url/:shortened'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 30 } }),
    (0, common_1.HttpCode)(302),
    (0, common_1.Redirect)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get original url' }),
    (0, swagger_1.ApiResponse)({
        status: 302,
        description: 'Redirect to original url',
        type: redirect_response_dto_1.RedirectResponse,
    }),
    __param(0, (0, common_1.Param)('shortened')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UrlController.prototype, "redirectToUrlOriginal", null);
exports.UrlController = UrlController = __decorate([
    (0, swagger_1.ApiTags)('Url Section'),
    (0, swagger_1.ApiExtraModels)(create_url_dto_1.CreateUrlRequest),
    (0, common_1.Controller)('users'),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [winston_1.Logger,
        url_service_1.UrlService])
], UrlController);
//# sourceMappingURL=url.controller.js.map