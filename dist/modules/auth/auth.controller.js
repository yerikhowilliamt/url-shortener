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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const winston_1 = require("winston");
const auth_service_1 = require("./auth.service");
const user_model_1 = require("../../model/user.model");
const local_guard_1 = require("./guards/local.guard");
const swagger_1 = require("@nestjs/swagger");
const register_auth_dto_1 = require("./dto/register-auth.dto");
const login_auth_dto_1 = require("./dto/login-auth.dto");
let AuthController = class AuthController {
    constructor(logger, authService) {
        this.logger = logger;
        this.authService = authService;
    }
    toAuthResponse(data, statusCode, paging) {
        return {
            data,
            statusCode,
            timestamp: new Date().toString(),
            ...(paging ? { paging } : {}),
        };
    }
    async register(request) {
        const logData = {
            email: request.email,
            action: 'REGISTER',
            timestamp: new Date().toISOString(),
        };
        try {
            const result = await this.authService.register(request);
            this.logger.info('User created successfully', {
                ...logData,
                user_id: result.id,
            });
            return this.toAuthResponse(result, 201);
        }
        catch (error) {
            this.logger.error('Registration failed', error);
            throw error;
        }
    }
    async login(request) {
        const logData = {
            email: request.email,
            action: 'LOGIN',
            timestamp: new Date().toISOString(),
        };
        try {
            const result = await this.authService.login(request);
            this.logger.info('User login successfully', {
                ...logData,
                user_id: result.id,
                access_token: result.accessToken,
            });
            return this.toAuthResponse(result, 200);
        }
        catch (error) {
            this.logger.error('Login failed', error);
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiBody)({ type: register_auth_dto_1.RegisterUserRequest }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User registered successfully',
        type: user_model_1.UserResponse,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_auth_dto_1.RegisterUserRequest]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)(local_guard_1.LocalAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiBody)({ type: login_auth_dto_1.LoginUserRequest }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User logged in successfully',
        type: user_model_1.UserResponse,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_auth_dto_1.LoginUserRequest]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication Section'),
    (0, swagger_1.ApiExtraModels)(register_auth_dto_1.RegisterUserRequest, login_auth_dto_1.LoginUserRequest),
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [winston_1.Logger,
        auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map