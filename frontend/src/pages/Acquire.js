import React, { useState } from 'react'
import { useParams } from 'react-router'
import { loader } from '../components/Helpers'
import { generateSeedPhrase, parseSeedPhrase } from 'near-seed-phrase'
// import { Link } from 'react-router-dom'

function AcquirePage (props) {
  const { bidId } = useParams()
  const [showAcquireButtons, setShowAcquireButtons] = useState(true)
  const [acquireSuccess, setAcquireSuccess] = useState(false)
  const [seedPhrase, setSeedPhrase] = useState(generateSeedPhrase().seedPhrase)
  const [showSeedPhrase, setShowSeedPhrase] = useState(false)

  async function acquireBidSeedPhrase (e) {
    e.preventDefault()
    setShowAcquireButtons(false)
    const clickSeedPhrase = document.getElementById('acquireSeedPhrase').value
    console.log(clickSeedPhrase)
    const publicKey = parseSeedPhrase(clickSeedPhrase, '').publicKey
    console.log(publicKey)
    await props._near.contract.acquire({ bid_id: bidId, new_public_key: publicKey }, '200000000000000', '0')
    setSeedPhrase(clickSeedPhrase)
    setShowSeedPhrase(true)
    setAcquireSuccess(true)
  }

  async function acquireBidPublicKey (e) {
    e.preventDefault()
    setShowAcquireButtons(false)
    const publicKey = document.getElementById('acquirePublicKey').value
    console.log(publicKey)
    await props._near.contract.acquire({ bid_id: bidId, new_public_key: publicKey }, '200000000000000', '0')
    setAcquireSuccess(true)
  }

  const recoverLink = props._near.config.walletUrl + '/recover-seed-phrase'
  // React bug:
  // <Link to={seedPhraseLink}>Go to the NEAR wallet and copy your seed phrase</Link> interprets as relative path

  return !acquireSuccess ? (
    <div className='container my-auto'>
      <h1 className='text-center'>Acquire {bidId}</h1>
      <h2 className='text-center'>
                Do it easy way or like a pro?
      </h2>
      <hr />
      <form onSubmit={(e) => acquireBidSeedPhrase(e)}>
        <h3 className='text-center'>Use a seed phrase</h3>
        <div className='d-flex align-items-center justify-content-center'>
          <div className='form-group' style={{ width: '600px', margin: '25px' }}>
            <div>Save this randomly generated seed phrase or choose your own</div>
            <div>
              <input
                type='text' className='form-control mt-2' id='acquireSeedPhrase'
                placeholder='Example: van honey cattle trend garbage human cereal donor pipe you response gym '
                defaultValue={seedPhrase}
              />
            </div>
            {props.connected && showAcquireButtons ? (
              <button disabled={!props.signedIn} className='btn btn-outline-warning my-3 w-100'>Acquire using seed phrase</button>
            ) : (
              <div className='my-3 w-100'>{loader()}</div>)}
          </div>
        </div>
      </form>
      <hr />
      <form onSubmit={(e) => acquireBidPublicKey(e)}>
        <h3 className='text-center'>or &mdash; Transfer your public key</h3>
        <div className='d-flex align-items-center justify-content-center'>
          <div className='form-group' style={{ width: '600px', margin: '25px' }}>
            <label htmlFor='exampleInputEmail1'>Put your base58 public key</label>
            <div>
              <input
                type='text' className='form-control mt-2' id='acquirePublicKey'
                placeholder='Example: 9bk1tm45X2hBSffmD65pA2vch862jtcz75mkRR7MXNVj'
              />
            </div>
            {props.connected && showAcquireButtons ? (
              <button disabled={!props.signedIn} className='btn btn-outline-warning my-3 w-100'>Acquire using new public key</button>
            ) : (
              <div className='my-3 w-100'>{loader()}</div>)}
          </div>
        </div>
      </form>
    </div>
  ) : (
    <div className='container my-auto'>
      <h1 className='text-center'>Acquire {bidId}</h1>
      <h2 className='alert alert-success' role='alert'>
            Contract instruction has been sent.
      </h2>
      {showSeedPhrase && <div><h2>Seed phrase used:</h2><h2 className='alert alert-info' role='alert'>{seedPhrase}</h2></div>}
      {showSeedPhrase &&
        <h2>Go to <a href={recoverLink}>wallet</a> and restore your account
        </h2>}
    </div>
  )
}

export default AcquirePage
