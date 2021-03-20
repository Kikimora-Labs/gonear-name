import React, { useCallback, useEffect, useState } from 'react'
import { fromNear, rules } from '../components/Helpers'

const mapStats = (s) => {
  return {
    numProfiles: s[0],
    numBids: s[1],
    totalCommission: fromNear(s[2]),
    numOffers: s[3],
    numBets: s[4],
    numClaims: s[5],
    numAcquisitions: s[6]
  }
}

function StatsPage (props) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    const [stats] = await Promise.all([
      props._near.contract.get_global_stats()
    ])
    return mapStats(stats)
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
                <li>Active profiles: {stats.numProfiles}</li>
                <li>Active bids: {stats.numBids}</li>
                <li>Number of offers: {stats.numOffers}</li>
                <li>Number of bets: {stats.numBets}</li>
                <li>Number of claims: {stats.numClaims}</li>
                <li>Number of acquisitions (successful claims): {stats.numAcquisitions}</li>
                <li>Total commission: {stats.totalCommission.toFixed(2)}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsPage
