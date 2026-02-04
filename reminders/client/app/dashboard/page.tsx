"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import ReminderModal from "@/components/ReminderModal";
import StatsCards from "@/components/StatsCards";
import ReminderFilters from "@/components/ReminderFilters";
import ReminderList from "@/components/ReminderList";
import { useReminders } from "@/hooks/useReminders";

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
  const {
    sortedReminders,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
  } = useReminders({ initialReminders });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

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
      updateReminder(editingReminder.id, reminderData);
    } else {
      createReminder(reminderData);
    }
    setIsModalOpen(false);
    setEditingReminder(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      deleteReminder(id);
    }
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
        <StatsCards {...stats} />

        {/* Filters */}
        <ReminderFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
          onCreateClick={handleCreate}
        />

        {/* Reminders List */}
        <ReminderList
          reminders={sortedReminders}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={toggleComplete}
          onCreateClick={handleCreate}
        />
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
