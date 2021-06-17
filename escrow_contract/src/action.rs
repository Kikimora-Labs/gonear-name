use crate::*;

pub const PLACE_DEPOSIT: Balance = 1_000_000_000_000_000_000_000_000;
pub const WITHDRAW_DEPOSIT: Balance = 1; // 1 yocto
pub const ACCEPT_DEPOSIT: Balance = 1_000_000_000_000_000_000_000_000;
pub const ACQUIRE_DEPOSIT: Balance = 1; // 1 yocto

pub const ON_ACQUIRE_FUNCTION_CALL_GAS: u64 = 100_000_000_000_000;
/// Indicates there are no deposit for a callback for better readability
const NO_DEPOSIT: u128 = 0;

pub const ERR_PLACE_DEPOSIT_NOT_ENOUGH: &str =
    "Attached deposit must be no less than PLACE_DEPOSIT + 1% of price";
pub const ERR_ACCEPT_DEPOSIT_NOT_ENOUGH: &str =
    "Attached deposit must be no less than ACCEPT_DEPOSIT + 102% of price";
pub const ERR_GAINER_SAME_AS_OFFER: &str = "Offered account cannot take profit";
pub const ERR_ACCESS_DENIED: &str = "Caller is not allowed to perform the action";
pub const ERR_PROPOSAL_DEPOSIT_RECEIVED: &str =
    "Proposal cannot be withdrawn, the deposit is already received";
pub const ERR_PROPOSAL_EXPIRED: &str = "Proposal is already expired";
pub const ERR_ACQUIRE_REJECTED: &str = "Do not have permission to acquire";

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn place(&mut self,
            profile_id: ValidAccountId,
            price: WrappedBalance,
            description: String
            ) -> bool {

        assert!(description.len() <= 200, "Abort. Description is longer then 200 characters");

        let price: Balance = price.into();
        assert!(
            env::attached_deposit() >= PLACE_DEPOSIT + price / 100,
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
        let proposal = Proposal::new(profile_id.into(), env::block_timestamp(), price, description);
        self.save_proposal_or_panic(&env::predecessor_account_id(), &proposal);
        self.top_proposals
            .insert(&(price, env::predecessor_account_id()), &());
        self.send(&self.dao_id, PLACE_DEPOSIT + price / 100);
        self.total_commission += PLACE_DEPOSIT + price / 100;
        self.num_proposals_total += 1;

        true
    }

    #[payable]
    pub fn withdraw(&mut self, proposal_id: ValidAccountId) -> bool {
        let proposal = self.extract_proposal_or_panic(proposal_id.as_ref());
        assert_eq!(
            env::predecessor_account_id(),
            proposal.proposal_owner,
            "{}",
            ERR_ACCESS_DENIED
        );
        assert!(
            proposal.new_owner.is_none(),
            "{}",
            ERR_PROPOSAL_DEPOSIT_RECEIVED
        );

        // Remove proposal
        self.top_proposals
            .remove(&(proposal.price, proposal_id.into()));
        self.num_proposals_withdrawn += 1;

        true
    }

    #[payable]
    pub fn accept(&mut self, proposal_id: ValidAccountId) -> bool {
        let mut proposal = self.extract_proposal_or_panic(proposal_id.as_ref());
        assert!(
            proposal.new_owner.is_none(),
            "{}",
            ERR_PROPOSAL_DEPOSIT_RECEIVED
        );
        assert!(
            !proposal.is_expired(self.expiration_period),
            "{}",
            ERR_PROPOSAL_EXPIRED
        );
        assert!(
            env::attached_deposit() >= ACCEPT_DEPOSIT + (proposal.price / 100) * 102,
            "{}",
            ERR_ACCEPT_DEPOSIT_NOT_ENOUGH
        );

        proposal.new_owner = Some(env::predecessor_account_id());
        self.save_proposal_or_panic(proposal_id.as_ref(), &proposal);
        self.top_proposals
            .remove(&(proposal.price, proposal_id.into()));
        self.send(&self.dao_id, ACCEPT_DEPOSIT + (proposal.price / 100) * 2);
        self.total_commission += ACCEPT_DEPOSIT + (proposal.price / 100) * 2;
        self.send(&proposal.proposal_owner, proposal.price);
        self.num_proposals_accepted += 1;

        true
    }

    // TODO payable?
    #[payable]
    pub fn acquire(
        &mut self,
        proposal_id: ValidAccountId,
        new_public_key: Base58PublicKey,
    ) -> bool {
        let proposal = self.extract_proposal_or_panic(proposal_id.as_ref());
        assert_eq!(
            proposal.new_owner,
            Some(env::predecessor_account_id()),
            "{}",
            ERR_ACQUIRE_REJECTED
        );

        let key: String = (&new_public_key).into();

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
        );

        true
    }

     #[payable]
        pub fn accept_and_acquire(&mut self, proposal_id: ValidAccountId, new_public_key: Base58PublicKey) -> bool {
            if self.accept(proposal_id.clone()){
                let result = self.acquire(proposal_id, new_public_key);
                return result;
            }
                false
        }

}

impl Contract {
    fn send(&self, account_id: &AccountId, value: Balance) -> Promise {
        Promise::new(account_id.into()).transfer(value)
    }
}
