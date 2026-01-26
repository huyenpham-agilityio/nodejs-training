import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { reminderApi, CreateReminderData, PaginationMetadata } from "@/lib/api";
import dayjs from "dayjs";

interface Reminder {
  id: number;
  title: string;
  description?: string;
  scheduled_at: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseRemindersProps {
  initialReminders?: Reminder[];
  enablePagination?: boolean;
  initialPage?: number;
  initialLimit?: number;
}

export function useReminders({
  initialReminders = [],
  enablePagination = false,
  initialPage = 1,
  initialLimit = 10,
}: UseRemindersProps = {}) {
  const { getToken } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);

  // Fetch reminders from API with filters
  const fetchReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) return;

      // Pass filter and search to API for server-side filtering
      const statusParam = filter === "all" ? undefined : filter;
      const searchParam = searchQuery.trim() || undefined;

      if (enablePagination) {
        const result = await reminderApi.getAllPaginated(
          token,
          page,
          limit,
          searchParam,
          statusParam,
        );
        setReminders(result.reminders);
        setPagination(result.pagination);
      } else {
        const data = await reminderApi.getAll(token, searchParam, statusParam);
        setReminders(data);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch reminders",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken, filter, searchQuery, enablePagination, page, limit]);

  // Reset to page 1 when filters or search changes (only in pagination mode)
  useEffect(() => {
    if (enablePagination && page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, searchQuery, enablePagination]);

  // Fetch reminders on mount and when filters change
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Reminders are already filtered by the server, just sort them
  const sortedReminders = useMemo(() => {
    return reminders.sort((a, b) => {
      // Move completed reminders to bottom
      if ((a.status === "notified") !== (b.status === "notified")) {
        return a.status === "notified" ? 1 : -1;
      }
      // Sort by date (earliest first)
      return dayjs(a.scheduled_at).valueOf() - dayjs(b.scheduled_at).valueOf();
    });
  }, [reminders]);

  // Handlers
  const createReminder = async (
    reminderData: Omit<
      Reminder,
      "id" | "status" | "status" | "created_at" | "updated_at"
    >,
  ) => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const newReminder = await reminderApi.create(
        token,
        reminderData as CreateReminderData,
      );
      setReminders([...reminders, newReminder]);
      return newReminder;
    } catch (err) {
      console.error("Error creating reminder:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create reminder",
      );
      throw err;
    }
  };

  const updateReminder = async (
    id: number,
    reminderData: Omit<
      Reminder,
      "id" | "status" | "status" | "created_at" | "updated_at"
    >,
  ) => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const updated = await reminderApi.update(token, id, reminderData);
      setReminders(reminders.map((r) => (r.id === id ? updated : r)));
      return updated;
    } catch (err) {
      console.error("Error updating reminder:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update reminder",
      );
      throw err;
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await reminderApi.delete(token, id);
      setReminders(reminders.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete reminder",
      );
      throw err;
    }
  };

  return {
    reminders,
    sortedReminders,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    createReminder,
    updateReminder,
    deleteReminder,
    isLoading,
    error,
    refetch: fetchReminders,
    // Pagination
    pagination,
    page,
    setPage,
    limit,
    setLimit,
    goToPage: (newPage: number) => {
      if (enablePagination && pagination) {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
          setPage(newPage);
        }
      }
    },
    nextPage: () => {
      if (enablePagination && pagination?.hasNextPage) {
        setPage((prev) => prev + 1);
      }
    },
    previousPage: () => {
      if (enablePagination && pagination?.hasPreviousPage) {
        setPage((prev) => Math.max(1, prev - 1));
      }
    },
  };
}
