use std::convert::TryInto;

/// Import the generated proxy contract
use escrow_marketplace::ContractContract as EMContract;
use escrow_marketplace::{
    ProposalView, ACCEPT_DEPOSIT, ACQUIRE_DEPOSIT, ERR_GAINER_SAME_AS_OFFER,
    ERR_PLACE_DEPOSIT_NOT_ENOUGH, ERR_PROPOSAL_DEPOSIT_RECEIVED, ERR_PROPOSAL_EXPIRED,
    PLACE_DEPOSIT, WITHDRAW_DEPOSIT,
};

use near_sdk::json_types::Base58PublicKey;
use near_sdk::Balance;
use near_sdk_sim::{call, deploy, init_simulator, to_yocto, view, ContractAccount, UserAccount};

// Load in contract bytes at runtime
near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
  CONTRACT_WASM_BYTES => "res/escrow_marketplace.wasm",
}

const CONTRACT_ID: &str = "marketplace";
const ANY_ERR: Option<&str> = Some("");

fn test_init() -> (UserAccount, ContractAccount<EMContract>) {
    let master_account = init_simulator(None);

    let deployed_contract = deploy!(
        contract: EMContract,
        contract_id: CONTRACT_ID,
        bytes: &CONTRACT_WASM_BYTES,
        signer_account: master_account,
        init_method: test_new(10, master_account.account_id().try_into().unwrap()) // 10 seconds
    );
    (master_account, deployed_contract)
}

fn init() -> (UserAccount, ContractAccount<EMContract>) {
    let master_account = init_simulator(None);
    let deployed_contract = deploy!(
        contract: EMContract,
        contract_id: CONTRACT_ID,
        bytes: &CONTRACT_WASM_BYTES,
        signer_account: master_account,
        init_method: new(master_account.account_id().try_into().unwrap(), master_account.account_id().try_into().unwrap())
    );
    (master_account, deployed_contract)
}

fn to_base58_pk(user: &UserAccount) -> Base58PublicKey {
    let key: String = (&user.signer.public_key).into();
    key.try_into().unwrap()
}

fn create_carol(master_account: &UserAccount) -> UserAccount {
    master_account.create_user("carol".into(), to_yocto("1000000000"))
}

fn create_bob_sells_alice(
    master_account: &UserAccount,
    contract: &ContractAccount<EMContract>,
) -> (UserAccount, UserAccount) {
    let alice = master_account.create_user("alice".into(), to_yocto("1000000000"));
    let bob = master_account.create_user("bob".into(), to_yocto("1000000000"));

    let outcome = call!(
        alice,
        contract.place(bob.account_id().try_into().unwrap(), to_yocto("100").into()),
        deposit = PLACE_DEPOSIT + to_yocto("1")
    );
    outcome.assert_success();
    let result: bool = outcome.unwrap_json();
    assert!(result);
    (alice, bob)
}

fn do_place(
    profile: &UserAccount,
    proposal: &UserAccount,
    price: Balance,
    contract: &ContractAccount<EMContract>,
    err: Option<&str>,
) {
    let outcome = call!(
        proposal,
        contract.place(profile.account_id().try_into().unwrap(), price.into()),
        deposit = PLACE_DEPOSIT + price / 100
    );
    if let Some(msg) = err {
        assert!(format!("{:?}", outcome.status()).contains(msg));
        assert!(!outcome.is_ok(), "Should panic");
    } else {
        outcome.assert_success();
    }
}

fn do_withdraw(
    profile: &UserAccount,
    proposal: &UserAccount,
    contract: &ContractAccount<EMContract>,
    err: Option<&str>,
) {
    let outcome = call!(
        profile,
        contract.withdraw(proposal.account_id().try_into().unwrap()),
        deposit = WITHDRAW_DEPOSIT
    );
    if let Some(msg) = err {
        assert!(format!("{:?}", outcome.status()).contains(msg));
        assert!(!outcome.is_ok(), "Should panic");
    } else {
        outcome.assert_success();
    }
}

fn do_accept(
    profile: &UserAccount,
    proposal: &UserAccount,
    deposit: Balance,
    contract: &ContractAccount<EMContract>,
    err: Option<&str>,
) {
    let outcome = call!(
        profile,
        contract.accept(proposal.account_id().try_into().unwrap()),
        deposit = deposit
    );
    if let Some(msg) = err {
        assert!(format!("{:?}", outcome.status()).contains(msg));
        assert!(!outcome.is_ok(), "Should panic");
    } else {
        outcome.assert_success();
    }
}

fn do_acquire(
    profile: &UserAccount,
    proposal: &UserAccount,
    contract: &ContractAccount<EMContract>,
    err: Option<&str>,
) {
    let outcome = call!(
        profile,
        contract.acquire(
            proposal.account_id().try_into().unwrap(),
            to_base58_pk(&profile)
        ),
        deposit = ACQUIRE_DEPOSIT
    );
    if let Some(msg) = err {
        assert!(format!("{:?}", outcome.status()).contains(msg));
        assert!(!outcome.is_ok(), "Should panic");
    } else {
        outcome.assert_success();
    }
}

