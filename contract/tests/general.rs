use std::convert::TryInto;
// TODO remove
use bs58;

/// Import the generated proxy contract
use accounts_marketplace::ContractContract as AMContract;
use accounts_marketplace::{ProfileView, INIT_BET_PRICE, OFFER_ACCOUNT_DEPOSIT};

use near_sdk::json_types::WrappedBalance;
use near_sdk::{Balance,AccountId};
use near_sdk_sim::{call, deploy, init_simulator, to_yocto, view, ContractAccount, UserAccount};

// Load in contract bytes at runtime
near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
  CONTRACT_WASM_BYTES => "res/accounts_marketplace.wasm",
}

const CONTRACT_ID: &str = "marketplace";
const ENOUGH_DEPOSIT: u128 = OFFER_ACCOUNT_DEPOSIT * 101 / 100;

fn init() -> (UserAccount, ContractAccount<AMContract>) {
    let master_account = init_simulator(None);

    // TODO SIMPLIFY THIS HELL
    let key = bs58::encode(
        &master_account
            .signer
            .public_key
            .unwrap_as_ed25519()
            .0
            .to_vec(),
    )
    .into_string();
    let deployed_contract = deploy!(
        // Contract Proxy
        contract: AMContract,
        // Contract account id
        contract_id: CONTRACT_ID,
        // Bytes of contract
        bytes: &CONTRACT_WASM_BYTES,
        // User deploying the contract,
        signer_account: master_account,
        // init method
        init_method: new(master_account.account_id().try_into().unwrap(), key.try_into().unwrap())
    );
    (master_account, deployed_contract)
}

fn create_bob_sells_alice(
    master_account: &UserAccount,
    contract: &ContractAccount<AMContract>,
) -> (UserAccount, UserAccount) {
    let alice = master_account.create_user("alice".into(), to_yocto("1000000000"));
    let bob = master_account.create_user("bob".into(), to_yocto("1000000000"));

    let outcome = call!(
        alice,
        contract.offer_predecessor_account(bob.account_id().try_into().unwrap()),
        deposit = ENOUGH_DEPOSIT
    );
    outcome.assert_success();
    let result: bool = outcome.unwrap_json();
    assert!(result);
    (alice, bob)
}

#[test]
fn simulate_init() {
    let (_, _) = init();
}

#[test]
fn simulate_register_profile() {
    let (master_account, contract) = init();

    let alice = master_account.create_user("alice".to_string(), to_yocto("100"));

    let alice_stats: Option<ProfileView> =
        view!(contract.get_profile(alice.account_id().try_into().unwrap())).unwrap_json();
    assert!(alice_stats.is_none());

    let alice_bet_price: Option<WrappedBalance> =
        view!(contract.get_bet_price(alice.account_id().try_into().unwrap())).unwrap_json();
    assert!(alice_bet_price.is_none());

    call!(alice, contract.register_profile()).assert_success();

    let alice_stats: Option<ProfileView> =
        view!(contract.get_profile(alice.account_id().try_into().unwrap())).unwrap_json();
    assert!(alice_stats.is_some());

    let alice_bet_price: Option<WrappedBalance> =
        view!(contract.get_bet_price(alice.account_id().try_into().unwrap())).unwrap_json();
    assert!(alice_bet_price.is_none());
}

#[test]
fn simulate_offer_predecessor_account() {
    let (master_account, contract) = init();

    let alice = master_account.create_user("alice".to_string(), to_yocto("100"));

    let outcome = call!(
        alice,
        contract.offer_predecessor_account(alice.account_id().try_into().unwrap()),
        deposit = 10
    );
    assert!(format!("{:?}", outcome.status())
        .contains("Attached deposit must be greater than OFFER_ACCOUNT_DEPOSIT"));

    let outcome = call!(
        master_account,
        contract.offer_predecessor_account(alice.account_id().try_into().unwrap()),
        deposit = ENOUGH_DEPOSIT
    );
    assert!(format!("{:?}", outcome.status()).contains("Cannot be executed from owner"));

    let outcome = call!(
        alice,
        contract.offer_predecessor_account(alice.account_id().try_into().unwrap()),
        deposit = ENOUGH_DEPOSIT
    );
    assert!(format!("{:?}", outcome.status()).contains("Gainer cannot be equal to predecessor"));

    let bob = master_account.create_user("bob".to_string(), to_yocto("100"));

    let outcome = call!(
        alice,
        contract.offer_predecessor_account(bob.account_id().try_into().unwrap()),
        deposit = ENOUGH_DEPOSIT
    );
    outcome.assert_success();
    let result: bool = outcome.unwrap_json();
    assert!(result);

    let outcome = call!(
        alice,
        contract.offer_predecessor_account(bob.account_id().try_into().unwrap()),
        deposit = ENOUGH_DEPOSIT
    );
    outcome.assert_success();
    let result: bool = outcome.unwrap_json();
    assert!(!result, "There should not be Access Key");
}

