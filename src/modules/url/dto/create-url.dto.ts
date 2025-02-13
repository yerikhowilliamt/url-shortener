import { ApiProperty } from '@nestjs/swagger';
import { UrlValidation } from "./../url.validation";
import { createZodDto } from 'nestjs-zod';

export class CreateUrlRequest extends createZodDto(UrlValidation.CREATE) {
  @ApiProperty({ example: 'https://www.youtube.com/watch?v=lZmsY0e2ojQ' })
  originalUrl: string;
}