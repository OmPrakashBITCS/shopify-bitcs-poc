import React, { useState } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Grid,
  InlineStack,
  Text,
  BlockStack,
  Tag,
} from "@shopify/polaris";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import { createAuction } from "app/_services/create-auction";
import { getSimpleIdFromLongId } from "app/_utils/getRealID";

interface ProductVariant {
  id: string;
  title: string;
}

interface SelectedProduct {
  id: string;
  title: string;
  variants: ProductVariant[];
  images: any;
}

interface VariantBidData {
  productId: string;
  variantId: string;
  variantTitle: string;
  bidPrice: string;
  incrementPrice: string;
}
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // i dont knw if the login issue i created because of this but after putting this the issue was resolved
  const { session } = await authenticate.admin(request);
  return json(null);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const auctionName = formData.get("auctionName") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const productDetails = JSON.parse(formData.get("auctionData") as string);
  const auctionEntries = productDetails.products.map(
    (product: SelectedProduct) => {
      const productVariants = productDetails?.variantBids
        ?.filter(
          (variantBid: VariantBidData) => variantBid.productId === product.id,
        )
        ?.map((variantBid: VariantBidData) => ({
          title: variantBid.variantTitle,
          price: parseFloat(variantBid.bidPrice),
          incrementPrice: parseFloat(variantBid.incrementPrice),
          userBids: [],
          variantId: getSimpleIdFromLongId({ id: variantBid.variantId, type: "variant" }),
        }));
      return {
        name: auctionName,
        startTime,
        endTime,
        platform: "shopify",
        productId: getSimpleIdFromLongId({ id: product.id, type: "product" }),
        product: {
          id: getSimpleIdFromLongId({ id: product.id, type: "product" }),
          title: product.title,
          price: parseFloat(productVariants[0]?.price || "0"),
          imageUrl: product.images[0]?.originalSrc || "",
          variants: productVariants,
        },
      };
    },
  );
  for (const auction of auctionEntries) {
    await createAuction(auction);
  }
  return null;
};

export default function NewAuction() {
  const [auctionName, setAuctionName] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );
  const [variantBids, setVariantBids] = useState<VariantBidData[]>([]);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  async function selectProducts() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: true,
    });

    if (products && products.length) {
      const newProducts = products as SelectedProduct[];
      setSelectedProducts([...selectedProducts, ...newProducts]);
      const newVariantBids = newProducts.flatMap((product) =>
        product.variants.map((variant) => ({
          productId: product.id,
          variantId: variant.id,
          variantTitle: variant.title,
          bidPrice: "",
          incrementPrice: "",
        })),
      );
      setVariantBids([...variantBids, ...newVariantBids]);
    }
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((p) => p.id !== productId),
    );
    setVariantBids((prevBids) =>
      prevBids.filter((b) => b.productId !== productId),
    );
  };

  const updateVariantBid = (
    variantId: string,
    field: keyof VariantBidData,
    value: string,
  ) => {
    setVariantBids((prevBids) =>
      prevBids.map((bid) =>
        bid.variantId === variantId ? { ...bid, [field]: value } : bid,
      ),
    );
  };

  return (
    <Page
      title="Create Auction"
      backAction={{ content: "Auctions", url: "/app/auctions" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <form method="post">
              <BlockStack gap="400">
                <FormLayout>
                  <TextField
                    label="Auction Name"
                    name="auctionName"
                    autoComplete="off"
                    placeholder="Name of the auction"
                    value={auctionName}
                    onChange={setAuctionName}
                    requiredIndicator
                  />
                </FormLayout>
                <Grid>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                    <TextField
                      label="Start Time"
                      name="startTime"
                      type="datetime-local"
                      autoComplete="off"
                      value={startTime}
                      onChange={setStartTime}
                    />
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                    <TextField
                      label="End Time"
                      name="endTime"
                      type="datetime-local"
                      autoComplete="off"
                      value={endTime}
                      onChange={setEndTime}
                    />
                  </Grid.Cell>
                </Grid>
                <Button onClick={selectProducts}>Select Products</Button>
                <InlineStack gap="200" wrap>
                  {selectedProducts.map((product) => (
                    <Tag
                      key={product.id}
                      onRemove={() => removeProduct(product.id)}
                    >
                      {product.title}
                    </Tag>
                  ))}
                </InlineStack>
                {selectedProducts.map((product) => (
                  <Card key={product.id}>
                    <BlockStack gap="400">
                      <Text variant="headingMd" as="h3">
                        {product.title}
                      </Text>
                      {product.variants.map((variant) => {
                        const variantBid = variantBids.find(
                          (b) => b.variantId === variant.id,
                        );
                        return variantBid ? (
                          <InlineStack
                            key={variant.id}
                            gap="500"
                            align="start"
                            wrap={false}
                          >
                            <div style={{ minWidth: "150px" }}>
                              <Text as="h3" variant="bodyMd" fontWeight="bold">
                                {variant.title}
                              </Text>
                            </div>
                            <InlineStack gap="300" align="start" wrap={false}>
                              <TextField
                                label="Bid Price"
                                type="number"
                                placeholder="0"
                                prefix="$"
                                autoComplete="off"
                                name="variantBid"
                                value={variantBid.bidPrice}
                                onChange={(value) =>
                                  updateVariantBid(
                                    variant.id,
                                    "bidPrice",
                                    value,
                                  )
                                }
                              />
                              <TextField
                                label="Increment Price"
                                type="number"
                                prefix="$"
                                placeholder="0"
                                autoComplete="off"
                                value={variantBid.incrementPrice}
                                onChange={(value) =>
                                  updateVariantBid(
                                    variant.id,
                                    "incrementPrice",
                                    value,
                                  )
                                }
                              />
                            </InlineStack>
                          </InlineStack>
                        ) : null;
                      })}
                    </BlockStack>
                  </Card>
                ))}
                <div style={{ display: "none" }}>
                  <TextField
                    name="auctionData"
                    value={JSON.stringify({
                      auctionName,
                      startTime,
                      endTime,
                      products: selectedProducts,
                      variantBids,
                    })}
                    autoComplete="off"
                    label="Auction Data"
                    labelHidden
                  />
                </div>

                <InlineStack align="end">
                  <Button submit variant="primary" size="large">
                    Create Auction
                  </Button>
                </InlineStack>
              </BlockStack>
            </form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
