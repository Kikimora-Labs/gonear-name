use crate::*;
use std::collections::HashMap;
use std::convert::TryFrom;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Proposal {
    pub proposal_owner: AccountId,
    pub new_owner: Option<AccountId>,

    pub published_time: Timestamp,

    pub price: Balance,

    pub description: Description
}

impl Proposal {
    pub(crate) fn new(
        proposal_owner: AccountId,
        published_time: Timestamp,
        price: Balance,
        description: String
    ) -> Self {
        Self {
            proposal_owner,
            new_owner: None,
            published_time,
            price,
            description
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
    pub description: String
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
            description: p.0.description.clone()
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

    pub fn get_proposals(&self, from_index: u64, limit: u64) -> HashMap<ProposalId, ProposalView> {
        let keys = self.proposals.keys_as_vector();

        (from_index..std::cmp::min(from_index + limit, keys.len()))
            .map(|index| {
                let key = keys.get(index).unwrap();
                let proposal_id = ValidAccountId::try_from(key.clone()).unwrap();
                let proposal = self.get_proposal(proposal_id.into()).unwrap();
                (key, proposal)
            })
            .collect()
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
