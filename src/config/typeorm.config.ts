import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import databaseConfig from './database.config';
import { AppDataSource } from './datasource.config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { ConfigModule, ConfigService } from '@nestjs/config';
export const typeOrmConfig: TypeOrmModuleOptions = databaseConfig;

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    return databaseConfig;
  },
  async dataSourceFactory(options) {
    if (!options) {
      throw new Error('Invalid options passed');
    }

    return addTransactionalDataSource(AppDataSource);
  },
};
