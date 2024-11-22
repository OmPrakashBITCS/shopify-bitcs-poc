import React from 'react'
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  ButtonGroup,
  EmptyState,
  Badge,
} from '@shopify/polaris'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { fetchAllProducts } from 'app/_services/fetch-auctions'
import logger from 'app/_utils/logger'


export const loader: LoaderFunction = async () => {
  const response = await fetchAllProducts();
  const data: any = await response.json();
  const auctions = data?.auctions;
  return json({ auctions })
}

export default function AuctionsIndex() {
  const {auctions} = useLoaderData<typeof loader>();
  logger.info('Auction date available')
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
  // const totalBidCount = auctions.reduce((auctionAcc: number, auction: any) => {
  //   const productBidCount = auction.product.reduce((productAcc: number, prod: any) => {
  //     const variantBidCount = prod.variants.reduce((variantAcc: number, variant: any) => {
  //       return variantAcc + variant.bids.length;
  //     }, 0);
  //     return productAcc + variantBidCount;
  //   }, 0);
  //   return auctionAcc + productBidCount;
  // }, 0);
  // console.log(totalBidCount)
  const rows = auctions?.map((auction: any) =>{
    const bidCount = auction?.product?.reduce((productAcc: number, prod: any) => {
      const variantBidCount = prod?.variants?.reduce((variantAcc: number, variant: any) => {
        return variantAcc + variant.userBids.length;
      }, 0);
      return productAcc + variantBidCount;
    }, 0);
    return [
    auction?.name,
    new Date(auction?.startTime).toLocaleString(),
    new Date(auction?.endTime).toLocaleString(),
    <div key={auction?.id} className="font-medium">{statusStyling(auction?.status)}</div>,
    <div key={auction?.id} className="space-y-1">
      <div className="text-sm text-gray-500">{bidCount} bids</div>
    </div>,
    <ButtonGroup key={auction?.id}>
      <Button url={`/app/auction-details/${auction?.id}`} variant="primary">
        View
      </Button>
      <Button>Delete</Button>
    </ButtonGroup>
  ]})

  return (
    <Page
      title="Auctions"
      primaryAction={
        <Button url="/app/create-auction" variant="primary">
          Create Auction
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          {rows?.length > 0 ? (
            <Card padding="0">
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                headings={['Auction Name', 'Start Time', 'End Time', 'Status', 'Details', 'Actions']}
                rows={rows}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                heading="Create your first auction"
                action={{
                  content: 'Create Auction',
                  url: '/app/create-auction',
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Start managing auctions and engage with your customers.</p>
              </EmptyState>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  )
}