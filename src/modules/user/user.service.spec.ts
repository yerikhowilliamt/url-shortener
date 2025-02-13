import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { User } from '@prisma/client';
import { NotFoundException, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserResponse } from '../../model/user.model';
import { UpdateUserRequest } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let validationService: ValidationService;
  let logger: Logger;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockValidationService = {
      validate: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ValidationService, useValue: mockValidationService },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    validationService = module.get<ValidationService>(ValidationService);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return user data when found', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.get(user);
      expect(result).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.get({ email: 'unknown@example.com' } as User)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if accessToken is missing', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        accessToken: null,
        refreshToken: 'refresh-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      await expect(service.get(user)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should update user profile successfully', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateRequest: UpdateUserRequest = {
        name: 'John Updated',
        password: 'newpassword123',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(validationService, 'validate').mockImplementation(async () => updateRequest);
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'new-hashed-password');
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...user,
        name: updateRequest.name,
        password: 'new-hashed-password',
      });

      const result = await service.update(user, updateRequest);
      expect(result.name).toBe(updateRequest.name);
      expect(result.email).toBe(user.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.update({ email: 'unknown@example.com' } as User, {
        name: 'Updated',
        password: ''
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if validation fails', async () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(validationService, 'validate').mockImplementation(() => {throw new BadRequestException('Invalid request')});

      await expect(service.update(user, {
        name: '',
        password: ''
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should log out user successfully', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.logout({ email: 'john@example.com' } as User);
      expect(result).toEqual({ message: 'Log out successful', success: true });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      jest.spyOn(prismaService.user, 'update').mockRejectedValue(new Error('DB error'));

      await expect(service.logout({ email: 'john@example.com' } as User)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
