import React, { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Button,
  ResourceList,
  ResourceItem,
  Badge,
  Text,
  InlineStack,
  BlockStack,
  Divider,
  Image,
  Tabs,
} from "@shopify/polaris";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { fetchProductByID } from "app/_services/fetch-auctions";

type Variant = {
  id: string;
  title: string;
  price: string;
  userBids: any;
  Winner: {
    customerName: string;
    bidAmount: string;
  } | null;
};

export const loader: LoaderFunction = async ({ params }) => {
  const response = await fetchProductByID(params.id);
  const data: any = await response.json();
  const auction = data.auction;
  return json({ auction });
};

export default function AuctionDetail() {
  const { auction } = useLoaderData<typeof loader>();
  // const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [selectedVariantId, setSelectedVariantId] = useState(
    auction?.product[0]?.variants[0]?.id,
  );

  const selectedVariant = auction?.product[0]?.variants?.find(
    (variant: Variant) => variant.id === selectedVariantId,
  );
  const tabs = auction?.product[0]?.variants?.map((variant: Variant) => ({
    id: variant.id,
    content: `Variant ${variant.title}`,
    accessibilityLabel: `Variant ${variant.title}`,
    panelID: `variant-${variant.id}-panel`,
  }));

  const handleTabChange = (selectedTabIndex: number) => {
    setSelectedVariantId(auction?.product[0]?.variants[selectedTabIndex]?.id);
  };

  const handleMarkAsComplete = async () => {
    try {
      const API_URL = "https://mutual-splendid-quagga.ngrok-free.app";

      const response = await fetch(`${API_URL}/api/select-winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId: auction.id }),
      });

      if (response.ok) {
        console.log("Bid successfully completed");
        revalidator.revalidate();
        // fetcher.load(`/app/auction-details/${auction.id}`);
      } else {
        console.error("Failed to complete bid");
      }
    } catch (error) {
      console.error("Error completing bid:", error);
    }
  };

  const getCurrentBid = (variant: Variant) => {
    if (variant?.userBids?.length === 0) return variant?.price;
    return variant?.userBids?.reduce(
      (max: any, bid: any) =>
        parseInt(bid?.bidAmount) > parseInt(max) ? bid.bidAmount : max,
      variant.price,
    );
  };

  const sortedBids = selectedVariant?.userBids
    .slice()
    .sort((a: any, b: any) => {
      return parseFloat(b.bidAmount) - parseFloat(a.bidAmount);
    });

  return (
    <Page
      title={auction?.name}
      backAction={{ content: "Auctions", url: "/app/auctions" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <InlineStack gap="500" align="start">
                <div style={{ flex: 1 }}>
                  <BlockStack gap="100">
                    <Text variant="headingLg" as="h2">
                      {auction?.product[0]?.title}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Start Time:{" "}
                      {new Date(auction?.startTime).toLocaleString()}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      End Time: {new Date(auction?.endTime).toLocaleString()}
                    </Text>
                  </BlockStack>
                </div>
                <Image
                  source={auction?.product[0]?.imageUrl}
                  alt={auction?.product[0]?.title}
                  width={400}
                  height={300}
                />
              </InlineStack>
              <Divider />
              <InlineStack align='end'>
                {auction?.status === "Active" && (
                  <Button variant='primary' onClick={handleMarkAsComplete}>
                    Mark as Complete
                  </Button>
                )}
              </InlineStack>
              <Tabs
                tabs={tabs}
                selected={tabs.findIndex(
                  (tab: any) => tab.id === selectedVariantId,
                )}
                onSelect={handleTabChange}
              />
              {selectedVariant && (
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd">
                    Starting Price: {auction?.product[0]?.price}
                  </Text>
                  <Text variant="headingMd" as="p">
                    Current Bid: {getCurrentBid(selectedVariant)}
                  </Text>
                  {selectedVariant.Winner[0] ? (
                    <BlockStack>
                      <Text variant="headingSm" as="p">
                        Winner: {selectedVariant.Winner[0].customerName}
                      </Text>
                      <Text as="p" variant="bodyMd">
                        Winning Bid: {selectedVariant.Winner[0].bidAmount}
                      </Text>
                    </BlockStack>
                  ) : (
                    <Text as="p" variant="bodyMd">
                      No winner announced.
                    </Text>
                  )}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack>
              <Text variant="headingLg" as="h2">
                Bid History for {selectedVariant?.title}
              </Text>
              <ResourceList
                resourceName={{ singular: "bid", plural: "bids" }}
                items={sortedBids || []}
                renderItem={(bid) => (
                  <ResourceItem
                    id={bid.id}
                    onClick={() => console.log("bid clicked")}
                    accessibilityLabel={`Bid by ${bid.customerName}`}
                  >
                    <InlineStack align="space-between">
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" fontWeight="bold">
                          {bid.customerName}
                        </Text>
                        <Text as="p" variant="bodySm">
                          {new Date(bid.bidTime).toLocaleString()}
                        </Text>
                      </BlockStack>
                      <BlockStack gap="100" align="center">
                        <Text as="p" variant="bodyLg">
                          Bid Amount
                        </Text>
                        <InlineStack>
                          <Badge size="large">{bid.bidAmount}</Badge>
                        </InlineStack>
                      </BlockStack>
                    </InlineStack>
                  </ResourceItem>
                )}
                emptyState={
                  <BlockStack gap="200" align="center">
                    <Text as="p" variant="bodyMd">
                      No bids yet for this variant
                    </Text>
                  </BlockStack>
                }
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
