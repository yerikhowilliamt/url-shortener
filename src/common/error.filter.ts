import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const timestamp = new Date().toString();

    this.logger.error('An error occurred', exception.stack);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();

      const errors = Array.isArray(responseBody) ? responseBody : [responseBody];

      const simplifiedErrors = errors.map((err) => {
        try {
          const parsedError = JSON.parse(err.message);
          return { message: parsedError[0]?.message || 'Unknown error' };
        } catch (e) {
          return { message: err.message || 'Unknown error' };
        }
      });

      response.status(status).json({
        success: false,
        errors: simplifiedErrors,
        timestamp,
      });
    } else if (exception instanceof ZodError) {
      const errors = exception.errors.map((err) => ({
        message: err.message,
        path: err.path.join('.'),
      }));

      response.status(400).json({
        success: false,
        errors,
        timestamp,
      });
    } else {
      response.status(500).json({
        success: false,
        errors: [
          {
            message: 'Internal server error',
            details: exception.message || 'An unexpected error occurred',
          },
        ],
        timestamp,
      });
    }
  }
}