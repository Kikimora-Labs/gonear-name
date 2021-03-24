import React from 'react'
import { Link } from 'react-router-dom'
import useSWR from 'swr'

import { AcquireButton, PriceButton, DetailsButton } from './Buttons'
import { loader, mapBidInfo } from './Helpers'

function BidPreview (props) {
  const bidId = props.bidId

  const fetchBid = async (...args) => {
    return mapBidInfo(await props._near.contract.get_bid({
      bid_id: args[1]
    }))
  }

  const { data: bid } = useSWR(['bid_id', bidId], fetchBid, { errorRetryInterval: 100 })

  return bid ? (
    <div className='row align-middle pt-3'>
      <div className='col-4'>
        <Link to={`/bid/${bidId}`} style={{ textDecoration: 'none', color: 'white' }}>{bidId}</Link>
      </div>
      <div className='col-6' style={{ maxWidth: '240px' }}>
        {!bid.isAtMarket ? (<AcquireButton {...props} bidId={bidId} />) : (bid.isOnAcquisition
          ? (<DetailsButton {...props} bidId={bidId} />)
          : (<PriceButton {...props} bidId={bidId} price={bid.betPrice} forfeit={bid.forfeit} />))}
      </div>
    </div>
  ) : (loader())
}

export { BidPreview }
