import React, { useState } from 'react'
import ls from 'local-storage'
import { fromNear, loader } from '../components/Helpers'

function OfferPage (props) {
  const accountSuffix = props._near.accountSuffix
  const [offerButtonEnabled, setOfferButtonEnabled] = useState(true)

  async function offerBid (e) {
    e.preventDefault()
    setOfferButtonEnabled(false)
    const appTitle = 'Accounts Marketplace'
    if (props.signedIn) {
      props._near.logOut()
    }
    if (props.connected) {
      const dotSuffix = '.' + props._near.accountSuffix
      const offerInputValue = document.getElementById('offerInput').value
      const favorInputValue = document.getElementById('rewardsInput').value
      if (!offerInputValue || !favorInputValue) {
        alert('Account(s) are empty')
        setOfferButtonEnabled(true)
        throw console.error('Account(s) are empty')
      }
      const offerAccountId = offerInputValue.endsWith(dotSuffix) ? offerInputValue : offerInputValue + dotSuffix
      const favorAccountId = favorInputValue.endsWith(dotSuffix) ? favorInputValue : favorInputValue + dotSuffix
      console.log('offerAccountId', offerAccountId)
      console.log('favorAccountId', favorAccountId)
      if (offerAccountId === favorAccountId) {
        alert('Accounts must be different')
        setOfferButtonEnabled(true)
        throw console.error('Accounts must be different')
      }
      const account = await props._near.near.account(offerAccountId)
      let balance = null
      try {
        balance = fromNear((await account.getAccountBalance()).available)
      } catch (e) {
        alert('Account not exist - you have to create it first')
        setOfferButtonEnabled(true)
        throw console.error('Account not exist - you have to create it first')
      }
      console.log(balance)

      if (balance < 1.97619) { // there is a bug shows improper available balance in nearAPI
        alert('Not enough balance - should be at least 2 NEAR available (2.05 total usually works)')
        setOfferButtonEnabled(true)
        throw console.error('Not enough balance - should be at least 2 NEAR available')
      }
      const accessKeys = await account.getAccessKeys()
      ls.set(props._near.lsPrevKeys, accessKeys)
      ls.set(props._near.lsFavorAccountId, favorAccountId)
      ls.set(props._near.lsOfferAccountId, offerAccountId)

      // adding random Full Access Key
      await props._near.walletConnection.requestSignIn(
        '',
        appTitle,
        window.location.origin + '/#/offerProcess',
        window.location.origin + '/#/offer'
      )
    }
  }

  return (
    <div className='container my-auto'>
      <h1 className='text-center'>Offer your account</h1>
      <h2 className='text-center'>
                Here you can offer your account to the Market.
                Choose an account to transfer all rewards after claiming your account.
      </h2>
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
            {offerButtonEnabled ? (<button className='btn btn-outline-warning mt-5 w-100'>Offer</button>) : (loader())}
          </div>
        </div>
      </form>
    </div>
  )
}

export default OfferPage
