use crate::*;

pub const PLACE_DEPOSIT: Balance = 1_000_000_000_000_000_000_000_000;
pub const WITHDRAW_DEPOSIT: Balance = ONE_YOCTO;

pub const ON_ACQUIRE_FUNCTION_CALL_GAS: u64 = 100_000_000_000_000;
/// Indicates there are no deposit for a callback for better readability
pub const ONE_YOCTO: Balance = 1;
const NO_DEPOSIT: u128 = 0;
const MAX_DESCRIPTION_LEN: usize = 256;

pub const ERR_PLACE_DEPOSIT_NOT_ENOUGH: &str = "Attached deposit must be no less than 1 NEAR";
pub const ERR_WITHDRAW_DEPOSIT_NOT_ENOUGH: &str =
    "Attached deposit must be no less than 1 yoctoNEAR";
pub const ERR_ACCEPT_DEPOSIT_NOT_ENOUGH: &str =
    "Attached deposit must be no less than 101% of price";
pub const ERR_GAINER_SAME_AS_OFFER: &str = "Offered account cannot take profit";
pub const ERR_ACCESS_DENIED: &str = "Caller is not allowed to perform the action";
pub const ERR_DESCRIPTION_TOO_LONG: &str = "Description is too long (256 characters max)";

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn place(
        &mut self,
        profile_id: ValidAccountId,
        price: WrappedBalance,
        description: Description,
    ) -> bool {
        assert!(
            description.len() <= MAX_DESCRIPTION_LEN,
            "{}",
            ERR_DESCRIPTION_TOO_LONG
        );

        let price: Balance = price.into();
        assert!(
            env::attached_deposit() >= PLACE_DEPOSIT,
            "{}",
            ERR_PLACE_DEPOSIT_NOT_ENOUGH
        );
        assert_ne!(
            &env::predecessor_account_id(),
            profile_id.as_ref(),
            "{}",
            ERR_GAINER_SAME_AS_OFFER
        );

        // Create proposal
        let proposal = Proposal::new(
            profile_id.into(),
            env::block_timestamp(),
            price,
            description,
        );
        self.save_proposal_or_panic(&env::predecessor_account_id(), &proposal);
        self.send(&self.dao_id, PLACE_DEPOSIT);
        self.total_commission += PLACE_DEPOSIT;
        self.num_proposals_total += 1;

        true
    }

    #[payable]
    pub fn withdraw(
        &mut self,
        proposal_id: ValidAccountId,
        new_public_key: Base58PublicKey,
    ) -> Promise {
        assert_eq!(
            env::attached_deposit(),
            ONE_YOCTO,
            "{}",
            ERR_WITHDRAW_DEPOSIT_NOT_ENOUGH
        );
        let proposal = self.extract_proposal_or_panic(proposal_id.as_ref());
        assert_eq!(
            env::predecessor_account_id(),
            proposal.proposal_owner,
            "{}",
            ERR_ACCESS_DENIED
        );

        let key: String = (&new_public_key).into();
        self.num_proposals_withdrawn += 1;

        // TODO what if Promise fails?
        Promise::new(proposal_id.clone().into()).function_call(
            "unlock".to_string().into_bytes(),
            json!({
                "public_key": key,
            })
            .to_string()
            .into_bytes(),
            NO_DEPOSIT,
            ON_ACQUIRE_FUNCTION_CALL_GAS,
        )
    }

    // TODO check the case if price is high and more than contract account amount
    // The promises might be needed to be executed in the strict order
    #[payable]
    pub fn accept(
        &mut self,
        proposal_id: ValidAccountId,
        new_public_key: Base58PublicKey,
    ) -> Promise {
        let proposal = self.extract_proposal_or_panic(proposal_id.as_ref());
        assert!(
            env::attached_deposit() >= (proposal.price / 100) * 101,
            "{}",
            ERR_ACCEPT_DEPOSIT_NOT_ENOUGH
        );
        let key: String = (&new_public_key).into();

        // The order of Promises is chosen in such way, that "unlock" calls the latest
        // to not allow to unlock the account with no paying for it (by playing gas price).
        // TODO do it in a batch and revert
        self.send(&self.dao_id, proposal.price / 100);
        self.total_commission += proposal.price / 100;
        self.send(&proposal.proposal_owner, proposal.price);
        self.num_proposals_accepted += 1;

        // TODO what if Promise fails?
        Promise::new(proposal_id.clone().into()).function_call(
            "unlock".to_string().into_bytes(),
            json!({
                "public_key": key,
            })
            .to_string()
            .into_bytes(),
            NO_DEPOSIT,
            ON_ACQUIRE_FUNCTION_CALL_GAS,
        )
    }

    // TODO uncomment for testing
    /*#[payable]
    pub fn withdraw_test(&mut self, proposal_id: ValidAccountId, new_public_key: Base58PublicKey) {
        assert_eq!(
            env::attached_deposit(),
            ONE_YOCTO,
            "{}",
            ERR_WITHDRAW_DEPOSIT_NOT_ENOUGH
        );
        let proposal = self.extract_proposal_or_panic(proposal_id.as_ref());
        assert_eq!(
            env::predecessor_account_id(),
            proposal.proposal_owner,
            "{}",
            ERR_ACCESS_DENIED
        );

        let _: String = (&new_public_key).into();
        self.num_proposals_withdrawn += 1;
    }

    #[payable]
    pub fn accept_test(&mut self, proposal_id: ValidAccountId, new_public_key: Base58PublicKey) {
        let proposal = self.extract_proposal_or_panic(proposal_id.as_ref());
        assert!(
            env::attached_deposit() >= (proposal.price / 100) * 101,
            "{}",
            ERR_ACCEPT_DEPOSIT_NOT_ENOUGH
        );
        let _: String = (&new_public_key).into();

        self.send(&self.dao_id, proposal.price / 100);
        self.total_commission += proposal.price / 100;
        self.send(&proposal.proposal_owner, proposal.price);
        self.num_proposals_accepted += 1;
    }*/
}

impl Contract {
    fn send(&self, account_id: &AccountId, value: Balance) -> Promise {
        // TODO what if Promise fails?
        Promise::new(account_id.into()).transfer(value)
    }
}
