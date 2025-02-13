declare const RegisterUserRequest_base: import("nestjs-zod").ZodDto<any, import("zod").ZodTypeDef, any>;
export declare class RegisterUserRequest extends RegisterUserRequest_base {
    name: string;
    email: string;
    password: string;
}
export {};
