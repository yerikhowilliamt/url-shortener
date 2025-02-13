import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { Logger } from 'winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Url } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('UrlService', () => {
  let service: UrlService;
  let prismaService: PrismaService;
  let validationService: ValidationService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: {
            url: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: ValidationService,
          useValue: { validate: jest.fn() },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prismaService = module.get<PrismaService>(PrismaService);
    validationService = module.get<ValidationService>(ValidationService);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('redirectOriginalUrl', () => {
    it('should return original URL if shortened URL exists', async () => {
      const mockUrl: Url = {
        id: 1,
        originalUrl: 'https://example.com',
        shortenedUrl: 'abc123',
        customUrl: null,
        userId: 1,
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.url.findUnique = jest.fn().mockResolvedValue(mockUrl);

      const result = await service.redirectOriginalUrl('abc123');
      expect(result).toBe(mockUrl.originalUrl);
    });

    it('should throw NotFoundException if shortened URL does not exist', async () => {
      prismaService.url.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.redirectOriginalUrl('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if URL is expired', async () => {
      const expiredUrl: Url = {
        id: 1,
        originalUrl: 'https://expired.com',
        shortenedUrl: 'expired123',
        customUrl: null,
        userId: 1,
        expiresAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.url.findUnique = jest.fn().mockResolvedValue(expiredUrl);

      await expect(service.redirectOriginalUrl('expired123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('shortenUrl', () => {
    it('should create a shortened URL', async () => {
      const request = { originalUrl: 'https://example.com', customUrl: null };
      const user = { id: 1 } as any;
      const mockUrl: Url = {
        id: 1,
        originalUrl: request.originalUrl,
        shortenedUrl: crypto.randomBytes(3).toString('hex'),
        customUrl: null,
        userId: user.id,
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      validationService.validate = jest.fn().mockResolvedValue(request);
      prismaService.url.findFirst = jest.fn().mockResolvedValue(null);
      prismaService.url.create = jest.fn().mockResolvedValue(mockUrl);

      const result = await service.shortenUrl(user, request);
      expect(result.originalUrl).toBe(request.originalUrl);
      expect(result.shortenedUrl).toBe(mockUrl.shortenedUrl);
    });

    it('should throw BadRequestException if custom URL is already in use', async () => {
      const request = {
        originalUrl: 'https://example.com',
        customUrl: 'abc123',
      };
      const user = { id: 1 } as any;

      validationService.validate = jest.fn().mockResolvedValue(request);
      prismaService.url.findFirst = jest
        .fn()
        .mockResolvedValue({ shortenedUrl: 'abc123' });

      await expect(service.shortenUrl(user, request)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
