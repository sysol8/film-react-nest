import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DevLogger } from './common/logger/dev.logger';
import { JsonLogger } from './common/logger/json.logger';
import { TskvLogger } from './common/logger/tskv.logger';

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

  await app.listen(3000);
}
bootstrap();
