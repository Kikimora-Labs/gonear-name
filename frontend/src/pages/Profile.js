import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router'
import { BidPreview } from '../components/BidPreview'
import { Link } from 'react-router-dom'
import { qq } from '../components/Helpers'

function ProfilePage (props) {
  const { profileId } = useParams()
  const [profile, setProfile] = useState(null)
  const [claimsOnly, setClaimsOnly] = useState(false)
  const [showRewardsButton] = useState(true)

  async function grabRewards (e) {
    e.preventDefault()
    lowRewards = true
    profile.profitTaken += profile.availableRewards
    profile.availableRewards = 0
    await setProfile(null)
    setProfile(profile)
    props._near.contract.collect_rewards({}, '200000000000000', 0)
  }

  const fetchProfile = useCallback(async () => {
    return await props._near.getProfile(profileId)
  }, [props._near, profileId])

  useEffect(() => {
    if (props.connected) {
      fetchProfile().then(setProfile)
    }
  }, [props.connected, fetchProfile])

  let acquisitions = null
  let participation = null
  if (props.connected && !!profile) {
    acquisitions = profile.acquisitions.map((bidId) => {
      return (
        <BidPreview {...props} key={bidId} bidId={bidId} onAcquisition />
      )
    })
    participation = profile.participation.map((bidId) => {
      return (
        <BidPreview {...props} key={bidId} bidId={bidId} />
      )
    })
  }

  const loader = (
    <div className='d-flex justify-content-center' key='loader'>
      <div className='spinner-grow' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  )

  const participationActive = claimsOnly ? 'nonavigate' : 'navigate'
  const claimsActive = claimsOnly ? 'navigate' : 'nonavigate'

  let lowRewards = profile && profile.availableRewards < 0.1
  const useMyGreen = lowRewards ? '' : 'my-green-big'

  return props.connected && profile ? (
    <div>
      <div className='container g-0 px-5'>
        <div className='d-flex flex-row bd-highlight mb-3'>
          <div className='py-2 bd-highlight my-gray'>
            <h5>{qq} profile</h5>
          </div>
          <div className='p-2 bd-highlight' />
          <div className='p-2 bd-highlight'>
            <h5>{qq} {profileId}</h5>
          </div>
        </div>
        <div className='mb-3 py-2'>
          <h4>Stats</h4>
        </div>

        <div className='row'>
          <div className='col-2' style={{ minWidth: '200px' }}>
            Bets volume:
          </div>
          <div className='col-2' style={{ minWidth: '200px' }}>
            {profile.betsVolume.toFixed(2)} NEAR
          </div>
        </div>
        <div className='row'>
          <div className='col-2' style={{ minWidth: '200px' }}>
          Profit taken:
          </div>
          <div className='col-2' style={{ minWidth: '200px' }}>
            {profile.profitTaken.toFixed(2)} NEAR
          </div>
        </div>
        <div className='row justify-content-start'>
          <div className='col-2' style={{ minWidth: '200px' }}>
          Available rewards:
          </div>
          <div className={`col-2 ${useMyGreen}`} style={{ minWidth: '200px' }}>
            {profile.availableRewards.toFixed(2)} NEAR
          </div>
        </div>
        {profileId === props.signedAccountId ? (
          <div style={{ marginTop: '25px', maxWidth: '320px' }}>
            {showRewardsButton ? (
              <button
                className='btn btn-warning w-100'
                disabled={lowRewards}
                onClick={(e) => grabRewards(e)}
              >Collect rewards
              </button>
            ) : (loader)}
            {lowRewards && <div><small className='gray'>Accumulate at least 0.1 NEAR to collect rewards</small></div>}
          </div>
        ) : (<div />)}
        <div style={{ marginTop: '25px' }} />
        <div>
          <small className='gray'>Number of offers: {profile.numOffers}</small>
        </div>
        <div>
          <small className='gray'>Number of bets: {profile.numBets}</small>
        </div>
        <div>
          <small className='gray'>Number of claims: {profile.numClaims}</small>
        </div>
        <div>
          <small className='gray'>Number of acquisitions (successful claims): {profile.numAcquisitions}</small>
        </div>
        <hr />
      </div>

      <div className='container g-0 px-5'>
        <div className='d-flex flex-row bd-highlight mb-3'>
          <div className='py-2 bd-highlight'>
            <h5>
              <Link className={` ${participationActive}`} to='#' onClick={(e) => { if (claimsOnly) { setClaimsOnly(false) } }}>
            Participating ({profile.participation.length})
              </Link>
            </h5>
          </div>
          <div className='p-2 bd-highlight' />
          <div className='p-2 bd-highlight'>
            <h5>
              <Link className={` ${claimsActive}`} to='#' onClick={(e) => { if (!claimsOnly) { setClaimsOnly(true) } }}>
            Successful claims ({profile.acquisitions.length})
              </Link>
            </h5>
          </div>
        </div>
      </div>
      <div className='container g-0 px-5'>
        {claimsOnly ? (
          acquisitions || loader
        ) : (
          participation || loader
        )}
      </div>
    </div>
  ) : (loader)
}

export default ProfilePage
