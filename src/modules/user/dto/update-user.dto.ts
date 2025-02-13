import { createZodDto } from 'nestjs-zod';
import { UserValidation } from '../user.validation';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRequest extends createZodDto(UserValidation.UPDATE) {
  @ApiProperty({ example: 'John Cena' })
  name: string;

  @ApiProperty({ example: 'UpdatedPassword123' })
  password: string;
}