import type { ActionFunction } from "@remix-run/node";
import { createBid } from "app/_services/create-bid";
import logger from "app/_utils/logger";
import { cors } from "remix-utils/cors";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json();
  const responseData = await createBid(data);
  logger.info(`Bid created [API_CreateBid] :: ${JSON.stringify(responseData)}`);
  return cors(request, responseData);
};
