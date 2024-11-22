import { z } from 'zod';

export const FilterSchema = z.object({
    isActive: z.boolean().optional(),
  });