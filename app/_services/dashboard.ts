import { json } from "@remix-run/node";
import prisma from '../db.server'

export const dashboardData = async () => {
  try {
    const auctions = await prisma.auction.findMany({
      include: {
        product: {
          include: {
            variants: true,
            UserBid: {
              orderBy: {
                bidTime: "desc",
              },
              take: 5,
            },
            Winner: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
      take: 5
    });

    const stats = await prisma.$transaction([
      prisma.auction.count(),
      prisma.userBid.count(),
      prisma.winner.count(),
      prisma.product.count(),
    ]);

    return json({
      auctions,
      stats: {
        totalAuctions: stats[0],
        totalBids: stats[1],
        totalWinners: stats[2],
        totalProducts: stats[3],
      },
    });
  } catch (error) {
    return json(
      { error: "Failed to fetch auctions" },
      { status: 500 },
    );
  }
};
