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
    await new Promise((resolve) => setTimeout(resolve, 300));

    return SUPERPOWERS;
  },
};
