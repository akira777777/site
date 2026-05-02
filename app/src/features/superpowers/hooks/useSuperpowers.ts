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
  });
};
