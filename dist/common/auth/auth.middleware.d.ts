import { NestMiddleware } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthMiddleware implements NestMiddleware {
    private prismaService;
    private configService;
    constructor(prismaService: PrismaService, configService: ConfigService);
    use(req: any, res: any, next: (error?: any) => void): Promise<void>;
}
