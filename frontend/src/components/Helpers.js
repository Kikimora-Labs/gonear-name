import React from 'react'

const fromNear = (s) => parseFloat(s) / 1e24 || 0

function OfferButton (props) {
  async function offerBid (e) {
    e.preventDefault()
    await props._near.contract.offer({ profile_id: document.getElementById('offer_input').value }, '200000000000000', String(parseInt(0.45 * 1e9)) + '000000000000000')
  }

  return (
    <div>
      <form onSubmit={(e) => offerBid(e)}>
        <div className='input-group mb-3'>
          <button
            className='btn btn-primary'
            disabled={!props.signedIn}
            onClick={(e) => offerBid(e)}
          >Offer current account in favor of
          </button>
          <input id='offer_input' type='text' className='form-control' placeholder='satoshi.testnet' aria-label='Username' aria-describedby='basic-addon1' />
        </div>
      </form>
    </div>
  )
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
        <p>Initial placement costs ~0.42 NEAR. Initial claim price is 1 NEAR. There are two operations available:</p>
        <li>
          <p>
            <strong>Place a bet. </strong>
          This costs half of the current price (starts from 0.5 NEAR at initial state).
          The payment goes to previous believers, and the price increases for x1.2 times.
          </p>
        </li>
        <li>
          <p>
            <strong>Claim an account. </strong>
          This costs full price. You need to wait 48 hours to make sure no one wants
          to bet on the account. If someone will bet within 48 hours, you will receive
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
          <i>Example. Let's say, you bet 0.6 NEAR for <strong>apple.near</strong>.
          In a couple days its price has been increased by series of bets,
          and you have been received 0.75 NEAR rewards for that bet in total.
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
          Marketplace takes 5% commission for each bet plus small constant for initial placement (~0.42 NEAR).
        </p>
        <p>
          Marketplace takes 5% commission in addition, in case of betting for account which is under claiming.
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
          and up to 20% at the end of 48-hours period.
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
            In this case you may take up to 87.5% rewards taken from claimer directly,
            not sharing with anyone.
          </p>
        </li>
        <p>
          Also mechanics is tuned in such way to make sure it's impossible to take less than you bet.
        </p>
      </ul>

      <h4>Account claiming procedure</h4>
      <ul>
        <p>
         1. (For experts) replace public key
         2. TBD
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
          Claim price: 15.407
            <br />
            Sum of bets: 36.4342
            <br />
            Commission: 2.2175
            <br />
            0 bet:  0.4167,  rewards:  4.6018,   ratio:  11.0442
            <br />
 1 bet:  0.5000,  rewards:  0.6250,   ratio:  1.2500
            <br />
 2 bet:  0.6000,  rewards:  0.7500,   ratio:  1.2500
            <br />
 3 bet:  0.7200,  rewards:  0.9000,   ratio:  1.2500
            <br />
 4 bet:  0.8640,  rewards:  1.0800,   ratio:  1.2500
            <br />
 5 bet:  1.0368,  rewards:  1.2959,   ratio:  1.2499
            <br />
 6 bet:  1.2442,  rewards:  1.5550,   ratio:  1.2499
            <br />
 7 bet:  1.4930,  rewards:  1.8656,   ratio:  1.2496
            <br />
 8 bet:  1.7916,  rewards:  2.2375,   ratio:  1.2489
            <br />
 9 bet:  2.1499,  rewards:  2.6811,   ratio:  1.2471
            <br />
 10 bet:  2.5799,  rewards:  3.2047,   ratio:  1.2422
            <br />
 11 bet:  3.0959,  rewards:  3.8073,   ratio:  1.2298
            <br />
 12 bet:  3.7150,  rewards:  4.4595,   ratio:  1.2004
            <br />
 13 bet:  4.4581,  rewards:  5.0908,   ratio:  1.1419
            <br />
 14 bet:  5.3497,  rewards:  5.8400,   ratio:  1.0917
            <br />
 15 bet:  6.4196,  rewards:  9.6294,   ratio:  1.5000
            <br />
 Sum of rewards: 49.6237
          </samp>
        </p>
      </ul>

    </div>
  )
}

export { rules, fromNear, OfferButton }
