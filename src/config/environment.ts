import { config as dotenvConfig } from 'dotenv';
import * as Joi from 'joi';
import { Environments } from './config.enums';
dotenvConfig({ path: '.env' });

const envConfig = {
  PORT: +process.env.PORT,
  ENVIRONMENT: process.env.ENVIRONMENT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: +process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
};

const envVarsSchema = Joi.object({
  PORT: Joi.number().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  ENVIRONMENT: Joi.string()
    .valid(
      Environments.LOCAL,
      Environments.DEV,
      Environments.STAGE,
      Environments.PROD,
    )
    .required(),
});

const { error } = envVarsSchema.validate(envConfig);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default envConfig;
