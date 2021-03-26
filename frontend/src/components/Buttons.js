import React from 'react'
import { Link } from 'react-router-dom'

import { NEAR, fromNear } from './Helpers'

function AcquireButton (props) {
  return (
    <div>
      <Link
        to={`/acquire/${props.bidId}`}
        className='btn w-100 btn-success'
      >
Acquire
      </Link>
    </div>
  )
}

function PriceButton (props) {
  return (
    <Link
      className='btn w-100 btn-success'
      to={`/bid/${props.bidId}`}
    >
Starts&nbsp;from {NEAR}{(fromNear(props.price) + fromNear(props.forfeit)).toFixed(2)}
    </Link>
  )
}

function DetailsButton (props) {
  return (
    <Link
      to={`/bid/${props.bidId}`}
      className='btn w-100 btn-success'
    >
Details
    </Link>
  )
}

export { PriceButton, DetailsButton, AcquireButton }
