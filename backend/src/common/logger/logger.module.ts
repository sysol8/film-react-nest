import { Module } from '@nestjs/common';
import { DevLogger } from './dev.logger';
import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

@Module({
  providers: [DevLogger, JsonLogger, TskvLogger],
  exports: [DevLogger, JsonLogger, TskvLogger],
})
export class LoggerModule {}
