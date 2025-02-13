import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserService } from './user.service';
import WebResponse, { Paging } from '../../model/web.model';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Auth } from '../../common/auth/auth.decorator';
import { User } from '@prisma/client';
import { UserResponse } from '../../model/user.model';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserRequest } from './dto/update-user.dto';
import { LogoutResponse } from './dto/logout-user.dto';

@ApiBearerAuth()
@ApiTags('Users Section')
@ApiExtraModels(UpdateUserRequest)
@Controller('users/current')
export class UserController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private userService: UserService,
  ) {}

  private toUserResponse<T>(
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Get current user details' })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
    type: UserResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async get(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    console.log('USER CONTROLLER | Auth() user:', user);
    const logData = {
      email: user.email,
      action: 'GET',
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info(`USER CONTROLLER | GET user: ${JSON.stringify(user)}`);

      const result = await this.userService.get(user);

      this.logger.info('User details retrieved', {
        ...logData,
        user_id: result.id,
        access_token: result.accessToken
      });

      return this.toUserResponse(result, 200);
    } catch (error) {
      this.logger.error('Failed to retrieve user details.', error);
      throw error;
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Update user details' })
  @ApiBody({ type: UpdateUserRequest })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async update(
    @Auth() user: User,
    @Body() request: UpdateUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const logData = {
      email: user.email,
      action: 'PATCH',
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info(
        `USER CONTROLLER | UPDATE user: ${JSON.stringify(user.email)}, request: ${JSON.stringify(request)}`,
      );

      if (!request) {
        throw new NotFoundException('No request data provided');
      }

      const result = await this.userService.update(user, request);

      this.logger.info('User updated successfully', {
        ...logData,
        user_id: result.id,
      });

      return this.toUserResponse(result, 200);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to update user data', error);
      throw error;
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
    type: LogoutResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async logout(
    @Auth() user: User,
  ): Promise<WebResponse<{ message: string; success: boolean }>> {
    const logData = {
      user_id: user.id,
      action: 'DELETE',
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info(
        `USER CONTROLLER | LOGOUT user: ${JSON.stringify(user.email)}`,
      );

      const result = await this.userService.logout(user);

      this.logger.info({
        ...logData,
        success: result.success,
        message: result.message,
      });

      return this.toUserResponse(
        {
          message: result.message,
          success: result.success,
        },
        200,
      );
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw error;
    }
  }
}