#[test]
fn view_first_offer() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let num_profiles: u64 = view!(contract.get_num_profiles()).unwrap_json();
    assert_eq!(num_profiles, 1);

    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(alice.account_id().try_into().unwrap())).unwrap_json();
    assert!(profile_view.is_none());
    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(bob.account_id().try_into().unwrap())).unwrap_json();
    let profile_view = profile_view.unwrap();
    assert_eq!(profile_view.participation, vec!["alice"]);
    assert_eq!(profile_view.acquisitions, Vec::<AccountId>::default());
    assert_eq!(profile_view.num_offers, 1);
}

#[test]
fn view_first_bet() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let bet_price: Option<WrappedBalance> =
        view!(contract.get_bet_price(alice.account_id().try_into().unwrap())).unwrap_json();
    assert_eq!(bet_price, Some(INIT_BET_PRICE.into()));
    let bet_price: Option<WrappedBalance> =
        view!(contract.get_bet_price(bob.account_id().try_into().unwrap())).unwrap_json();
    assert!(bet_price.is_none());

    let outcome = call!(
        bob,
        contract.bet(alice.account_id().try_into().unwrap()),
        deposit = 10
    );
    assert!(format!("{:?}", outcome.status())
        .contains("Attached deposit must be no less than bet price"));

    let outcome = call!(
        bob,
        contract.bet(alice.account_id().try_into().unwrap()),
        deposit = OFFER_ACCOUNT_DEPOSIT * 100
    );
    outcome.assert_success();

    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(bob.account_id().try_into().unwrap())).unwrap_json();
    let profile_view = profile_view.unwrap();
    assert_eq!(profile_view.participation, vec!["alice"]);
    assert_eq!(profile_view.acquisitions, Vec::<AccountId>::default());
    assert_eq!(profile_view.num_offers, 1);
    assert_eq!(profile_view.num_bets, 1);
    assert_eq!(profile_view.bets_volume, INIT_BET_PRICE.into());

    let bet_price: Option<WrappedBalance> =
        view!(contract.get_bet_price(alice.account_id().try_into().unwrap())).unwrap_json();
    assert_eq!(bet_price, Some((INIT_BET_PRICE * 6 / 5).into()));
}

#[test]
fn view_100_bets() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let mut proven_price = INIT_BET_PRICE;
    let mut bets_volume = 0;

    for _ in 0..100 {
        let bet_price: Option<WrappedBalance> =
            view!(contract.get_bet_price(alice.account_id().try_into().unwrap())).unwrap_json();

        assert_eq!(bet_price, Some(proven_price.into()));

        let outcome = call!(
            bob,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = proven_price
        );
        outcome.assert_success();

        bets_volume += proven_price;

        proven_price = proven_price * 6 / 5;
    }

    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(bob.account_id().try_into().unwrap())).unwrap_json();
    let profile_view = profile_view.unwrap();
    assert_eq!(profile_view.participation, vec!["alice"]);
    assert_eq!(profile_view.acquisitions, Vec::<AccountId>::default());
    assert_eq!(profile_view.num_offers, 1);
    assert_eq!(profile_view.num_bets, 100);
    assert_eq!(profile_view.bets_volume, bets_volume.into());
}

