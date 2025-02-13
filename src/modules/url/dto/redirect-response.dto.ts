import { ApiProperty } from '@nestjs/swagger';

export class RedirectResponse {
  @ApiProperty({ example: 'https://example.com/original-url' })
  url: string;
}
