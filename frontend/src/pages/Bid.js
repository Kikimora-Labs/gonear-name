import React from 'react'
import { useParams } from 'react-router'
import { Contract } from 'near-api-js'
import Moment from 'react-moment'
import { Link } from 'react-router-dom'
import useSWR from 'swr'

import { BetButton, ClaimButton, FinalizeButton, AcquireButton } from '../components/BidActions'
import { NEAR, qq, loader, mapBidInfo, mapProfile, fromNear } from '../components/Helpers'

function BidPage (props) {
  const { bidId } = useParams()

  const fetchBid = async (...args) => {
    return mapBidInfo(await props._near.contract.get_bid({
      bid_id: args[1]
    }))
  }

  const fetchBidSafety = async (...args) => {
    const bidId = args[1]
    const account = await props._near.near.account(bidId)
    try {
      const codeHash = (await account.state()).code_hash
      const accessKeysLen = (await account.getAccessKeys()).length
      const lockerContract = await new Contract(account, bidId, {
        viewMethods: ['get_owner'],
        changeMethods: []
      })
      const lockerOwner = await lockerContract.get_owner({})
      const balance = (await account.getAccountBalance()).total
      return { codeHash, accessKeysLen, lockerOwner, balance }
    } catch (e) {
      console.log('check safety error', e)
    }
    return { codeHash: '(unknown)', accessKeysLen: '(unknown)', lockerOwner: '(not found)', balance: 0 }
  }

  const { data: bidInfo } = useSWR(['bid_id', bidId], fetchBid, { errorRetryInterval: 250 })
  const { data: bidSafety } = useSWR(['bid_id_safety', bidId], fetchBidSafety, { errorRetryInterval: 250 })

  const isReady = !!bidInfo && !!bidSafety

  const isSafe = isReady &&
  (!bidInfo.isAtMarket ||
  (bidSafety.codeHash === 'DKUq738xnns9pKjpv9GifM68UoFSmfnBYNp3hsfkkUFa' &&
  bidSafety.accessKeysLen === 0 &&
  bidSafety.lockerOwner === props._near.config.contractName))

  const balance = bidSafety && fromNear(bidSafety.balance)

  let claimedTime = null
  let timeLeft = null
  if (bidInfo) {
    timeLeft = parseInt(bidInfo.claimedTime / 1000000)
    claimedTime = new Intl.DateTimeFormat('UK', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timeLeft)
  }

  const founder = bidInfo && bidInfo.bets && bidInfo.bets[0]
  const believers = bidInfo && bidInfo.bets && bidInfo.bets.slice(1).map((data, index) => {
    return (
      <div key={index} className='row'>
        <div className='col-2' style={{ minWidth: '200px' }}>
          <Link className='nonavigate' to={`/profile/${data}`}>{data}</Link>
        </div>
        <div className='col-2' style={{ minWidth: '200px' }}>
          {NEAR}{(1.25 * Math.pow(1.2, index)).toFixed(2)}
        </div>
      </div>
    )
  })

  const fetchProfile = async (...args) => {
    return mapProfile(await props._near.contract.get_profile({ profile_id: args[1] }))
  }

  const { data: profile } = useSWR(['profile_id', props._near.accountId], fetchProfile, { errorRetryInterval: 500 })

  // TESTS
  // no safe
  // if (bidInfo) { isSafe = false }
  // bet & claim
  // if (bidInfo) { bidInfo.claimedBy = null; bidInfo.isAtMarket = true; bidInfo.isOnAcquisition = false; profile.acquisitions = [] }
  // only bet
  // if (bidInfo) { bidInfo.claimedBy = 'profile.near'; bidInfo.isAtMarket = true; bidInfo.isOnAcquisition = false; profile.acquisitions = [] }
  // finalize
  // if (bidInfo) { bidInfo.claimedBy = 'profile.near'; bidInfo.isAtMarket = true; bidInfo.isOnAcquisition = true; profile.acquisitions = [] }
  // acquire
  // if (bidInfo) { bidInfo.claimedBy = 'kpr.testnet'; bidInfo.isAtMarket = false; bidInfo.isOnAcquisition = true; profile.acquisitions = ['blab.testnet'] }
  // claimed by someone
  // if (bidInfo) { bidInfo.claimedBy = 'profile.near'; bidInfo.isAtMarket = false; bidInfo.isOnAcquisition = true; profile.acquisitions = [] }
  // no
  // if (bidInfo) { bidInfo.claimedBy = null; bidInfo.isAtMarket = false; bidInfo.isOnAcquisition = false; profile.acquisitions = [] }

  let isMine = false
  if (props.signedIn && profile) {
    profile.acquisitions.forEach(profileBidId => {
      if (bidId === profileBidId) {
        isMine = true
      }
    })
  }

  const isProfitable = bidInfo && bidInfo.claimPrice && balance > fromNear(bidInfo.claimPrice)

  const showBetClaim = bidInfo && bidInfo.isAtMarket && !bidInfo.isOnAcquisition
  const showFinalize = bidInfo && bidInfo.isAtMarket && bidInfo.isOnAcquisition
  const showAcquire = bidInfo && !bidInfo.isAtMarket && isMine

  Moment.startPooledTimer(1000)

  return props.connected && isReady ? (
    <div>
      <div className='container g-0 px-5'>
        <div className='d-flex flex-row bd-highlight mb-3'>
          <div className='py-2 bd-highlight my-gray'>
            <h5>{qq} bid</h5>
          </div>
          <div className='p-2 bd-highlight' />
          <div className='p-2 bd-highlight'>
            <h5>{qq} {bidId}</h5>
          </div>
        </div>

        {!isSafe ? (
          <div className='mb-3 py-2'>
            <h4>Account is not considered safe. What does it mean?</h4>
            <div className='pb-4'>You are suggested not to participate with the bid.</div>
            <div>The validation consist of three steps to make sure everything is going properly under smart contract rules:</div>
            <li className='small'>There must be a contract deployed onto the bid with hash equal to "DKUq738xnns9pKjpv9GifM68UoFSmfnBYNp3hsfkkUFa"</li>
            <li className='small'>There must be no access keys</li>
            <li className='small'>Owner of the locker must be equal to the account of the Marketplace {props._near.config.contractName}</li>
            <div className='py-4'>The following conditions are found:</div>
            <li className='small'>Hash of the contract is "{bidSafety.codeHash}"</li>
            <li className='small'>There are {bidSafety.accessKeysLen} keys found</li>
            <li className='small'>Owner of the locker is {bidSafety.lockerOwner}</li>
          </div>
        ) : (
          <div>
            <div>
              {bidInfo.claimedBy ? (
                <div className='mb-3 py-2'>
                  <div>Claimed by <Link className='nonavigate' to={`/profile/${bidInfo.claimedBy}`}>{bidInfo.claimedBy}</Link></div>
                  <small className='gray'>Claimed time: {claimedTime}</small>

                  {showBetClaim ? (
                    <div className='d-flex flex-row bd-highlight mt-3'>
                      <div className='py-2 bd-highlight'>Will be successfully claimed after</div>
                      <div className='p-2 bd-highlight' />
                      <div className='p-2 bd-highlight my-green-big h5'>
                        <Moment date={timeLeft} format='hh:mm:ss' add={{ seconds: props._near.claimPeriod }} durationFromNow />
                      </div>
                    </div>
                  ) : (<div />)}

                </div>
              ) : (bidInfo.isAtMarket ? <div className='mb-3 py-2'>Not claimed yet</div> : <div className='mb-3 py-2'>Not here yet. Is it a good fit?</div>)}
            </div>

            <div style={{ maxWidth: '400px' }}>
              {showBetClaim && <BetButton {...props} bidId={bidId} bidInfo={bidInfo} isSafe={isSafe} />}
              {showBetClaim && <ClaimButton {...props} bidId={bidId} bidInfo={bidInfo} isSafe={isSafe} />}
              {showFinalize && <FinalizeButton {...props} bidId={bidId} bidInfo={bidInfo} isSafe={isSafe} />}
              {showAcquire && <AcquireButton {...props} bidId={bidId} bidInfo={bidInfo} isSafe={isSafe} />}
              <div className='pt-3'>
                Bid balance: {NEAR}{balance.toFixed(2)}
              </div>
              {isProfitable
                ? <div className='my-green-big pb-2'>PROFITABLE! <span className='small'>Bid balance is higher than claim price</span></div> : <div />}
              <div className='small gray'>You will possess all bid balance in case of successful claim</div>

            </div>
            <hr />
            {showBetClaim &&
              <div className='small'>
                <div className='pb-2'>What do the buttons mean?</div>
                <div className='gray'>When you believe the bid is underestimated and will be claimed for higher price, choose «Bet» option. </div>
                <div className='gray'>You will receive rewards for each bet on top of yours, or for successful claim &mdash; up to 50%.  </div>
                <div className='gray pt-2'>When you want to claim the bid, choose «Claim» option.</div>
                <div className='gray'>If no one overbid you in the next 72 hours, the bid will be yours.</div>
                <div className='gray pt-2'>Dive into <Link to='/rules'>the rules</Link> for more details.</div>
                <hr />
              </div>}
            {bidInfo.isAtMarket &&
              <div>
                <div className='mb-3 py-2'>
                  <h5>Competitors</h5>
                </div>
                <div className='mb-2'>
                  <div>Founded by: <Link className='nonavigate' to={`/profile/${founder}`}>{founder}</Link></div>
                </div>
                {believers}
              </div>}
          </div>
        )}
      </div>

    </div>
  ) : (loader())
}

export default BidPage
