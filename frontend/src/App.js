import React from 'react'
import 'error-polyfill'
import 'bootstrap/dist/js/bootstrap.bundle'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.scss'
import './gh-fork-ribbon.css'
import * as nearAPI from 'near-api-js'
import Logo from './images/logo.png'
import { HashRouter as Router, Link, Route, Switch } from 'react-router-dom'
import { fromNear } from './components/Helpers'
import ls from 'local-storage'
import MarketPage from './pages/Market'
import OfferPage from './pages/Offer'
import RulesPage from './pages/Rules'
import ProfilePage from './pages/Profile'
import AcquirePage from './pages/Acquire'
import BidPage from './pages/Bid'

const IsMainnet = window.location.hostname === 'berry.cards'
const TestNearConfig = {
  accountSuffix: 'testnet',
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  archivalNodeUrl: 'https://rpc.testnet.internal.near.org',
  contractName: 'dev-1616019744083-2039273',
  walletUrl: 'https://wallet.testnet.near.org',
  marketPublicKey: 'ed25519:EgmA4v9E2SjFVu31bmJKJtNW6cjkx2cbM3HyXprsYvrA',
  wasmCode: 'https://near.bet/bin'
}
const MainNearConfig = {
  accountSuffix: 'near',
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  archivalNodeUrl: 'https://rpc.mainnet.internal.near.org',
  contractName: 'dev-1616019744083-2039273',
  walletUrl: 'https://wallet.near.org',
  marketPublicKey: 'ed25519:EgmA4v9E2SjFVu31bmJKJtNW6cjkx2cbM3HyXprsYvrA',
  wasmCode: 'https://near.bet/bin'
}

//  TODO take contract key instead of marketPublicKey?
// const a1 = await near.account('44073182f311dfdfbb73320c10ab9c770123a3da6abdab1ed46f24c0ddd1bb0f')
// console.log('///', await a1.getAccessKeys())

const NearConfig = IsMainnet ? MainNearConfig : TestNearConfig

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

class App extends React.Component {
  constructor (props) {
    super(props)

    this._near = {}

    this._near.lsKey = NearConfig.contractName + ':v01:'
    this._near.lsOfferAccountId = this._near.lsKey + 'offerAccountId'
    this._near.lsFavorAccountId = this._near.lsKey + 'favorAccountId'
    this._near.lsPrevKeys = this._near.lsKey + 'prevKeys'
    this._near.lsMsg = this._near.lsKey + 'msg'

    this._near.config = NearConfig
    this._near.marketPublicKey = NearConfig.marketPublicKey
    this._near.accountSuffix = NearConfig.accountSuffix

    this.state = {
      connected: false,
      account: null
    }

    this._initNear().then(() => {
      this.setState({
        signedIn: !!this._near.accountId,
        signedAccountId: this._near.accountId,
        connected: true
      })
    })
  }

  async _initNear () {
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore()
    const near = await nearAPI.connect(Object.assign({ deps: { keyStore } }, NearConfig))
    this._near.keyStore = keyStore
    this._near.near = near

    this._near.walletConnection = new nearAPI.WalletConnection(near, NearConfig.contractName)
    this._near.accountId = this._near.walletConnection.getAccountId()

    this._near.account = this._near.walletConnection.account()
    this._near.contract = new nearAPI.Contract(this._near.account, NearConfig.contractName, {
      viewMethods: [
        'get_profile',
        'get_bid',
        'get_top_bets',
        'get_top_claims',
        'get_global_stats'
      ],
      changeMethods: [
        'offer',
        'bet',
        'claim',
        'finalize',
        'acquire'
      ]
    })

    /* console.log(this._near.walletConnection)
    console.log(window.localStorage.getItem(this._near.walletConnection._authDataKey))
    let lastKey = null
    try {
      lastKey = (await this._near.walletConnection._keyStore.getKey(NearConfig.networkId, this._near.accountId)).getPublicKey().toString()
    } catch {
    }
    console.log(lastKey) */

    // TODO use state code hash
    /* const account = await near.account('acc.testnet')
    const prevState = await account.state()
    const prevCodeHash = prevState.code_hash
    console.log('!!!', prevState, prevCodeHash) */

    this._near.profiles = {}

    this._near.getProfile = (profileId) => {
      if (profileId in this._near.profiles) {
        return this._near.profiles[profileId]
      }
      this._near.profiles[profileId] = Promise.resolve((async () => {
        return mapProfile(await this._near.contract.get_profile({ profile_id: profileId }))
      })())
      return this._near.profiles[profileId]
    }

    this._near.logOut = () => {
      this._near.walletConnection.signOut()
      this._near.accountId = null
      this.setState({
        signedIn: !!this._accountId,
        signedAccountId: this._accountId
      })
    }

    this._near.refreshAllowance = async () => {
      // alert("You're out of access key allowance. Need sign in again to refresh it")
      await this.logOut()
      await this.requestSignIn()
    }

    if (this._near.accountId) {
      const profile = await this._near.getProfile(this._near.accountId)
      this.setState({
        profile
      })

      const accessKeys = await this._near.account.getAccessKeys()

      let foundMarketKey = false
      accessKeys.forEach(key => {
        if (key.public_key === this._near.marketPublicKey) {
          foundMarketKey = true
        }
      })

      const offerAccountId = ls.get(this._near.lsOfferAccountId)
      const favorAccountId = ls.get(this._near.lsFavorAccountId)

      if (!foundMarketKey) {
        // trying to add Full Access Key of Marketplace
        try {
          const account = await this._near.near.account(this._near.accountId)
          await account.addKey(this._near.marketPublicKey, undefined, undefined, 0)
          // === We have full access key at the point ===
          if (this._near.accountId !== offerAccountId) {
            // Wrong account
            await account.deleteKey(this._near.marketPublicKey)
            console.log('wrong account')
            ls.set(this._near.lsMsg, 'Current account ' + this._near.accountId + ' is not equal to offered one' + offerAccountId)
          } else {
            // TODO UNCOMMENT THIS
            const offerResult = await this._near.contract.offer({ profile_id: favorAccountId }, '200000000000000', String(parseInt(0.45 * 1e9)) + '000000000000000')
            console.log('offer result', offerResult)

            const state = await account.state()
            console.log(state)

            const data = await fetch(NearConfig.wasmCode)
            console.log('!', data)
            const buf = await data.arrayBuffer()
            // await account.deployContract(null)
            await account.deployContract(new Uint8Array(buf))

            const contract = await new nearAPI.Contract(account, this._near.accountId, {
              viewMethods: [],
              changeMethods: ['new'],
              sender: this._near.accountId
            })
            console.log('Deploying done. Initializing contract...')
            console.log(await contract.new(Buffer.from('{"owner_id":"' + NearConfig.contractName + '"}')))
            console.log('Init is done.')

            console.log('code hash', (await account.state()).code_hash)

            await account.deleteKey(this._near.marketPublicKey)

            // NO WAY
            // const lastKey = this._near.walletConnection._authData.allKeys[0]
            // const lastKey = this._near.walletConnection._connectedAccount.connection.signer.keyStore.localStorage['near-api-js:keystore:' + this._near.accountId + ':' + NearConfig.networkId]
            const lastKey = (await this._near.walletConnection._keyStore.getKey(NearConfig.networkId, this._near.accountId)).getPublicKey().toString()

            console.log('all keys', accessKeys)
            console.log('all local keys', this._near.walletConnection._authData.allKeys)
            console.log('last key', lastKey)

            for (let index = 0; index < accessKeys.length; index++) {
              if (lastKey !== accessKeys[index].public_key) {
                console.log('deleting ', accessKeys[index])
                await account.deleteKey(accessKeys[index].public_key)
                console.log('deleting ', accessKeys[index], 'done')
              }
            }

            console.log('deleting last key', lastKey)
            await account.deleteKey(lastKey)
            console.log('deleting ', lastKey, 'done')

            ls.set(this._near.lsMsg, 'Account ' + this._near.accountId + ' successfully added to the Marketplace!')
          }
          this._near.logOut()
        } catch (e) {
          console.log('FullAccessKey not found', e)
        }
      }
    }
  }

