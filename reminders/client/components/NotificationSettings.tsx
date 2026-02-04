"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  userApi,
  type NotificationSettings,
  type UpdateNotificationSettings,
} from "@/lib/api";
import NotificationToggle from "./NotificationToggle";

export default function NotificationSettings() {
  const { getToken } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch notification settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const data = await userApi.getNotificationSettings(token);
        setSettings(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load settings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [getToken]);

  // Handle toggle change
  const handleToggle = async (
    field: keyof UpdateNotificationSettings,
    value: boolean,
  ) => {
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      // Update on server
      await userApi.updateNotificationSettings(token, { [field]: value });

      // Update local state
      setSettings({
        ...settings,
        [field]: value,
      });

      setSuccessMessage("Settings updated successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-2xl font-bold mb-6'>Notification Settings</h2>
        <div className='animate-pulse space-y-4'>
          <div className='h-12 bg-gray-200 rounded'></div>
          <div className='h-12 bg-gray-200 rounded'></div>
          <div className='h-12 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-2xl font-bold mb-6'>Notification Settings</h2>
        <p className='text-red-500'>Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-2xl font-bold mb-6 text-blue-600'>
        Notification Settings
      </h2>

      <p className='text-sm text-gray-600 mb-6'>
        Choose how you want to receive reminder notifications.
      </p>

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg'>
          {error}
        </div>
      )}

      <div className='space-y-4'>
        {/* Email Notifications */}
        <NotificationToggle
          id='email-notifications'
          title='Email Notifications'
          description='Receive reminder notifications via email'
          checked={settings.email_notifications_enabled}
          disabled={saving}
          onChange={(checked) =>
            handleToggle("email_notifications_enabled", checked)
          }
        />

        {/* Slack Notifications */}
        <NotificationToggle
          id='slack-notifications'
          title='Slack Notifications'
          description='Receive reminder notifications via Slack'
          checked={settings.slack_notifications_enabled}
          disabled={saving}
          onChange={(checked) =>
            handleToggle("slack_notifications_enabled", checked)
          }
        />
      </div>

      {successMessage && (
        <div className='my-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg'>
          {successMessage}
        </div>
      )}
    </div>
  );
}
