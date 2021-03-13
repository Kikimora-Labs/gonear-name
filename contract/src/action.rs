use crate::*;

pub const OFFER_DEPOSIT: Balance = 450_000_000_000_000_000_000_000;
pub const INIT_BET_PRICE: Balance = 500_000_000_000_000_000_000_000;

pub const INV_COMMISSION: u128 = 20;
pub const INV_REWARD_DECAY_MULT_100: u128 = 144;

pub const ERR_OFFER_DEPOSIT_NOT_ENOUGH: &str =
    "Attached deposit must be no less than OFFER_DEPOSIT";
pub const ERR_GAINER_SAME_AS_OFFER: &str = "Offered account cannot take profit";
pub const ERR_ALREADY_OFFERED: &str = "Account is already offered";
pub const ERR_BET_FORFEIT_NOT_ENOUGH: &str =
    "Attached deposit must be no less than bet price plus forfeit";
pub const ERR_CLAIM_NOT_ENOUGH: &str = "Attached deposit must be no less than claim price";
pub const ERR_ALREADY_CLAIMED: &str = "Account is already claimed";
pub const ERR_BET_ON_ACQUISITION: &str = "Account is on acquisition";
pub const ERR_NOT_ON_ACQUISITION: &str = "Account is not on acquisition";
pub const ERR_ACQUIRE_REJECTED: &str = "Do not have permission to acquire";

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn offer(&mut self, profile_id: ValidAccountId) -> bool {
        assert!(
            env::attached_deposit() >= OFFER_DEPOSIT,
            "{}",
            ERR_OFFER_DEPOSIT_NOT_ENOUGH
        );
        assert_ne!(
            &env::predecessor_account_id(),
            profile_id.as_ref(),
            "{}",
            ERR_GAINER_SAME_AS_OFFER
        );

        // Adding bid to the Marketplace
        let mut bid = self.extract_bid_or_create(&env::predecessor_account_id());
        assert_eq!(bid.bets.len(), 0, "{}", ERR_ALREADY_OFFERED);

        // Updating profile
        let mut profile = self.extract_profile_or_create(profile_id.as_ref());
        profile.num_offers += 1;
        profile.participation.insert(&env::predecessor_account_id());
        self.save_profile_or_panic(profile_id.as_ref(), &profile);

        // Insert account and update bet leaders
        self.bet_and_update_leaders(
            profile_id.as_ref(),
            &env::predecessor_account_id(),
            &mut bid,
        );

        true
    }

    #[payable]
    pub fn bet(&mut self, bid_id: ValidAccountId) -> bool {
        let mut bid = self.bids.remove(bid_id.as_ref()).unwrap();
        let bet_price = self.calculate_bet(&bid);

        let forfeit = if let Some((_claim_profile_id, timestamp)) = bid.claim {
            assert!(
                !self.on_acquisition(&timestamp),
                "{}",
                ERR_BET_ON_ACQUISITION
            );
            // TODO rewards for claim
            bid.claim = None;
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
        profile.participation.insert(bid_id.as_ref());
        self.save_profile_or_panic(&env::predecessor_account_id(), &profile);

        // Insert account and update bet leaders
        self.bet_and_update_leaders(&env::predecessor_account_id(), bid_id.as_ref(), &mut bid);

        true
    }

    #[payable]
    pub fn claim(&mut self, bid_id: ValidAccountId) -> bool {
        let mut bid = self.bids.remove(bid_id.as_ref()).unwrap();
        let claim_price = self.calculate_bet(&bid) * 2;
        assert!(
            env::attached_deposit() >= claim_price,
            "{}",
            ERR_CLAIM_NOT_ENOUGH
        );

        assert!(bid.claim.is_none(), "{}", ERR_ALREADY_CLAIMED);
        bid.claim = Some((env::predecessor_account_id(), env::block_timestamp()));
        self.bids.insert(bid_id.as_ref(), &bid);

        // Update profile
        let mut profile = self.extract_profile_or_create(&env::predecessor_account_id());
        profile.num_claims += 1;
        profile.participation.insert(bid_id.as_ref());
        self.save_profile_or_panic(&env::predecessor_account_id(), &profile);

        self.top_claims.insert(&(claim_price, bid_id.into()), &());

        true
    }

    #[payable]
    pub fn finalize(&mut self, _bid_id: ValidAccountId) {
        // TODO implement
    }

    #[payable]
    pub fn acquire(&mut self, bid_id: ValidAccountId, new_public_key: Base58PublicKey) -> bool {
        let bid = self.bids.remove(bid_id.as_ref()).unwrap();
        let (profile_id, timestamp) = bid.claim.clone().unwrap();
        assert!(
            self.on_acquisition(&timestamp),
            "{}",
            ERR_NOT_ON_ACQUISITION
        );
        assert_eq!(
            &env::predecessor_account_id(),
            &profile_id,
            "{}",
            ERR_ACQUIRE_REJECTED
        );

        self.update_final_rewards(&bid);

        // Update profile
        let mut profile = self.extract_profile_or_create(&profile_id);
        profile.num_acquisitions += 1;
        profile.participation.remove(bid_id.as_ref());
        profile.acquisitions.push(bid_id.as_ref());
        self.save_profile_or_panic(&profile_id, &profile);

        let claim_price = self.calculate_bet(&bid) * 2;
        self.top_claims.remove(&(claim_price, bid_id.into()));

        Promise::new(env::current_account_id()).add_full_access_key(new_public_key.into()).then({
            // This Promise may fail by design
            Promise::new(env::current_account_id()).delete_key(env::signer_account_pk())
        });

        true
    }

    pub fn get_bet_price(&self, bid_id: ValidAccountId) -> Option<WrappedBalance> {
        self.calculate_bet_by_bid_id(bid_id.as_ref())
            .map(|a| a.into())
    }

    pub fn get_claim_price(&self, bid_id: ValidAccountId) -> Option<WrappedBalance> {
        if let Some(bid) = self.get_bid(bid_id.clone()) {
            if bid.claim.is_some() {
                None
            } else {
                Some((self.calculate_bet_by_bid_id(bid_id.as_ref()).unwrap() * 2).into())
            }
        } else {
            None
        }
    }

    pub fn get_forfeit(&self, bid_id: ValidAccountId) -> Option<WrappedBalance> {
        if let Some(bid) = self.get_bid(bid_id.clone()) {
            if bid.claim.is_none() {
                None
            } else {
                let bet_price = self.calculate_bet_by_bid_id(bid_id.as_ref()).unwrap();
                Some(
                    self.calculate_forfeit(&bid.claim.unwrap().1.into(), bet_price)
                        .into(),
                )
            }
        } else {
            None
        }
    }
}

