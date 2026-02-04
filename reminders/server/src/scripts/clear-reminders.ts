import 'reflect-metadata';
import AppDataSource from '@/configs/database';
import { Reminder } from '@/modules/reminders/entities/Reminder.entity';
import { User } from '@/modules/users/entities/User.entity';

/**
 * Clear all reminders for a specific user
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/clear-reminders.ts <clerkUserId>
 */

async function clearReminders(clerkUserId?: string): Promise<void> {
  console.log('🗑️  Starting reminder cleanup process...');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const reminderRepository = AppDataSource.getRepository(Reminder);
    const userRepository = AppDataSource.getRepository(User);

    if (clerkUserId) {
      // Clear reminders for specific user
      const user = await userRepository.findOne({
        where: { clerk_user_id: clerkUserId },
      });

      if (!user) {
        console.log(`❌ User not found: ${clerkUserId}`);
        return;
      }

      const count = await reminderRepository.count({
        where: { user: { id: user.id } },
      });

      await reminderRepository.delete({ user: { id: user.id } });

      console.log(`✅ Deleted ${count} reminders for user: ${user.name} (${user.email})`);
    } else {
      // Clear all reminders (use with caution!)
      const count = await reminderRepository.count();
      await reminderRepository.clear();
      console.log(`✅ Deleted all ${count} reminders from the database`);
    }
  } catch (error) {
    console.error('❌ Error clearing reminders:', error);
    throw error;
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
const main = async () => {
  const args = process.argv.slice(2);
  const clerkUserId = args[0];

  console.log('\n🗑️  Reminder Cleanup Script');
  console.log('=========================\n');

  if (!clerkUserId) {
    console.log('⚠️  Warning: No user ID provided. This will delete ALL reminders!');
    console.log('Usage: npm run clear-reminders <clerkUserId>');
    console.log('Or: npm run clear-reminders (to delete all)\n');
  }

  await clearReminders(clerkUserId);

  console.log('\n✅ Cleanup complete!\n');
  process.exit(0);
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
