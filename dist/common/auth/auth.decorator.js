"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const common_1 = require("@nestjs/common");
exports.Auth = (0, common_1.createParamDecorator)((data, context) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user) {
        return user;
    }
    else {
        throw new common_1.UnauthorizedException('Unauthorized');
    }
});
//# sourceMappingURL=auth.decorator.js.map