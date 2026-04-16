import 'reflect-metadata';
import AppDataSource from '@/configs/database';
import { Reminder } from '@/modules/reminders/entities/Reminder.entity';
import { User } from '@/modules/users/entities/User.entity';
import logger from '@/configs/logger';

/**
 * Clear all reminders for a specific user
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/clear-reminders.ts <clerkUserId>
 */

async function clearReminders(clerkUserId?: string): Promise<void> {
  logger.info('🗑️  Starting reminder cleanup process...');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('✅ Database connection established');

    const reminderRepository = AppDataSource.getRepository(Reminder);
    const userRepository = AppDataSource.getRepository(User);

    if (clerkUserId) {
      // Clear reminders for specific user
      const user = await userRepository.findOne({
        where: { clerk_user_id: clerkUserId },
      });

      if (!user) {
        logger.info(`❌ User not found: ${clerkUserId}`);
        return;
      }

      const count = await reminderRepository.count({
        where: { user: { id: user.id } },
      });

      await reminderRepository.delete({ user: { id: user.id } });

      logger.info(`✅ Deleted ${count} reminders for user: ${user.name} (${user.email})`);
    } else {
      // Clear all reminders (use with caution!)
      const count = await reminderRepository.count();
      await reminderRepository.clear();
      logger.info(`✅ Deleted all ${count} reminders from the database`);
    }
  } catch (error) {
    logger.error('❌ Error clearing reminders:', error);
    throw error;
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('🔌 Database connection closed');
    }
  }
}

// Run the script
const main = async () => {
  const args = process.argv.slice(2);
  const clerkUserId = args[0];

  logger.info('\n🗑️  Reminder Cleanup Script');
  logger.info('=========================\n');

  if (!clerkUserId) {
    logger.info('⚠️  Warning: No user ID provided. This will delete ALL reminders!');
    logger.info('Usage: npm run clear-reminders <clerkUserId>');
    logger.info('Or: npm run clear-reminders (to delete all)\n');
  }

  await clearReminders(clerkUserId);

  logger.info('\n✅ Cleanup complete!\n');
  process.exit(0);
};

main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
