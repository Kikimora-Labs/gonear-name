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
import ClaimsPage from './pages/Claims'
import RulesPage from './pages/Rules'
import ProfilePage from './pages/Profile'
import BidPage from './pages/Bid'

const IsMainnet = window.location.hostname === 'berry.cards'
const TestNearConfig = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  archivalNodeUrl: 'https://rpc.testnet.internal.near.org',
  contractName: 'dev-1615735979760-2198693',
  walletUrl: 'https://wallet.testnet.near.org'
}
const MainNearConfig = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  archivalNodeUrl: 'https://rpc.mainnet.internal.near.org',
  contractName: 'cards.berryclub.ek.near',
  walletUrl: 'https://wallet.near.org'
}

const NearConfig = IsMainnet ? MainNearConfig : TestNearConfig

const mapProfile = (p) => {
  return {
    participation: p.participation,
    acquisitions: p.acquisitions,
    betsVolume: fromNear(p.bets_volume),
    availableRewards: fromNear(p.available_rewards),
    profitTaken: fromNear(p.profit_taken),
    numOffers: p.num_offers,
    numBets: p.num_bets,
    numClaims: p.num_claims,
    numAcquisitions: p.num_acquisitions
  }
}

const emptyProfile = () => {
  return {
    participation: [],
    acquisitions: [],
    betsVolume: fromNear(0),
    availableRewards: fromNear(0),
    profitTaken: fromNear(0),
    numOffers: 0,
    numBets: 0,
    numClaims: 0,
    numAcquisitions: 0
  }
}

class App extends React.Component {
  constructor (props) {
    super(props)

    this._near = {}

    this._near.lsKey = NearConfig.contractName + ':v01:'
    this._near.lsKeyRecentCards = this._near.lsKey + 'recentCards'

    this.state = {
      connected: false,
      isNavCollapsed: true,
      account: null,
      requests: null,
      recentCards: ls.get(this._near.lsKeyRecentCards) || []
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

    this._near.profiles = {}

    this._near.getProfile = (profileId) => {
      if (profileId in this._near.profiles) {
        return this._near.profiles[profileId]
      }
      this._near.profiles[profileId] = Promise.resolve((async () => {
        const p = await this._near.contract.get_profile({ profile_id: profileId })
        const profile = p ? mapProfile(p) : emptyProfile()
        return profile
      })())
      return this._near.profiles[profileId]
    }

    if (this._near.accountId) {
      const profile = await this._near.getProfile(this._near.accountId)
      console.log(profile)
      this.setState({
        profile
      })
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

  async logOut () {
    this._near.walletConnection.signOut()
    this._near.accountId = null
    this.setState({
      signedIn: !!this._accountId,
      signedAccountId: this._accountId
    })
  }

  popRequest (c) {
    const requests = this.state.requests.slice(1)
    this.setState({
      requests
    }, c)
  }

  addRequest (r, c) {
    const requests = this.state.requests.slice(0)
    requests.push(r)
    this.setState({
      requests
    }, c)
  }

  addRecentCard (cardId) {
    let recentCards = this.state.recentCards.slice(0)
    const index = recentCards.indexOf(cardId)
    if (index !== -1) {
      recentCards.splice(index, 1)
    }
    recentCards.unshift(cardId)
    recentCards = recentCards.slice(0, 5)
    ls.set(this._near.lsKeyRecentCards, recentCards)
    this.setState({
      recentCards
    })
  }

  async refreshAllowance () {
    alert("You're out of access key allowance. Need sign in again to refresh it")
    await this.logOut()
    await this.requestSignIn()
  }

  render () {
    const passProps = {
      _near: this._near,
      updateState: (s, c) => this.setState(s, c),
      popRequest: (c) => this.popRequest(c),
      addRequest: (r, c) => this.addRequest(r, c),
      addRecentCard: (cardId) => this.addRecentCard(cardId),
      refreshAllowance: () => this.refreshAllowance(),
      ...this.state
    }
    const header = !this.state.connected ? (
      <div>Connecting... <span className='spinner-grow spinner-grow-sm' role='status' aria-hidden='true' /></div>
    ) : (this.state.signedIn ? (
      <div>
        <button
          className='btn btn-outline-secondary'
          onClick={() => this.logOut()}
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
                  <li className='nav-item'>
                    <Link className='nav-link' aria-current='page' to='/claims'>Claims</Link>
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
            <Route exact path='/claims'>
              <ClaimsPage {...passProps} />
            </Route>
            <Route exact path='/rules'>
              <RulesPage {...passProps} />
            </Route>
            <Route exact path='/profile/:profileId'>
              <ProfilePage {...passProps} />
            </Route>
            <Route exact path='/bid/:bidId'>
              <BidPage {...passProps} />
            </Route>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App
