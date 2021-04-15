mod action;
mod proposal;

pub use crate::action::*;
pub use crate::proposal::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{TreeMap, UnorderedMap};
use near_sdk::json_types::{Base58PublicKey, ValidAccountId, WrappedBalance, WrappedTimestamp};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{env, log, near_bindgen, AccountId, Balance, PanicOnDefault, Promise, Timestamp};

pub type ProposalId = AccountId;

pub const EXPIRATION_PERIOD: u64 = 24 * 60 * 60; // 24 hours

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub proposals: UnorderedMap<ProposalId, Proposal>,

    pub top_proposals: TreeMap<(Balance, ProposalId), ()>,

    pub expiration_period: u64, // in seconds

    pub num_proposals_total: u64,
    pub num_proposals_withdrawn: u64,
    pub num_proposals_accepted: u64,

    pub total_commission: Balance,

    pub owner_id: AccountId,
    pub dao_id: AccountId,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn test_new(expiration_period: u64, dao_id: ValidAccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        log!(
            "Test init with owner_id = {:?}, dao_id = {:?}, expiration_period = {:?}",
            env::signer_account_id(),
            dao_id,
            expiration_period
        );
        Self {
            proposals: UnorderedMap::new(b"a".to_vec()),
            top_proposals: TreeMap::new(b"b".to_vec()),
            expiration_period,
            num_proposals_total: 0,
            num_proposals_withdrawn: 0,
            num_proposals_accepted: 0,
            total_commission: 0,
            owner_id: env::signer_account_id(),
            dao_id: dao_id.into(),
        }
    }

    #[init]
    pub fn new(owner_id: ValidAccountId, dao_id: ValidAccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            proposals: UnorderedMap::new(b"a".to_vec()),
            top_proposals: TreeMap::new(b"b".to_vec()),
            expiration_period: EXPIRATION_PERIOD,
            num_proposals_total: 0,
            num_proposals_withdrawn: 0,
            num_proposals_accepted: 0,
            total_commission: 0,
            owner_id: owner_id.into(),
            dao_id: dao_id.into(),
        }
    }

    pub fn get_global_stats(&self) -> (u64, u64, u64, u64, Balance) {
        (
            self.proposals.len(),
            self.num_proposals_total,
            self.num_proposals_withdrawn,
            self.num_proposals_accepted,
            self.total_commission,
        )
    }
}
