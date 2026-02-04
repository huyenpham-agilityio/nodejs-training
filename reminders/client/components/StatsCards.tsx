"use client";

interface StatsCardsProps {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

export default function StatsCards({
  total,
  active,
  completed,
  cancelled,
}: StatsCardsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
      {/* Total Card */}
      <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 hover:border-indigo-500/50 transition-colors'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-400'>Total</p>
            <p className='text-3xl font-bold text-white'>{total}</p>
          </div>
          <div className='text-4xl bg-indigo-500/10 p-3 rounded-xl'>
            <svg
              className='w-8 h-8 text-indigo-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Active Card */}
      <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 hover:border-blue-500/50 transition-colors'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-400'>Active</p>
            <p className='text-3xl font-bold text-blue-400'>{active}</p>
          </div>
          <div className='text-4xl bg-blue-500/10 p-3 rounded-xl'>
            <svg
              className='w-8 h-8 text-blue-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Completed Card */}
      <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 hover:border-green-500/50 transition-colors'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-400'>Completed</p>
            <p className='text-3xl font-bold text-green-400'>{completed}</p>
          </div>
          <div className='text-4xl bg-green-500/10 p-3 rounded-xl'>
            <svg
              className='w-8 h-8 text-green-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
        </div>
      </div>

      {/* cancelled Card */}
      <div className='bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 hover:border-red-500/50 transition-colors'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-400'>cancelled</p>
            <p className='text-3xl font-bold text-red-400'>{cancelled}</p>
          </div>
          <div className='text-4xl bg-red-500/10 p-3 rounded-xl'>
            <svg
              className='w-8 h-8 text-red-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
