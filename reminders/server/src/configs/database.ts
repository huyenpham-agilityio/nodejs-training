import { DataSource } from 'typeorm';
import { User } from '@/modules/users/entities/User.entity';
import { Reminder } from '@/modules/reminders/entities/Reminder.entity';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Create and export the DataSource instance
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_DATABASE || 'reminders_db',
  synchronize: isDevelopment,
  logging: false,
  entities: [User, Reminder],
});

export default AppDataSource;
