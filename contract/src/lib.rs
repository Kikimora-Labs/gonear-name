mod account;
mod action;
mod profile;

pub use crate::account::*;
pub use crate::action::*;
pub use crate::profile::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{TreeMap, UnorderedMap, UnorderedSet, Vector};
use near_sdk::json_types::{Base58PublicKey, ValidAccountId, WrappedBalance, WrappedTimestamp};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, ext_contract, near_bindgen, AccountId, Balance, PanicOnDefault, Promise, PromiseResult,
    PublicKey, Timestamp,
};

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub profiles: UnorderedMap<AccountId, Profile>,

    pub accounts: UnorderedMap<AccountId, Account>,

    pub bet_to_account_id: TreeMap<(Balance, AccountId), ()>,
    pub claim_to_account_id: TreeMap<(Balance, AccountId), ()>,

    pub num_offers: u64,
    pub num_bets: u64,
    pub num_claims: u64,
    pub num_acquisitions: u64,

    pub owner_id: AccountId,
    pub owner_pk: PublicKey,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: ValidAccountId, owner_pk: Base58PublicKey) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            profiles: UnorderedMap::new(b"u".to_vec()),
            accounts: UnorderedMap::new(b"a".to_vec()),
            bet_to_account_id: TreeMap::new(b"b".to_vec()),
            claim_to_account_id: TreeMap::new(b"c".to_vec()),
            num_offers: 0,
            num_bets: 0,
            num_claims: 0,
            num_acquisitions: 0,
            owner_id: owner_id.into(),
            owner_pk: owner_pk.into(),
        }
    }
}
