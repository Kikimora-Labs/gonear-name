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
use near_sdk::{env, log, near_bindgen, AccountId, Balance, PanicOnDefault, PublicKey, Timestamp};

pub type BidId = AccountId;
pub type ProfileId = AccountId;

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

    pub owner_id: AccountId,
    pub owner_pk: PublicKey,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn test_new() -> Self {
        assert!(!env::state_exists(), "Already initialized");
        log!(
            "Test init with owner_id = {:?}, owner_pk = {:?}",
            env::signer_account_id(),
            env::signer_account_pk()
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
            owner_id: env::signer_account_id(),
            owner_pk: env::signer_account_pk(),
        }
    }

    #[init]
    pub fn new(owner_id: ValidAccountId, owner_pk: Base58PublicKey) -> Self {
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
            owner_id: owner_id.into(),
            owner_pk: owner_pk.into(),
        }
    }
}