impl Contract {
    fn bet_and_update_leaders(&mut self, profile_id: &ProfileId, bid_id: &BidId, bid: &mut Bid) {
        let mut bet_price = self.calculate_bet(&bid);
        if bid.bets.len() == 0 {
            // Offer
            self.update_commission(OFFER_DEPOSIT);
        } else {
            self.top_bets.remove(&(bet_price, bid_id.clone()));
            self.update_commission(bet_price / INV_COMMISSION);
            let mut paid = bet_price - bet_price / INV_COMMISSION;
            for i in (0..bid.bets.len()).rev() {
                self.update_reward(
                    &bid.bets.get(i).unwrap(),
                    &(paid / INV_REWARD_DECAY_MULT_100 * 100),
                );
                paid -= paid / INV_REWARD_DECAY_MULT_100 * 100;
            }
            self.update_reward(&bid.bets.get(0).unwrap(), &paid);
        }

        bid.bets.push(&profile_id);
        bet_price = bet_price * 6 / 5;
        self.top_bets.insert(&(bet_price, bid_id.clone()), &());
        self.top_claims.remove(&(bet_price, bid_id.clone()));

        assert!(self.bids.insert(bid_id, bid).is_none());
    }

    fn update_final_rewards(&mut self, _bid: &Bid) {
        // TODO implement
    }

    fn calculate_bet(&self, bid: &Bid) -> Balance {
        let mut bet_price = INIT_BET_PRICE;
        for _ in 1..bid.bets.len() {
            bet_price = bet_price * 6 / 5;
        }
        bet_price
    }

    fn calculate_bet_by_bid_id(&self, bid_id: &BidId) -> Option<Balance> {
        if let Some(bid) = self.bids.get(bid_id) {
            Some(self.calculate_bet(&bid))
        } else {
            None
        }
    }

    fn calculate_forfeit(&self, timestamp: &Timestamp, bet_price: Balance) -> Balance {
        // TODO
        std::cmp::min(
            ((env::block_timestamp() - timestamp) / self.acquisition_time).into(),
            1_000_000_000,
        ) * bet_price
            / 5_000_000_000
            + bet_price / 20
    }

    fn on_acquisition(&self, timestamp: &Timestamp) -> bool {
        env::block_timestamp() - timestamp >= self.acquisition_time * 1_000_000_000
    }

    fn update_commission(&mut self, value: Balance) {
        self.total_commission += value;
    }
}
