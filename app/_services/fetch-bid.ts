import { json } from "@remix-run/node";
import prisma from '../db.server'

export const fetchBidByVariant = async (data: any) => {
  try {
    const { auctionId, productId, variantId, customerId } = data;

    const bid = await prisma.userBid.findFirst({
      where: {
        auctionId,
        productId,
        variantId,
        customerId,
      },
    });
    return json({ bid }, { status: 200 });
  } catch (error) {
    return json({ error: "failed to fetch bid" }, { status: 400 });
  }
};

export const fetchAllBidByVariant = async (data: any) => {
    try {
      const { auctionId, productId, variantId } = data;
  
      const bids = await prisma.userBid.findMany({
        where: {
          auctionId,
          productId,
          variantId,
        },
      });
      return json({ bids }, { status: 200 });
    } catch (error) {
      return json({ error: "failed to fetch bid" }, { status: 400 });
    }
  };