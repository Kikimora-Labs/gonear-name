use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Proposal {
    pub proposal_owner: AccountId,
    pub new_owner: Option<AccountId>,

    pub published_time: Timestamp,

    pub price: Balance,
}

impl Proposal {
    pub(crate) fn new(
        proposal_owner: AccountId,
        published_time: Timestamp,
        price: Balance,
    ) -> Self {
        Self {
            proposal_owner,
            new_owner: None,
            published_time,
            price,
        }
    }

    pub(crate) fn is_expired(&self, expiration_period: u64) -> bool {
        self.new_owner.is_none()
            && (env::block_timestamp() - self.published_time >= expiration_period * 1_000_000_000)
    }
}

// TODO remove Debug?
#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct ProposalView {
    pub proposal_owner: AccountId,
    pub new_owner: Option<AccountId>,

    pub published_time: WrappedTimestamp,

    pub price: WrappedBalance,

    pub is_expired: bool,
    pub is_deposit_received: bool,
}

impl From<(&Proposal, Timestamp)> for ProposalView {
    fn from(p: (&Proposal, Timestamp)) -> Self {
        Self {
            proposal_owner: p.0.proposal_owner.clone(),
            new_owner: p.0.new_owner.clone(),
            published_time: p.0.published_time.into(),
            price: p.0.price.into(),
            is_expired: p.0.is_expired(p.1),
            is_deposit_received: p.0.new_owner.is_some(),
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn get_proposal(&self, proposal_id: ValidAccountId) -> Option<ProposalView> {
        self.proposals
            .get(proposal_id.as_ref())
            .map(|a| (&a, self.expiration_period).into())
    }

    pub fn get_top_proposals(
        &self,
        from_key: Option<(WrappedBalance, ProposalId)>,
        limit: u64,
    ) -> Vec<(WrappedBalance, ProposalId)> {
        if let Some((balance, proposal_id)) = from_key {
            self.top_proposals
                .iter_rev_from((balance.into(), proposal_id))
                .take(limit as usize)
                .map(|((balance, proposal_id), _)| (balance.into(), proposal_id))
                .collect()
        } else {
            self.top_proposals
                .iter_rev()
                .take(limit as usize)
                .map(|((balance, proposal_id), _)| (balance.into(), proposal_id))
                .collect()
        }
    }
}

impl Contract {
    pub(crate) fn extract_proposal_or_panic(&mut self, proposal_id: &ProposalId) -> Proposal {
        self.proposals.remove(&proposal_id).unwrap()
    }

    pub(crate) fn save_proposal_or_panic(&mut self, proposal_id: &ProposalId, proposal: &Proposal) {
        assert!(self.proposals.insert(proposal_id, proposal).is_none());
    }
}
