import React from 'react'
import ls from 'local-storage'

function OfferPage (props) {
  const accountSuffix = props._near.accountSuffix

  async function offerBid (e) {
    e.preventDefault()
    const appTitle = 'Accounts Marketplace'
    if (props.signedIn) {
      props._near.logOut()
    }
    if (props.connected) {
      const offerAccountId = document.getElementById('offerInput').value + '.' + props._near.accountSuffix
      const account = await props._near.near.account(offerAccountId)
      const accessKeys = await account.getAccessKeys()
      ls.set(props._near.lsPrevKeys, accessKeys)
      ls.set(props._near.lsFavorAccountId, document.getElementById('rewardsInput').value + '.' + props._near.accountSuffix)
      ls.set(props._near.lsOfferAccountId, offerAccountId)

      // adding random Full Access Key
      await props._near.walletConnection.requestSignIn(
        '',
        appTitle
      )
    }
  }

  const msg = ls.get(props._near.lsMsg)
  // TODO clear msg
  // ls.set(props._near.lsMsg, null)

  return (
    <div className='container my-auto'>
      <h1 className='text-center'>Offer your account</h1>
      <h2 className='text-center'>
                Here you can offer your account to the Market.
                Choose an account to transfer all rewards after claiming your account.
      </h2>
      {msg ? (<h3>{msg}</h3>) : (<div />)}

      <form onSubmit={(e) => offerBid(e)}>
        <div className='d-flex align-items-center justify-content-center'>
          <div className='form-group' style={{ width: '400px', margin: '25px' }}>
            <label htmlFor='exampleInputEmail1'>Account you offer</label>
            <div className={'account-suffix account-suffix-' + accountSuffix}>
              <input
                type='text' className='form-control mt-2' id='offerInput'
                placeholder='Example: satoshi'
              />
            </div>
            <small id='emailHelp' className='form-text text-muted'>All your access keys will be removed</small>
            <div style={{ margin: '25px' }} />
            <label htmlFor='exampleInputEmail1'>Account which takes rewards</label>
            <div className={'account-suffix account-suffix-' + accountSuffix}>
              <input
                type='text' className='form-control mt-2' id='rewardsInput'
                placeholder='Example: vitalik'
              />
            </div>
            <small id='emailHelp' className='form-text text-muted'>All rewards will be transferred to this account</small>
            <br />
            <button className='btn btn-outline-warning mt-5 w-100'>Offer</button>
            <h2 className='text-center'>
                DO NOT REFRESH THIS PAGE UNTIL YOU SEE RESULTS
            </h2>
          </div>
        </div>
      </form>
    </div>
  )
}

export default OfferPage