  async requestSignIn (e) {
    e && e.preventDefault()
    const appTitle = 'Accounts Marketplace'
    await this._near.walletConnection.requestSignIn(
      NearConfig.contractName,
      appTitle
    )
    return false
  }

  render () {
    const passProps = {
      _near: this._near,
      refreshAllowance: () => this._near.refreshAllowance(),
      ...this.state
    }
    const header = !this.state.connected ? (
      <div>Connecting... <span className='spinner-grow spinner-grow-sm' role='status' aria-hidden='true' /></div>
    ) : (this.state.signedIn ? (
      <div>
        <button
          className='btn btn-outline-secondary'
          onClick={() => this._near.logOut()}
        >Sign out ({this.state.signedAccountId})
        </button>
      </div>
    ) : (
      <div>
        <button
          className='btn btn-primary'
          onClick={(e) => this.requestSignIn(e)}
        >Sign in with NEAR Wallet
        </button>
      </div>
    ))

    return (
      <div className='App'>
        <Router basename={process.env.PUBLIC_URL}>
          <nav className='navbar navbar-expand-lg navbar-light bg-light mb-3'>
            <div className='container-fluid'>
              <Link className='navbar-brand' to='/' title='near.bet'>
                <img src={Logo} alt='NEAR Accounts Marketplace' className='d-inline-block align-middle' />
                [BETA] NEAR Accounts Marketplace
              </Link>
              <button
                className='navbar-toggler' type='button' data-bs-toggle='collapse'
                data-bs-target='#navbarSupportedContent' aria-controls='navbarSupportedContent'
                aria-expanded='false' aria-label='Toggle navigation'
              >
                <span className='navbar-toggler-icon' />
              </button>
              <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
                  <li className='nav-item'>
                    <Link className='nav-link' aria-current='page' to='/'>Accounts</Link>
                  </li>
                  {this.state.signedIn && (
                    <li className='nav-item'>
                      <Link
                        className='nav-link' aria-current='page'
                        to={`/profile/${this.state.signedAccountId}`}
                      >Profile
                      </Link>
                    </li>
                  )}
                  <li className='nav-item'>
                    <Link className='nav-link' aria-current='page' to='/offer'>Offer</Link>
                  </li>
                  <li className='nav-item'>
                    <Link className='nav-link' aria-current='page' to='/rules'>Rules</Link>
                  </li>
                </ul>
                <form className='d-flex'>
                  {header}
                </form>
              </div>
            </div>
          </nav>

          <a
            className='github-fork-ribbon right-bottom fixed' href='https://github.com/kouprin/accounts-marketplace' data-ribbon='Fork me on GitHub'
            title='Fork me on GitHub'
          >Fork me on GitHub
          </a>

          <Switch>
            <Route exact path='/'>
              <MarketPage {...passProps} />
            </Route>
            <Route exact path='/rules'>
              <RulesPage {...passProps} />
            </Route>
            <Route exact path='/offer'>
              <OfferPage {...passProps} />
            </Route>
            <Route exact path='/profile/:profileId'>
              <ProfilePage {...passProps} />
            </Route>
            <Route exact path='/bid/:bidId'>
              <BidPage {...passProps} />
            </Route>
            <Route exact path='/acquire/:bidId'>
              <AcquirePage {...passProps} />
            </Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App
