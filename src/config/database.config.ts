import { DataSourceOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
});

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '../../**/**/*entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  logging: false,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
};

export default databaseConfig;
