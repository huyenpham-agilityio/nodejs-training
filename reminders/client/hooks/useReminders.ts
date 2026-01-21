import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { reminderApi, CreateReminderData } from "@/lib/api";

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
}

export function useReminders({
  initialReminders = [],
}: UseRemindersProps = {}) {
  const { getToken } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
  }>({ total: 0 });

  // Fetch reminders from API
  const fetchReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) return;

      const data = await reminderApi.getAll(token);
      setReminders(data);

      const currentStats = await reminderApi.getStats(token);
      setStats(currentStats);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch reminders",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  // Fetch reminders on mount
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Filter and sort reminders
  const sortedReminders = useMemo(() => {
    return reminders
      .filter((reminder) => {
        // Filter by status
        if (filter === "active" && reminder.status === "notified") {
          return false;
        }
        if (filter === "completed" && reminder.status !== "notified") {
          return false;
        }

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
        if ((a.status === "notified") !== (b.status === "notified")) {
          return a.status === "notified" ? 1 : -1;
        }
        // Sort by date (earliest first)
        return (
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime()
        );
      });
  }, [reminders, filter, searchQuery]);

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

  const toggleComplete = async (id: number) => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const updated = await reminderApi.toggleComplete(token, id);
      setReminders(reminders.map((r) => (r.id === id ? updated : r)));
      return updated;
    } catch (err) {
      console.error("Error toggling reminder:", err);
      setError(
        err instanceof Error ? err.message : "Failed to toggle reminder",
      );
      throw err;
    }
  };

  return {
    reminders,
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
    isLoading,
    error,
    refetch: fetchReminders,
  };
}
