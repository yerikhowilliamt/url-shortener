declare const UpdateUserRequest_base: import("nestjs-zod").ZodDto<any, import("zod").ZodTypeDef, any>;
export declare class UpdateUserRequest extends UpdateUserRequest_base {
    name: string;
    password: string;
}
export {};
