"use client";

import { memo } from "react";

interface ErrorMessageProps {
  message: string | null;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className='mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg'>
      <p className='text-red-400 text-sm'>{message}</p>
    </div>
  );
}

export default memo(ErrorMessage);
