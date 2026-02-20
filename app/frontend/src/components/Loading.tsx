/**
 * Loading Component
 * Reusable loading spinner for API calls and long operations
 */

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  isLoading: boolean;
  children?: React.ReactNode;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function Loading({ 
  isLoading, 
  children, 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false 
}: LoadingProps) {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  if (!isLoading) {
    return null;
  }

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Full screen loading overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className={`${sizeMap[size]} animate-spin mx-auto mb-4 text-white`} />
          <p className="text-white font-medium">{message}</p>
        </div>
      </div>
    );
  }

  // Inline loading indicator
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <Loader2 className={`${sizeMap[size]} animate-spin text-pink-600 dark:text-pink-400`} />
      <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
    </div>
  );
}

/**
 * Skeleton Loading (for data placeholders)
 */
interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = 'h-4 bg-gray-300 dark:bg-gray-700 rounded w-full', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${className} mb-3 last:mb-0 animate-pulse`} />
      ))}
    </>
  );
}
