import React, { useCallback, useEffect, useState } from 'react'

function AddMarketKeyButton (props) {
  async function AddMarketKey (e) {
    e.preventDefault()
    const appTitle = 'Accounts Marketplace'
    if (props.signedIn) {
      props._near.logOut()
    }
    // adding random Full Access Key
    await props._near.walletConnection.requestSignIn(
      '',
      appTitle
    )
    // adding Full Access Key of Marketplace
    // await props._near.account.addKey(props._near.marketPublicKey, undefined, undefined, 0)
  }

  const [accessKeys, setAccessKeys] = useState(props.accessKeys)
  const propsAccessKeys = props.accessKeys

  const fetchAccessKeys = useCallback(async () => {
    return await props._near.account.getAccessKeys()
  }, [props._near])

  useEffect(() => {
    if (props.connected) {
      if (!propsAccessKeys) {
        fetchAccessKeys().then(setAccessKeys)
      } else {
        setAccessKeys(propsAccessKeys)
      }
    }
  }, [props.connected, propsAccessKeys, fetchAccessKeys])

  console.log(accessKeys)

  return accessKeys ? (
    <div>
      <div className='row py-3'>
        <button
          className='btn btn-danger'
          onClick={(e) => AddMarketKey(e)}
        >
        Bet for NEAR
        </button>
      </div>
    </div>
  ) : (
    <div className='container m-2'>
      <div className='d-flex justify-content-center'>
        <div className='spinner-grow' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    </div>
  )
}

export default AddMarketKeyButton
