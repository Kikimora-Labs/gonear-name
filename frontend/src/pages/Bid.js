import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { BidActions } from '../components/BidActions'
import { mapBidInfo } from '../components/BidPreview'

function BidPage (props) {
  const { bidId } = useParams()

  const [bidInfo, setBidInfo] = useState(null)
  const [bidSafety, setBidSafety] = useState(null)

  const fetchBidInfo = useCallback(async () => {
    const bidInfo = mapBidInfo(await props._near.contract.get_bid({
      bid_id: bidId
    }))
    return bidInfo
  }, [props._near, bidId])

  const fetchBidSafety = useCallback(async () => {
    const account = await props._near.near.account(bidId)
    const codeHash = (await account.state()).code_hash
    const accessKeysLen = (await account.getAccessKeys()).length
    return { codeHash, accessKeysLen }
  }, [props._near, bidId])

  useEffect(() => {
    if (props.connected) {
      fetchBidInfo().then(setBidInfo)
      fetchBidSafety().then(setBidSafety)
    }
  }, [props.connected, fetchBidInfo, fetchBidSafety, bidId])

  const isReady = !!bidInfo && !!bidSafety

  const isSafe = bidSafety && bidSafety.codeHash === '6n1W8Dpr2nAJ6NmvsirNz82my8d6MAu29gDC377BwuTC' && bidSafety.accessKeysLen === 0

  return (
    <div className='container'>
      <div className='row'>
        <div className='col col-12 col-lg-8 col-xl-6'>
          {isReady ? (
            <div className='bid m-2'>
              <div className='bid-body text-start'>
                <h3>{bidId}</h3>
                {!isSafe ? (
                  <h2>
                    Hash of the contract: {bidSafety.codeHash}
                    <br />
                    expected 6n1W8Dpr2nAJ6NmvsirNz82my8d6MAu29gDC377BwuTC
                    <br />
                  Amount of Full Access Keys: {bidSafety.accessKeysLen}, expected 0
                    <br />
                  THE ACCOUNT IS NOT CONSIDERED SAFE, YOU ASKED NOT TO PARTICIPATE
                  </h2>
                ) : (<h2>Account is safe</h2>)}

                {bidInfo.claimedBy ? (
                  <div>
                    <p>
                    (claimed data)
                    </p>
                  </div>
                ) : (
                  <div>
                    <p>
              (claimed data)
                    </p>
                  </div>
                )}
                <div>
                  <p>
              Accounts who participate:
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
                <BidActions {...props} bidId={bidId} bidInfo={bidInfo} isSafe={isSafe} />
                <div className='row text-muted text-start'>
        Price breakdown:
        ...
                  <p>
          blah
                  </p>
                </div>
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
