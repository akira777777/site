import type { Superpower } from '../types';
import { SUPERPOWERS } from '../data/superpowers';

/**
 * Superpowers API
 * 
 * Centralized API layer for superpower-related data.
 */
export const superpowersApi = {
  /**
   * Fetches all available superpowers.
   * Mocked for demonstration.
   */
  getSuperpowers: async (): Promise<Superpower[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate 5% error rate for testing error boundaries
    if (Math.random() < 0.05) {
      throw new Error('Failed to fetch superpowers: Network error');
    }

    return SUPERPOWERS;
  },
};
