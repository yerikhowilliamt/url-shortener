import { ZodType, z } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().min(1, { message: 'Name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password is required. It must be at least 8 characters long.' }),
  });

  static readonly VALIDATEUSER: ZodType = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1).optional(),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password is required. It must be at least 8 characters long.' }),
  });
}