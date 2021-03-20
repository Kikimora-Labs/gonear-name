import './Buttons.scss'
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
        className='py-2 px-2 badge rounded-pill w-100 butnavigate'
        style={{ textDecoration: 'none', color: 'white' }}
      >
Acquire
      </Link>
    </div>
  )
}

function PriceButton (props) {
  return (
    <Link
      className='py-2 px-2 badge rounded-pill w-100 butnavigate'
      to={`/bid/${props.bidId}`}
      style={{ textDecoration: 'none', color: 'white' }}
    >
Starts from {(fromNear(props.price) + fromNear(props.forfeit)).toFixed(2)} NEAR
    </Link>
  )
}

function DetailsButton (props) {
  return (
    <Link
      to={`/bid/${props.bidId}`}
      className='py-2 px-2 badge rounded-pill w-100 butnavigate'
      style={{ textDecoration: 'none', color: 'white' }}
    >
Details
    </Link>
  )
}

export { PriceButton, DetailsButton, AcquireButton, RewardsButton }
