import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService, private configService: ConfigService) {}

  async use(req: any, res: any, next: (error?: any) => void) {
    console.log('authorizationHeader: ', req.headers['authorization'])
    try {
      const authorizationHeader = req.headers['authorization'];

      if (!authorizationHeader) {
        return next();
      }

      const [bearer, accessToken] = authorizationHeader.split(' ');

      if (bearer !== 'Bearer' || !accessToken) {
        throw new HttpException('Invalid token format', HttpStatus.FORBIDDEN);
      }

      // ✅ Verifikasi token dengan secret key
      let decoded: any;
      try {
        decoded = jwt.verify(accessToken, this.configService.get<string>('JWT_SECRET'));
      } catch (error) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      // ✅ Cek user berdasarkan `id` dari payload JWT, bukan berdasarkan accessToken
      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      req.user = user; // Simpan user di request
      return next();
    } catch (error) {
      return next(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED));
    }
  }
}