"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import ReminderModal from "@/components/ReminderModal";
import StatsCards from "@/components/StatsCards";
import ReminderFilters from "@/components/ReminderFilters";
import ReminderList from "@/components/ReminderList";
import DashboardHeader from "@/components/DashboardHeader";
import ErrorMessage from "@/components/ErrorMessage";
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
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    createReminder,
    updateReminder,
    deleteReminder,
    error,
  } = useReminders();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // Sync user on mount
  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !isSignedIn) return;
      
      try {
        const token = await getToken();
        if (!token) {
          console.error('No token available');
          return;
        }

        console.log('Syncing user with backend...');
        const userData = await userApi.getMe(token);
        console.log("User synced successfully:", userData);
      } catch (error) {
        console.error("Error syncing user:", error);
        
        // Log more details
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      }
    };

    syncUser();
  }, [getToken, isLoaded, isSignedIn]);

  // Memoized handlers to prevent re-renders
  const handleCreate = useCallback(() => {
    setEditingReminder(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(async (reminderData: Omit<Reminder, "id" | "status">) => {
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
    }
  }, [editingReminder, updateReminder, createReminder]);

  const handleDelete = useCallback(async (id: number) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      try {
        await deleteReminder(id);
      } catch (error) {
        console.error("Error deleting reminder:", error);
      }
    }
  }, [deleteReminder]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingReminder(null);
  }, []);

  return (
    <div className='min-h-screen bg-gray-950 pt-20'>
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Error Message */}
        <ErrorMessage message={error} />

        {/* Stats Cards */}
        <StatsCards />

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
        onClose={handleCloseModal}
        onSave={handleSave}
        reminder={editingReminder}
      />
    </div>
  );
}
