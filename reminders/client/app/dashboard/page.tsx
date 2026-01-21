"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import ReminderModal from "@/components/ReminderModal";
import StatsCards from "@/components/StatsCards";
import ReminderFilters from "@/components/ReminderFilters";
import ReminderList from "@/components/ReminderList";
import { useReminders } from "@/hooks/useReminders";
import { userApi } from "@/lib/api";

interface Reminder {
  id: number;
  title: string;
  description?: string;
  scheduled_at: string;
  status?: string;
}

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
    isLoading,
    error,
  } = useReminders();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const fetchExternalData = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    try {
      // This will create the user in the database if they don't exist
      const userData = await userApi.getMe(token);
      console.log("User synced:", userData);
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Sync user first to ensure they exist in the database
      fetchExternalData();
    }
  }, [fetchExternalData, isLoaded, isSignedIn]);

  const handleCreate = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  const handleSave = async (reminderData: Omit<Reminder, "id" | "status">) => {
    try {
      if (editingReminder) {
        await updateReminder(editingReminder.id, reminderData);
      } else {
        await createReminder(reminderData);
      }
      setIsModalOpen(false);
      setEditingReminder(null);
    } catch (error) {
      console.error("Error saving reminder:", error);
      // Error is already handled in the hook, but you could show a toast here
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      try {
        await deleteReminder(id);
      } catch (error) {
        console.error("Error deleting reminder:", error);
        // Error is already handled in the hook
      }
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
        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500'></div>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && <StatsCards {...stats} />}

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
