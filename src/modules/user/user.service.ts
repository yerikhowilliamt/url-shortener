import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { UserResponse } from '../../model/user.model';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { UpdateUserRequest } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async get(user: User): Promise<UserResponse> {
    try {
      this.logger.info(`USER SERVICE | GET : User with email: ${user.email}, access_token: ${user.accessToken}`);

      const currentUser = await this.prismaService.user.findUnique({
        where: { email: user.email },
      });

      if (!currentUser) {
        throw new UnauthorizedException('User not found');
      }

      if (!currentUser.accessToken) {
        throw new UnauthorizedException('Token must be provided');
      }

      return this.toUserResponse(currentUser);
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
    try {
      this.logger.info(
        `USER SERVICE | UPDATE : User ${user.email} trying to update their profile`,
      );

      const updateRequest: UpdateUserRequest =
        await this.validationService.validate(UserValidation.UPDATE, request);

      const existingUser = await this.prismaService.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (updateRequest.password) {
        existingUser.password = await bcrypt.hash(updateRequest.password, 10);
      }

      const updatedUser = await this.prismaService.user.update({
        where: { email: user.email },
        data: {
          name: updateRequest.name,
          password: updateRequest.password,
        },
      });

      return this.toUserResponse(updatedUser);
    } catch (error) {
      this.handleError(error);
    }
  }

  async logout(user: User): Promise<{ message: string; success: boolean }> {
    try {
      await this.prismaService.user.update({
        where: { email: user.email },
        data: { accessToken: null, refreshToken: null },
      });

      this.logger.info(
        `USER SERVICE | LOGOUT : User with email: ${user.email} has logged out`,
      );

      return {
        message: 'Log out successful',
        success: true,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toString(),
      updatedAt: user.updatedAt.toString(),
    };
  }

  private handleError(error: any): never {
    if (error instanceof ZodError) {
      throw new BadRequestException(error.message);
    } else if (
      error instanceof NotFoundException ||
      error instanceof UnauthorizedException ||
      error instanceof BadRequestException
    ) {
      throw error;
    } else {
      this.logger.error('Internal Server Error:', error);
      throw new InternalServerErrorException(error);
    }
  }
}
