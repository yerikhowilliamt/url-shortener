import { createZodDto } from 'nestjs-zod';
import { AuthValidation } from '../auth.validation';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserRequest extends createZodDto(AuthValidation.REGISTER) {
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@mail.com' })
  email: string;

  @ApiProperty({ example: 'StrongPassword123' })
  password: string;
}
