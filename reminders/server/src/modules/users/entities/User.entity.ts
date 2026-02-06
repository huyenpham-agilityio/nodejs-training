import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reminder } from '@/modules/reminders/entities/Reminder.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  clerk_user_id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'boolean', default: true })
  email_notifications_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  slack_notifications_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  console_notifications_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];
}
