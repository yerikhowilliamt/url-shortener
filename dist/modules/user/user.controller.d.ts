import { Logger } from 'winston';
import { UserService } from './user.service';
import WebResponse from '../../model/web.model';
import { User } from '@prisma/client';
import { UserResponse } from '../../model/user.model';
import { UpdateUserRequest } from './dto/update-user.dto';
export declare class UserController {
    private logger;
    private userService;
    constructor(logger: Logger, userService: UserService);
    private toUserResponse;
    get(user: User): Promise<WebResponse<UserResponse>>;
    update(user: User, request: UpdateUserRequest): Promise<WebResponse<UserResponse>>;
    logout(user: User): Promise<WebResponse<{
        message: string;
        success: boolean;
    }>>;
}
