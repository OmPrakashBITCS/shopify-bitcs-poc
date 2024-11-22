import { json } from "@remix-run/node";
import { createDraftOrder } from "./create-draft";
import prisma from '../db.server'
import logger from "app/_utils/logger";

export async function selectWinner(data: any, request: Request) {
  try {
    const { auctionId } = data;

    const existingWinners = await prisma.winner.findMany({
      where: { auctionId },
      select: { variantId: true },
    });

    const existingWinnerVariantIds = new Set(
      existingWinners.map((w) => w.variantId),
    );

    const auctionVariants = await prisma.variant.findMany({
      where: {
        product: { auctionId },
        id: { notIn: Array.from(existingWinnerVariantIds) },
      },
      include: {
        userBids: {
          orderBy: { bidAmount: "desc" },
          take: 1,
        },
        product: true,
      },
    });

    if (auctionVariants.length === 0) {
      return json(
        { message: "All variants already have winners or no variants found" },
        { status: 200 },
      );
    }
    const winners = [];

    for (const variant of auctionVariants) {
      if (variant.userBids.length === 0) {
        logger.info(`No bids for variant ${variant.id}`);
        continue;
      }

      const highestBid = variant.userBids[0];
      const { customerId, bidAmount } = highestBid;

      const savedOrder = await createDraftOrder({
        productId: variant.productId,
        productName: variant.title,
        price: bidAmount,
        customerId: customerId,
        request,
      });
      const draftOrder = await savedOrder.json();

      const winner = await prisma.winner.create({
        data: {
          auctionId,
          productId: variant.productId,
          variantId: variant.id,
          customerId: customerId,
          customerName: highestBid.customerName,
          bidAmount: bidAmount,
          invoiceId: String(draftOrder.id),
          invoiceUrl: draftOrder.invoiceUrl,
        },
      });
      winners.push(winner);
    }
    logger.info(`Winners List :: ${JSON.stringify(winners)}`)
    if (winners.length > 0) {
       await prisma.auction.update({
        where: { id: auctionId },
        data: {
          status: "Inactive",
          isActive: false,
        },
      });
      return json({ winners }, { status: 200 });
    } else {
      return json({ message: "No new winners selected" }, { status: 200 });
    }
  } catch (error) {
    logger.error(`Error selecting winners :: ${error}`);
    return json({ error: "Error selecting winners" }, { status: 500 });
  }
}
