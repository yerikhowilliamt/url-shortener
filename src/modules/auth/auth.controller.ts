import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AuthService } from './auth.service';
import WebResponse, { Paging } from '../../model/web.model';
import { UserResponse } from '../../model/user.model';
import { LocalAuthGuard } from './guards/local.guard';
import { ApiBody, ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserRequest } from './dto/register-auth.dto';
import { LoginUserRequest } from './dto/login-auth.dto';

@ApiTags('Authentication Section')
@ApiExtraModels(RegisterUserRequest, LoginUserRequest)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private authService: AuthService,
  ) {}

  private toAuthResponse<T>(
    data: T,
    statusCode: number,
    paging?: Paging,
  ): WebResponse<T> {
    return {
      data,
      statusCode,
      timestamp: new Date().toString(),
      ...(paging ? { paging } : {}),
    };
  }

  @Post('register')
  @HttpCode(201)
  @ApiBody({ type: RegisterUserRequest })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: UserResponse,
  })
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const logData = {
      email: request.email,
      action: 'REGISTER',
      timestamp: new Date().toISOString(),
    };

    try {
      const result = await this.authService.register(request);

      this.logger.info('User created successfully', {
        ...logData,
        user_id: result.id,
      });

      return this.toAuthResponse(result, 201);
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw error;
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @ApiBody({ type: LoginUserRequest })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: UserResponse,
  })
  async login(
    @Body() request: LoginUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const logData = {
      email: request.email,
      action: 'LOGIN',
      timestamp: new Date().toISOString(),
    };

    try {
      const result = await this.authService.login(request);

      this.logger.info('User login successfully', {
        ...logData,
        user_id: result.id,
        access_token: result.accessToken,
      });

      return this.toAuthResponse(result, 200);
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }
}
