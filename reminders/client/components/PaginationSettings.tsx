"use client";

import { memo } from "react";

interface PaginationSettingsProps {
  currentLimit: number;
  onLimitChange: (limit: number) => void;
}

const limitOptions = [5, 10, 20, 50, 100];

function PaginationSettings({
  currentLimit,
  onLimitChange,
}: PaginationSettingsProps) {
  return (
    <div className='flex items-center gap-2 text-sm'>
      <label htmlFor='page-limit' className='text-gray-400'>
        Show:
      </label>
      <select
        id='page-limit'
        value={currentLimit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className='px-3 py-1.5 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all'
      >
        {limitOptions.map((limit) => (
          <option key={limit} value={limit}>
            {limit} per page
          </option>
        ))}
      </select>
    </div>
  );
}

export default memo(PaginationSettings);
