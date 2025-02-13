import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Redirect,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UrlService } from './url.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import WebResponse from '../../model/web.model';
import { UrlResponse } from '../../model/url.model';
import { Auth } from '../../common/auth/auth.decorator';
import { User } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUrlRequest } from './dto/create-url.dto';
import { RedirectResponse } from './dto/redirect-response.dto';

@ApiTags('Url Section')
@ApiExtraModels(CreateUrlRequest)
@Controller('users')
export class UrlController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private urlService: UrlService,
  ) {}

  private checkAuthorization(userId: number, user: User): void {
    if (user.id !== userId) {
      this.logger.info(
        `URL CONTROLLER | CHECK AUTH: {user_id: ${JSON.stringify(userId)}}`,
      );
      throw new UnauthorizedException(
        `You are not authorized to access this user's urls`,
      );
    }
  }

  @ApiBearerAuth()
  @Post(':userId/url/shorten')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 30 } })
  @HttpCode(201)
  @ApiOperation({ summary: 'Create short url' })
  @ApiBody({ type: CreateUrlRequest })
  @ApiResponse({
    status: 201,
    description: 'Generate short url',
    type: UrlResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async shortenUrl(
    @Auth() user: User,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() request: CreateUrlRequest,
  ): Promise<WebResponse<UrlResponse>> {
    try {
      this.checkAuthorization(userId, user);
      const result = await this.urlService.shortenUrl(user, request);
      return {
        data: result,
        statusCode: 201,
        timestamp: new Date().toString(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw error;
    }
  }

  @Get('url/:shortened')
  @Throttle({ default: { limit: 5, ttl: 30 } })
  @HttpCode(302)
  @Redirect()
  @ApiOperation({ summary: 'Get original url' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to original url',
    type: RedirectResponse,
  })
  async redirectToUrlOriginal(@Param('shortened') shortened: string) {
    try {
      this.logger.info(`URL CONTROLLER | shortened_url : ${shortened}`);

      const result = await this.urlService.redirectOriginalUrl(shortened);

      if (!result) {
        throw new NotFoundException('Short URL not found');
      }

      return {
        url: result,
      };
    } catch (error) {
      this.logger.error(`Failed to redirect URL: ${error.message}`);
      throw error;
    }
  }
}
