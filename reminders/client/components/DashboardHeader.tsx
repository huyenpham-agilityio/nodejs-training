"use client";

import { memo } from "react";
import { UserButton } from "@clerk/nextjs";

interface DashboardHeaderProps {
  className?: string;
}

function DashboardHeader({ className }: DashboardHeaderProps) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800 ${className || ""}`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <span className='text-3xl'>📝</span>
            <h1 className='text-2xl font-bold text-white'>H-Reminders</h1>
          </div>
          <UserButton afterSignOutUrl='/' />
        </div>
      </div>
    </header>
  );
}

export default memo(DashboardHeader);
