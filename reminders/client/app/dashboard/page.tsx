"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import ReminderModal from "@/components/ReminderModal";
import StatsCards, { StatsCardsRef } from "@/components/StatsCards";
import ReminderFilters from "@/components/ReminderFilters";
import ReminderList from "@/components/ReminderList";
import DashboardHeader from "@/components/DashboardHeader";
import ErrorMessage from "@/components/ErrorMessage";
import Pagination from "@/components/Pagination";
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
  const statsRef = useRef<StatsCardsRef>(null);

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
    isLoading,
    pagination,
    page,
    limit,
    setLimit,
    goToPage,
    nextPage,
    previousPage,
  } = useReminders({
    enablePagination: true,
    initialPage: 1,
    initialLimit: 10,
    onRemindersChange: async () => {
      // Refetch stats whenever reminders change
      await statsRef.current?.refetchStats();
    },
  });
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
          console.error("No token available");
          return;
        }

        console.log("Syncing user with backend...");
        const userData = await userApi.getUserProfile(token);
        console.log("User synced successfully:", userData);
      } catch (error) {
        console.error("Error syncing user:", error);

        // Log more details
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
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

  const handleSave = useCallback(
    async (reminderData: Omit<Reminder, "id" | "status">) => {
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
    },
    [editingReminder, updateReminder, createReminder],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (confirm("Are you sure you want to delete this reminder?")) {
        try {
          await deleteReminder(id);
        } catch (error) {
          console.error("Error deleting reminder:", error);
        }
      }
    },
    [deleteReminder],
  );

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
        <StatsCards ref={statsRef} />

        {/* Filters */}
        <ReminderFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
          onCreateClick={handleCreate}
          showPaginationSettings={true}
          pageLimit={limit}
          onPageLimitChange={(newLimit) => {
            setLimit(newLimit);
            goToPage(1); // Reset to first page when changing limit
          }}
        />

        {/* Reminders List */}
        <ReminderList
          reminders={sortedReminders}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateClick={handleCreate}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
          />
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className='flex justify-center items-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
          </div>
        )}
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
