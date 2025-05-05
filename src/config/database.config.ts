import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
   useFactory: (config: ConfigService) => ({
      type: 'postgres',
      url: config.get('DATABASE_URL'),
      entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
      migrationsRun: true,
   }),
   inject: [ConfigService],
};
