use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::{Base58PublicKey, ValidAccountId};
use near_sdk::{
    env, ext_contract, near_bindgen, AccountId, PanicOnDefault, Promise, PromiseResult,
};

const ON_ACCESS_KEY_ADDED_CALLBACK_GAS: u64 = 20_000_000_000_000;
/// Indicates there are no deposit for a callback for better readability
const NO_DEPOSIT: u128 = 0;

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub owner_id: AccountId,
}

#[ext_contract(ext_self)]
pub trait ExtContract {
    fn on_access_key_added(&mut self, owner_id: AccountId) -> bool;
}

fn is_promise_success() -> bool {
    assert_eq!(
        env::promise_results_count(),
        1,
        "Contract expected a result on the callback"
    );
    match env::promise_result(0) {
        PromiseResult::Successful(_) => true,
        _ => false,
    }
}

#[near_bindgen]
impl Contract {
    #[init(ignore_state)]
    pub fn lock(owner_id: ValidAccountId) -> Self {
        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Actor is not allowed to init the contract"
        );
        Self {
            owner_id: owner_id.into(),
        }
    }

    pub fn unlock(&mut self, public_key: Base58PublicKey) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner_id,
            "Actor is not allowed to add a key"
        );
        self.owner_id = AccountId::default();
        Promise::new(env::current_account_id())
            .add_full_access_key(public_key.into())
            .then(ext_self::on_access_key_added(
                env::predecessor_account_id(),
                &env::current_account_id(),
                NO_DEPOSIT,
                ON_ACCESS_KEY_ADDED_CALLBACK_GAS,
            ));
    }

    pub fn get_owner(&self) -> AccountId {
        self.owner_id.clone()
    }

    // Callback
    pub fn on_access_key_added(&mut self, owner_id: AccountId) -> bool {
        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Callback can only be called from the contract"
        );
        let access_key_created = is_promise_success();
        if !access_key_created {
            // In case of failure, put owner_id back
            self.owner_id = owner_id;
        }
        access_key_created
    }
}
