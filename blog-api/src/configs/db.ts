import { Sequelize, Options } from 'sequelize';
import { appConfig } from '@/configs/appConfig';

export const sequelize = new Sequelize(
  appConfig.database,
  appConfig.username,
  appConfig.password,
  appConfig.params as Options,
);
