import { User } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { UserResponse } from '../../model/user.model';
import { Logger } from 'winston';
import { UpdateUserRequest } from './dto/update-user.dto';
export declare class UserService {
    private logger;
    private prismaService;
    private validationService;
    constructor(logger: Logger, prismaService: PrismaService, validationService: ValidationService);
    get(user: User): Promise<UserResponse>;
    update(user: User, request: UpdateUserRequest): Promise<UserResponse>;
    logout(user: User): Promise<{
        message: string;
        success: boolean;
    }>;
    private toUserResponse;
    private handleError;
}