fn get_proposal_view(
    proposal: &UserAccount,
    contract: &ContractAccount<EMContract>,
) -> Option<ProposalView> {
    view!(contract.get_proposal(proposal.account_id().try_into().unwrap())).unwrap_json()
}

fn sdk_sim_tick_tock(profile: &UserAccount, contract: &ContractAccount<EMContract>) {
    let _outcome = call!(
        profile,
        contract.acquire(
            profile.account_id().try_into().unwrap(),
            to_base58_pk(&profile)
        ),
        deposit = ACQUIRE_DEPOSIT
    );
}

#[test]
fn simulate_test_init() {
    let (_, _) = test_init();
}

#[test]
fn simulate_init() {
    let (_, _) = init();
}

#[test]
fn simulate_place() {
    let (master_account, contract) = init();

    let alice = master_account.create_user("alice".to_string(), to_yocto("100").into());

    do_place(
        &alice,
        &alice,
        to_yocto("101"),
        &contract,
        Some(ERR_GAINER_SAME_AS_OFFER),
    );
    let bob = master_account.create_user("bob".to_string(), to_yocto("204"));

    let outcome = call!(
        alice,
        contract.place(bob.account_id().try_into().unwrap(), to_yocto("100").into()),
        deposit = to_yocto("1.99")
    );
    assert!(format!("{:?}", outcome.status()).contains(ERR_PLACE_DEPOSIT_NOT_ENOUGH));
    let outcome = call!(
        alice,
        contract.place(bob.account_id().try_into().unwrap(), to_yocto("100").into()),
        deposit = to_yocto("2")
    );
    outcome.assert_success();

    do_place(&bob, &alice, to_yocto("101"), &contract, ANY_ERR);
}

#[test]
fn double_accept() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    do_accept(&bob, &alice, to_yocto("103"), &contract, None);

    let carol = create_carol(&master_account);

    do_accept(
        &carol,
        &alice,
        to_yocto("103"),
        &contract,
        Some(ERR_PROPOSAL_DEPOSIT_RECEIVED),
    );
    do_accept(
        &bob,
        &alice,
        to_yocto("103"),
        &contract,
        Some(ERR_PROPOSAL_DEPOSIT_RECEIVED),
    );
}

#[test]
fn withdraw_place_simple() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    for _ in 0..10 {
        do_withdraw(&bob, &alice, &contract, None);
        do_place(&bob, &alice, to_yocto("100"), &contract, None);
    }
    do_accept(&bob, &alice, to_yocto("103"), &contract, None);
    do_acquire(&bob, &alice, &contract, None);
    do_acquire(&bob, &alice, &contract, ANY_ERR);
}

#[test]
fn simple_acquisition() {
    let (master_account, contract) = test_init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    for _ in 0..10 {
        sdk_sim_tick_tock(&alice, &contract);
    }

    do_accept(
        &bob,
        &alice,
        to_yocto("102"),
        &contract,
        Some(ERR_PROPOSAL_EXPIRED),
    );

    do_acquire(&bob, &alice, &contract, ANY_ERR);
    do_acquire(&alice, &alice, &contract, ANY_ERR);
    do_acquire(&alice, &bob, &contract, ANY_ERR);

    do_withdraw(&bob, &alice, &contract, None);
    do_withdraw(&bob, &alice, &contract, ANY_ERR);

    do_acquire(&bob, &alice, &contract, ANY_ERR);
    do_acquire(&alice, &alice, &contract, ANY_ERR);
    do_acquire(&alice, &bob, &contract, ANY_ERR);
}

