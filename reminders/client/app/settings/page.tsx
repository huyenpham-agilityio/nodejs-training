"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import NotificationSettings from "@/components/NotificationSettings";

export default function SettingsPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4'>
              <Link
                href='/dashboard'
                className='text-blue-600 hover:text-blue-700 font-medium'
              >
                ← Dashboard
              </Link>
              {/* <h1 className='text-2xl font-bold text-gray-900'>Settings</h1> */}
            </div>
            <UserButton afterSignOutUrl='/sign-in' />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='space-y-6'>
          {/* Notification Settings Section */}
          <NotificationSettings />

          {/* You can add more settings sections here */}
        </div>
      </main>
    </div>
  );
}
