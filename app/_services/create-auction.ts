import { json } from "@remix-run/node";
import prisma from '../db.server'
import logger from "app/_utils/logger";

export const createAuction = async (data: any) => {
  //   const result = AuctionSchema.safeParse(data);
  //   if (!result.success) {
  //     return json({ error: result.error.flatten() }, { status: 400 });
  //   }

  const { name, product, startTime, endTime, platform, productId } = data;
  logger.info(`Creating auction :: ${JSON.stringify({name, product, startTime, endTime, platform, productId, variant: product.variants})}`)
  let status: string;

  logger.info(`Date Comparison :: ${JSON.stringify({
    first: new Date(startTime).getTime(),
    second: new Date().getTime(),
    third: new Date(startTime).getTime() > new Date().getTime(),
    fourth: new Date(startTime).getTime() <= new Date().getTime()
  })}`)


  
  if (new Date(startTime).getTime() > new Date().getTime()) {
    status = "Upcoming";
  } else if (new Date(startTime).getTime() <= new Date().getTime()) {
    status = "Active";
  } else {
    status = "Inactive";
  }
  logger.info(`Auction Status :: ${status}`)
  try {
    const auction = await prisma.auction.create({
      data: {
        name,
        startTime,
        endTime,
        productId,
        platform,
        status,
        product: {
          create: {
            productId: productId,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            variants: {
              create:
                product.variants?.map((variant: any) => ({
                  title: variant.title,
                  variantId: variant.variantId,
                  price: variant.price,
                  incrementPrice: variant.incrementPrice,
                  userBids: {
                    create:
                      variant.userBids?.map((userBid: any) => ({
                        customerId: userBid.customerId,
                        customerName: userBid.customerName,
                        bidAmount: userBid.bidAmount,
                        bidTime: userBid.bidTime || new Date(),
                      })) || [],
                  },
                })) || [],
            },
          },
        },
      },
    });
    logger.info(`Auction Created [Service_createAuction] :: ${JSON.stringify(auction)}`)
    return json({ auction }, { status: 201 });
  } catch (error) {
    logger.error(`Failed to create auction :: ${error}`)
    return json({ error: "Failed to create auction" }, { status: 500 });
  }
};
