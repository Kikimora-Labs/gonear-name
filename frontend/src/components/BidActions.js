import React from 'react'
import { fromNear } from './Helpers'

function BetButton (props) {
  const betPrice = props.betPrice
  const forfeit = props.forfeit
  const totalBetPrice = fromNear(betPrice) + fromNear(forfeit)
  async function betBid (e) {
    e.preventDefault()
    console.log(String(totalBetPrice * 1e9) + '000000000000000')
    // TODO
    await props._near.contract.bet({ bid_id: props.bidId }, '200000000000000', String(parseInt(totalBetPrice * 1.01 * 1e9)) + '000000000000000')
  }

  return (
    <button
      className='btn btn-primary btn-lg btn-block'
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
    await props._near.contract.claim({ bid_id: props.bidId }, '200000000000000', String(parseInt(claimPrice * 1e9)) + '000000000000000')
  }

  return (
    claimPrice ? (
      <button
        className='btn btn-success btn-lg btn-block'
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
    e.preventDefault()
    const button = document.getElementById('finalize_button_input')
    button.disabled = true
    button.innerText = 'Finalizing...'
    await props._near.contract.finalize({ bid_id: props.bidId }, '200000000000000', '0')
  }

  return (
    <button
      id='finalize_button_input'
      className='btn btn-primary btn-lg btn-block'
      disabled={!props.signedIn || !props.isSafe}
      onClick={(e) => finalizeBid(e)}
    >Finalize
    </button>
  )
}

function AcquireButton (props) {
  async function acquireBid (e) {
    e.preventDefault()
    const button = document.getElementById('acquire_button_input')
    button.disabled = true
    button.innerText = 'Acquiring...'
    // TODO
    // await props._near.contract.acquire({ bid_id: props.bidId, new_public_key: '' }, '200000000000000', '0')
  }

  return (
    <button
      id='acquire_button_input'
      className='btn btn-success btn-lg btn-block'
      disabled={!props.signedIn}
      onClick={(e) => acquireBid(e)}
    >Acquire
    </button>
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
