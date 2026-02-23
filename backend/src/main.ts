import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DevLogger } from './common/logger/dev.logger';
import { JsonLogger } from './common/logger/json.logger';
import { TskvLogger } from './common/logger/tskv.logger';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const loggerMode = process.env.LOGGER_MODE;
  const logger =
    loggerMode === 'json'
      ? app.get(JsonLogger)
      : loggerMode === 'tskv'
        ? app.get(TskvLogger)
        : app.get(DevLogger);

  app.useLogger(logger);
  app.setGlobalPrefix('api/afisha', {
    exclude: [{ path: 'content/(.*)', method: RequestMethod.ALL }],
  });

  await app.listen(3000);
}
bootstrap();
