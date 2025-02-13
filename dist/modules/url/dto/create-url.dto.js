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
exports.CreateUrlRequest = void 0;
const swagger_1 = require("@nestjs/swagger");
const url_validation_1 = require("./../url.validation");
const nestjs_zod_1 = require("nestjs-zod");
class CreateUrlRequest extends (0, nestjs_zod_1.createZodDto)(url_validation_1.UrlValidation.CREATE) {
}
exports.CreateUrlRequest = CreateUrlRequest;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://www.youtube.com/watch?v=lZmsY0e2ojQ' }),
    __metadata("design:type", String)
], CreateUrlRequest.prototype, "originalUrl", void 0);
//# sourceMappingURL=create-url.dto.js.map