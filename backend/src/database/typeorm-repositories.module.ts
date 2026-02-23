import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const username = config.get<string>('DATABASE_USERNAME');
        const password = config.get<string>('DATABASE_PASSWORD');
        const databaseName = config.get<string>('DATABASE_NAME') ?? 'afisha';
        const databasePort = Number(
          config.get<string>('DATABASE_PORT') ?? 5432,
        );
        const synchronize =
          (config.get<string>('DATABASE_SYNCHRONIZE') ?? 'false') === 'true';

        const isConnectionString =
          databaseUrl?.startsWith('postgres://') ||
          databaseUrl?.startsWith('postgresql://');

        if (isConnectionString) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            username,
            password,
            autoLoadEntities: true,
            synchronize,
          };
        }

        return {
          type: 'postgres' as const,
          host: databaseUrl ?? '127.0.0.1',
          port: databasePort,
          username: username ?? 'postgres',
          password: password ?? 'postgres',
          database: databaseName,
          autoLoadEntities: true,
          synchronize,
        };
      },
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  exports: [TypeOrmModule],
})
export class TypeormRepositoriesModule {}
