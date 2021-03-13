import React, { useCallback, useEffect, useState } from 'react'
import { fromNear, rules } from '../components/Helpers'

function StatsPage (props) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    const [numProfiles, numBids] = await Promise.all([
      props._near.contract.get_num_profiles(),
      props._near.contract.get_num_bids()
    ])
    return {
      numProfiles,
      numBids
    }
  }, [props._near])

  useEffect(() => {
    if (props.connected) {
      fetchStats().then((stats) => {
        setStats(stats)
        setLoading(false)
      })
    }
  }, [props.connected, fetchStats])

  return (
    <div className='container'>
      <div className='row'>
        {loading ? (
          <div className='col'>
            <div className='d-flex justify-content-center'>
              <div className='spinner-grow' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className='col col-12 col-lg-8 col-xl-8'>
            {rules()}
            <div>
              <h3>Global Stats</h3>
              <ul>
                <li>Num profiles: {stats.numProfiles}</li>
                <li>Num accounts: {stats.numBids}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsPage
