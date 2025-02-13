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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const jwt = require("jsonwebtoken");
const config_1 = require("@nestjs/config");
let AuthMiddleware = class AuthMiddleware {
    constructor(prismaService, configService) {
        this.prismaService = prismaService;
        this.configService = configService;
    }
    async use(req, res, next) {
        console.log('authorizationHeader: ', req.headers['authorization']);
        try {
            const authorizationHeader = req.headers['authorization'];
            if (!authorizationHeader) {
                return next();
            }
            const [bearer, accessToken] = authorizationHeader.split(' ');
            if (bearer !== 'Bearer' || !accessToken) {
                throw new common_1.HttpException('Invalid token format', common_1.HttpStatus.FORBIDDEN);
            }
            let decoded;
            try {
                decoded = jwt.verify(accessToken, this.configService.get('JWT_SECRET'));
            }
            catch (error) {
                throw new common_1.HttpException('Invalid token', common_1.HttpStatus.UNAUTHORIZED);
            }
            const user = await this.prismaService.user.findUnique({
                where: { id: decoded.id },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.UNAUTHORIZED);
            }
            req.user = user;
            return next();
        }
        catch (error) {
            return next(new common_1.HttpException('Unauthorized', common_1.HttpStatus.UNAUTHORIZED));
        }
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map