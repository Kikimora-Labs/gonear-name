import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router'
import { BidPreview } from '../components/BidPreview'
import { RewardsButton } from '../components/Buttons'

function ProfilePage (props) {
  const { profileId } = useParams()
  const [profile, setProfile] = useState(null)

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

  return (
    <div>
      <div className='container'>
        {props.connected ? (
          <div className='row justify-content-md-center'>
            {!profile ? (
              <div className='col col-12 col-lg-8 col-xl-6'>
                <div className='d-flex justify-content-center'>
                  <div className='spinner-grow' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3>Stats</h3>
                <ul>
                  <li>Bets volume: {profile.betsVolume.toFixed(2)} NEAR</li>
                  <li>Available rewards: {profile.availableRewards.toFixed(2)} NEAR</li>
                  {profileId === props.signedAccountId ? (
                    (profile.availableRewards > 0.1
                      ? (<RewardsButton {...props} availableRewards={profile.availableRewards} isMe={profileId === props.signedAccountId} />
                      ) : (
                        <small className='gray'>Accumulate at least 0.1 NEAR to grab your rewards</small>
                      )
                    )
                  ) : (<div />)}
                  <li>Profit taken: {profile.profitTaken.toFixed(2)} NEAR</li>
                  <li>Number of offers: {profile.numOffers}</li>
                  <li>Number of bets: {profile.numBets}</li>
                  <li>Number of claims: {profile.numClaims}</li>
                  <li>Number of acquisitions (successful claims): {profile.numAcquisitions}</li>
                </ul>
              </div>
            )}
          </div>) : (<div />)}
        <div className='col'>
          <h3>Successful claims</h3>
          {acquisitions || loader}
        </div>
        <div className='col'>
          <h3>Participating</h3>
          {participation || loader}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
