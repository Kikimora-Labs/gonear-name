use crate::*;

pub const MIN_REWARDS: Balance = 100_000_000_000_000_000_000_000;
pub const ON_REWARDS_COLLECTED_CALLBACK_GAS: u64 = 30_000_000_000_000;
/// Indicates there are no deposit for a callback for better readability
const NO_DEPOSIT: u128 = 0;

pub const ERR_REWARD_BALANCE_INSUFFICIENT: &str =
    "Available rewards amount is less than MIN_REWARDS boundary";

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Profile {
    pub participation: UnorderedSet<BidId>,
    pub acquisitions: UnorderedSet<BidId>,

    pub bets_volume: Balance,
    pub available_rewards: Balance,
    pub profit_taken: Balance,

    pub num_offers: u64,
    pub num_bets: u64,
    pub num_claims: u64,
    pub num_acquisitions: u64,
}

// TODO remove Debug?
#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct ProfileView {
    pub participation: Vec<BidId>,
    pub acquisitions: Vec<BidId>,

    pub bets_volume: WrappedBalance,
    pub available_rewards: WrappedBalance,
    pub profit_taken: WrappedBalance,

    pub num_offers: u64,
    pub num_bets: u64,
    pub num_claims: u64,
    pub num_acquisitions: u64,
}

impl From<&Profile> for ProfileView {
    fn from(p: &Profile) -> Self {
        Self {
            participation: p.participation.iter().map(|x| x.into()).collect(),
            acquisitions: p.acquisitions.iter().map(|x| x.into()).collect(),
            bets_volume: p.bets_volume.into(),
            available_rewards: p.available_rewards.into(),
            profit_taken: p.profit_taken.into(),
            num_offers: p.num_offers,
            num_bets: p.num_bets,
            num_claims: p.num_claims,
            num_acquisitions: p.num_acquisitions,
        }
    }
}

#[ext_contract(ext_self)]
pub trait ExtContract {
    /// Callback after rewards collecting
    fn on_rewards_collected(&mut self, predecessor_account_id: AccountId, rewards: Balance)
        -> bool;
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
    pub fn get_profile(&self, profile_id: ValidAccountId) -> Option<ProfileView> {
        self.profiles.get(profile_id.as_ref()).map(|p| (&p).into())
    }

    pub fn collect_rewards(&mut self) -> Promise {
        let mut profile = self.extract_profile_or_create(&env::predecessor_account_id());
        let rewards = profile.available_rewards;
        assert!(
            rewards >= MIN_REWARDS,
            "{}",
            ERR_REWARD_BALANCE_INSUFFICIENT
        );
        profile.available_rewards = 0;
        profile.profit_taken += rewards;
        self.save_profile_or_panic(&env::predecessor_account_id(), &profile);

        Promise::new(env::predecessor_account_id())
            .transfer(rewards)
            .then(ext_self::on_rewards_collected(
                env::predecessor_account_id(),
                rewards,
                &env::current_account_id(),
                NO_DEPOSIT,
                ON_REWARDS_COLLECTED_CALLBACK_GAS,
            ))
    }

    pub fn on_rewards_collected(
        &mut self,
        predecessor_account_id: AccountId,
        rewards: Balance,
    ) -> bool {
        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Callback can only be called from the contract"
        );
        let rewards_transferred = is_promise_success();
        if !rewards_transferred {
            // In case of failure, put the amount back
            let mut profile = self.extract_profile_or_create(&predecessor_account_id);
            profile.available_rewards = rewards;
            profile.profit_taken -= rewards;
            self.save_profile_or_panic(&env::predecessor_account_id(), &profile);
        }
        rewards_transferred
    }
}

impl Contract {
    pub(crate) fn extract_profile_or_create(&mut self, profile_id: &ProfileId) -> Profile {
        self.profiles.remove(&profile_id).unwrap_or_else(|| {
            let mut prefix = Vec::with_capacity(33);
            prefix.push(b'p');
            prefix.extend(env::sha256(profile_id.as_bytes()));
            let mut prefix2 = Vec::with_capacity(33);
            prefix2.push(b'q');
            prefix2.extend(env::sha256(profile_id.as_bytes()));
            Profile {
                participation: UnorderedSet::new(prefix),
                acquisitions: UnorderedSet::new(prefix2),
                bets_volume: 0,
                available_rewards: 0,
                profit_taken: 0,
                num_offers: 0,
                num_bets: 0,
                num_claims: 0,
                num_acquisitions: 0,
            }
        })
    }

    pub(crate) fn save_profile_or_panic(&mut self, profile_id: &ProfileId, profile: &Profile) {
        assert!(self.profiles.insert(profile_id, profile).is_none());
    }

    pub(crate) fn update_reward(&mut self, profile_id: &ProfileId, value: &Balance) {
        let mut profile = self.extract_profile_or_create(profile_id);
        profile.available_rewards += value;
        self.save_profile_or_panic(profile_id, &profile);
    }
}
