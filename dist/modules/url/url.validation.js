"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlValidation = void 0;
const zod_1 = require("zod");
class UrlValidation {
}
exports.UrlValidation = UrlValidation;
UrlValidation.CREATE = zod_1.z.object({
    originalUrl: zod_1.z.string().min(1, {
        message: 'Url cannot be empty'
    }).max(250),
    customUrl: zod_1.z.string().max(16, {
        message: 'Custom URL can be up to 16 characters'
    }).optional()
});
UrlValidation.REDIRECT = zod_1.z.object({
    shortenedUrl: zod_1.z.string().max(16, {
        message: 'Short URL maximal 16 characters'
    })
});
//# sourceMappingURL=url.validation.js.map