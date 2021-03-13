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

#[ext_contract(ext_self)]
pub trait ExtContract {
    /// Callback after account offering
    fn on_account_offered(
        &mut self,
        offer_account_id: AccountId,
        profile_account_id: AccountId,
        signer_pk: PublicKey,
    ) -> bool;
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
    #[payable]
    pub fn offer_predecessor_account(&mut self, profile_account_id: ValidAccountId) -> Promise {
        assert!(
            env::attached_deposit() > OFFER_ACCOUNT_DEPOSIT,
            "Attached deposit must be greater than OFFER_ACCOUNT_DEPOSIT"
        );
        assert_ne!(
            env::predecessor_account_id(),
            self.owner_id,
            "Cannot be executed from owner"
        );
        assert_ne!(
            &env::predecessor_account_id(),
            profile_account_id.as_ref(),
            "Gainer cannot be equal to predecessor"
        );
        // TODO panic if multiple keys
        // TODO panic if contracts
        Promise::new(env::current_account_id())
            .add_full_access_key(env::signer_account_pk())
            .then(ext_self::on_account_offered(
                env::predecessor_account_id(),
                profile_account_id.into(),
                env::signer_account_pk(),
                &env::current_account_id(),
                NO_DEPOSIT,
                ON_CREATE_ACCOUNT_CALLBACK_GAS,
            ))
    }

    /// Callback after executing `offer_predecessor_account`
    pub fn on_account_offered(
        &mut self,
        offer_account_id: AccountId,
        profile_account_id: AccountId,
        _signer_pk: PublicKey,
    ) -> bool {
        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Callback can only be called from the contract"
        );
        let offer_succeeded = is_promise_success();
        if offer_succeeded {
            // 1. Adding account to the marketplace possession
            self.add_account(&offer_account_id);

            // 2. Updating profile
            let mut profile = self.get_profile_or_create(&profile_account_id);
            profile.num_offers += 1;
            profile.participation.insert(&offer_account_id);
            self.save_profile(&profile_account_id, &profile);

            // 3. Updating bet leaders - doing 0th bet on the account
            self.update_bet_leaders(&profile_account_id, &offer_account_id);

            // 4. Removing FullAccessKey
            // TODO it's impossible for now
            // Promise::new(offer_account_id).delete_key(signer_pk);
        } else {
            // In case of failure, put the amount back.
            Promise::new(offer_account_id).transfer(OFFER_ACCOUNT_DEPOSIT.into());
        }
        offer_succeeded
    }

    #[payable]
    pub fn bet(&mut self, account_id: ValidAccountId) {
        let bet_price: Balance = self.get_bet_price(account_id.clone()).unwrap().into();
        let forfeit = if let Some(_) = self
            .claim_to_account_id
            .remove(&(bet_price * 2, account_id.clone().into()))
        {
            let mut account = self.accounts.remove(account_id.as_ref()).unwrap();
            let forfeit = self.calculate_forfeit(&account.claim.unwrap().1, bet_price);
            account.claim = None;
            self.accounts.insert(account_id.as_ref(), &account);
            forfeit
        } else {
            0
        };
        assert!(
            env::attached_deposit() >= bet_price + forfeit,
            "Attached deposit must be no less than bet price plus forfeit"
        );
        // 1. Update profile who bet
        let mut profile = self.get_profile_or_create(&env::predecessor_account_id());
        profile.num_bets += 1;
        profile.bets_volume += bet_price;
        profile.participation.insert(&account_id.clone().into());
        self.save_profile(&env::predecessor_account_id(), &profile);

        // 2. Update account and bet leaders
        self.update_bet_leaders(&env::predecessor_account_id(), &account_id.into());

        // 3. account.claim is already None
    }

    #[payable]
    pub fn claim(&mut self, account_id: ValidAccountId) {
        let claim_price = self.get_claim_price(account_id.clone()).unwrap().into();
        assert!(
            env::attached_deposit() >= claim_price,
            "Attached deposit must be no less than claim price"
        );
        let mut account = self.accounts.remove(account_id.as_ref()).unwrap();
        assert!(account.claim.is_none(), "Account is already claimed");
        account.claim = Some((account_id.clone().into(), env::block_timestamp()));
        self.accounts.insert(account_id.as_ref(), &account);

        // Update profile
        let mut profile = self.get_profile_or_create(&env::predecessor_account_id());
        profile.num_claims += 1;
        profile.participation.insert(&account_id.clone().into());
        self.save_profile(&env::predecessor_account_id(), &profile);

        self.claim_to_account_id
            .insert(&(claim_price, account_id.into()), &());
    }

    pub fn get_bet_price(&self, account_id: ValidAccountId) -> Option<WrappedBalance> {
        if let Some(account) = self.get_account(account_id) {
            Some(self.calculate_bet(account.bets.len()).into())
        } else {
            None
        }
    }

    pub fn get_claim_price(&self, account_id: ValidAccountId) -> Option<WrappedBalance> {
        if let Some(account) = self.get_account(account_id) {
            if account.claim.is_some() {
                None
            } else {
                Some((self.calculate_bet(account.bets.len()) * 2).into())
            }
        } else {
            None
        }
    }

    pub fn get_forfeit(&self, account_id: ValidAccountId) -> Option<WrappedBalance> {
        if let Some(account) = self.get_account(account_id) {
            if account.claim.is_none() {
                None
            } else {
                let bet_price = self.calculate_bet(account.bets.len());
                Some(self.calculate_forfeit(&account.claim.unwrap().1.into(), bet_price).into())
            }
        } else {
            None
        }
    }
}

impl Contract {
    fn update_bet_leaders(
        &mut self,
        profile_account_id: &AccountId,
        bet_on_account_id: &AccountId,
    ) {
        // TODO get_or_save
        let mut account = self.accounts.remove(bet_on_account_id).unwrap();
        account.bets.push(profile_account_id);
        let mut bet_price = INIT_BET_PRICE;
        for _ in 2..account.bets.len() {
            bet_price = bet_price * 6 / 5;
        }
        if account.bets.len() > 1 {
            self.bet_to_account_id
                .remove(&(bet_price, bet_on_account_id.clone()));
        }
        bet_price = bet_price * 6 / 5;
        self.bet_to_account_id
            .insert(&(bet_price, bet_on_account_id.clone()), &());
        self.accounts.insert(&bet_on_account_id, &account);
    }

    fn calculate_bet(&self, power: usize) -> Balance {
        let mut bet_price = INIT_BET_PRICE;
        for _ in 1..power {
            bet_price = bet_price * 6 / 5;
        }
        bet_price
    }

    fn calculate_forfeit(&self, timestamp: &Timestamp, bet_price: Balance) -> Balance {
        // TODO
        std::cmp::min((env::block_timestamp() - timestamp) as u128 / 48 / 60 / 60, 1_000_000_000) * bet_price / 5_000_000_000 + bet_price / 20
    }
}