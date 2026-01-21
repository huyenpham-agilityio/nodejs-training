"use client";

import ReminderCard from "./ReminderCard";

interface Reminder {
  id: number;
  title: string;
  description?: string;
  scheduled_at: string;
  status?: string;
}

interface ReminderListProps {
  reminders: Reminder[];
  searchQuery: string;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: number) => void;
  onCreateClick: () => void;
}

export default function ReminderList({
  reminders,
  searchQuery,
  onEdit,
  onDelete,
  onCreateClick,
}: ReminderListProps) {
  if (reminders.length === 0) {
    return (
      <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-12 text-center'>
        <div className='text-6xl mb-4'>📭</div>
        <h3 className='text-xl font-semibold text-white mb-2'>
          No reminders found
        </h3>
        <p className='text-gray-400 mb-6'>
          {searchQuery
            ? "Try adjusting your search"
            : "Create your first reminder to get started"}
        </p>
        {!searchQuery && (
          <button
            onClick={onCreateClick}
            className='px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/50'
          >
            Create Reminder
          </button>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {reminders.map((reminder) => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
