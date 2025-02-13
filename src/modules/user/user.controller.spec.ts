import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ExecutionContext } from '@nestjs/common';
import { Auth } from '../../common/auth/auth.decorator';
import { User } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let logger: Logger;

  beforeEach(async () => {
    const mockJwtAuthGuard = {
      canActivate: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard
        },
        {
          provide: UserService,
          useValue: {
            logout: jest.fn().mockResolvedValue({
              message: 'Log out successful',
              success: true,
            }),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should logout user and clear refreshToken', async () => {
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const response = await controller.logout(mockUser);

    expect(response.data.success).toBe(true);
    expect(response.data.message).toBe('Log out successful');
    expect(userService.logout).toHaveBeenCalledWith(mockUser);
  });
});
