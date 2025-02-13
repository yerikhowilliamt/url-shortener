import { User } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { UrlResponse } from '../../model/url.model';
import { Logger } from 'winston';
import { CreateUrlRequest } from './dto/create-url.dto';
export declare class UrlService {
    private logger;
    private prismaService;
    private validationService;
    constructor(logger: Logger, prismaService: PrismaService, validationService: ValidationService);
    private findUrlByShortened;
    shortenUrl(user: User, request: CreateUrlRequest): Promise<UrlResponse>;
    redirectOriginalUrl(shortenedUrl: string): Promise<string>;
    private toUrlResponse;
    private handleError;
}
