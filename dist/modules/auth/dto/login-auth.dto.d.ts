declare const LoginUserRequest_base: import("nestjs-zod").ZodDto<any, import("zod").ZodTypeDef, any>;
export declare class LoginUserRequest extends LoginUserRequest_base {
    email: string;
    password: string;
}
export {};
