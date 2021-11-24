import { fromNear } from 'helpers/api'

export interface IStat {
  numProfiles: number;
  numBids: number;
  numBidsOnClaim: number;
  totalCommission: number;
  numOffers: number;
  numBets: number;
  numClaims: number;
  numAcquisitions: number;
}

export const mapStats = (s: any[]): IStat => {
  return {
    numProfiles: s[0],
    numBids: s[1],
    numBidsOnClaim: s[2],
    totalCommission: fromNear(s[3]),
    numOffers: s[4],
    numBets: s[5],
    numClaims: s[6],
    numAcquisitions: s[7]
  }
}


export interface IBid {
  id: string;
  isAtMarket: boolean;
  numClaims: number;
  claimedBy: string | null;
  claimedTime: number;
  bets: string[] | null;
  betPrice: number;
  claimPrice: number;
  forfeit: number;
  isOnAcquisition: boolean;
}


export const mapBidInfo = (b: any): IBid => {
  return b && b.bet_price ? {
    id: b.id,
    isAtMarket: true,
    numClaims: b.num_claims,
    claimedBy: b.claim_status ? b.claim_status[0] : null,
    claimedTime: b.claim_status ? parseInt(b.claim_status[1]) / 1000000 : 0,
    bets: b.bets,
    betPrice: fromNear(b.bet_price),
    claimPrice: fromNear(b.claim_price),
    forfeit: fromNear(b.forfeit),
    isOnAcquisition: b.on_acquisition
  } : {
    id: b.id || '',
    isAtMarket: false,
    numClaims: 0,
    claimedBy: null,
    claimedTime: 0,
    bets: null,
    betPrice: 0,
    claimPrice: 0,
    forfeit: 0,
    isOnAcquisition: false
  }
}

export interface IProfile {
  participation: string[];
  acquisitions: string[];
  betsVolume: number;
  availableRewards: number;
  profitTaken: number;
  numOffers: number;
  numBets: number;
  numClaims: number;
  numAcquisitions: number;
}

export const mapProfile = (p: any): IProfile => {
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
    betsVolume: fromNear('0'),
    availableRewards: fromNear('0'),
    profitTaken: fromNear('0'),
    numOffers: 0,
    numBets: 0,
    numClaims: 0,
    numAcquisitions: 0
  })
}

export interface IBidSafety {
  codeHash: string;
  accessKeysLen: any;
  lockerOwner: any;
  balance: number;
}