use std::convert::TryInto;

/// Import the generated proxy contract
use escrow_marketplace::ContractContract as EMContract;
use escrow_marketplace::{
    ProposalView, ERR_ACCEPT_DEPOSIT_NOT_ENOUGH, ERR_GAINER_SAME_AS_OFFER,
    ERR_PLACE_DEPOSIT_NOT_ENOUGH, ONE_YOCTO, PLACE_DEPOSIT,
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
const PLACE_DESCRIPTION_DEFAULT: &str = "default description";

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
        contract.place(
            bob.account_id().try_into().unwrap(),
            to_yocto("100").into(),
            PLACE_DESCRIPTION_DEFAULT.to_string()
        ),
        deposit = PLACE_DEPOSIT
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
        contract.place(
            profile.account_id().try_into().unwrap(),
            price.into(),
            PLACE_DESCRIPTION_DEFAULT.to_string()
        ),
        deposit = PLACE_DEPOSIT
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
        contract.withdraw_test(
            proposal.account_id().try_into().unwrap(),
            to_base58_pk(&profile)
        ),
        deposit = ONE_YOCTO
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
        contract.accept_test(
            proposal.account_id().try_into().unwrap(),
            to_base58_pk(&profile)
        ),
        deposit = deposit
    );
    if let Some(msg) = err {
        assert!(
            format!("{:?}", outcome.status()).contains(msg),
            "received msg: {}",
            msg
        );
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
        contract.place(
            bob.account_id().try_into().unwrap(),
            to_yocto("100").into(),
            PLACE_DESCRIPTION_DEFAULT.to_string()
        ),
        deposit = to_yocto("0.99")
    );
    assert!(format!("{:?}", outcome.status()).contains(ERR_PLACE_DEPOSIT_NOT_ENOUGH));
    let outcome = call!(
        alice,
        contract.place(
            bob.account_id().try_into().unwrap(),
            to_yocto("100").into(),
            PLACE_DESCRIPTION_DEFAULT.to_string()
        ),
        deposit = to_yocto("1")
    );
    outcome.assert_success();

    do_place(&bob, &alice, to_yocto("101"), &contract, ANY_ERR);
}

#[test]
fn double_accept() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    do_accept(
        &bob,
        &alice,
        to_yocto("100.9"),
        &contract,
        Some(ERR_ACCEPT_DEPOSIT_NOT_ENOUGH),
    );
    do_accept(&bob, &alice, to_yocto("101"), &contract, None);
    do_accept(&bob, &alice, to_yocto("101"), &contract, ANY_ERR);

    let carol = create_carol(&master_account);

    do_accept(&carol, &alice, to_yocto("101"), &contract, ANY_ERR);
    do_accept(&bob, &alice, to_yocto("101"), &contract, ANY_ERR);
}

#[test]
fn withdraw_simple() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    do_withdraw(&bob, &alice, &contract, None);

    do_accept(&bob, &alice, to_yocto("101"), &contract, ANY_ERR);

    do_withdraw(&bob, &alice, &contract, ANY_ERR);

    do_accept(&bob, &alice, to_yocto("101"), &contract, ANY_ERR);
}

#[test]
fn withdraw_after_accept() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let carol = create_carol(&master_account);
    do_accept(&carol, &alice, to_yocto("101"), &contract, None);

    do_withdraw(&bob, &alice, &contract, ANY_ERR);
}

#[test]
fn place_after_accept() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let carol = create_carol(&master_account);
    do_accept(&carol, &alice, to_yocto("101"), &contract, None);

    do_place(&carol, &alice, to_yocto("101"), &contract, None);

    do_accept(
        &bob,
        &alice,
        to_yocto("102"),
        &contract,
        Some(ERR_ACCEPT_DEPOSIT_NOT_ENOUGH),
    );

    do_accept(&bob, &alice, to_yocto("102.01"), &contract, None);
}
