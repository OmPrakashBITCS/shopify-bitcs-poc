import { authenticate } from "app/shopify.server";
import { json } from "@remix-run/node";

export async function createDraftOrder({
  productId,
  productName,
  price,
  customerId,
  request,
}: {
  productId: string;
  productName: string;
  price: number;
  customerId: string;
  request: Request;
}) {
  const { admin, session } = await authenticate.admin(request);
  const draft_order = new admin.rest.resources.DraftOrder({ session });
  draft_order.line_items = [
    {
      id: productId,
      title: productName,
      price: price,
      quantity: 1,
    },
  ];
  draft_order.customer = {
    id: customerId,
  };
  draft_order.use_customer_default_address = true;
  await draft_order.save({update: true});

  return json(
    {
      id: draft_order.id,
      invoiceId: draft_order.invoice_id,
      invoiceUrl: draft_order.invoice_url,
    },
    { status: 200 },
  );
}
