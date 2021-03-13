use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Bid {
    pub bets: Vector<ProfileId>,

    pub claim: Option<(ProfileId, Timestamp)>,

    pub num_claims: u64,
}

// TODO remove Debug
#[derive(Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct BidView {
    pub bets: Vec<ProfileId>,

    pub claim: Option<(ProfileId, WrappedTimestamp)>,

    pub num_claims: u64,
}

impl From<&Bid> for BidView {
    fn from(a: &Bid) -> Self {
        Self {
            bets: a.bets.iter().map(|x| x.into()).collect(),
            claim: match &a.claim {
                Some((a, t)) => Some((a.clone(), t.clone().into())),
                None => None,
            },
            num_claims: a.num_claims,
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn get_bid(&self, bid_id: ValidAccountId) -> Option<BidView> {
        self.bids.get(bid_id.as_ref()).map(|a| (&a).into())
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
            prefix.push(b'z');
            prefix.extend(env::sha256(bid_id.as_bytes()));
            Bid {
                bets: Vector::new(prefix),
                claim: None,
                num_claims: 0,
            }
        })
    }
}
