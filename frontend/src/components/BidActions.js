import React from 'react'
import { Link } from 'react-router-dom'

import { NEAR, fromNear } from './Helpers'

function BetButton (props) {
  const betPrice = props.bidInfo.betPrice
  const forfeit = props.bidInfo.forfeit
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
      className='btn btn-success w-100 mb-2'
      disabled={!props.signedIn || !props.isSafe}
      onClick={(e) => betBid(e)}
    >
        Bet for {NEAR}{totalBetPrice.toFixed(6)}
    </button>
  )
}

function ClaimButton (props) {
  const claimedBy = props.bidInfo.claimedBy
  const claimPrice = fromNear(props.bidInfo.claimPrice)
  async function claimBid (e) {
    e.preventDefault()
    console.log(String(claimPrice * 1e9) + '000000000000000')
    // TODO
    await props._near.contract.claim({ bid_id: props.bidId }, '200000000000000', String(parseInt((claimPrice + 1e-5) * 1e9)) + '000000000000000')
  }

  return (
    !claimedBy ? (
      <button
        className='btn btn-warning w-100'
        disabled={!props.signedIn || !props.isSafe}
        onClick={(e) => claimBid(e)}
      >
        Claim for {NEAR}{claimPrice.toFixed(6)}
      </button>
    ) : (
      <button
        className='btn btn-outline-warning w-100'
        disabled
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
  const disabled = !props.signedIn || !props.isSafe

  return !disabled ? (
    <Link to={toOfferPage ? (`/acquire/${props.bidId}`) : (`/profile/${props.signedAccountId}`)} className='btn btn-warning w-100' onClick={(e) => finalizeBid(e)}>
          Finalize
    </Link>
  ) : (
    <button
      className='btn btn-warning w-100'
      disabled
    >
    Finalize
    </button>
  )
}

function AcquireButton (props) {
  return (
    <Link
      className='btn btn-warning w-100'
      to={`/acquire/${props.bidId}`}
    >Acquire
    </Link>
  )
}

export { BetButton, ClaimButton, FinalizeButton, AcquireButton }
