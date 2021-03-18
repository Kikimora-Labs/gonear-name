import React from 'react'
import { loader } from '../components/Helpers'

function OfferProcessPage (props) {
  let finished = false
  let success = false
  if (props.connected) {
    finished = props.offerFinished
    success = props.offerSuccess
  }

  return (
    <div className='container my-auto'>
      <h1 className='text-center'>Offer processing</h1>
      {finished
        ? (success
          ? (
            <h2 className='alert alert-success' role='alert'>
            Success!
            </h2>
          ) : (
            <h2 className='alert alert-danger' role='alert'>
            Something went wrong
            </h2>
          )
        ) : (
          <div>
            <div style={{ margin: '25px' }} />
            {loader()}
            <h2 className='alert alert-warning' role='alert'>
            Do not refresh or close the page
            </h2>

            <h2 className='alert alert-secondary' role='alert'>
            It may take up to 5 minutes to complete
            </h2>
          </div>
        )}

    </div>
  )
}

export default OfferProcessPage
