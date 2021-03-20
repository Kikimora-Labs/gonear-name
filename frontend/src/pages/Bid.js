import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Contract } from 'near-api-js'
import { BidActions } from '../components/BidActions'
import { mapBidInfo } from '../components/BidPreview'
import Moment from 'react-moment'

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
    let lockerOwner = '(not found)'
    try {
      const lockerContract = await new Contract(account, bidId, {
        viewMethods: ['get_owner'],
        changeMethods: []
      })
      lockerOwner = await lockerContract.get_owner({})
    } catch (e) {
      console.log('check safety error', e)
    }
    return { codeHash, accessKeysLen, lockerOwner }
  }, [props._near, bidId])

  useEffect(() => {
    if (props.connected) {
      fetchBidInfo().then(setBidInfo)
      fetchBidSafety().then(setBidSafety)
    }
  }, [props.connected, fetchBidInfo, fetchBidSafety, bidId])

  const isReady = !!bidInfo && !!bidSafety

  const isSafe = bidSafety &&
  bidSafety.codeHash === 'DKUq738xnns9pKjpv9GifM68UoFSmfnBYNp3hsfkkUFa' &&
  bidSafety.accessKeysLen === 0 &&
  bidSafety.lockerOwner === props._near.config.contractName

  let claimedTime = null
  let timeLeft = null
  if (bidInfo) {
    timeLeft = parseInt(bidInfo.claimedTime / 1000000)
    claimedTime = new Intl.DateTimeFormat('UK', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timeLeft)
  }

  Moment.startPooledTimer(1000)

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
                    expected DKUq738xnns9pKjpv9GifM68UoFSmfnBYNp3hsfkkUFa
                    <br />
                  Amount of Access Keys: {bidSafety.accessKeysLen}, expected 0
                    <br />
                    Contract owner: {bidSafety.lockerOwner}, expected {props._near.config.contractName}
                    <br />
                  THE ACCOUNT IS NOT CONSIDERED SAFE, YOU ASKED NOT TO PARTICIPATE
                  </h2>
                ) : (<h2>Account is safe</h2>)}

                {bidInfo.claimedBy ? (
                  <div>
                    <p>
                    Claimed by {bidInfo.claimedBy}
                    </p>
                    {!bidInfo.isOnAcquisition ? (
                      <div>
                        <div>
                    Claimed time: {claimedTime}
                        </div>
                        <div>
                    Time left:  <Moment date={timeLeft} format='hh:mm:ss' add={{ seconds: props._near.claimPeriod }} durationFromNow />
                        </div>
                      </div>
                    ) : (<div />)}
                  </div>
                ) : (
                  <div>
                    <p>
               No one claimed yet
                    </p>
                  </div>
                )}
                <div>
                  <h2>
              Accounts who participate:
                  </h2>
                  {bidInfo.bets.map((data, index) => {
                    return (
                      <div key={index}>{data}</div>
                    )
                  })}
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
