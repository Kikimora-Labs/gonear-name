import React from 'react'
import { fromNear } from './Helpers'
import { Link } from 'react-router-dom'

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
Starts from {(fromNear(props.price) + fromNear(props.forfeit)).toFixed(2)} NEAR
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
