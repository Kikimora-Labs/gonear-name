export interface INearConfig {
  accountSuffix: string,
  networkId: string,
  nodeUrl: string,
  contractName: string,
  walletUrl: string,
  marketPublicKey: string,
  wasmCode: string,
  claimPeriod: number
}


export const config = getConfig()

// TODO: move these data to envs
function getConfig(): INearConfig {
  const env = process.env.REACT_APP_ENVIRONMENT || 'development';
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        accountSuffix: 'near',
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        contractName: 'c.nearbet.near',
        walletUrl: 'https://wallet.near.org',
        marketPublicKey: 'ed25519:5mgNVstFy67S469tG2j8MjRchPuKqJFYsydghKRteR42',
        wasmCode: 'https://gonear.name/bin',
        claimPeriod: 72 * 60 * 60
      }
    case 'development':
    case 'testnet':
    default:
      return {
        accountSuffix: 'testnet',
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: 'dev-1616355537428-9726228',
        walletUrl: 'https://wallet.testnet.near.org',
        marketPublicKey: 'ed25519:EgmA4v9E2SjFVu31bmJKJtNW6cjkx2cbM3HyXprsYvrA',
        wasmCode: 'https://near.bet/bin',
        claimPeriod: 15 * 60
      }
  }
}
