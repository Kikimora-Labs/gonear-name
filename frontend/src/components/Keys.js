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
    // adding Full Access Key of Marketplace - will be done in _initNear
    // await props._near.account.addKey(props._near.marketPublicKey, undefined, undefined, 0)
  }

  const [accessKeys, setAccessKeys] = useState(props.accessKeys)
  const propsAccessKeys = props.accessKeys

  const fetchAccessKeys = useCallback(async () => {
    return await props._near.account.getAccessKeys()
  }, [props._near])

  useEffect(() => {
    if (props.signedIn) {
      if (!propsAccessKeys) {
        fetchAccessKeys().then(setAccessKeys)
      } else {
        setAccessKeys(propsAccessKeys)
      }
    }
  }, [props.signedIn, propsAccessKeys, fetchAccessKeys])

  console.log(accessKeys)

  return (
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
  )
}

export default AddMarketKeyButton
