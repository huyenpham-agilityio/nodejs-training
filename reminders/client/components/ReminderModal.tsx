"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Reminder {
  id?: number;
  title: string;
  description?: string;
  scheduled_at: string;
}

// Zod validation schema
const reminderSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  scheduled_at: z
    .string()
    .min(1, "Date and time is required")
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        return selectedDate > new Date();
      },
      { message: "Reminder must be scheduled in the future" },
    ),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Omit<Reminder, "id">) => void;
  reminder?: Reminder | null;
}

export default function ReminderModal({
  isOpen,
  onClose,
  onSave,
  reminder,
}: ReminderModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduled_at: "",
    },
  });

  // Reset form when reminder changes (edit mode) or modal opens
  useEffect(() => {
    if (isOpen) {
      if (reminder) {
        const date = new Date(reminder.scheduled_at);
        reset({
          title: reminder.title,
          description: reminder.description || "",
          scheduled_at: date.toISOString().slice(0, 16),
        });
      } else {
        reset({
          title: "",
          description: "",
          scheduled_at: "",
        });
      }
    }
  }, [reminder, reset, isOpen]);

  const onSubmit = (data: ReminderFormData) => {
    onSave({
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      scheduled_at: new Date(data.scheduled_at).toISOString(),
    });

    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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
                {...register("title")}
                className='w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500'
                placeholder='Enter reminder title'
              />
              {errors.title && (
                <p className='text-red-400 text-sm mt-1'>
                  {errors.title.message}
                </p>
              )}
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
                {...register("description")}
                rows={3}
                className='w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500'
                placeholder='Add more details (optional)'
              />
              {errors.description && (
                <p className='text-red-400 text-sm mt-1'>
                  {errors.description.message}
                </p>
              )}
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
                {...register("scheduled_at")}
                className='w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent scheme-dark'
              />
              {errors.scheduled_at && (
                <p className='text-red-400 text-sm mt-1'>
                  {errors.scheduled_at.message}
                </p>
              )}
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
                disabled={isSubmitting}
                className='flex-1 px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSubmitting ? "Saving..." : reminder ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
