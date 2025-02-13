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
exports.UpdateUserRequest = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const user_validation_1 = require("../user.validation");
const swagger_1 = require("@nestjs/swagger");
class UpdateUserRequest extends (0, nestjs_zod_1.createZodDto)(user_validation_1.UserValidation.UPDATE) {
}
exports.UpdateUserRequest = UpdateUserRequest;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Cena' }),
    __metadata("design:type", String)
], UpdateUserRequest.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'UpdatedPassword123' }),
    __metadata("design:type", String)
], UpdateUserRequest.prototype, "password", void 0);
//# sourceMappingURL=update-user.dto.js.map