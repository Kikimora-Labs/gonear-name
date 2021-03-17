use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::{Base58PublicKey, ValidAccountId};
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault, Promise};

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub owner_id: AccountId,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: ValidAccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            owner_id: owner_id.into(),
        }
    }

    pub fn add_access_key(&mut self, public_key: Base58PublicKey) {
        assert_eq!(env::predecessor_account_id(), self.owner_id, "BOOM");
        Promise::new(env::current_account_id())
            .add_full_access_key(public_key.into());
        // TODO callback
        // TODO remove state
        self.owner_id = "no_way".into();
    }
}
