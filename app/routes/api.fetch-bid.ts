import type { LoaderFunction } from "@remix-run/node";
import { fetchBidByVariant } from "app/_services/fetch-bid";
import { cors } from "remix-utils/cors";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  const customerId = url.searchParams.get("customerId");
  const variantId = url.searchParams.get("variantId");
  const auctionId = url.searchParams.get("auctionId");

  const responseData = await fetchBidByVariant({
    productId,
    customerId,
    variantId,
    auctionId,
  });
  return cors(request, responseData);
};
