import React from 'react'
import useSWR from 'swr'

import { mapStats, rules } from '../components/Helpers'

function StatsPage (props) {
  const fetchStats = async (...args) => {
    return mapStats(await props._near.contract.get_global_stats())
  }

  const { data: stats } = useSWR('global_stats', fetchStats, { errorRetryInterval: 500 })

  return (
    <div className='container'>
      <div className='row'>
        {!stats ? (
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
