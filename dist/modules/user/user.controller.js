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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const winston_1 = require("winston");
const user_service_1 = require("./user.service");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const auth_decorator_1 = require("../../common/auth/auth.decorator");
const user_model_1 = require("../../model/user.model");
const swagger_1 = require("@nestjs/swagger");
const update_user_dto_1 = require("./dto/update-user.dto");
const logout_user_dto_1 = require("./dto/logout-user.dto");
let UserController = class UserController {
    constructor(logger, userService) {
        this.logger = logger;
        this.userService = userService;
    }
    toUserResponse(data, statusCode, paging) {
        return {
            data,
            statusCode,
            timestamp: new Date().toString(),
            ...(paging ? { paging } : {}),
        };
    }
    async get(user) {
        console.log('USER CONTROLLER | Auth() user:', user);
        const logData = {
            email: user.email,
            action: 'GET',
            timestamp: new Date().toISOString(),
        };
        try {
            this.logger.info(`USER CONTROLLER | GET user: ${JSON.stringify(user)}`);
            const result = await this.userService.get(user);
            this.logger.info('User details retrieved', {
                ...logData,
                user_id: result.id,
                access_token: result.accessToken
            });
            return this.toUserResponse(result, 200);
        }
        catch (error) {
            this.logger.error('Failed to retrieve user details.', error);
            throw error;
        }
    }
    async update(user, request) {
        const logData = {
            email: user.email,
            action: 'PATCH',
            timestamp: new Date().toISOString(),
        };
        try {
            this.logger.info(`USER CONTROLLER | UPDATE user: ${JSON.stringify(user.email)}, request: ${JSON.stringify(request)}`);
            if (!request) {
                throw new common_1.NotFoundException('No request data provided');
            }
            const result = await this.userService.update(user, request);
            this.logger.info('User updated successfully', {
                ...logData,
                user_id: result.id,
            });
            return this.toUserResponse(result, 200);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Failed to update user data', error);
            throw error;
        }
    }
    async logout(user) {
        const logData = {
            user_id: user.id,
            action: 'DELETE',
            timestamp: new Date().toISOString(),
        };
        try {
            this.logger.info(`USER CONTROLLER | LOGOUT user: ${JSON.stringify(user.email)}`);
            const result = await this.userService.logout(user);
            this.logger.info({
                ...logData,
                success: result.success,
                message: result.message,
            });
            return this.toUserResponse({
                message: result.message,
                success: result.success,
            }, 200);
        }
        catch (error) {
            this.logger.error('Logout failed', error);
            throw error;
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user details' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User details retrieved successfully',
        type: user_model_1.UserResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, auth_decorator_1.Auth)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Update user details' }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateUserRequest }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User updated successfully',
        type: user_model_1.UserResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    __param(0, (0, auth_decorator_1.Auth)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserRequest]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User successfully logged out',
        type: logout_user_dto_1.LogoutResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, auth_decorator_1.Auth)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "logout", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('Users Section'),
    (0, swagger_1.ApiExtraModels)(update_user_dto_1.UpdateUserRequest),
    (0, common_1.Controller)('users/current'),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [winston_1.Logger,
        user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map