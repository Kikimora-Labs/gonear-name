import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { BuyButton } from '../components/Helpers'

const mapBidInfo = (b) => {
  return b ? {
    numClaims: b.num_claims,
    claimedBy: b.claim,
    bets: b.bets,
    betPrice: b.bet_price,
    claimPrice: b.claim_price,
    forfeit: b.forfeit,
    onAcquisition: b.on_acquisition
  } : {
    numClaims: 0,
    claimedBy: null,
    bets: null,
    betPrice: 0,
    claimPrice: 0,
    forfeit: null,
    onAcquisition: false
  }
}

function BidPage (props) {
  const { bidId } = useParams()

  console.log(bidId)

  const [bidInfo, setBidInfo] = useState(null)
  const refreshTime = props.refreshTime
  const hidden = props.hidden

  const fetchInfo = useCallback(async () => {
    const bidInfo = mapBidInfo(await props._near.contract.get_bid({
      bid_id: bidId
    }))
    bidInfo.refreshTime = refreshTime
    return bidInfo
  }, [props._near, bidId, refreshTime])

  console.log(bidInfo)

  useEffect(() => {
    if (props.connected && !hidden) {
      fetchInfo().then(setBidInfo)
    }
  }, [props.connected, fetchInfo, bidId, hidden])

  return (
    <div className='container'>
      <div className='row'>
        <div className='col col-12 col-lg-8 col-xl-6'>
          {bidInfo ? (
            <div className='bid m-2'>
              <div className='bid-body text-start'>
                <h3>{bidId}</h3>
                {bidInfo.claimedBy ? (
                  <div>
                    <p>
              Claimed by {bidInfo.claimedBy[0]}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p>
              Not claimed by anyone.
                    </p>
                  </div>
                )}
                <div>
                  <p>
              Accounts who bet:
                  </p>
                  <table className='table'>
                    <tbody>
                      {bidInfo.bets.map((data, index) => {
                        return (
                          <tr key={index}>
                            {data}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='text-center'>
                <BuyButton {...props} bidId={bidId} bet={bidInfo.betPrice} forfeit={bidInfo.forfeit} claim={bidInfo.claimPrice} />
              </div>
            </div>
          ) : (
            <div className='bid m-2'>
              <div className='d-flex justify-content-center'>
                <div className='spinner-grow' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BidPage
