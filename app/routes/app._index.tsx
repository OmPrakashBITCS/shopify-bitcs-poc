import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Badge,
  Banner,
  Button,
  Modal,
  Text,
  BlockStack,
  Box,
  InlineGrid,
} from "@shopify/polaris";
import { formatDistance } from "date-fns";
import { dashboardData } from "app/_services/dashboard";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
  const response = await dashboardData();
  const data = await response.json();
  return json({ data });
};

export default function Dashboard() {
  const { data } = useLoaderData<typeof loader>();
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // if (loading) {
  //   return (
  //     <SkeletonPage>
  //       <Layout>
  //         <Layout.Section>
  //           <Card>
  //             <SkeletonBodyText lines={6} />
  //           </Card>
  //         </Layout.Section>
  //       </Layout>
  //     </SkeletonPage>
  //   )
  // }

  const { auctions, stats } = data;

  const statusStyling = (status: any) => {
    switch (status) {
      case 'Active':
        return <Badge tone="success">Active</Badge>
      case 'Inactive':
        return <Badge tone="critical">Inactive</Badge>
      case 'Upcoming':
        return <Badge tone="warning">Scheduled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const rows = auctions.map((auction: any) => [
    auction.name,
    statusStyling(auction.status),
    auction.product[0]?.title || "N/A",
    `$${auction.product[0]?.price.toFixed(2)}`,
    formatDistance(new Date(auction.startTime), new Date(), {
      addSuffix: true,
    }),
    formatDistance(new Date(auction.endTime), new Date(), { addSuffix: true }),
    <Button
      onClick={() => {
        setSelectedAuction(auction);
        setShowModal(true);
      }}
    >
      View Details
    </Button>,
  ]);
  const StatCard = ({ title, value }) => (
    <Card>
      <BlockStack gap="200">
        <Text as="h2" variant="headingMd">
          {title}
        </Text>
        <Text as="p" variant="headingLg" fontWeight="bold">
          {value}
        </Text>
      </BlockStack>
    </Card>
  );
  return (
    <Page title="Auction Dashboard">
      <Layout>
        <Layout.Section>
          <Box paddingBlockEnd="400">
            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              <StatCard title="Total Auctions" value={stats.totalAuctions} />
              <StatCard title="Total Bids" value={stats.totalBids} />
              <StatCard title="Successful Sales" value={stats.totalWinners} />
              <StatCard title="Products Listed" value={stats.totalProducts} />
            </InlineGrid>
          </Box>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={[
                "text",
                "text",
                "text",
                "numeric",
                "text",
                "text",
                "text",
              ]}
              headings={[
                "Auction Name",
                "Status",
                "Product",
                "Starting Price",
                "Started",
                "Ends",
                "Actions",
              ]}
              rows={rows}
            />
          </Card>
        </Layout.Section>

        {selectedAuction && (
          <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            title={`Auction Details: ${selectedAuction?.name}`}
          >
            <Modal.Section>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Product Details:
                </Text>
                {selectedAuction?.product.map((product: any) => (
                  <Card key={product.id}>
                    <BlockStack gap="200">
                      <Text as="p">Title: {product.title}</Text>
                      <Text as="p">Base Price: ${product.price}</Text>
                      <Box paddingBlockStart="400">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          style={{ maxWidth: "200px" }}
                        />
                      </Box>
                    </BlockStack>
                  </Card>
                ))}

                <Text as="h3" variant="headingMd">
                  Recent Bids:
                </Text>
                {selectedAuction?.product[0]?.UserBid.length > 0 ? (
                  selectedAuction?.product[0]?.UserBid.map((bid: any) => (
                    <Banner key={bid.id} tone="info">
                      <p>
                        {bid.customerName} bid ${bid.bidAmount} on{" "}
                        {formatDistance(new Date(bid.bidTime), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </Banner>
                  ))
                ) : (
                  <Banner tone="info">No recent bids for this auction.</Banner>
                )}

                <Text as="h3" variant="headingMd">
                  Winners:
                </Text>
                {selectedAuction.product[0]?.Winner.length > 0 ? (
                  selectedAuction.product[0]?.Winner.map((winner: any) => (
                    <Banner key={winner.id} tone="success">
                      <BlockStack gap="200">
                        <Text as="p">
                          {winner.customerName} won with bid ${winner.bidAmount}
                        </Text>
                        {winner.invoiceUrl && (
                          <Button url={winner.invoiceUrl}>
                            View Invoice
                          </Button>
                        )}
                      </BlockStack>
                    </Banner>
                  ))
                ) : (
                  <Banner tone="info">
                    No winner announced yet for this auction.
                  </Banner>
                )}
              </BlockStack>
            </Modal.Section>
          </Modal>
        )}
      </Layout>
    </Page>
  );
}
