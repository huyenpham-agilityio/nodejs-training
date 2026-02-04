"use client";

interface ReminderFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: "all" | "active" | "completed";
  onFilterChange: (filter: "all" | "active" | "completed") => void;
  onCreateClick: () => void;
}

export default function ReminderFilters({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onCreateClick,
}: ReminderFiltersProps) {
  return (
    <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 mb-6'>
      <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
        {/* Search */}
        <div className='w-full md:w-96'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search reminders...'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            />
            <svg
              className='absolute left-3 top-2.5 w-5 h-5 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
        </div>

        {/* Filter & Create */}
        <div className='flex gap-3 w-full md:w-auto'>
          {/* Filter Tabs */}
          <div className='flex bg-gray-800 rounded-lg p-1 border border-gray-700'>
            <button
              onClick={() => onFilterChange("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange("active")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "active"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => onFilterChange("completed")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "completed"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={onCreateClick}
            className='px-6 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/50 flex items-center gap-2 whitespace-nowrap'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
            New Reminder
          </button>
        </div>
      </div>
    </div>
  );
}
