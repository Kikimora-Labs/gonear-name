import React from 'react'
import { fromNear } from './Helpers'
import { Link } from 'react-router-dom'

function BetButton (props) {
  const betPrice = props.betPrice
  const forfeit = props.forfeit
  const totalBetPrice = fromNear(betPrice) + fromNear(forfeit)
  async function betBid (e) {
    e.preventDefault()
    console.log(String(totalBetPrice * 1e9) + '000000000000000')
    // TODO
    if (forfeit < 0.001) {
      await props._near.contract.bet({ bid_id: props.bidId }, '200000000000000', String(parseInt((totalBetPrice + 1e-5) * 1e9)) + '000000000000000')
    } else {
      await props._near.contract.bet({ bid_id: props.bidId }, '200000000000000', String(parseInt((totalBetPrice + 1e-5) * 1.001 * 1e9)) + '000000000000000')
    }
  }

  return (
    <button
      className='btn btn-success btn-lg btn-block'
      disabled={!props.signedIn || !props.isSafe}
      onClick={(e) => betBid(e)}
    >
        Bet for {totalBetPrice.toFixed(6)} NEAR
    </button>
  )
}

function ClaimButton (props) {
  const claimPrice = fromNear(props.claimPrice)
  async function claimBid (e) {
    e.preventDefault()
    console.log(String(claimPrice * 1e9) + '000000000000000')
    // TODO
    await props._near.contract.claim({ bid_id: props.bidId }, '200000000000000', String(parseInt((claimPrice + 1e-5) * 1e9)) + '000000000000000')
  }

  return (
    claimPrice ? (
      <button
        className='btn btn-warning btn-lg btn-block'
        disabled={!props.signedIn || !props.isSafe}
        onClick={(e) => claimBid(e)}
      >
        Claim for {claimPrice.toFixed(6)} NEAR
      </button>
    ) : (
      <button
        className='btn btn-outline-warning btn-lg btn-block'
        disabled
        onClick={(e) => claimBid(e)}
      >
        Already claimed - you can only bet
      </button>
    )
  )
}

function FinalizeButton (props) {
  async function finalizeBid (e) {
    // e.preventDefault()
    await props._near.contract.finalize({ bid_id: props.bidId }, '200000000000000', '0')
  }

  const toOfferPage = props.signedIn && props.bidInfo && props.signedAccountId && (props.signedAccountId === props.bidInfo.claimedBy)
  const disabled = !(props.signedIn && props.isSafe)

  return !disabled ? (
    <Link to={toOfferPage ? (`/acquire/${props.bidId}`) : (`/profile/${props.signedAccountId}`)} className='btn btn-warning btn-lg btn-block' onClick={(e) => finalizeBid(e)}>
          Finalize
    </Link>
  ) : (
    <button disabled className='btn btn-warning btn-lg btn-block'>Finalize</button>
  )
}

function AcquireButton (props) {
  return (
    <Link
      className='btn btn-success btn-lg btn-block'
      to={`/acquire/${props.bidId}`}
    >Acquire
    </Link>
  )
}

function BidActions (props) {
  const bidInfo = props.bidInfo
  const isAtMarket = bidInfo.isAtMarket
  const isOnAcquisition = bidInfo.isOnAcquisition

  let isMine = false
  if (props.signedIn) {
    props.profile.acquisitions.forEach(bidId => {
      if (bidId === props.bidId) {
        isMine = true
      }
    })
  }

  return isAtMarket ? (
    !isOnAcquisition ? (
      <div>
        <div className='row py-3'>
          <BetButton {...props} betPrice={bidInfo.betPrice} forfeit={bidInfo.forfeit} />
          <div className='row py-1' />
          <ClaimButton {...props} claimPrice={bidInfo.claimPrice} />
        </div>
      </div>
    ) : (
      <div>
        <div className='row py-3'>
          <FinalizeButton {...props} bidInfo={props.bidInfo} />
        </div>
      </div>
    )
  ) : (
    isMine ? (
      <div>
        <h4>
          Congratulations! You claimed the account successfully. Please proceed to the acquisition procedure.
        </h4>
        <div className='row py-3'>
          <AcquireButton {...props} bidInfo={props.bidInfo} />
        </div>
      </div>
    ) : (
      <div>
      Is not on market. Is it a good fit?
      </div>
    )
  )
}

export { BidActions }
