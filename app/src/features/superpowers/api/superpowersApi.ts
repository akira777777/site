import type { Superpower } from '../types';
import { SUPERPOWERS } from '../data/superpowers';
import { z } from 'zod';

const superpowerSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  icon: z.string(),
  color: z.string(),
});

const superpowersResponseSchema = z.object({
  data: z.array(superpowerSchema),
});

const apiBaseUrl = import.meta.env.VITE_API_URL ?? '';

/**
 * Superpowers API
 * 
 * Centralized API layer for superpower-related data.
 */
export const superpowersApi = {
  /**
   * Fetches all available superpowers.
   */
  getSuperpowers: async (): Promise<Superpower[]> => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/superpowers`);

      if (!response.ok) {
        throw new Error('Failed to fetch superpowers');
      }

      const payload: unknown = await response.json();

      return superpowersResponseSchema.parse(payload).data;
    } catch {
      return SUPERPOWERS;
    }
  },
};
