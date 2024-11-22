import { json } from "@remix-run/node";
import prisma from '../db.server'

type BidData = {
  productId: string;
  customerId: string;
  variantId: string;
  auctionId: string;
  customerName: string;
  bidAmount: number;
};

export const createBid = async (data: BidData) => {
  try {
    const {
      productId,
      customerId,
      variantId,
      auctionId,
      customerName,
      bidAmount,
    } = data;
    
    const [userBid] = await Promise.all([
      prisma.userBid.create({
        data: {
          customerId,
          customerName,
          bidAmount,
          auction: {
            connect: { id: auctionId },
          },
          product: {
            connect: { productId: productId },
          },
          variant: {
            connect: { variantId: variantId },
          },
        },
      }),
      prisma.variant.update({
        where: { variantId: variantId },
        data: { price: bidAmount },
      })
    ]);
    return json({ userBid }, { status: 201 });
  } catch (error) {
    return json({ error: "Failed to create the bid" }, { status: 400 });
  }
};
