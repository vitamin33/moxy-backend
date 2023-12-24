import { Injectable, LoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MoxyLogger implements LoggerService {
  log(message: string, context?: string) {
    // Implement custom logging logic here
    console.log(new Date().toISOString(), message, context);
  }

  error(message: string, trace: string, context?: string) {
    // Log errors with stack trace
    console.error(new Date().toISOString(), message, trace, context);
  }

  warn(message: string, context?: string) {
    // Implement warning logging logic
    console.warn(new Date().toISOString(), message, context);
  }

  debug(message: string, context?: string) {
    // Implement debug logging logic
    console.debug(new Date().toISOString(), message, context);
  }

  verbose(message: string, context?: string) {
    // Implement verbose logging logic
    console.log(new Date().toISOString(), message, context);
  }
}
