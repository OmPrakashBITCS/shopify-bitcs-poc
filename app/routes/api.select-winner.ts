// for each variant in auction we will select the winner 

import type { ActionFunction } from "@remix-run/node";
import { selectWinner } from "app/_services/select-winner";
import logger from "app/_utils/logger";
import { cors } from "remix-utils/cors";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json();
  const responseData = await selectWinner(data, request);
  logger.info(`Winner selected [API_SelectWinner] :: ${JSON.stringify(responseData)}`);
  return cors(request, responseData);
};
