import { Injectable, LoggerService } from '@nestjs/common';

type LogLevel = 'debug' | 'log' | 'warn' | 'error' | 'verbose';

@Injectable()
export class JsonLogger implements LoggerService {
  private now(): string {
    return new Date().toISOString();
  }

  private normalizeMessage(message: unknown) {
    if (message instanceof Error) {
      return {
        name: message.name,
        message: message.message,
        stack: message.stack,
      };
    }

    return message;
  }

  private formatMessage(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[] = [],
  ): string {
    const payload = {
      timestamp: this.now(),
      level,
      message: this.normalizeMessage(message),
      optionalParams,
    };

    return JSON.stringify(payload);
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    process.stdout.write(
      this.formatMessage('log', message, optionalParams) + '\n',
    );
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    process.stdout.write(
      this.formatMessage('warn', message, optionalParams) + '\n',
    );
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    process.stdout.write(
      this.formatMessage('debug', message, optionalParams) + '\n',
    );
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    process.stdout.write(
      this.formatMessage('verbose', message, optionalParams) + '\n',
    );
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    process.stderr.write(
      this.formatMessage('error', message, optionalParams) + '\n',
    );
  }
}
