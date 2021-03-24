import React from 'react'

const fromNear = (s) => parseFloat(s) / 1e24 || 0

const qq = '//'

function loader () {
  return (
  // key='1' is needed by InfiniteScroll
    <div className='d-flex justify-content-center' key='1'>
      <div className='spinner-grow' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  )
}

const mapBidInfo = (b) => {
  return b ? {
    isAtMarket: true,
    numClaims: b.num_claims,
    claimedBy: b.claim_status ? b.claim_status[0] : null,
    claimedTime: b.claim_status ? b.claim_status[1] : null,
    bets: b.bets,
    betPrice: b.bet_price,
    claimPrice: b.claim_price,
    forfeit: b.forfeit,
    isOnAcquisition: b.on_acquisition
  } : {
    isAtMarket: false,
    numClaims: 0,
    claimedBy: null,
    claimedTime: null,
    bets: null,
    betPrice: 0,
    claimPrice: 0,
    forfeit: null,
    isOnAcquisition: false
  }
}

const mapProfile = (p) => {
  return p ? ({
    participation: p.participation,
    acquisitions: p.acquisitions,
    betsVolume: fromNear(p.bets_volume),
    availableRewards: fromNear(p.available_rewards),
    profitTaken: fromNear(p.profit_taken),
    numOffers: p.num_offers,
    numBets: p.num_bets,
    numClaims: p.num_claims,
    numAcquisitions: p.num_acquisitions
  }) : ({
    participation: [],
    acquisitions: [],
    betsVolume: fromNear(0),
    availableRewards: fromNear(0),
    profitTaken: fromNear(0),
    numOffers: 0,
    numBets: 0,
    numClaims: 0,
    numAcquisitions: 0
  })
}

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