#[test]
fn view_first_claim() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let claim_price: Option<WrappedBalance> =
        view!(contract.get_claim_price(alice.account_id().try_into().unwrap())).unwrap_json();
    assert_eq!(claim_price, Some((INIT_BET_PRICE * 2).into()));
    let claim_price: Option<WrappedBalance> =
        view!(contract.get_claim_price(bob.account_id().try_into().unwrap())).unwrap_json();
    assert!(claim_price.is_none());

    let outcome = call!(
        bob,
        contract.claim(alice.account_id().try_into().unwrap()),
        deposit = 10
    );
    assert!(format!("{:?}", outcome.status())
        .contains("Attached deposit must be no less than claim price"));

    let outcome = call!(
        bob,
        contract.claim(alice.account_id().try_into().unwrap()),
        deposit = OFFER_ACCOUNT_DEPOSIT * 100
    );
    outcome.assert_success();

    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(bob.account_id().try_into().unwrap())).unwrap_json();
    let profile_view = profile_view.unwrap();
    assert_eq!(profile_view.participation, vec!["alice"]);
    assert_eq!(profile_view.acquisitions, Vec::<AccountId>::default());
    assert_eq!(profile_view.num_offers, 1);
    assert_eq!(profile_view.num_claims, 1);

    let bet_price: Option<WrappedBalance> =
        view!(contract.get_bet_price(alice.account_id().try_into().unwrap())).unwrap_json();
    assert_eq!(bet_price, Some((INIT_BET_PRICE).into()));
    let claim_price: Option<WrappedBalance> =
        view!(contract.get_claim_price(alice.account_id().try_into().unwrap())).unwrap_json();
    assert!(claim_price.is_none());
}

#[test]
fn double_claim() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let outcome = call!(
        bob,
        contract.claim(alice.account_id().try_into().unwrap()),
        deposit = OFFER_ACCOUNT_DEPOSIT * 100
    );
    outcome.assert_success();

    let carol = master_account.create_user("carol".into(), to_yocto("1000000000"));

    let outcome = call!(
        carol,
        contract.claim(alice.account_id().try_into().unwrap()),
        deposit = OFFER_ACCOUNT_DEPOSIT * 300
    );
    assert!(!outcome.is_ok(), "Should panic");
}

#[test]
fn bet_claim_simple() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    for _ in 0..10 {
        let outcome = call!(
            bob,
            contract.claim(alice.account_id().try_into().unwrap()),
            deposit = OFFER_ACCOUNT_DEPOSIT * 100
        );
        outcome.assert_success();

        let outcome = call!(
            bob,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = OFFER_ACCOUNT_DEPOSIT * 100
        );
        outcome.assert_success();
    }
}

#[test]
fn bet_claim_forfeit() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    for _ in 0..10 {
        let claim_price: Option<WrappedBalance> =
            view!(contract.get_claim_price(alice.account_id().try_into().unwrap())).unwrap_json();
        let outcome = call!(
            bob,
            contract.claim(alice.account_id().try_into().unwrap()),
            deposit = claim_price.unwrap().into()
        );
        outcome.assert_success();

        let bet_price: Option<WrappedBalance> =
            view!(contract.get_bet_price(alice.account_id().try_into().unwrap())).unwrap_json();
        let mut deposit:Balance = bet_price.unwrap().into();
        let outcome = call!(
            bob,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = deposit
        );
        assert!(format!("{:?}", outcome.status())
        .contains("Attached deposit must be no less than bet price plus forfeit"));

        let forfeit: Option<WrappedBalance> =
            view!(contract.get_forfeit(alice.account_id().try_into().unwrap())).unwrap_json();
        let forfeit: Balance = forfeit.unwrap().into();
        assert!(forfeit * 19 < deposit);
        assert!(forfeit * 20 > deposit);
        deposit += forfeit;
        let outcome = call!(
                bob,
                contract.bet(alice.account_id().try_into().unwrap()),
                deposit = deposit - 1
            );
        assert!(format!("{:?}", outcome.status())
        .contains("Attached deposit must be no less than bet price plus forfeit"));

        deposit = deposit * 1001 / 1000;
        let outcome = call!(
            bob,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = deposit
        );
        outcome.assert_success();
    }
}

