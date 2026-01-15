import { useState, useMemo } from "react";

interface Reminder {
  id: number;
  title: string;
  description?: string;
  reminder_time: string;
  is_completed: boolean;
}

interface UseRemindersProps {
  initialReminders: Reminder[];
}

export function useReminders({ initialReminders }: UseRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort reminders
  const sortedReminders = useMemo(() => {
    return reminders
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
  }, [reminders, filter, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: reminders.length,
      active: reminders.filter((r) => !r.is_completed).length,
      completed: reminders.filter((r) => r.is_completed).length,
      overdue: reminders.filter(
        (r) => !r.is_completed && new Date(r.reminder_time) < new Date()
      ).length,
    };
  }, [reminders]);

  // Handlers
  const createReminder = (
    reminderData: Omit<Reminder, "id" | "is_completed">
  ) => {
    const newReminder: Reminder = {
      id: Math.max(...reminders.map((r) => r.id), 0) + 1,
      ...reminderData,
      is_completed: false,
    };
    setReminders([...reminders, newReminder]);
  };

  const updateReminder = (
    id: number,
    reminderData: Omit<Reminder, "id" | "is_completed">
  ) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, ...reminderData } : r))
    );
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const toggleComplete = (id: number, isCompleted: boolean) => {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, is_completed: isCompleted } : r
      )
    );
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
  };
}
