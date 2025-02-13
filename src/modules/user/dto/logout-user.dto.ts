import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponse {
  @ApiProperty({ example: 'Logout successful' })
  message: string;

  @ApiProperty({ example: true })
  success: boolean;
}