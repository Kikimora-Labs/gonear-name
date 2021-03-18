mod action;
mod bid;
mod profile;

pub use crate::action::*;
pub use crate::bid::*;
pub use crate::profile::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{TreeMap, UnorderedMap, UnorderedSet, Vector};
use near_sdk::json_types::{Base58PublicKey, ValidAccountId, WrappedBalance, WrappedTimestamp};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{
    env, ext_contract, log, near_bindgen, AccountId, Balance, PanicOnDefault, Promise,
    PromiseResult, Timestamp,
};

pub type BidId = AccountId;
pub type ProfileId = AccountId;

pub const ACQUISITION_TIME: u64 = 48 * 60 * 60; // 48 hours

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub profiles: UnorderedMap<ProfileId, Profile>,

    pub bids: UnorderedMap<BidId, Bid>,

    pub top_bets: TreeMap<(Balance, BidId), ()>,
    pub top_claims: TreeMap<(Balance, BidId), ()>,

    pub num_offers: u64,
    pub num_bets: u64,
    pub num_claims: u64,
    pub num_acquisitions: u64,

    pub total_commission: Balance,

    pub acquisition_time: u64, // in seconds

    pub owner_id: AccountId,
    pub dao_id: AccountId,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn test_new(acquisition_time: u64, dao_id: ValidAccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        log!(
            "Test init with owner_id = {:?}, dao_id = {:?}, acquisition_time = {:?}",
            env::signer_account_id(),
            dao_id,
            acquisition_time
        );
        Self {
            profiles: UnorderedMap::new(b"u".to_vec()),
            bids: UnorderedMap::new(b"a".to_vec()),
            top_bets: TreeMap::new(b"b".to_vec()),
            top_claims: TreeMap::new(b"c".to_vec()),
            num_offers: 0,
            num_bets: 0,
            num_claims: 0,
            num_acquisitions: 0,
            total_commission: 0,
            acquisition_time,
            owner_id: env::signer_account_id(),
            dao_id: dao_id.into(),
        }
    }

    #[init]
    pub fn new(owner_id: ValidAccountId, dao_id: ValidAccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            profiles: UnorderedMap::new(b"u".to_vec()),
            bids: UnorderedMap::new(b"a".to_vec()),
            top_bets: TreeMap::new(b"b".to_vec()),
            top_claims: TreeMap::new(b"c".to_vec()),
            num_offers: 0,
            num_bets: 0,
            num_claims: 0,
            num_acquisitions: 0,
            total_commission: 0,
            acquisition_time: ACQUISITION_TIME,
            owner_id: owner_id.into(),
            dao_id: dao_id.into(),
        }
    }

    pub fn get_global_stats(&self) -> (u64, u64, WrappedBalance, u64, u64, u64, u64) {
        (
            self.profiles.len(),
            self.bids.len(),
            self.total_commission.into(),
            self.num_offers,
            self.num_bets,
            self.num_claims,
            self.num_acquisitions,
        )
    }
}
