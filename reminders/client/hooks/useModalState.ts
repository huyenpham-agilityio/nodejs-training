"use client";

import { useCallback } from "react";

interface Reminder {
  id: number;
  title: string;
  description?: string;
  scheduled_at: string;
  status?: string;
}

interface UseModalStateReturn {
  isOpen: boolean;
  editingReminder: Reminder | null;
  openCreate: () => void;
  openEdit: (reminder: Reminder) => void;
  close: () => void;
  setEditingReminder: (reminder: Reminder | null) => void;
}

export function useModalState(
  isModalOpen: boolean,
  setIsModalOpen: (open: boolean) => void,
  editingReminder: Reminder | null,
  setEditingReminder: (reminder: Reminder | null) => void
): UseModalStateReturn {
  const openCreate = useCallback(() => {
    setEditingReminder(null);
    setIsModalOpen(true);
  }, [setEditingReminder, setIsModalOpen]);

  const openEdit = useCallback(
    (reminder: Reminder) => {
      setEditingReminder(reminder);
      setIsModalOpen(true);
    },
    [setEditingReminder, setIsModalOpen]
  );

  const close = useCallback(() => {
    setIsModalOpen(false);
    setEditingReminder(null);
  }, [setIsModalOpen, setEditingReminder]);

  return {
    isOpen: isModalOpen,
    editingReminder,
    openCreate,
    openEdit,
    close,
    setEditingReminder,
  };
}
