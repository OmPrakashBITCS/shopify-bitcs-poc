import type { LoaderFunction } from "@remix-run/node";
import { fetchAllProducts } from "app/_services/fetch-auctions";
import { cors } from "remix-utils/cors";


export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const filterParams = url.searchParams.get("filter");
  const responseData = await fetchAllProducts(filterParams);
  return cors(request, responseData);
};
