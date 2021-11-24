import { Near, Account, Contract, utils } from 'near-api-js'
import { ExtendWalletConnection } from 'helpers/walletConnection'
import { mapBidInfo, mapProfile, mapStats, IBid, IProfile, IBidSafety, IStat } from 'helpers/mappers'
import { config } from './config'

export const fromNear = (amount: string): number => parseFloat(utils.format.formatNearAmount(amount || '0'))
export const toYoctoNear = (amount: number): string => utils.format.parseNearAmount(String(amount)) || '0'

export interface NearContract extends Contract {
  bet?(params: { bid_id: string }, gas: string, amount: string): void
  claim?(params: { bid_id: string }, gas: string, amount: string): void
  finalize?(params: { bid_id: string }, gas: string, amount: string): void
  get_bid?(params: { bid_id: string }): any
  acquire?(params: { bid_id: string, new_public_key: string }, gas: string, amount: string): void
  get_profile?(params: { profile_id: string }): any
  get_global_stats?(): any
  get_top_bets?(params: { from_key: string | null, limit: number }): [string, string][]
  get_top_claims?(params: { from_key: string | null, limit: number }): [string, string][]
  offer?(params: { profile_id: string }, gas: string, amount: string): boolean
  collect_rewards?(params: object, gas: string, amount: string): void
}

class NearApi {
  readonly near: Near;
  readonly contract: NearContract;
  readonly walletConnection: ExtendWalletConnection;

  constructor(near: Near) {
    this.near = near;
    this.walletConnection = new ExtendWalletConnection(near, config.contractName)
    this.contract = this.getContract(this.walletConnection.account())
  }

  getContract(account: Account): NearContract {
    return new Contract(account, config.contractName, {
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
        'acquire',
        'collect_rewards'
      ]
    })
  }

  signIn(): void {
    let successUrl = window.location.href
    if (window.location.hash.indexOf('offer-processing') >= 0) {
      successUrl = window.location.origin
    }
    this.walletConnection.requestSignIn(config.contractName, undefined, successUrl)
  }

  signOut(): void {
    this.walletConnection.signOut()
  }

  async get_account_id(): Promise<string> {
    return await this.walletConnection.getAccountId()
  }

  async account(bid_id: string): Promise<Account> {
    return await this.near.account(bid_id)
  }

  async get_balance(bid_id: string): Promise<number | null> {
    const account = await this.account(bid_id)
    let balance = null
    try {
      const b = await account.getAccountBalance()
      balance = fromNear(b.total)
    } catch (e) {
      console.error('Account not exist')
    }
    return balance
  }

  async bet(bid_id: string, amount: number): Promise<void> {
    await this.contract.bet?.({ bid_id }, '200000000000000', toYoctoNear(amount))
  }

  async claim(bid_id: string, amount: number): Promise<void> {
    await this.contract.claim?.({ bid_id }, '200000000000000', toYoctoNear(amount))
  }

  async finalize(bid_id: string): Promise<void> {
    await this.contract.finalize?.({ bid_id }, '200000000000000', '0')
  }

  async get_bid(bid_id: string): Promise<IBid> {
    let bid = await this.contract.get_bid?.({ bid_id })
    if (bid) bid = mapBidInfo({ id: bid_id, ...bid })
    return bid
  }

  async get_bid_safety(bid_id: string): Promise<IBidSafety> {
    const account = await this.account(bid_id)
    try {
      const codeHash = (await account.state()).code_hash
      const accessKeysLen = (await account.getAccessKeys()).length
      const lockerContract: any = await new Contract(account, bid_id, {
        viewMethods: ['get_owner'],
        changeMethods: []
      })
      const lockerOwner = await lockerContract.get_owner({})
      const balance = (await account.getAccountBalance()).total
      return { codeHash, accessKeysLen, lockerOwner, balance: fromNear(balance) }
    } catch (e) {
      console.log('check safety error', e)
    }
    return { codeHash: '(unknown)', accessKeysLen: '(unknown)', lockerOwner: '(not found)', balance: 0 }
  }

  async acquire(bid_id: string, new_public_key: string ): Promise<void> {
    await this.contract.acquire?.({ bid_id, new_public_key }, '200000000000000', '0')
  }

  async collect_rewards(): Promise<void> {
    await this.contract.collect_rewards?.({}, '200000000000000', '0')
  }

  async get_profile(profile_id: string | null): Promise<IProfile> {
    const profile = profile_id ? await this.contract.get_profile?.({ profile_id }) : null
    return mapProfile(profile)
  }

  async get_global_stats(): Promise<IStat> {
    return mapStats(await this.contract.get_global_stats?.())
  }

  async get_top_bets(from_key: string | null, limit: number): Promise<[string, string][]> {
    if (!this.contract.get_top_bets) return []
    return await this.contract.get_top_bets?.({ from_key, limit })
  }

  async get_top_claims(from_key: string | null, limit: number): Promise<[string, string][]> {
    if (!this.contract.get_top_claims) return []
    return await this.contract.get_top_claims?.({ from_key, limit })
  }

  async addFullAccessKey({ account_id, successUrl, failureUrl }: { account_id: string, successUrl?: string, failureUrl?: string }): Promise<void> {
    const walletConnection = new ExtendWalletConnection(this.near, config.contractName)
    await walletConnection.addFullAccessKey(account_id, successUrl, failureUrl)
  }

  async deleteAllKeys(offer: string, deleteLastKey?: boolean): Promise<void> {
    const account = await this.near.account(offer)
    const accessKeys = await account.getAccessKeys()
    const currentKey = (await account.connection.signer.getPublicKey(offer, config.networkId)).toString()
    for (let index = 0; index < accessKeys.length; index++) {
      const { public_key } = accessKeys[index]
      if (currentKey === public_key) continue
      await account.deleteKey(public_key)
    }
    if (deleteLastKey) await account.deleteKey(currentKey)
  }

  async offer(offer: string, beneficiar: string): Promise<void> {
    const account = await this.near.account(offer)
    const contract = this.getContract(account)
    try {
      await contract.offer?.({ profile_id: beneficiar }, '200000000000000', toYoctoNear(0.3))
    } catch (e) {
      console.error(e)
    }
  }


  async createContract(accountId: string): Promise<void> {
    const account = await this.near.account(accountId);
    const data = await fetch(config.wasmCode)
    const buf = await data.arrayBuffer()
    await account.deployContract(new Uint8Array(buf))

  }

  async lockContract(accountId: string): Promise<void> {
    const account = await this.near.account(accountId);
    const contract: any = await new Contract(account, accountId, {
      viewMethods: [],
      changeMethods: ['lock']
    })
    await contract.lock(Buffer.from('{"owner_id":"' + config.contractName + '"}'))

  }

  async addMarketKeyToAccount(accountId: string): Promise<void> {
    const account = await this.near.account(accountId);
    try {
      await account.addKey(config.marketPublicKey, accountId);
    } catch(e) {
      console.error(e);
    }
  }

  deleteKeyFromLocalStorage(accountId: string): void {
    this.walletConnection._keyStore.removeKey(config.networkId, accountId)
  }
}

export default NearApi