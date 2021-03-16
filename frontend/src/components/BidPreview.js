import './BidPreview.scss'
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PriceButton, DetailsButton } from './PriceButton'

const mapBidInfo = (b) => {
  return b ? {
    isAtMarket: true,
    numClaims: b.num_claims,
    claimedBy: b.claim,
    bets: b.bets,
    betPrice: b.bet_price,
    claimPrice: b.claim_price,
    forfeit: b.forfeit,
    isOnAcquisition: b.on_acquisition
  } : {
    isAtMarket: false,
    numClaims: 0,
    claimedBy: null,
    bets: [],
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
    <div className='container m-3'>
      <div className='row'>
        <div className='col-5'>
          <Link className='nav-link' to={`/bid/${bidId}`}>{bidId}</Link>
        </div>
        <div className='col'>
          <div className='row py-2' />
        </div>
        <div className='col-6'>
          {isOnAcquisition | bid.isOnAcquisition
            ? (<DetailsButton {...props} bidId={bidId} />)
            : (<PriceButton {...props} bidId={bidId} price={bid.betPrice} forfeit={bid.forfeit} />)}
        </div>
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
