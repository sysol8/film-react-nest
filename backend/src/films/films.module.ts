import { Module } from '@nestjs/common';

import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { TypeormRepositoriesModule } from '../database/typeorm-repositories.module';

import { FilmsRepository } from './repository/films.repository';
import { FilmsRepositoryMongo } from './repository/films.repository.mongo';
import { AppRepository } from './repository/app.repository';

@Module({
  imports: [TypeormRepositoriesModule],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    AppRepository,
    { provide: FilmsRepository, useExisting: AppRepository },
    { provide: FilmsRepositoryMongo, useExisting: AppRepository },
  ],
  exports: [FilmsService, AppRepository, FilmsRepositoryMongo],
})
export class FilmsModule {}
