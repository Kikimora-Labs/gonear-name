use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Profile {
    pub participation: UnorderedSet<AccountId>,

    pub acquisitions: Vector<AccountId>,

    pub bets_volume: Balance,
    pub available_rewards: Balance,
    pub profit_taken: Balance,

    pub num_offers: u64,
    pub num_bets: u64,
    pub num_claims: u64,
    pub num_acquisitions: u64,
}

// TODO remove Debug
#[derive(Deserialize, Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct ProfileView {
    pub participation: Vec<AccountId>,

    pub acquisitions: Vec<AccountId>,

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

#[near_bindgen]
impl Contract {
    pub fn get_profile(&self, account_id: ValidAccountId) -> Option<ProfileView> {
        self.profiles.get(account_id.as_ref()).map(|p| (&p).into())
    }

    /*pub fn register_profile(&mut self) -> ProfileView {
        let account_id = env::predecessor_account_id();
        let profile = self.get_profile_or_create(&account_id);
        self.save_profile(&account_id, &profile);
        (&profile).into()
    }*/

    pub fn get_num_profiles(&self) -> u64 {
        self.profiles.len()
    }
}

impl Contract {
    pub(crate) fn extract_profile_or_create(&mut self, account_id: &AccountId) -> Profile {
        self.profiles.remove(&account_id).unwrap_or_else(|| {
            let mut prefix = Vec::with_capacity(33);
            prefix.push(b'p');
            prefix.extend(env::sha256(account_id.as_bytes()));
            let mut prefix2 = Vec::with_capacity(33);
            prefix2.push(b'q');
            prefix2.extend(env::sha256(account_id.as_bytes()));
            Profile {
                participation: UnorderedSet::new(prefix),
                acquisitions: Vector::new(prefix2),
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

    pub(crate) fn save_profile_or_panic(&mut self, account_id: &AccountId, profile: &Profile) {
        assert!(self.profiles.insert(account_id, profile).is_none());
    }
}