import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UrlResponse } from '../../model/url.model';
import { User } from '@prisma/client';
import { CreateUrlRequest } from './dto/create-url.dto';

describe('UrlController', () => {
  let controller: UrlController;
  let urlService: UrlService;

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockUrlService = {
    shortenUrl: jest.fn(),
    redirectOriginalUrl: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
        { provide: UrlService, useValue: mockUrlService },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shortenUrl', () => {
    it('should return a shortened URL response', async () => {
      const user: User = { id: 1 } as User;
      const userId = 1;
      const request: CreateUrlRequest = { originalUrl: 'https://example.com' };
      const response: UrlResponse = {
        id: 1,
        originalUrl: 'https://example.com',
        shortenedUrl: 'abc123',
        expiresAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockUrlService.shortenUrl.mockResolvedValue(response);

      const result = await controller.shortenUrl(user, userId, request);
      expect(result.data).toEqual(response);
      expect(result.statusCode).toBe(201);
      expect(mockUrlService.shortenUrl).toHaveBeenCalledWith(user, request);
    });

    it('should throw UnauthorizedException if user is not authorized', async () => {
      const user: User = { id: 2 } as User;
      const userId = 1;
      const request: CreateUrlRequest = { originalUrl: 'https://example.com' };
      
      await expect(controller.shortenUrl(user, userId, request)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('redirectToUrlOriginal', () => {
    it('should redirect to the original URL', async () => {
      const shortened = 'abc123';
      const originalUrl = 'https://example.com';
      
      mockUrlService.redirectOriginalUrl.mockResolvedValue(originalUrl);

      const result = await controller.redirectToUrlOriginal(shortened);
      expect(result.url).toBe(originalUrl);
      expect(mockUrlService.redirectOriginalUrl).toHaveBeenCalledWith(shortened);
    });

    it('should throw NotFoundException if the URL is not found', async () => {
      const shortened = 'invalid123';
      mockUrlService.redirectOriginalUrl.mockRejectedValue(
        new NotFoundException('Short URL not found'),
      );

      await expect(controller.redirectToUrlOriginal(shortened)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
