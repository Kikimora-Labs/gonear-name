import './Market.scss'
import React, { useEffect, useState } from 'react'
import BidPreview from '../components/BidPreview'
import InfiniteScroll from 'react-infinite-scroller'

const FetchLimit = 25

function MarketPage (props) {
  const [feed, setFeed] = useState([])
  const [hasMore, setHasMore] = useState(false)

  const fetchMore = async () => {
    const f = [...feed]
    const lastKey = f.length > 0 ? f[f.length - 1] : null
    const fetched = await props._near.contract.get_top_bets({
      from_key: lastKey,
      limit: FetchLimit
    })
    f.push(...fetched)
    if (fetched.length === 0) {
      setHasMore(false)
    }
    setFeed(f)
  }

  useEffect(() => {
    if (props.connected) {
      setHasMore(true)
    }
  }, [props.connected])

  const bids = feed.map(([bidPrice, bidId]) => {
    return (
      <BidPreview {...props} key={bidId} bidId={bidId} />
    )
  })

  const loader = (
    // key='1' is needed by InfiniteScroll
    <div key='1' className='d-flex justify-content-center'>
      <div className='spinner-grow' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  )

  return (
    <div>
      <div className='container'>
        <div>
          <h3>
            Account names on sale
          </h3>
        </div>
        <div className='row'>
          <div className='col'>
            <InfiniteScroll
              pageStart={0}
              loadMore={fetchMore}
              hasMore={hasMore}
              loader={loader}
            >
              {bids}
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketPage
