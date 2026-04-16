import { faker } from '@faker-js/faker';
import 'reflect-metadata';
import AppDataSource from '@/configs/database';
import { Reminder, ReminderStatus } from '@/modules/reminders/entities/Reminder.entity';
import { User } from '@/modules/users/entities/User.entity';
import dayjs from 'dayjs';
import logger from '@/configs/logger';

/**
 * Seed script to generate fake reminder data for testing pagination
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/seed-reminders.ts
 */

interface SeedOptions {
  numberOfReminders: number;
  clerkUserId: string;
  userName?: string;
  userEmail?: string;
}

/**
 * Generate a random reminder status with weighted distribution
 * 60% pending, 30% notified, 10% cancelled
 */
function getRandomStatus(): ReminderStatus {
  const rand = Math.random();
  if (rand < 0.6) return ReminderStatus.PENDING;
  if (rand < 0.9) return ReminderStatus.NOTIFIED;
  return ReminderStatus.CANCELLED;
}

/**
 * Generate a scheduled date based on status
 * - PENDING: future dates
 * - NOTIFIED: past dates
 * - CANCELLED: mix of past and future dates
 */
function getScheduledDate(status: ReminderStatus): Date {
  switch (status) {
    case ReminderStatus.PENDING:
      // Future date (1 hour to 60 days from now)
      return faker.date.between({
        from: dayjs().add(1, 'hour').toDate(),
        to: dayjs().add(60, 'days').toDate(),
      });
    case ReminderStatus.NOTIFIED:
      // Past date (1 to 90 days ago)
      return faker.date.between({
        from: dayjs().subtract(90, 'days').toDate(),
        to: dayjs().subtract(1, 'day').toDate(),
      });
    case ReminderStatus.CANCELLED:
      // Mix of past and future (30 days ago to 30 days ahead)
      return faker.date.between({
        from: dayjs().subtract(30, 'days').toDate(),
        to: dayjs().add(30, 'days').toDate(),
      });
  }
}

/**
 * Generate a realistic reminder title
 */
function generateReminderTitle(): string {
  const templates = [
    () => `${faker.company.buzzVerb()} ${faker.company.buzzNoun()}`,
    () => `${faker.hacker.verb()} ${faker.hacker.noun()}`,
    () => `Meeting with ${faker.person.firstName()}`,
    () => `Call ${faker.person.fullName()}`,
    () => `${faker.word.verb()} ${faker.commerce.productName()}`,
    () => `Review ${faker.commerce.productName()} documentation`,
    () => `Submit ${faker.commerce.department()} report`,
    () => `${faker.word.verb()} project ${faker.word.noun()}`,
    () => `Doctor appointment at ${faker.location.city()}`,
    () => `Pay ${faker.finance.accountName()} bill`,
    () => `Renew ${faker.commerce.product()}`,
    () => `Follow up on ${faker.commerce.productName()}`,
    () => `Prepare for ${faker.commerce.department()} presentation`,
    () => `Schedule ${faker.commerce.department()} meeting`,
    () => `Complete ${faker.hacker.adjective()} ${faker.hacker.noun()} task`,
  ];

  const template = faker.helpers.arrayElement(templates);
  return template();
}

/**
 * Generate a realistic reminder description
 */
function generateReminderDescription(): string {
  const shouldHaveDescription = Math.random() > 0.3; // 70% have descriptions

  if (!shouldHaveDescription) {
    return '';
  }

  const templates = [
    () => faker.lorem.sentence(),
    () => faker.lorem.sentences(2),
    () => `${faker.lorem.sentence()}\n\n${faker.lorem.sentence()}`,
    () => `Location: ${faker.location.streetAddress()}\nNotes: ${faker.lorem.sentence()}`,
    () =>
      `Contact: ${faker.person.fullName()} (${faker.phone.number()})\n${faker.lorem.sentence()}`,
  ];

  const template = faker.helpers.arrayElement(templates);
  return template();
}

/**
 * Generate fake reminders for a user
 */
async function generateReminders(options: SeedOptions): Promise<void> {
  const { numberOfReminders, clerkUserId, userName, userEmail } = options;

  logger.info('🌱 Starting reminder seed process...');
  logger.info(`📝 Generating ${numberOfReminders} reminders for user: ${clerkUserId}`);

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('✅ Database connection established');

    const userRepository = AppDataSource.getRepository(User);
    const reminderRepository = AppDataSource.getRepository(Reminder);

    // Find or create user
    let user = await userRepository.findOne({
      where: { clerk_user_id: clerkUserId },
    });

    if (!user) {
      logger.info('👤 User not found, creating new user...');
      user = userRepository.create({
        clerk_user_id: clerkUserId,
        name: userName || faker.person.fullName(),
        email: userEmail || faker.internet.email(),
      });
      await userRepository.save(user);
      logger.info(`✅ User created: ${user.name} (${user.email})`);
    } else {
      logger.info(`✅ Found existing user: ${user.name} (${user.email})`);
    }

    // Generate reminders
    const reminders: Partial<Reminder>[] = [];

    for (let i = 0; i < numberOfReminders; i++) {
      const status = getRandomStatus();
      const scheduledAt = getScheduledDate(status);

      const reminder: Partial<Reminder> = {
        title: generateReminderTitle(),
        description: generateReminderDescription(),
        scheduled_at: scheduledAt,
        status: status,
        user: user,
        created_at: faker.date.between({
          from: dayjs().subtract(90, 'days').toDate(),
          to: dayjs().toDate(),
        }),
      };

      reminders.push(reminder);

      // Show progress every 10 reminders
      if ((i + 1) % 10 === 0) {
        logger.info(`📝 Generated ${i + 1}/${numberOfReminders} reminders...`);
      }
    }

    // Save all reminders in batches
    const batchSize = 50;
    for (let i = 0; i < reminders.length; i += batchSize) {
      const batch = reminders.slice(i, i + batchSize);
      await reminderRepository.save(batch);
      logger.info(
        `💾 Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(reminders.length / batchSize)}`
      );
    }

    // Show summary
    const stats = {
      total: await reminderRepository.count({ where: { user: { id: user.id } } }),
      pending: await reminderRepository.count({
        where: { user: { id: user.id }, status: ReminderStatus.PENDING },
      }),
      notified: await reminderRepository.count({
        where: { user: { id: user.id }, status: ReminderStatus.NOTIFIED },
      }),
      cancelled: await reminderRepository.count({
        where: { user: { id: user.id }, status: ReminderStatus.CANCELLED },
      }),
    };

    logger.info('\n✨ Seed completed successfully!');
    logger.info('📊 Summary:');
    logger.info(`   Total reminders: ${stats.total}`);
    logger.info(`   Pending: ${stats.pending}`);
    logger.info(`   Notified: ${stats.notified}`);
    logger.info(`   Cancelled: ${stats.cancelled}`);
  } catch (error) {
    logger.error('❌ Error seeding reminders:', error);
    throw error;
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('🔌 Database connection closed');
    }
  }
}

// Run the seed script
const main = async () => {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const numberOfReminders = parseInt(args[0]) || 50;
  const clerkUserId = args[1] || 'user_test_123456789';
  const userName = args[2];
  const userEmail = args[3];

  logger.info('\n🚀 Reminder Seeder Script');
  logger.info('========================\n');

  await generateReminders({
    numberOfReminders,
    clerkUserId,
    userName,
    userEmail,
  });

  logger.info('\n✅ All done!\n');
  process.exit(0);
};

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
