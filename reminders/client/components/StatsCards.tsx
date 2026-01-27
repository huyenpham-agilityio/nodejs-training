"use client";

import {
  memo,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { reminderApi } from "@/lib/api";

interface Stats {
  total: number;
  active: number;
  completed: number;
}

export interface StatsCardsRef {
  refetchStats: () => Promise<void>;
}

interface StatsCardsProps {
  onStatsChange?: (stats: Stats) => void;
}

function StatsCards(
  { onStatsChange }: StatsCardsProps,
  ref: React.Ref<StatsCardsRef>,
) {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const currentStats = await reminderApi.getStats(token);
      setStats(currentStats);
      onStatsChange?.(currentStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, onStatsChange]);

  // Expose refetchStats to parent component
  useImperativeHandle(
    ref,
    () => ({
      refetchStats: fetchStats,
    }),
    [fetchStats],
  );

  useEffect(() => {
    fetchStats();

    // Refresh stats every 30 seconds
    // const interval = setInterval(fetchStats, 30000);

    // return () => clearInterval(interval);
  }, [fetchStats]);

  // Show loading skeleton or zeros while loading
  const { total, active, completed } = isLoading
    ? { total: 0, active: 0, completed: 0 }
    : stats;
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
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
    </div>
  );
}

export default memo(forwardRef(StatsCards));
