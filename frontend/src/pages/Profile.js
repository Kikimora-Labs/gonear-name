import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router'
import uuid from 'react-uuid'
import BidPreview from '../components/BidPreview'
import InfiniteScroll from 'react-infinite-scroller'

const FetchLimit = 25

function ProfilePage (props) {
  const { profileId } = useParams()
  const [feed, setFeed] = useState([])
  const [profile, setProfile] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [gkey] = useState(uuid())

  // TODO do it in React way
  if (props._near.getProfile) {
    Promise.resolve((async () => {
      setProfile(await props._near.getProfile(profileId))
    })())
  }
  const fetchMore = async () => {
    const f = [...feed]
    const lastKey = f.length > 0 ? f[f.length - 1] : null
    const fetched = await props._near.contract.get_top_bets({
      from_key: lastKey,
      limit: FetchLimit
    })
    f.push(...fetched)
    if (fetched.length === 0) {
      setHasMore(false)
    }
    setFeed(f)
  }

  useEffect(() => {
    if (props.connected) {
      setHasMore(true)
    }
  }, [props.connected])

  const bids = feed.map(([rating, bidId]) => {
    const key = `${gkey}-${bidId}`
    return (
      <BidPreview {...props} key={key} bidId={bidId} rating={rating} />
    )
  })

  const loader = (
    <div className='d-flex justify-content-center' key={`${gkey}-loader`}>
      <div className='spinner-grow' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  )

  return (
    <div>
      <div className='container'>
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
            <div className='col col-12 col-lg-4 col-xl-4'>
              <h3>Stats</h3>
              <ul>
                <li>Bets volume: {profile.betsVolume.toFixed(2)} NEAR</li>
                <li>Available rewards: {profile.availableRewards.toFixed(2)} NEAR</li>
                <li>TODO BUTTON TO COLLECT REWARDS</li>
                <li>TODO PRINT OTHER LOCAL STATS</li>
              </ul>
            </div>
          )}
        </div>
        <div className='col'>
          <h3>Successful claims</h3>
          <InfiniteScroll
            pageStart={0}
            loadMore={fetchMore}
            hasMore={hasMore}
            loader={loader}
          >
            {bids}
          </InfiniteScroll>
        </div>
        <div className='col'>
          <h3>Participating</h3>
          <InfiniteScroll
            pageStart={0}
            loadMore={fetchMore}
            hasMore={hasMore}
            loader={loader}
          >
            {bids}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
