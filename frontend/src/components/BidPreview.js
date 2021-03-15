import './BidPreview.scss'
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PriceButton from './PriceButton'

function BidPreview (props) {
  const [bid, setBid] = useState(props.bid)
  const bidId = props.bidId
  const propsBid = props.bid

  const fetchBid = useCallback(async () => {
    return (await props._near.contract.get_bid({
      bid_id: bidId
    }))
  }, [props._near, bidId])

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
          <PriceButton {...props} bidId={bidId} price={bid.bet_price} forfeit={bid.forfeit} />
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

export default BidPreview
