"use client";

import { useEffect, useState } from "react";

interface Reminder {
  id?: number;
  title: string;
  description?: string;
  reminder_time: string;
  is_completed?: boolean;
}

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Omit<Reminder, "id" | "is_completed">) => void;
  reminder?: Reminder | null;
}

export default function ReminderModal({
  isOpen,
  onClose,
  onSave,
  reminder,
}: ReminderModalProps) {
  // Initialize state from props - this avoids the useEffect pattern
  const [currentReminder, setCurrentReminder] = useState(reminder);

  const [reminderTime, setReminderTime] = useState(() => {
    if (reminder?.reminder_time) {
      const date = new Date(reminder.reminder_time);
      return date.toISOString().slice(0, 16);
    }
    return "";
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Don't save if title is empty
    if (!currentReminder) return;

    onSave({
      title: currentReminder.title.trim(),
      description: currentReminder.description?.trim() || undefined,
      reminder_time: new Date(reminderTime).toISOString(),
    });

    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setCurrentReminder(reminder);
    onClose();
  };

  useEffect(() => {
    setCurrentReminder(reminder);
  }, [reminder]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 overflow-y-auto'
      key={reminder?.id || "new"}
    >
      {/* Backdrop with Blur */}
      <div
        className='fixed inset-0 bg-black/50 transition-all'
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-white'>
              {reminder ? "Edit Reminder" : "New Reminder"}
            </h2>
            <button
              onClick={handleClose}
              className='text-gray-500 hover:text-gray-300 transition-colors rounded-lg p-1 hover:bg-gray-800'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Title */}
            <div>
              <label
                htmlFor='title'
                className='block text-sm font-medium text-gray-300 mb-1'
              >
                Title *
              </label>
              <input
                type='text'
                id='title'
                value={currentReminder?.title || ""}
                onChange={(e) =>
                  setCurrentReminder((prev) =>
                    prev
                      ? {
                          ...prev,
                          title: e.target.value,
                        }
                      : null
                  )
                }
                className='w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500'
                placeholder='Enter reminder title'
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-300 mb-1'
              >
                Description
              </label>
              <textarea
                id='description'
                value={currentReminder?.description || ""}
                onChange={(e) =>
                  setCurrentReminder((prev) =>
                    prev
                      ? {
                          ...prev,
                          description: e.target.value,
                        }
                      : null
                  )
                }
                rows={3}
                className='w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500'
                placeholder='Add more details (optional)'
              />
            </div>

            {/* Date & Time */}
            <div>
              <label
                htmlFor='reminderTime'
                className='block text-sm font-medium text-gray-300 mb-1'
              >
                Date & Time *
              </label>
              <input
                type='datetime-local'
                id='reminderTime'
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className='w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent scheme-dark'
                required
              />
            </div>

            {/* Actions */}
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={handleClose}
                className='flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 font-medium transition-colors'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='flex-1 px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/50'
              >
                {reminder ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
