import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { Logger } from 'winston';
import { ZodError } from 'zod';
import * as bcrypt from 'bcryptjs';
import { UserResponse } from '../../model/user.model';
import { AuthValidation } from './auth.validation';
import { RegisterUserRequest } from './dto/register-auth.dto';
import { LoginUserRequest } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private jwtService: JwtService,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    try {
      this.logger.info('Creating new user', { email: request.email });

      const validatedRequest = await this.validationService.validate(
        AuthValidation.REGISTER,
        request,
      );

      await this.checkExistingUser(validatedRequest.email);

      const hashedPassword = await bcrypt.hash(validatedRequest.password, 10);
      validatedRequest.password = hashedPassword;

      const user = await this.prismaService.user.create({
        data: validatedRequest,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    try {
      this.logger.info(`AUTH SERVICE | User login attempt: ${request.email}`);

      const validatedRequest = await this.validationService.validate(
        AuthValidation.LOGIN,
        request,
      );

      const user = await this.findUserByEmail(validatedRequest.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(
        validatedRequest.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const accessToken = this.generateAccessToken(user.id, user.email);
      const refreshToken = this.generateRefreshToken(user.id, user.email);

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      await this.prismaService.user.update({
        where: { email: user.email },
        data: { accessToken, refreshToken: hashedRefreshToken },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        accessToken,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  private async checkExistingUser(email: string) {
    try {
      const userExists = await this.prismaService.user.count({
        where: { email },
      });

      if (userExists) {
        this.logger.warn('Email already registered');
        throw new BadRequestException('This email is already registered.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Error checking if email exists', { error });
      throw new InternalServerErrorException(error);
    }
  }

  private generateAccessToken(userId: number, email: string): string {
    return this.jwtService.sign({ id: userId, email }, { expiresIn: '2h' });
  }

  private generateRefreshToken(userId: number, email: string): string {
    return this.jwtService.sign({ id: userId, email }, { expiresIn: '30d' });
  }

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  private handleError(error: any): never {
    if (error instanceof ZodError) {
      throw new BadRequestException(error.message);
    } else if (
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      throw error;
    } else {
      this.logger.error('Internal Server Error:', error);
      throw new InternalServerErrorException(error);
    }
  }
}
