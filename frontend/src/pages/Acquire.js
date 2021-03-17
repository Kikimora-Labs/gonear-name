import React from 'react'
import { useParams } from 'react-router'
import { loader } from '../components/Helpers'
import { parseSeedPhrase } from 'near-seed-phrase'
// import { Link } from 'react-router-dom'

function AcquirePage (props) {
  const { bidId } = useParams()

  async function acquireBidSeedPhrase (e) {
    e.preventDefault()
    const seedPhrase = document.getElementById('acquireSeedPhrase').value
    const publicKey = parseSeedPhrase(seedPhrase, '').publicKey
    console.log(publicKey)
    await props._near.contract.acquire({ bid_id: bidId, new_public_key: publicKey }, '200000000000000', '0')
  }

  async function acquireBidPublicKey (e) {
    e.preventDefault()
    const publicKey = document.getElementById('acquirePublicKey').value
    console.log(publicKey)
    await props._near.contract.acquire({ bid_id: bidId, new_public_key: publicKey }, '200000000000000', '0')
  }

  const seedPhraseLink = props._near.config.walletUrl + '/setup-seed-phrase/' + bidId + '/phrase'
  const recoverLink = props._near.config.walletUrl + '/recover-seed-phrase'
  // React bug:
  // <Link to={seedPhraseLink}>Go to the NEAR wallet and copy your seed phrase</Link> interpretes as realative path

  return (
    <div className='container my-auto'>
      <h1 className='text-center'>Acquire {bidId}</h1>
      <h2 className='text-center'>
                Do it easy way or like a pro?
      </h2>
      <hr />
      <form onSubmit={(e) => acquireBidSeedPhrase(e)}>
        <h3 className='text-center'>Generate a seed phrase</h3>
        <div className='d-flex align-items-center justify-content-center'>
          <div className='form-group' style={{ width: '600px', margin: '25px' }}>
            <div>1. Generate a new seed phrase</div>
            <a href={seedPhraseLink}>Go to the NEAR wallet and copy your seed phrase</a>
            <div>2. Put your seed phrase here and click on "Acquire using seed phrase"</div>
            <div>
              <input
                type='text' className='form-control mt-2' id='acquireSeedPhrase'
                placeholder='Example: van honey cattle trend garbage human cereal donor pipe you response gym '
              />
            </div>
            {props.connected ? (
              <button className='btn btn-outline-warning my-3 w-100'>Acquire using seed phrase</button>) : (loader())}
            <div>3. Restore you account at NEAR wallet using seed phrase</div>
            <a href={recoverLink}>Go to the NEAR wallet and restore your account</a>
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
            {props.connected ? (
              <button className='btn btn-outline-warning mt-3 w-100'>Acquire using new public key</button>) : (loader())}
          </div>
        </div>
      </form>
    </div>
  )
}

export default AcquirePage
