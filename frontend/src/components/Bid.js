import React, { useCallback, useEffect, useState } from 'react'
import { BuyButton } from './Helpers'
import TimeAgo from 'timeago-react'
import { Link } from 'react-router-dom'

const mapBidInfo = (b) => {
  return b ? {
    numClaims: b.num_claims,
    claim: b.claim,
    bets: b.bets
  } : {
    numClaims: 0,
    claim: null,
    bets: null
  }
}

function Bid (props) {
  const [bidInfo, setBidInfo] = useState(null)
  const bidId = props.bidId
  const refreshTime = props.refreshTime
  const hidden = props.hidden

  const fetchInfo = useCallback(async () => {
    const bet = await props._near.contract.get_bet_price({
      bid_id: bidId
    })
    const claim = await props._near.contract.get_claim_price({
      bid_id: bidId
    })
    const forfeit = await props._near.contract.get_forfeit({
      bid_id: bidId
    })
    const bidInfo = mapBidInfo(await props._near.contract.get_bid({
      bid_id: bidId
    }))
    bidInfo.refreshTime = refreshTime
    bidInfo.bet = bet
    bidInfo.claim = claim
    bidInfo.forfeit = forfeit
    return bidInfo
  }, [props._near, bidId, refreshTime])

  useEffect(() => {
    if (props.connected && !hidden) {
      fetchInfo().then(setBidInfo)
    }
  }, [props.connected, fetchInfo, bidId, hidden])

  console.log(bidInfo)

  return bidInfo ? (
    <div className='bid m-2'>
      <div className='bid-body text-start'>
        <h3>{bidId}</h3>
        {!bidInfo.claim ? (
          <div>
            <p>
              Claimed?
            </p>
          </div>
        ) : (
          <div>
            <p>
              Not claimed by anyone.
            </p>
          </div>
        )}
      </div>
      <div className='text-center'>
        <BuyButton {...props} bidId={bidId} bet={bidInfo.bet} forfeit={bidInfo.forfeit} claim={bidInfo.claim} ownerId={bidInfo.ownerId} />
      </div>
    </div>
  ) : (
    <div className='bid m-2'>
      <div className='d-flex justify-content-center'>
        <div className='spinner-grow' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    </div>
  )
}

export default Bid
