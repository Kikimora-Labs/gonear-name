import React from 'react'
import { fromNear } from './Helpers'
import { Link } from 'react-router-dom'

function PriceButton (props) {
  return (
    <div>
      <Link
        to={`/bid/${props.bidId}`}
        className='btn btn-success' disabled={!props.signedIn}
      >
        {fromNear(props.price).toFixed(2)} NEAR
      </Link>
    </div>
  )
}

export default PriceButton
