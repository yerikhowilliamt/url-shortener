import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Url, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import {
  UrlResponse,
} from '../../model/url.model';
import { Logger } from 'winston';
import * as crypto from 'crypto';
import { UrlValidation } from './url.validation';
import { ZodError } from 'zod';
import { CreateUrlRequest } from './dto/create-url.dto';

@Injectable()
export class UrlService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  private async findUrlByShortened(
    shortenedUrl: string,
    userId: number,
  ): Promise<Url | null> {
    return this.prismaService.url.findFirst({
      where: { shortenedUrl, userId },
    });
  }

  async shortenUrl(
    user: User,
    request: CreateUrlRequest,
  ): Promise<UrlResponse> {
    try {
      const createRequest: CreateUrlRequest =
      await this.validationService.validate(UrlValidation.CREATE, request);

    let shortened: string;
    shortened =
      createRequest.customUrl || crypto.randomBytes(3).toString('hex');

    if (shortened) {
      const existingUrl = await this.findUrlByShortened(shortened, user.id);

      if (existingUrl) {
        throw new BadRequestException('Custom URL already in use');
      }
    }

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 5);

    const url = await this.prismaService.url.create({
      data: {
        originalUrl: createRequest.originalUrl,
        shortenedUrl: shortened,
        customUrl: createRequest.customUrl,
        userId: user.id,
        expiresAt: expirationDate,
      },
    });

    this.logger.info('URL shortened successfully', {
      original: url.originalUrl,
      shortened: url.shortenedUrl,
    });

    return this.toUrlResponse(url);
    } catch (error) {
      this.handleError(error)
    }
  }

  async redirectOriginalUrl(shortenedUrl: string) {
    try {
      const url = await this.prismaService.url.findUnique({
        where: { shortenedUrl },
      });

      if (!url) {
        throw new NotFoundException('Short URL not found');
      }

      if (new Date() > url.expiresAt) {
        throw new BadRequestException('URL has expired');
      }

      return url.originalUrl;
    } catch (error) {
      this.handleError(error);
    }
  }

  private toUrlResponse(url: Url): UrlResponse {
    return {
      id: url.id,
      originalUrl: url.originalUrl,
      shortenedUrl: url.shortenedUrl,
      expiresAt: url.expiresAt.toISOString(),
      createdAt: url.createdAt.toISOString(),
      updatedAt: url.updatedAt.toISOString(),
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
      this.logger.error('Internal Server Error:', {
        message: error.message,
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }
}
