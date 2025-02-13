"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ErrorFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorFilter = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
let ErrorFilter = ErrorFilter_1 = class ErrorFilter {
    constructor() {
        this.logger = new common_1.Logger(ErrorFilter_1.name);
    }
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const timestamp = new Date().toString();
        this.logger.error('An error occurred', exception.stack);
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const responseBody = exception.getResponse();
            const errors = Array.isArray(responseBody) ? responseBody : [responseBody];
            const simplifiedErrors = errors.map((err) => {
                try {
                    const parsedError = JSON.parse(err.message);
                    return { message: parsedError[0]?.message || 'Unknown error' };
                }
                catch (e) {
                    return { message: err.message || 'Unknown error' };
                }
            });
            response.status(status).json({
                success: false,
                errors: simplifiedErrors,
                timestamp,
            });
        }
        else if (exception instanceof zod_1.ZodError) {
            const errors = exception.errors.map((err) => ({
                message: err.message,
                path: err.path.join('.'),
            }));
            response.status(400).json({
                success: false,
                errors,
                timestamp,
            });
        }
        else {
            response.status(500).json({
                success: false,
                errors: [
                    {
                        message: 'Internal server error',
                        details: exception.message || 'An unexpected error occurred',
                    },
                ],
                timestamp,
            });
        }
    }
};
exports.ErrorFilter = ErrorFilter;
exports.ErrorFilter = ErrorFilter = ErrorFilter_1 = __decorate([
    (0, common_1.Catch)()
], ErrorFilter);
//# sourceMappingURL=error.filter.js.map