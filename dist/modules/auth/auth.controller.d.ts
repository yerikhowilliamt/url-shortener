import { Logger } from 'winston';
import { AuthService } from './auth.service';
import WebResponse from '../../model/web.model';
import { UserResponse } from '../../model/user.model';
import { RegisterUserRequest } from './dto/register-auth.dto';
import { LoginUserRequest } from './dto/login-auth.dto';
export declare class AuthController {
    private logger;
    private authService;
    constructor(logger: Logger, authService: AuthService);
    private toAuthResponse;
    register(request: RegisterUserRequest): Promise<WebResponse<UserResponse>>;
    login(request: LoginUserRequest): Promise<WebResponse<UserResponse>>;
}