/*#[test]
fn offer_same_after_acquisition() {
    let (master_account, contract) = test_init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);
    do_claim(&bob, &alice, &contract, None);

    for _ in 0..10 {
        sdk_sim_tick_tock(&alice, &contract);
    }

    let bw: Option<BidView> =
        view!(contract.get_bid(alice.account_id().try_into().unwrap())).unwrap_json();
    assert!(bw.is_some());

    do_finalize(&bob, &alice, &contract, None);
    do_acquire(&bob, &alice, &contract, None);

    let bw: Option<BidView> =
        view!(contract.get_bid(alice.account_id().try_into().unwrap())).unwrap_json();
    assert!(bw.is_none());

    do_offer(&bob, &alice, &contract, None);

    let bets: Vec<(WrappedBalance, BidId)> = view!(contract.get_top_bets(None, 100)).unwrap_json();
    assert_eq!(bets, vec![(INIT_BET_PRICE.into(), "alice".to_string())]);
    let claims: Vec<(WrappedBalance, BidId)> =
        view!(contract.get_top_claims(None, 100)).unwrap_json();
    assert_eq!(claims.len(), 0);
    let bw: Option<BidView> =
        view!(contract.get_bid(alice.account_id().try_into().unwrap())).unwrap_json();
    assert!(bw.is_some());

    do_claim(&bob, &alice, &contract, None);

    for _ in 0..10 {
        sdk_sim_tick_tock(&alice, &contract);
    }

    do_finalize(&bob, &alice, &contract, None);
    do_acquire(&bob, &alice, &contract, None);
    do_offer(&bob, &alice, &contract, None);
}

#[test]
fn bob_carol_finalize_acquire() {
    let (master_account, contract) = test_init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);
    let carol = create_carol(&master_account);

    do_claim(&carol, &alice, &contract, None);
    do_finalize(&alice, &alice, &contract, ANY_ERR);
    do_finalize(&bob, &alice, &contract, ANY_ERR);
    do_finalize(&carol, &alice, &contract, ANY_ERR);
    for _ in 0..10 {
        sdk_sim_tick_tock(&alice, &contract);
    }

    do_acquire(&bob, &alice, &contract, ANY_ERR);
    do_acquire(&carol, &alice, &contract, ANY_ERR);
    do_finalize(&alice, &alice, &contract, None);
    do_finalize(&alice, &alice, &contract, ANY_ERR);
    do_finalize(&carol, &alice, &contract, ANY_ERR);
    do_acquire(&bob, &alice, &contract, ANY_ERR);
    do_acquire(&carol, &alice, &contract, None);
    do_acquire(&carol, &alice, &contract, ANY_ERR);

    // We cannot prove keys at this point - any first offer should work
    do_offer(&carol, &alice, &contract, None);
    do_offer(&bob, &alice, &contract, ANY_ERR);

    do_claim(&bob, &alice, &contract, None);
    do_finalize(&bob, &alice, &contract, ANY_ERR);
    do_finalize(&carol, &alice, &contract, ANY_ERR);
    do_finalize(&alice, &alice, &contract, ANY_ERR);
    for _ in 0..10 {
        sdk_sim_tick_tock(&alice, &contract);
    }

    do_acquire(&bob, &alice, &contract, ANY_ERR);
    do_acquire(&carol, &alice, &contract, ANY_ERR);
    do_finalize(&carol, &alice, &contract, None);
    do_finalize(&carol, &alice, &contract, ANY_ERR);
    do_finalize(&alice, &alice, &contract, ANY_ERR);
    do_acquire(&carol, &alice, &contract, ANY_ERR);
    do_acquire(&bob, &alice, &contract, None);
    do_acquire(&bob, &alice, &contract, ANY_ERR);

    // Same as above
    do_offer(&bob, &alice, &contract, None);
    do_offer(&bob, &alice, &contract, ANY_ERR);
}

#[test]
fn claim_update_rewards() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);
    let carol = create_carol(&master_account);

    for _ in 0..10 {
        let claim_price = get_claim_price(&alice, &contract);
        do_claim(&carol, &alice, &contract, None);

        let cur_rewards: Balance = get_profile(&carol, &contract).available_rewards.into();

        do_bet(&bob, &alice, &contract, None);

        let final_rewards: Balance = get_profile(&carol, &contract).available_rewards.into();

        // claim_price + little forfeit
        assert!(final_rewards - cur_rewards > claim_price);
        assert!(final_rewards - cur_rewards < claim_price * 1001 / 1000);
    }
}

#[test]
fn collect_rewards_simple() {
    let (master_account, contract) = test_init();

    let alice = master_account.create_user("alice".into(), to_yocto("1000000000"));
    let bob = master_account.create_user("bob".into(), MIN_STORAGE_FOR_ACCOUNT);
    let carol = create_carol(&master_account);

    let outcome = call!(
        alice,
        contract.offer(bob.account_id().try_into().unwrap()),
        deposit = OFFER_DEPOSIT
    );
    outcome.assert_success();

    do_claim(&carol, &alice, &contract, None);
    for _ in 0..10 {
        sdk_sim_tick_tock(&alice, &contract);
    }
    do_collect_rewards(&bob, &contract, Some(ERR_REWARD_BALANCE_INSUFFICIENT));

    do_finalize(&carol, &alice, &contract, None);

    do_collect_rewards(&bob, &contract, None);
    do_collect_rewards(&bob, &contract, Some(ERR_REWARD_BALANCE_INSUFFICIENT));

    bob.transfer("alice".to_string(), to_yocto("1.00"));
}

#[test]
fn dao_rewards_simple() {
    let master_account = init_simulator(None);
    let dao = master_account.create_user("dao".into(), MIN_STORAGE_FOR_ACCOUNT);

    let contract = deploy!(
        contract: AMContract,
        contract_id: CONTRACT_ID,
        bytes: &CONTRACT_WASM_BYTES,
        signer_account: master_account,
        init_method: new(master_account.account_id().try_into().unwrap(), dao.account_id().try_into().unwrap())
    );

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    dao.transfer("alice".to_string(), OFFER_DEPOSIT);

    do_bet(&bob, &alice, &contract, None);

    dao.transfer("alice".to_string(), INIT_BET_PRICE / 20);

    do_bet(&bob, &alice, &contract, None);

    dao.transfer("alice".to_string(), INIT_BET_PRICE * 6 / 5 / 20);
}
*/