function rules () {
  return (
    <div>
      <h4>Hello</h4>
      <ul>
        <p>
        This is NEAR Account Marketplace.
        It allows you to sell, bet and buy NEAR Account names.
        </p>
      </ul>

      <h4>For whom</h4>
      <ul>
        <p>
          Founders &mdash; to allow you to find brilliant account names and place them onto the market for selling.
        </p>
        <p>
          Believers &mdash; to participate in finding fair price, taking rewards for your faithful evaluation and wisdom.
        </p>
        <p>
          Claimers &mdash; to obtain perfect account names for inner usage, personal collection or further resales.
        </p>
      </ul>

      <h4>Basics</h4>
      <ul>
        <p>Initial placement costs 0.3 NEAR + ~1.6 NEAR to deploy a locker contract.
          (The system expects at least 2 NEAR in available balance).
          Initial claim price is 2.5 NEAR. There are two operations available:
        </p>
        <li>
          <p>
            <strong>Place a bet. </strong>
          This costs half of the current price (starts from 1.25 NEAR at initial state).
          The payment goes to previous believers, and the price increases for x1.2 times.
          </p>
        </li>
        <li>
          <p>
            <strong>Claim an account. </strong>
          This costs full price. You need to wait 72 hours to make sure no one wants
          to bet on the account. If someone will bet within 72 hours, you will receive
          all your funds back plus forfeits paid by believer who bets. If no one will bet,
          the account is totally yours, congratulations!
          </p>
        </li>
      </ul>

      <h4>Rewards for bets</h4>
      <ul>
        <p>
        Each new bet triggers the reward distribution function for previous believers.
        This means, if you even bet only once, you will receive rewards multiple times.
        The function converges to 25% rewards for each bet.
        </p>
        <p>
          <i>Example. Let's say, you bet 1.8 NEAR for <strong>apple.near</strong>.
          In a couple days its price has been increased by series of bets,
          and you have been received 2.25 NEAR rewards for that bet in total.
          </i>
        </p>
      </ul>

      <h4>Rewards for claims</h4>
      <ul>
        <p>
          Claim is the most important and unique procedure as it finalizes
          the lifetime of account on the market.
          The rewards for the successful claim are the biggest.
        </p>
        <p>
          First of all, the founder of the account gets 25% of claim price as additional reward.
          It means, even not betting at all, it's still possible to take huge rewards by
          bringing awesome account names to the market.
        </p>
        <p>
          <i>Due to importance of claiming accounts, as it helps for the main purpose of the project,
          the marketplace takes zero commission for claiming.
          </i>
        </p>
      </ul>

      <h4>Commission</h4>
      <ul>
        <p>
          Marketplace takes 5% commission for each bet plus small constant for initial placement (0.3 NEAR).
        </p>
        <p>
          Marketplace takes 2.5% commission in addition, in case of betting for account which is under claiming.
          This is necessary to prevent holding the account with no willing to actually claim it.
          Strategies that disturbing market in such way are not welcomed as they diverge with
          the purpose of the marketplace.
        </p>
        <p>
        Marketplace takes zero commission for claim.
        </p>
      </ul>

      <h4>Forfeits</h4>
      <ul>
        <p>
          Forfeit is an additional cost for placing a bet while the account is under claiming.
          Its value grows linearly from 0% at the moment when claim requested,
          and up to 2.5% at the end of 72-hours period.
          Forfeits are paid to claimers directly.
          The purpose of forfeit is to pay for claimers' willing to obtain an account.
        </p>
      </ul>

      <h4>Specific cases</h4>
      <ul>
        <p>
          Knowing the mechanics, try to find your personal way to reach the maximal value.
          There are couple examples that may help you.
        </p>
        <li>
          <p>
            <strong>Using multiple accounts and place series of bets. </strong>
            As all Believers behind their accounts are anonymous,
            you can use multiple accounts while betting.
            That's why there is no reason to disallow to bet multiple times from the same
            account - you can simply bet from another one.
            You may use this trick if you want to hide your interest or intentions
            by spreading up your bets between multiple accounts.
          </p>
        </li>
        <li>
          <p>
            <strong>Sell the account for the full price. </strong>
            If you are sure about fair price, you shouldn't wait until others bet.
            You can simply bet as many times as necessary to increase the price up
            to the value that makes sense to you.
            In this case you will take at least 87.5% rewards taken from claimer directly,
            not sharing with anyone.
          </p>
        </li>
        <p>
          Also mechanics is tuned in such way to make sure it's impossible to take less than you bet.
        </p>
      </ul>

      <h4>Account acquiring procedure</h4>
      <ul>
        <p>
          <li>(For experts) Replace public key.</li>
          <li>Put seed phrase.</li>
         After acquiring you can remove a contract and return its cost back (~1.6 NEAR).
        </p>
      </ul>

      <h4>Example of distribution</h4>
      <ul>
        <p>
        The following spreadsheet shows rewards distribution for an account
        that has been bet for 15 times and claimed afterwards. 0-th bet means initial
        offering from founder, all other lines correspond to bets.
        </p>
        <p>
          <samp>
          Sum of bets + placement: 90.3439
            <br />Total paid: 128.8614
            <br />Commission: 4.8022
            <br />Rewards after claim:
            <br />0 bet:  0.3000,  rewards:  11.5044,   ratio:  38.3480
            <br />1 bet:  1.2500,  rewards:  1.5625,   ratio:  1.2500
            <br />2 bet:  1.5000,  rewards:  1.8750,   ratio:  1.2500
            <br />3 bet:  1.8000,  rewards:  2.2500,   ratio:  1.2500
            <br />4 bet:  2.1600,  rewards:  2.7000,   ratio:  1.2500
            <br />5 bet:  2.5920,  rewards:  3.2399,   ratio:  1.2499
            <br />6 bet:  3.1104,  rewards:  3.8875,   ratio:  1.2499
            <br />7 bet:  3.7325,  rewards:  4.6641,   ratio:  1.2496
            <br />8 bet:  4.4790,  rewards:  5.5938,   ratio:  1.2489
            <br />9 bet:  5.3748,  rewards:  6.7027,   ratio:  1.2471
            <br />10 bet:  6.4497,  rewards:  8.0118,   ratio:  1.2422
            <br />11 bet:  7.7397,  rewards:  9.5183,   ratio:  1.2298
            <br />12 bet:  9.2876,  rewards:  11.1487,   ratio:  1.2004
            <br />13 bet:  11.1451,  rewards:  12.7271,   ratio:  1.1419
            <br />14 bet:  13.3742,  rewards:  14.6001,   ratio:  1.0917
            <br />15 bet:  16.0490,  rewards:  24.0735,   ratio:  1.5000
            <br />Sum of rewards: 124.0592
          </samp>
        </p>
      </ul>

    </div>
  )
}

export { rules, fromNear, loader, mapBidInfo, mapStats, mapProfile, qq }
