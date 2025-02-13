import { ZodType, z } from 'zod';

export class UrlValidation {
  static readonly CREATE: ZodType = z.object({
    originalUrl: z.string().min(1, {
      message: 'Url cannot be empty'
    }).max(250),
    customUrl: z.string().max(16, {
      message: 'Custom URL can be up to 16 characters'
    }).optional()
  })

  static readonly REDIRECT: ZodType = z.object({
    shortenedUrl: z.string().max(16, {
      message: 'Short URL maximal 16 characters'
    })
  }) 
}