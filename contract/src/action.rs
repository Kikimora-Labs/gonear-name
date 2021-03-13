use crate::*;

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub enum Action {
    Offer(AccountId),
    Bet(AccountId),
    Claim(AccountId),
}

pub const OFFER_ACCOUNT_DEPOSIT: u128 = 450_000_000_000_000_000_000_000;
pub const OFFER_ACCOUNT_GAS_COVERAGE: u128 = 30_000_000_000_000_000_000_000;
pub const ON_CREATE_ACCOUNT_CALLBACK_GAS: u64 = 20_000_000_000_000;

pub const INIT_BET_PRICE: u128 = 500_000_000_000_000_000_000_000;

/// Indicates there are no deposit for a callback for better readability
pub const NO_DEPOSIT: u128 = 0;

pub const ERR_OFFER_ACCOUNT_DEPOSIT_NOT_ENOUGH: &str =
    "Attached deposit must be no less than OFFER_ACCOUNT_DEPOSIT";
pub const ERR_GAINER_SAME_AS_OFFER: &str = "Offered account cannot take profit";
pub const ERR_ALREADY_OFFERED: &str = "Account is already offered";
pub const ERR_BET_FORFEIT_NOT_ENOUGH: &str =
    "Attached deposit must be no less than bet price plus forfeit";
pub const ERR_CLAIM_NOT_ENOUGH: &str = "Attached deposit must be no less than claim price";
pub const ERR_ALREADY_CLAIMED: &str = "Account is already claimed";

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn offer(&mut self, profile_account_id: ValidAccountId) -> bool {
        assert!(
            env::attached_deposit() >= OFFER_ACCOUNT_DEPOSIT,
            "{}",
            ERR_OFFER_ACCOUNT_DEPOSIT_NOT_ENOUGH
        );
        assert_ne!(
            &env::predecessor_account_id(),
            profile_account_id.as_ref(),
            "{}",
            ERR_GAINER_SAME_AS_OFFER
        );

        // Adding account to the Marketplace
        let mut account = self.extract_account_or_create(&env::predecessor_account_id());
        assert_eq!(account.bets.len(), 0, "{}", ERR_ALREADY_OFFERED);

        // Updating profile
        let mut profile = self.extract_profile_or_create(profile_account_id.as_ref());
        profile.num_offers += 1;
        profile.participation.insert(&env::predecessor_account_id());
        self.save_profile_or_panic(profile_account_id.as_ref(), &profile);

        // Insert account and update bet leaders
        self.bet_and_update_leaders(
            profile_account_id.as_ref(),
            &env::predecessor_account_id(),
            &mut account,
        );

        true
    }

    #[payable]
    pub fn bet(&mut self, account_id: ValidAccountId) -> bool {
        let mut account = self.accounts.remove(account_id.as_ref()).unwrap();
        let bet_price = self.calculate_bet(&account);
        let forfeit = if let Some((_claim_account_id, timestamp)) = account.claim {
            // TODO rewards for claim
            account.claim = None;
            self.calculate_forfeit(&timestamp, bet_price)
        } else {
            0
        };

        assert!(
            env::attached_deposit() >= bet_price + forfeit,
            "{}",
            ERR_BET_FORFEIT_NOT_ENOUGH
        );

        // Update profile who bet
        let mut profile = self.extract_profile_or_create(&env::predecessor_account_id());
        profile.num_bets += 1;
        profile.bets_volume += bet_price;
        profile.participation.insert(&account_id.clone().into());
        self.save_profile_or_panic(&env::predecessor_account_id(), &profile);

        // Insert account and update bet leaders
        self.bet_and_update_leaders(
            &env::predecessor_account_id(),
            account_id.as_ref(),
            &mut account,
        );

        true
    }

    #[payable]
    pub fn claim(&mut self, account_id: ValidAccountId) {
        let mut account = self.accounts.remove(account_id.as_ref()).unwrap();
        let claim_price = self.calculate_bet(&account) * 2;
        assert!(
            env::attached_deposit() >= claim_price,
            "{}",
            ERR_CLAIM_NOT_ENOUGH
        );

        assert!(account.claim.is_none(), "{}", ERR_ALREADY_CLAIMED);
        account.claim = Some((account_id.clone().into(), env::block_timestamp()));
        self.accounts.insert(account_id.as_ref(), &account);

        // Update profile
        let mut profile = self.extract_profile_or_create(&env::predecessor_account_id());
        profile.num_claims += 1;
        profile.participation.insert(&account_id.clone().into());
        self.save_profile_or_panic(&env::predecessor_account_id(), &profile);

        self.claim_to_account_id
            .insert(&(claim_price, account_id.into()), &());
    }

    pub fn get_bet_price(&self, account_id: ValidAccountId) -> Option<WrappedBalance> {
        self.calculate_bet_account_id(account_id.as_ref())
            .map(|a| a.into())
    }

    pub fn get_claim_price(&self, account_id: ValidAccountId) -> Option<WrappedBalance> {
        if let Some(account) = self.get_account(account_id.clone()) {
            if account.claim.is_some() {
                None
            } else {
                Some((self.calculate_bet_account_id(account_id.as_ref()).unwrap() * 2).into())
            }
        } else {
            None
        }
    }

    pub fn get_forfeit(&self, account_id: ValidAccountId) -> Option<WrappedBalance> {
        if let Some(account) = self.get_account(account_id.clone()) {
            if account.claim.is_none() {
                None
            } else {
                let bet_price = self.calculate_bet_account_id(account_id.as_ref()).unwrap();
                Some(
                    self.calculate_forfeit(&account.claim.unwrap().1.into(), bet_price)
                        .into(),
                )
            }
        } else {
            None
        }
    }
}

impl Contract {
    fn bet_and_update_leaders(
        &mut self,
        profile_account_id: &AccountId,
        bet_on_account_id: &AccountId,
        account: &mut Account,
    ) {
        let mut bet_price = self.calculate_bet(&account);
        if account.bets.len() > 0 {
            self.bet_to_account_id
                .remove(&(bet_price, bet_on_account_id.clone()));
        }

        account.bets.push(&profile_account_id);
        bet_price = bet_price * 6 / 5;
        self.bet_to_account_id
            .insert(&(bet_price, bet_on_account_id.clone()), &());
        assert!(self.accounts.insert(bet_on_account_id, account).is_none());
    }

    fn calculate_bet(&self, account: &Account) -> Balance {
        let mut bet_price = INIT_BET_PRICE;
        for _ in 1..account.bets.len() {
            bet_price = bet_price * 6 / 5;
        }
        bet_price
    }

    fn calculate_bet_account_id(&self, account_id: &AccountId) -> Option<Balance> {
        if let Some(account) = self.accounts.get(account_id) {
            Some(self.calculate_bet(&account))
        } else {
            None
        }
    }

    fn calculate_forfeit(&self, timestamp: &Timestamp, bet_price: Balance) -> Balance {
        // TODO
        std::cmp::min(
            (env::block_timestamp() - timestamp) as u128 / 48 / 60 / 60,
            1_000_000_000,
        ) * bet_price
            / 5_000_000_000
            + bet_price / 20
    }
}
