import React, { useEffect, useState, useCallback } from 'react'
import ls from 'local-storage'
import { loader } from '../components/Helpers'

function OfferPage (props) {
  const accountSuffix = props._near.accountSuffix

  async function offerBid (e) {
    e.preventDefault()
    const appTitle = 'Accounts Marketplace'
    if (props.signedIn) {
      props._near.logOut()
    }
    ls.set(props._near.lsFavorAccountId, document.getElementById('offerInput').value + '.' + props._near.accountSuffix)
    ls.set(props._near.lsPrevKeys, accessKeys)
    // adding random Full Access Key
    await props._near.walletConnection.requestSignIn(
      '',
      appTitle
    )
  }

  const [accessKeys, setAccessKeys] = useState(null)

  const fetchAccessKeys = useCallback(async () => {
    return await props._near.account.getAccessKeys()
  }, [props._near])

  useEffect(() => {
    if (props.connected) {
      fetchAccessKeys().then(setAccessKeys)
    }
  }, [props.connected, fetchAccessKeys])

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
            <label htmlFor='exampleInputEmail1'>Offer my account in favor of</label>
            <div className={'account-suffix account-suffix-' + accountSuffix}>
              <input
                type='text' className='form-control mt-2' id='offerInput'
                placeholder='Example: satoshi'
              />
            </div>
            <small id='emailHelp' className='form-text text-muted'>All rewards will be transferred to this account</small>
            <br />
            {props.connected ? (
              <button className='btn btn-outline-warning mt-5 w-100'>Offer</button>) : (loader())}
          </div>
        </div>
      </form>
    </div>
  )
}

export default OfferPage
