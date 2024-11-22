import { z } from 'zod';

export const BidSchema = z.object({
  id: z.string().optional(),
  bidder: z.string(),
  amount: z.string().transform((val) => parseFloat(val)),
  time: z.string().transform((val) => new Date(val)),
  variantId: z.string(),
});

export const VariantSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  price: z.string().transform((val) => parseFloat(val)),
  bids: z.array(BidSchema).optional(),
  incrementPrice: z.string().transform((val) => parseFloat(val)),
  reservedPrice: z.string().transform((val) => parseFloat(val)),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  price: z.string().transform((val) => parseFloat(val)),
  imageUrl: z.string().url(),
  variants: z.array(VariantSchema).optional(),
});

export const AuctionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  productId: z.string(),
  product: ProductSchema,
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
  platform: z.string(),
});
