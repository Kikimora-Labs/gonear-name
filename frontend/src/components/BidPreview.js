import React from 'react'
import { Link } from 'react-router-dom'
import useSWR from 'swr'

import { AcquireButton, PriceButton, DetailsButton } from './Buttons'
import { loader, mapBidInfo, fromNear } from './Helpers'

function BidPreview (props) {
  const bidId = props.bidId

  const fetchBid = async (...args) => {
    return mapBidInfo(await props._near.contract.get_bid({
      bid_id: args[1]
    }))
  }

  const fetchBidBalance = async (...args) => {
    const account = await props._near.near.account(args[1])
    return (await account.getAccountBalance()).total
  }

  const { data: bid } = useSWR(['bid_id', bidId], fetchBid, { errorRetryInterval: 100 })
  const { data: balance } = useSWR(['bid_balance', bidId], fetchBidBalance, { errorRetryInterval: 100 })
  const textBetsNum = bid && bid.bets && bid.bets.length > 2 ? 'bets' : 'bet'
  const buttonWidthPx = window.innerWidth < 800 ? '120px' : '300px'

  const isProfitable = bid && bid.claimPrice && fromNear(balance) > fromNear(bid.claimPrice)

  return bid ? (
    <div className='pt-3'>
      <div className='d-flex flex-row w-100 align-items-center' style={{ maxWidth: '640px' }}>
        <div className='d-flex flex-row justify-content-between w-100'>
          <Link to={`/bid/${bidId}`} style={{ textDecoration: 'none', color: 'white' }}>{bidId}</Link>
          {isProfitable ? <small className='text-end ps-1 my-green-big'>profitable!</small>
            : (bid.claimedBy ? (<small className='text-end ps-1 my-gray'>claimed&nbsp;by <Link className='navigate' to={`/profile/${bid.claimedBy}`}>{bid.claimedBy}</Link></small>
            ) : (bid.bets && bid.bets.length > 1 && <small className='text-end ps-1 my-gray'>{bid.bets.length - 1}&nbsp;{textBetsNum}</small>))}
        </div>
        <div className='ps-2' style={{ width: buttonWidthPx }}>
          {!bid.isAtMarket ? (<AcquireButton {...props} bidId={bidId} />) : (bid.isOnAcquisition
            ? (<DetailsButton {...props} bidId={bidId} />)
            : (<PriceButton {...props} bidId={bidId} price={bid.betPrice} forfeit={bid.forfeit} />))}
        </div>
      </div>

    </div>
  ) : (loader())
}

export { BidPreview }
