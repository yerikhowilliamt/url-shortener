"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
class UserValidation {
}
exports.UserValidation = UserValidation;
UserValidation.UPDATE = zod_1.z.object({
    name: zod_1.z.string().min(1, {
        message: 'Name cannot be empty.'
    }).max(100).optional(),
    password: zod_1.z.string().min(8, {
        message: 'Password must be at least 8 characters long.'
    }).max(100).optional(),
});
//# sourceMappingURL=user.validation.js.map