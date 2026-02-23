import { Injectable, LoggerService } from '@nestjs/common';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

@Injectable()
export class TskvLogger implements LoggerService {
  private now(): string {
    return new Date().toISOString();
  }

  private escapeTskv(value: unknown): string {
    if (value === null || value === undefined) return '';

    let string: string;

    if (value instanceof Error) {
      string = JSON.stringify({
        name: value.name,
        message: value.message,
        stack: value.stack,
      });
    } else if (typeof value === 'object') {
      string = JSON.stringify(value);
    } else {
      string = String(value);
    }

    return string
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/=/g, '\\=');
  }

  private toTskv(fields: Record<string, unknown>): string {
    const parts = ['tskv'];

    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      parts.push(`${key}=${this.escapeTskv(value)}`);
    }

    return parts.join('\t');
  }

  private formatMessage(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[] = [],
  ): string {
    return this.toTskv({
      timestamp: this.now(),
      level,
      message,
      optionalParams: optionalParams.length ? optionalParams : undefined,
    });
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
