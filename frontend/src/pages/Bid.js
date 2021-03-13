import React from 'react'
import { useParams } from 'react-router'
import Bid from '../components/Bid'

function BidPage (props) {
  const { bidId } = useParams()

  return (
    <div className='container'>
      <div className='row'>
        <div className='col col-12 col-lg-8 col-xl-6'>
          <Bid {...props} bidId={bidId} />
        </div>
      </div>
    </div>
  )
}

export default BidPage
