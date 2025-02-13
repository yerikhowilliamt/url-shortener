import { createZodDto } from 'nestjs-zod';
import { AuthValidation } from '../auth.validation';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserRequest extends createZodDto(AuthValidation.LOGIN) {
  @ApiProperty({ example: 'john@mail.com' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123' })
  password: string;
}
