import type { ActionFunction } from "@remix-run/node";
import { createAuction } from "app/_services/create-auction";
import logger from "app/_utils/logger";
import { cors } from "remix-utils/cors";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json();
  const responseData = await createAuction(data);
  logger.info(`Auction created [API_CreateAuction] :: ${JSON.stringify(responseData)}`);
  return cors(request, responseData);
};
