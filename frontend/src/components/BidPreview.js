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
  const textBetsNum = bid && bid.bets && bid.bets.length > 2 ? 'bets' : 'bet'
  return bid ? (
    <div className='pt-3'>

      <div className='d-flex flex-row w-100 align-items-center' style={{ maxWidth: '640px' }}>
        <div className='d-flex flex-row justify-content-between w-100'>
          <Link to={`/bid/${bidId}`} style={{ textDecoration: 'none', color: 'white' }}>{bidId}</Link>
          {bid.claimedBy ? (<small className='text-end ps-1 my-gray'>claimed&nbsp;by <Link className='navigate' to={`/profile/${bid.claimedBy}`}>{bid.claimedBy}</Link></small>
          ) : (bid.bets && bid.bets.length > 1 && <small className='my-gray'>{bid.bets.length - 1} {textBetsNum}</small>)}
        </div>
        <div className='ps-2' style={{ minWidth: '200px', maxWidth: '300px' }}>
          {!bid.isAtMarket ? (<AcquireButton {...props} bidId={bidId} />) : (bid.isOnAcquisition
            ? (<DetailsButton {...props} bidId={bidId} />)
            : (<PriceButton {...props} bidId={bidId} price={bid.betPrice} forfeit={bid.forfeit} />))}
        </div>
      </div>

    </div>
  ) : (loader())
}

export { BidPreview }
