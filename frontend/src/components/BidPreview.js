import './BidPreview.scss'
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PriceButton from './PriceButton'

function BidPreview (props) {
  const [bet, setBet] = useState(props.bet)
  const bidId = props.bidId
  const propsBet = props.bet

  const fetchBid = useCallback(async () => {
    return await props._near.contract.get_bet_price({
      bid_id: bidId
    })
  }, [props._near, bidId])

  useEffect(() => {
    if (props.connected) {
      if (!propsBet) {
        fetchBid().then(setBet)
      } else {
        setBet(propsBet)
      }
    }
  }, [props.connected, propsBet, fetchBid])

  return props.bidId ? (
    <div className='container m-3'>
      <div className='row'>
        <div className='col-3'>
          <Link to={`/bid/${bidId}`}>{bidId}</Link>
        </div>
        <div className='col'>
          <div className='row py-2' />
        </div>
        <div className='col-6'>
          <PriceButton {...props} bidId={bidId} price={bet} />
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
