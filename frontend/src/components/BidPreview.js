import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AcquireButton, PriceButton, DetailsButton } from './Buttons'

const mapBidInfo = (b) => {
  return b ? {
    isAtMarket: true,
    numClaims: b.num_claims,
    claimedBy: b.claim_status ? b.claim_status[0] : null,
    claimedTime: b.claim_status ? b.claim_status[1] : null,
    bets: b.bets,
    betPrice: b.bet_price,
    claimPrice: b.claim_price,
    forfeit: b.forfeit,
    isOnAcquisition: b.on_acquisition
  } : {
    isAtMarket: false,
    numClaims: 0,
    claimedBy: null,
    claimedTime: null,
    bets: null,
    betPrice: 0,
    claimPrice: 0,
    forfeit: null,
    isOnAcquisition: false
  }
}

function BidPreview (props) {
  const [bid, setBid] = useState(props.bid)
  const bidId = props.bidId
  const propsBid = props.bid
  const isOnAcquisition = !!props.onAcquisition

  const fetchBid = useCallback(async () => {
    if (!isOnAcquisition) {
      return mapBidInfo(await props._near.contract.get_bid({
        bid_id: bidId
      }))
    } else {
      return mapBidInfo(null)
    }
  }, [props._near, bidId, isOnAcquisition])

  useEffect(() => {
    if (props.connected) {
      if (!propsBid) {
        fetchBid().then(setBid)
      } else {
        setBid(propsBid)
      }
    }
  }, [props.connected, propsBid, fetchBid])

  return bid ? (
    <div className='row align-middle pt-3'>
      <div className='col-4'>
        <Link to={`/bid/${bidId}`} style={{ textDecoration: 'none', color: 'white' }}>{bidId}</Link>
      </div>
      <div className='col-6' style={{ maxWidth: '240px' }}>
        {isOnAcquisition ? (<AcquireButton {...props} bidId={bidId} />) : (bid.isOnAcquisition
          ? (<DetailsButton {...props} bidId={bidId} />)
          : (<PriceButton {...props} bidId={bidId} price={bid.betPrice} forfeit={bid.forfeit} />))}
      </div>
    </div>
  ) : (
    <div className='container m-2'>
      <div className='d-flex justify-content-center'>
        <div className='spinner-grow' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    </div>
  )
}

export { BidPreview, mapBidInfo }
