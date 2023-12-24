import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { MoxyLogger } from 'src/middleware/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new MoxyLogger();
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string;
    } else if (exception instanceof Error) {
      // Log the full error with stack trace if available
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );

      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error.';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
