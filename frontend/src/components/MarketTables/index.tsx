import { useState, useEffect } from 'react'
import { INearProps } from 'helpers/near'
import {
  Table,
  Button
} from './layout'
import BidPreview from './BidPreview'

export const MarketTable = ({ near, limit, isClaimed, filterActiveBids }: { near: INearProps, limit: number, isClaimed: boolean,    filterActiveBids?: (bidId: string) => void }) => {

  const [feed, setFeed] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(false)

  async function getBets() {
    const lastKey = feed && feed.length > 0 ? feed[feed.length - 1] : null
    const bets = isClaimed ? 
      await near.api.get_top_claims(lastKey, limit) : 
      await near.api.get_top_bets(lastKey, limit)
      
    if (bets.length === limit) {
      setHasMore(true)
    } else {
      setHasMore(false)
    }
    setFeed(feed => [...feed, ...bets]);
  }

  useEffect(() => {
    getBets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const bids = feed && feed.map(([bidPrice, bidId]) => {
    return (
      <BidPreview bidId={bidId} key={bidId} isClaimed={isClaimed} filterActiveBids={filterActiveBids} />
    )
  })


  return (
    <>
      <Table>
        {bids}
      </Table>
      {hasMore && <Button onClick={getBets}>Get More</Button>}
    </>
  )
}

