import { WalletConnection, utils } from 'near-api-js'
const LOGIN_WALLET_URL_SUFFIX = '/login/'

export class ExtendWalletConnection extends WalletConnection {
  async addFullAccessKey(accountId: string, successUrl?: string, failureUrl?: string): Promise<void> {
    const currentUrl = new URL(window.location.href);
    const newUrl = new URL(this._walletBaseUrl + LOGIN_WALLET_URL_SUFFIX);
    newUrl.searchParams.set('success_url', successUrl || currentUrl.href);
    newUrl.searchParams.set('failure_url', failureUrl || currentUrl.href);
    newUrl.searchParams.set('contract_id', '');
    const accessKey = utils.KeyPair.fromRandom('ed25519');
    const publicKey = accessKey.getPublicKey().toString();
    newUrl.searchParams.set('public_key', publicKey);
    await this._keyStore.setKey(this._networkId, accountId, accessKey);
    window.location.assign(newUrl.toString());
  }
}
