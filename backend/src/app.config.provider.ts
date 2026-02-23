export const configProvider = {
  provide: 'CONFIG',
  useFactory: (): AppConfig => ({
    database: {
      driver: process.env.DATABASE_DRIVER ?? 'postgres',
      url: process.env.DATABASE_URL ?? '127.0.0.1',
      username: process.env.DATABASE_USERNAME ?? 'postgres',
      password: process.env.DATABASE_PASSWORD ?? 'postgres',
    },
  }),
};

export interface AppConfig {
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  url: string;
  username: string;
  password: string;
}
