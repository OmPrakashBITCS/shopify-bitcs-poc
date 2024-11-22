import { json } from "@remix-run/node";
import { FilterSchema } from "app/schema/filters.schema";
import prisma from '../db.server'
// const API_URL = "https://mutual-splendid-quagga.ngrok-free.app";

export const fetchAllProducts = async (filterParams?: any) => {
  let filter = {};
  if (filterParams) {
    try {
      const parsedFilter = FilterSchema.parse(JSON.parse(filterParams));
      if (parsedFilter.isActive !== undefined) {
        const now = new Date();
        filter = parsedFilter.isActive
          ? { startTime: { lte: now }, endTime: { gte: now } }
          : { OR: [{ endTime: { lt: now } }, { startTime: { gt: now } }] };
      }
    } catch (error) {
      return json({ error: "Invalid filter format" }, { status: 400 });
    }
  }

  try {
    const auctions = await prisma.auction.findMany({
      where: filter,
      include: {
        product: {
          include: {
            variants: {
              include: {
                userBids: true,
              },
            },
          },
        },
      },
    });
    const updatedAuctions = await Promise.all(
      auctions?.map(async (auction) => {
        const now = new Date();
        if (auction.status !== "Inactive") {
          let status = "Upcoming";
          let isActive = true;

          if (auction.startTime <= now && auction.endTime >= now) {
            status = "Active";
          } else if (auction.endTime < now) {
            status = "Inactive";
            isActive = false;
            //   await fetch(`${API_URL}/api/select-winner`, {
            //   method: "POST",
            //   body: JSON.stringify({
            //     auctionId: auction.id,
            //   }),
            // });
          }
          await prisma.auction.update({
            where: { id: auction.id },
            data: { status, isActive },
          });

          return {
            ...auction,
            status,
            isActive,
          };
        } else {
          return {
            ...auction,
          };
        }
      }),
    );

    return json({ auctions: updatedAuctions }, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to fetch auctions" }, { status: 500 });
  }
};

export const fetchProductByID = async (auctionId: any) => {
  if (!auctionId) {
    return json({ error: "Auction ID is required" }, { status: 400 });
  }

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        product: {
          include: {
            variants: {
              include: {
                userBids: true,
                Winner: true,
              },
            },
          },
        },
      },
    });

    if (!auction) {
      return json({ error: "Auction not found" }, { status: 404 });
    }
    let updatedAuction = { ...auction };
    if (auction.status !== "Inactive") {
      let status = "Upcoming";
      let isActive = true;
      const now = new Date();

      if (auction.startTime <= now && auction.endTime >= now) {
        status = "Active";
      } else if (auction.endTime < now) {
        status = "Inactive";
        isActive = false;
        // await fetch(`${API_URL}/api/select-winner`, {
        //   method: "POST",
        //   body: JSON.stringify({
        //     auctionId: auction.id,
        //   }),
        // });
      }
      await prisma.auction.update({
        where: { id: auction.id },
        data: { status, isActive },
      });

      updatedAuction = {
        ...auction,
        status,
        isActive,
      };
    }

    return json({ auction: updatedAuction }, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to fetch auction" }, { status: 500 });
  }
};
