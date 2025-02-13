import { Logger } from 'winston';
import { UrlService } from './url.service';
import WebResponse from '../../model/web.model';
import { UrlResponse } from '../../model/url.model';
import { User } from '@prisma/client';
import { CreateUrlRequest } from './dto/create-url.dto';
export declare class UrlController {
    private logger;
    private urlService;
    constructor(logger: Logger, urlService: UrlService);
    private checkAuthorization;
    shortenUrl(user: User, userId: number, request: CreateUrlRequest): Promise<WebResponse<UrlResponse>>;
    redirectToUrlOriginal(shortened: string): Promise<{
        url: string;
    }>;
}
