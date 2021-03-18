import React, { useState } from 'react'
import { loader, fromNear } from './Helpers'
import { Link } from 'react-router-dom'

function RewardsButton (props) {
  const [showRewardsButton, setShowRewardsButton] = useState(true)
  async function grabRewards (e) {
    e.preventDefault()
    setShowRewardsButton(false)
    await props._near.contract.collect_rewards({}, '200000000000000', 0)
    setShowRewardsButton(true)
  }

  return showRewardsButton ? (
    <button
      className='btn btn-primary'
      disabled={!props.signedIn}
      onClick={(e) => grabRewards(e)}
    >
      Grab the rewards!
    </button>
  ) : (
    loader()
  )
}

function AcquireButton (props) {
  return (
    <div>
      <Link
        to={`/acquire/${props.bidId}`}
        className='btn btn-success'
      >
Acquire
      </Link>
    </div>
  )
}

function PriceButton (props) {
  return (
    <div>
      <Link
        to={`/bid/${props.bidId}`}
        className='btn btn-success'
      >
Starts from {(fromNear(props.price) + fromNear(props.forfeit)).toFixed(2)} NEAR
      </Link>
    </div>
  )
}

function DetailsButton (props) {
  return (
    <div>
      <Link
        to={`/bid/${props.bidId}`}
        className='btn btn-primary'
      >
Details
      </Link>
    </div>
  )
}

export { PriceButton, DetailsButton, AcquireButton, RewardsButton }
