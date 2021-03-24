import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroller'
import useSWR from 'swr'

import { BidPreview } from '../components/BidPreview'
import { mapStats, loader } from '../components/Helpers'

const FetchLimit = 25

function MarketCommon (props, swrKey, swrFetcher, showBetsLink) {
  const [feed, setFeed] = useState([])
  const [hasMore, setHasMore] = useState(true)

  const fetchStats = async (...args) => {
    return mapStats(await props._near.contract.get_global_stats())
  }

  const fetchTopClaims = async (...args) => {
    return (await props._near.contract.get_top_claims({
      from_key: args[1],
      limit: FetchLimit
    }))
  }

  const { data: stats } = useSWR('global_stats', fetchStats, { errorRetryInterval: 250 })
  const { data: topClaims } = useSWR(['get_top_claims', null], fetchTopClaims, { errorRetryInterval: 500 })
  const numBidsOnClaim = topClaims && topClaims.length

  const lastKey = feed && feed.length > 0 ? feed[feed.length - 1] : null
  const { data: nextPage } = useSWR([swrKey, lastKey], swrFetcher, { errorRetryInterval: 250 })

  const fetchMore = async () => {
    if (!nextPage) {
      return
    }
    const f = [...feed]
    f.push(...nextPage)
    if (nextPage.length === 0) {
      setHasMore(false)
    }
    setFeed(f)
  }

  const bids = feed && feed.map(([bidPrice, bidId]) => {
    return (
      <BidPreview {...props} key={bidId} bidId={bidId} />
    )
  })

  return stats ? (
    <div>
      <div className='container g-0 px-5'>
        <div className='d-flex flex-row bd-highlight mb-3'>
          <div className='py-2 bd-highlight'>
            {showBetsLink
              ? <h5><Link className='navigate' to='/bets'>Active bids ({stats.numBids})</Link></h5>
              : <h5 className='nonavigate'>Active bids ({stats.numBids})</h5>}
          </div>
          <div className='p-2 bd-highlight' />
          <div className='p-2 bd-highlight'>
            {showBetsLink
              ? <h5 className='nonavigate'>On claim ({numBidsOnClaim || '0'})</h5>
              : <h5><Link className='navigate' to='/claims'>On claim ({numBidsOnClaim || '0'})</Link></h5>}
          </div>
        </div>
      </div>
      <div className='container g-0 px-5'>
        <InfiniteScroll
          loadMore={fetchMore}
          hasMore={hasMore}
          loader={loader()}
        >{bids}
        </InfiniteScroll>
      </div>
    </div>
  ) : (loader())
}

function BetsPage (props) {
  const fetchTopBets = async (...args) => {
    return (await props._near.contract.get_top_bets({
      from_key: args[1],
      limit: FetchLimit
    }))
  }
  return MarketCommon(props, 'get_top_bets', fetchTopBets, false)
}

function ClaimsPage (props) {
  const fetchTopClaims = async (...args) => {
    return (await props._near.contract.get_top_claims({
      from_key: args[1],
      limit: FetchLimit
    }))
  }
  return MarketCommon(props, 'get_top_claims', fetchTopClaims, true)
}

export { ClaimsPage, BetsPage }
