use crate::*;
use std::collections::HashMap;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Proposal {
    pub proposal_owner: AccountId,
    pub published_time: Timestamp,
    pub price: Balance,
    pub description: Description,
}

impl Proposal {
    pub(crate) fn new(
        proposal_owner: AccountId,
        published_time: Timestamp,
        price: Balance,
        description: Description,
    ) -> Self {
        Self {
            proposal_owner,
            published_time,
            price,
            description,
        }
    }
}

// TODO remove Debug?
#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct ProposalView {
    pub proposal_owner: AccountId,
    pub published_time: WrappedTimestamp,
    pub price: WrappedBalance,
    pub description: String,
}

impl From<&Proposal> for ProposalView {
    fn from(p: &Proposal) -> Self {
        Self {
            proposal_owner: p.proposal_owner.clone(),
            published_time: p.published_time.into(),
            price: p.price.into(),
            description: p.description.clone(),
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn get_proposal(&self, proposal_id: ValidAccountId) -> Option<ProposalView> {
        self.proposals
            .get(proposal_id.as_ref())
            .map(|p| (&p).into())
    }

    pub fn get_proposals(&self, from_index: u64, limit: u64) -> HashMap<ProposalId, ProposalView> {
        // O(1)
        let keys = self.proposals.keys_as_vector();
        // O(1)
        let values = self.proposals.values_as_vector();
        // O(limit)
        (from_index..std::cmp::min(from_index + limit, keys.len()))
            .map(|index| {
                (
                    keys.get(index).unwrap(),
                    (&values.get(index).unwrap()).into(),
                )
            })
            .collect()
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
