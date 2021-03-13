import React, { useCallback, useEffect, useState } from 'react'
import { BuyButton, fromNear } from './Helpers'
import TimeAgo from 'timeago-react'
import { Link } from 'react-router-dom'
import PriceButton from './PriceButton'

const mapBidInfo = (c) => {
  return c ? {
    ownerId: c.owner_id,
    purchasePrice: fromNear(c.purchase_price),
    purchaseTime: new Date(parseFloat(c.purchase_time) / 1e6),
    volume: fromNear(c.volume),
    artDaoProfit: fromNear(c.art_dao_profit),
    numTrades: c.num_trades
  } : {
    ownerId: null,
    purchasePrice: 0,
    purchaseTime: null,
    volume: 0,
    artDaoProfit: 0,
    numTrades: 0
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
    const bidInfo = mapBidInfo(await props._near.contract.get_bid({
      bid_id: bidId
    }))
    bidInfo.refreshTime = refreshTime
    bidInfo.bet = bet
    return bidInfo
  }, [props._near, bidId, refreshTime])

  useEffect(() => {
    if (props.connected && !hidden) {
      fetchInfo().then(setBidInfo)
    }
  }, [props.connected, fetchInfo, bidId, hidden])

  return bidInfo ? (
    <div className='bid m-2'>
      <div className='card-body text-start'>
        <h3>#{bidId}</h3>
        {bidInfo.ownerId ? (
          <div>
            <p>
              Owned by {bidInfo.ownerId === props.signedAccountId ? 'you' : (
                <Link to={`/a/${bidInfo.ownerId}`}>@{bidInfo.ownerId}</Link>
              )}<br />
              Purchased <TimeAgo datetime={bidInfo.purchaseTime} /> for {bidInfo.purchasePrice.toFixed(2)} NEAR<br />
            </p>
            <p>
              Total bid volume {bidInfo.volume.toFixed(2)} NEAR<br />
              Art DAO got {bidInfo.artDaoProfit.toFixed(2)} NEAR<br />
            </p>
          </div>
        ) : (
          <div>
            <p>
              Not owned by anyone.
            </p>
          </div>
        )}
      </div>
      <div className='bid-footer text-center'>
        {bidInfo.ownerId === props.signedAccountId ? (
          <PriceButton {...props} bidId={bidId} price={bidInfo.bet} />
        ) : (
          <BuyButton {...props} bidId={bidId} price={bidInfo.bet} ownerId={bidInfo.ownerId} />
        )}
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
