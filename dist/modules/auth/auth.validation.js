"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
class AuthValidation {
}
exports.AuthValidation = AuthValidation;
AuthValidation.REGISTER = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: 'Name is required.' }),
    email: zod_1.z.string().email({ message: 'Please enter a valid email address.' }),
    password: zod_1.z.string().min(8, { message: 'Password is required. It must be at least 8 characters long.' }),
});
AuthValidation.VALIDATEUSER = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1),
    accessToken: zod_1.z.string().min(1),
    refreshToken: zod_1.z.string().min(1).optional(),
});
AuthValidation.LOGIN = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Please enter a valid email address.' }),
    password: zod_1.z.string().min(8, { message: 'Password is required. It must be at least 8 characters long.' }),
});
//# sourceMappingURL=auth.validation.js.map