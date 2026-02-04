"use client";

interface Reminder {
  id: number;
  title: string;
  description?: string;
  reminder_time: string;
  is_completed: boolean;
}

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
}

export default function ReminderCard({
  reminder,
  onEdit,
  onDelete,
  onToggleComplete,
}: ReminderCardProps) {
  const reminderDate = new Date(reminder.reminder_time);
  const now = new Date();
  const isOverdue = reminderDate < now && !reminder.is_completed;

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`group relative bg-linear-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-500/50 ${
        reminder.is_completed ? "opacity-60" : ""
      } ${
        isOverdue
          ? "border-l-4 border-red-500 bg-linear-to-br from-red-950/50 to-gray-900"
          : ""
      }`}
    >
      {/* Gradient accent line at top */}
      {!isOverdue && (
        <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
      )}

      <div className='flex items-start justify-between'>
        <div className='flex items-start gap-4 flex-1'>
          {/* Custom Checkbox */}
          <div className='relative flex items-center justify-center mt-1'>
            <input
              type='checkbox'
              checked={reminder.is_completed}
              onChange={(e) => onToggleComplete(reminder.id, e.target.checked)}
              className='peer w-6 h-6 appearance-none border-2 border-gray-600 bg-gray-900 rounded-lg cursor-pointer transition-all duration-200 checked:border-indigo-500 checked:bg-indigo-600 hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900'
            />
            {/* Checkmark Icon */}
            <svg
              className='absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={3}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>

          <div className='flex-1 min-w-0'>
            {/* Title */}
            <h3
              className={`text-xl font-bold mb-2 transition-all duration-200 ${
                reminder.is_completed
                  ? "line-through text-gray-500"
                  : isOverdue
                  ? "text-white"
                  : "text-gray-100 group-hover:text-indigo-400"
              }`}
            >
              {reminder.title}
            </h3>

            {/* Description */}
            {reminder.description && (
              <p
                className={`text-gray-400 mt-2 text-sm leading-relaxed line-clamp-2 ${
                  reminder.is_completed ? "text-gray-600" : ""
                }`}
              >
                {reminder.description}
              </p>
            )}

            {/* Time and Status Badges */}
            <div className='flex items-center gap-2 mt-4 flex-wrap'>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  isOverdue
                    ? "bg-red-900/50 text-red-300 border border-red-800"
                    : reminder.is_completed
                    ? "bg-gray-800 text-gray-400 border border-gray-700"
                    : "bg-indigo-900/50 text-indigo-300 border border-indigo-800"
                }`}
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span>{formatDate(reminderDate)}</span>
              </div>

              {isOverdue && (
                <span className='inline-flex items-center gap-1.5 text-xs bg-linear-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg font-semibold shadow-sm'>
                  <svg
                    className='w-3.5 h-3.5'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Overdue
                </span>
              )}

              {reminder.is_completed && (
                <span className='inline-flex items-center gap-1.5 text-xs bg-linear-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold shadow-sm'>
                  <svg
                    className='w-3.5 h-3.5'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-1.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
          <button
            onClick={() => onEdit(reminder)}
            className='p-2.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-900/50 rounded-xl transition-all duration-200 hover:scale-110'
            title='Edit reminder'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(reminder.id)}
            className='p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-900/50 rounded-xl transition-all duration-200 hover:scale-110'
            title='Delete reminder'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
