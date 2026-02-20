/**
 * useApiCall Hook
 * Handles API calls with automatic error notifications and loading states
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useApiCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      apiFunction: () => Promise<any>,
      options?: ApiCallOptions
    ) => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFunction();
        
        if (options?.showSuccessToast) {
          toast.success(options.successMessage || 'Success!', {
            description: 'Operation completed successfully',
          });
        }

        options?.onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        toast.error(options?.errorMessage || 'An error occurred', {
          description: error.message || 'Please try again later',
        });

        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    execute,
    reset: () => {
      setError(null);
      setLoading(false);
    },
  };
}

/**
 * useFetch Hook
 * Simpler hook for basic GET requests
 */
export function useFetch<T = any>(
  url: string | null,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    dependencies?: any[];
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const response = await window.fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return {
    data,
    loading,
    error,
    refetch: fetch,
  };
}
