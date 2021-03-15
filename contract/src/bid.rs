use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Bid {
    pub bets: Vector<ProfileId>,
    pub participants: UnorderedSet<ProfileId>,

    pub claim_status: Option<(ProfileId, Timestamp)>,

    pub num_claims: u64,
}

impl Bid {
    pub(crate) fn calculate_bet_price(&self) -> Balance {
        let mut bet_price = INIT_BET_PRICE;
        for _ in 1..self.bets.len() {
            bet_price = bet_price * 6 / 5;
        }
        bet_price
    }

    pub(crate) fn force_calculate_claim_price(&self) -> Balance {
        self.calculate_bet_price() * 2
    }

    pub(crate) fn calculate_claim_price(&self) -> Option<Balance> {
        if self.claim_status.is_none() {
            Some(self.force_calculate_claim_price())
        } else {
            None
        }
    }

    pub(crate) fn calculate_forfeit(&self, acquisition_time: &u64) -> Option<Balance> {
        if let Some((_profile_id, timestamp)) = &self.claim_status {
            let bet_price = self.calculate_bet_price();
            Some(
                std::cmp::min(
                    ((env::block_timestamp() - timestamp) / acquisition_time).into(),
                    1_000_000_000,
                ) // [0..1] ratio multiplied by 1e9
                * (bet_price / 40_000_000_000) // this will be 2.5% for Claimer
                    + bet_price / 40, // this is 2.5 additional commission
            )
        } else {
            None
        }
    }

    pub(crate) fn on_acquisition(&self, acquisition_time: &u64) -> bool {
        if let Some((_profile_id, timestamp)) = &self.claim_status {
            env::block_timestamp() - timestamp >= acquisition_time * 1_000_000_000
        } else {
            false
        }
    }
}

// TODO remove Debug?
#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct BidView {
    pub bets: Vec<ProfileId>,

    pub claim_status: Option<(ProfileId, WrappedTimestamp)>,

    pub bet_price: WrappedBalance,
    pub claim_price: Option<WrappedBalance>,
    pub forfeit: Option<WrappedBalance>,
    pub on_acquisition: bool,

    pub num_claims: u64,
}

impl From<(&Bid, &u64)> for BidView {
    fn from(a: (&Bid, &u64)) -> Self {
        Self {
            bets: a.0.bets.iter().map(|x| x.into()).collect(),
            claim_status: a
                .0
                .claim_status
                .as_ref()
                .map(|(p, t)| (p.into(), (t.clone().into()))),
            bet_price: a.0.calculate_bet_price().into(),
            claim_price: (a.0.calculate_claim_price()).map(|c| (c).into()),
            forfeit: a.0.calculate_forfeit(a.1).map(|f| (f).into()),
            on_acquisition: a.0.on_acquisition(a.1),
            num_claims: a.0.num_claims,
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn get_bid(&self, bid_id: ValidAccountId) -> Option<BidView> {
        self.bids
            .get(bid_id.as_ref())
            .map(|a| (&a, &self.acquisition_time).into())
    }

    pub fn get_top_bets(
        &self,
        from_key: Option<(WrappedBalance, BidId)>,
        limit: u64,
    ) -> Vec<(WrappedBalance, BidId)> {
        if let Some((balance, bid_id)) = from_key {
            self.top_bets
                .iter_rev_from((balance.into(), bid_id))
                .take(limit as usize)
                .map(|((balance, bid_id), _)| (balance.into(), bid_id))
                .collect()
        } else {
            self.top_bets
                .iter_rev()
                .take(limit as usize)
                .map(|((balance, bid_id), _)| (balance.into(), bid_id))
                .collect()
        }
    }

    pub fn get_top_claims(
        &self,
        from_key: Option<(WrappedBalance, BidId)>,
        limit: u64,
    ) -> Vec<(WrappedBalance, BidId)> {
        if let Some((balance, bid_id)) = from_key {
            self.top_claims
                .iter_rev_from((balance.into(), bid_id))
                .take(limit as usize)
                .map(|((balance, bid_id), _)| (balance.into(), bid_id))
                .collect()
        } else {
            self.top_claims
                .iter_rev()
                .take(limit as usize)
                .map(|((balance, bid_id), _)| (balance.into(), bid_id))
                .collect()
        }
    }
}

impl Contract {
    pub(crate) fn extract_bid_or_create(&mut self, bid_id: &BidId) -> Bid {
        self.bids.remove(&bid_id).unwrap_or_else(|| {
            let mut prefix = Vec::with_capacity(33);
            prefix.push(b'y');
            prefix.extend(env::sha256(bid_id.as_bytes()));
            let mut prefix2 = Vec::with_capacity(33);
            prefix2.push(b'z');
            prefix2.extend(env::sha256(bid_id.as_bytes()));
            Bid {
                bets: Vector::new(prefix),
                participants: UnorderedSet::new(prefix2),
                claim_status: None,
                num_claims: 0,
            }
        })
    }

    pub(crate) fn extract_bid_or_panic(&mut self, bid_id: &BidId) -> Bid {
        self.bids.remove(&bid_id).unwrap()
    }

    pub(crate) fn save_bid_or_panic(&mut self, bid_id: &BidId, bid: &Bid) {
        assert!(self.bids.insert(bid_id, bid).is_none());
    }

    pub(crate) fn clear_bid(&self, bid: &mut Bid) {
        // This method helps to clear Bid data from storage completely after finalizing
        bid.bets.clear();
        bid.participants.clear();
        bid.claim_status = None;
        bid.num_claims = 0;
    }
}
