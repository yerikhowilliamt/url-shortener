import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserResponse } from '../../model/user.model';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterUserRequest } from './dto/register-auth.dto';
import { LoginUserRequest } from './dto/login-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let logger: Logger;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const request: RegisterUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockResponse: UserResponse = {
        id: 1,
        name: request.name,
        email: request.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockResponse);

      const response = await controller.register(request);

      expect(response.statusCode).toBe(201);
      expect(response.data).toEqual(mockResponse);
      expect(authService.register).toHaveBeenCalledWith(request);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw error if email is already registered', async () => {
      const request: RegisterUserRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      jest.spyOn(authService, 'register').mockRejectedValue(new BadRequestException('Email already registered'));

      await expect(controller.register(request)).rejects.toThrow(BadRequestException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockResponse: UserResponse = {
        id: 1,
        name: 'John Doe',
        email: request.email,
        accessToken: 'mock-access-token',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

      const response = await controller.login(request);

      expect(response.statusCode).toBe(200);
      expect(response.data).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(request);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const request: LoginUserRequest = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'login').mockRejectedValue(new UnauthorizedException('Invalid email or password'));

      await expect(controller.login(request)).rejects.toThrow(UnauthorizedException);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
