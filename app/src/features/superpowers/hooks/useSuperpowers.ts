import { useSuspenseQuery } from '@tanstack/react-query';
import { superpowersApi } from '../api/superpowersApi';
import type { Superpower } from '../types';

/**
 * useSuperpowers
 * 
 * Custom hook to fetch superpowers using Suspense-first TanStack Query.
 */
export const useSuperpowers = () => {
  return useSuspenseQuery<Superpower[]>({
    queryKey: ['superpowers'],
    queryFn: superpowersApi.getSuperpowers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};
