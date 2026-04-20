'use client';

import { cn } from '@workspace/ui/lib/utils';

interface StatusBadgeProps {
  status: 'connected' | 'disconnected' | 'loading' | 'error';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    connected: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
      dot: 'bg-green-500',
      defaultLabel: 'Connected',
    },
    disconnected: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-200',
      dot: 'bg-gray-500',
      defaultLabel: 'Disconnected',
    },
    loading: {
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      text: 'text-yellow-800 dark:text-yellow-200',
      dot: 'bg-yellow-500 animate-pulse',
      defaultLabel: 'Testing...',
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
      dot: 'bg-red-500',
      defaultLabel: 'Error',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {label ?? config.defaultLabel}
    </span>
  );
}
