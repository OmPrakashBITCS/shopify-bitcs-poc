import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createDraftOrder } from "app/_services/create-draft";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json();

  try {
    const savedOrder = await createDraftOrder({ ...data, request });
    return json({ savedOrder }, { status: 200 });
  } catch (error) {
    console.error("Error creating draft order:", error);
    return json({ error: "Error creating draft order" }, { status: 500 });
  }
};