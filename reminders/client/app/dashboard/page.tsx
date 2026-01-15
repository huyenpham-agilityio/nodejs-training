"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import ReminderCard from "@/components/ReminderCard";
import ReminderModal from "@/components/ReminderModal";

interface Reminder {
  id: number;
  title: string;
  description?: string;
  reminder_time: string;
  is_completed: boolean;
}

// Mock data for UI demonstration
const initialReminders: Reminder[] = [
  {
    id: 1,
    title: "Team Meeting",
    description: "Weekly sync with the development team",
    reminder_time: "2026-01-16T10:00:00Z",
    is_completed: false,
  },
  {
    id: 2,
    title: "Finish Project Proposal",
    description: "Complete and submit the Q1 project proposal",
    reminder_time: "2026-01-15T15:00:00Z",
    is_completed: false,
  },
  {
    id: 3,
    title: "Doctor Appointment",
    reminder_time: "2026-01-20T09:30:00Z",
    is_completed: false,
  },
  {
    id: 4,
    title: "Buy Groceries",
    description: "Milk, eggs, bread, and vegetables",
    reminder_time: "2026-01-14T18:00:00Z",
    is_completed: true,
  },
];

export default function DashboardPage() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort reminders
  const sortedReminders = reminders
    .filter((reminder) => {
      // Filter by status
      if (filter === "active" && reminder.is_completed) return false;
      if (filter === "completed" && !reminder.is_completed) return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          reminder.title.toLowerCase().includes(query) ||
          reminder.description?.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Move completed reminders to bottom
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      // Sort by date (earliest first)
      return (
        new Date(a.reminder_time).getTime() -
        new Date(b.reminder_time).getTime()
      );
    });

  // Handlers
  const handleCreate = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  const handleSave = (reminderData: Omit<Reminder, "id" | "is_completed">) => {
    if (editingReminder) {
      // Update existing
      setReminders(
        reminders.map((r) =>
          r.id === editingReminder.id ? { ...r, ...reminderData } : r
        )
      );
    } else {
      // Create new
      const newReminder: Reminder = {
        id: Math.max(...reminders.map((r) => r.id), 0) + 1,
        ...reminderData,
        is_completed: false,
      };
      setReminders([...reminders, newReminder]);
    }
    setIsModalOpen(false);
    setEditingReminder(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      setReminders(reminders.filter((r) => r.id !== id));
    }
  };

  const handleToggleComplete = (id: number, isCompleted: boolean) => {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, is_completed: isCompleted } : r
      )
    );
  };

  // Stats
  const stats = {
    total: reminders.length,
    active: reminders.filter((r) => !r.is_completed).length,
    completed: reminders.filter((r) => r.is_completed).length,
    overdue: reminders.filter(
      (r) => !r.is_completed && new Date(r.reminder_time) < new Date()
    ).length,
  };

  return (
    <div className='min-h-screen bg-gray-950 pt-20'>
      {/* Header */}
      <header className='fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <span className='text-3xl'>📝</span>
              <h1 className='text-2xl font-bold text-white'>My Reminders</h1>
            </div>
            <UserButton afterSignOutUrl='/' />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 hover:border-indigo-500/50 transition-colors'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-400'>Total</p>
                <p className='text-3xl font-bold text-white'>{stats.total}</p>
              </div>
              <div className='text-4xl bg-indigo-500/10 p-3 rounded-xl'>
                <svg
                  className='w-8 h-8 text-indigo-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 hover:border-blue-500/50 transition-colors'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-400'>Active</p>
                <p className='text-3xl font-bold text-blue-400'>
                  {stats.active}
                </p>
              </div>
              <div className='text-4xl bg-blue-500/10 p-3 rounded-xl'>
                <svg
                  className='w-8 h-8 text-blue-400'
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
              </div>
            </div>
          </div>
          <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 hover:border-green-500/50 transition-colors'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-400'>Completed</p>
                <p className='text-3xl font-bold text-green-400'>
                  {stats.completed}
                </p>
              </div>
              <div className='text-4xl bg-green-500/10 p-3 rounded-xl'>
                <svg
                  className='w-8 h-8 text-green-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 hover:border-red-500/50 transition-colors'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-400'>Overdue</p>
                <p className='text-3xl font-bold text-red-400'>
                  {stats.overdue}
                </p>
              </div>
              <div className='text-4xl bg-red-500/10 p-3 rounded-xl'>
                <svg
                  className='w-8 h-8 text-red-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 mb-6'>
          <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
            {/* Search */}
            <div className='w-full md:w-96'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search reminders...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
                <svg
                  className='absolute left-3 top-2.5 w-5 h-5 text-gray-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
            </div>

            {/* Filter & Create */}
            <div className='flex gap-3 w-full md:w-auto'>
              {/* Filter Tabs */}
              <div className='flex bg-gray-800 rounded-lg p-1 border border-gray-700'>
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("active")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === "active"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === "completed"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                className='px-6 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/50 flex items-center gap-2 whitespace-nowrap'
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
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                New Reminder
              </button>
            </div>
          </div>
        </div>

        {/* Reminders List */}
        <div className='space-y-4'>
          {sortedReminders.length === 0 ? (
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
                  onClick={handleCreate}
                  className='px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/50'
                >
                  Create Reminder
                </button>
              )}
            </div>
          ) : (
            sortedReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReminder(null);
        }}
        onSave={handleSave}
        reminder={editingReminder}
      />
    </div>
  );
}
