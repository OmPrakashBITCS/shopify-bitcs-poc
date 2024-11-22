import type { LoaderFunction } from '@remix-run/node';
import { fetchProductByID } from 'app/_services/fetch-auctions';
import { cors } from 'remix-utils/cors';


export const loader: LoaderFunction = async ({ request, params }) => {
  const { auctionId } = params;
   const responseData = await fetchProductByID(auctionId);
   return cors(request, responseData)
};
