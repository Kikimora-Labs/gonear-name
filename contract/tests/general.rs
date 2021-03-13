use std::convert::TryInto;
use std::time::{Duration, Instant};
// TODO remove
use bs58;
use std::thread::sleep;

/// Import the generated proxy contract
use accounts_marketplace::ContractContract as AMContract;
use accounts_marketplace::{
    ProfileView, ERR_ACQUIRE_REJECTED, ERR_ALREADY_CLAIMED, ERR_ALREADY_OFFERED,
    ERR_BET_FORFEIT_NOT_ENOUGH, ERR_BET_ON_ACQUISITION, ERR_CLAIM_NOT_ENOUGH,
    ERR_GAINER_SAME_AS_OFFER, ERR_OFFER_DEPOSIT_NOT_ENOUGH, INIT_BET_PRICE, OFFER_DEPOSIT,
};

use near_sdk::json_types::{Base58PublicKey, WrappedBalance};
use near_sdk::{AccountId, Balance};
use near_sdk_sim::{call, deploy, init_simulator, to_yocto, view, ContractAccount, UserAccount};

// Load in contract bytes at runtime
near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
  CONTRACT_WASM_BYTES => "res/accounts_marketplace.wasm",
}

const CONTRACT_ID: &str = "marketplace";
const ENOUGH_DEPOSIT: u128 = OFFER_DEPOSIT * 101 / 100;

fn test_init() -> (UserAccount, ContractAccount<AMContract>) {
    let master_account = init_simulator(None);

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
        init_method: test_new(10) // 10 seconds
    );
    (master_account, deployed_contract)
}

fn init() -> (UserAccount, ContractAccount<AMContract>) {
    let master_account = init_simulator(None);
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
        init_method: new(master_account.account_id().try_into().unwrap(), to_base58_pk(&master_account))
    );
    (master_account, deployed_contract)
}

fn to_base58_pk(user: &UserAccount) -> Base58PublicKey {
    // TODO SIMPLIFY THIS HELL
    bs58::encode(&user.signer.public_key.unwrap_as_ed25519().0.to_vec())
        .into_string()
        .try_into()
        .unwrap()
}

fn create_carol(master_account: &UserAccount) -> UserAccount {
    master_account.create_user("carol".into(), to_yocto("1000000000"))
}

fn create_bob_sells_alice(
    master_account: &UserAccount,
    contract: &ContractAccount<AMContract>,
) -> (UserAccount, UserAccount) {
    let alice = master_account.create_user("alice".into(), to_yocto("1000000000"));
    let bob = master_account.create_user("bob".into(), to_yocto("1000000000"));

    let outcome = call!(
        alice,
        contract.offer(bob.account_id().try_into().unwrap()),
        deposit = ENOUGH_DEPOSIT
    );
    outcome.assert_success();
    let result: bool = outcome.unwrap_json();
    assert!(result);
    (alice, bob)
}

fn claim(profile: &UserAccount, bid: &UserAccount, contract: &ContractAccount<AMContract>) {
    let claim_price: Option<WrappedBalance> =
        view!(contract.get_claim_price(bid.account_id().try_into().unwrap())).unwrap_json();
    let outcome = call!(
        profile,
        contract.claim(bid.account_id().try_into().unwrap()),
        deposit = claim_price.unwrap().into()
    );
    outcome.assert_success();
}

fn forfeit(bid: &UserAccount, contract: &ContractAccount<AMContract>) -> Balance {
    let f: Option<WrappedBalance> =
        view!(contract.get_forfeit(bid.account_id().try_into().unwrap())).unwrap_json();
    f.unwrap().into()
}

fn bet_price(bid: &UserAccount, contract: &ContractAccount<AMContract>) -> Balance {
    let f: Option<WrappedBalance> =
        view!(contract.get_bet_price(bid.account_id().try_into().unwrap())).unwrap_json();
    f.unwrap().into()
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
fn simulate_offer() {
    let (master_account, contract) = init();

    let alice = master_account.create_user("alice".to_string(), to_yocto("100"));

    let outcome = call!(
        alice,
        contract.offer(alice.account_id().try_into().unwrap()),
        deposit = 10
    );
    assert!(format!("{:?}", outcome.status()).contains(ERR_OFFER_DEPOSIT_NOT_ENOUGH));

    let outcome = call!(
        alice,
        contract.offer(alice.account_id().try_into().unwrap()),
        deposit = OFFER_DEPOSIT
    );
    assert!(format!("{:?}", outcome.status()).contains(ERR_GAINER_SAME_AS_OFFER));

    let bob = master_account.create_user("bob".to_string(), to_yocto("100"));

    let outcome = call!(
        alice,
        contract.offer(bob.account_id().try_into().unwrap()),
        deposit = OFFER_DEPOSIT
    );
    outcome.assert_success();
    let result: bool = outcome.unwrap_json();
    assert!(result);

    let outcome = call!(
        alice,
        contract.offer(bob.account_id().try_into().unwrap()),
        deposit = OFFER_DEPOSIT
    );
    assert!(format!("{:?}", outcome.status()).contains(ERR_ALREADY_OFFERED));
}

#[test]
fn view_first_offer() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let (
        num_profiles,
        _num_bids,
        _total_commission,
        _num_offers,
        _num_bets,
        _num_claims,
        _num_acquisitions,
    ): (u64, u64, WrappedBalance, u64, u64, u64, u64) =
        view!(contract.get_global_stats()).unwrap_json();
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
    assert!(format!("{:?}", outcome.status()).contains(ERR_BET_FORFEIT_NOT_ENOUGH));

    let outcome = call!(
        bob,
        contract.bet(alice.account_id().try_into().unwrap()),
        deposit = OFFER_DEPOSIT * 100
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

#[cfg(feature = "expensive_tests")]
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
    assert!(format!("{:?}", outcome.status()).contains(ERR_CLAIM_NOT_ENOUGH));

    let outcome = call!(
        bob,
        contract.claim(alice.account_id().try_into().unwrap()),
        deposit = OFFER_DEPOSIT * 100
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
        deposit = OFFER_DEPOSIT * 100
    );
    outcome.assert_success();

    let carol = master_account.create_user("carol".into(), to_yocto("1000000000"));

    let outcome = call!(
        carol,
        contract.claim(alice.account_id().try_into().unwrap()),
        deposit = OFFER_DEPOSIT * 300
    );
    assert!(format!("{:?}", outcome.status()).contains(ERR_ALREADY_CLAIMED));
}

#[test]
fn bet_claim_simple() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    for _ in 0..10 {
        let outcome = call!(
            bob,
            contract.claim(alice.account_id().try_into().unwrap()),
            deposit = OFFER_DEPOSIT * 100
        );
        outcome.assert_success();

        let outcome = call!(
            bob,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = OFFER_DEPOSIT * 100
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
        let mut deposit: Balance = bet_price.unwrap().into();
        let outcome = call!(
            bob,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = deposit
        );
        assert!(format!("{:?}", outcome.status()).contains(ERR_BET_FORFEIT_NOT_ENOUGH));

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
        assert!(format!("{:?}", outcome.status()).contains(ERR_BET_FORFEIT_NOT_ENOUGH));

        deposit = deposit * 1001 / 1000;
        let outcome = call!(
            bob,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = deposit
        );
        outcome.assert_success();
    }
}

#[test]
fn view_carol_bet_and_claim() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);
    let carol = create_carol(&master_account);

    let bet_price: Option<WrappedBalance> =
        view!(contract.get_bet_price(alice.account_id().try_into().unwrap())).unwrap_json();

    let outcome = call!(
        carol,
        contract.bet(alice.account_id().try_into().unwrap()),
        deposit = bet_price.unwrap().into()
    );
    outcome.assert_success();

    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(bob.account_id().try_into().unwrap())).unwrap_json();
    let profile_view = profile_view.unwrap();
    assert_eq!(profile_view.participation, vec!["alice"]);
    assert_eq!(profile_view.acquisitions, Vec::<AccountId>::default());
    assert_eq!(profile_view.num_offers, 1);
    assert_eq!(profile_view.num_bets, 0);
    assert_eq!(profile_view.num_claims, 0);
    assert_eq!(profile_view.bets_volume, 0.into());

    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(carol.account_id().try_into().unwrap())).unwrap_json();
    let profile_view = profile_view.unwrap();
    assert_eq!(profile_view.participation, vec!["alice"]);
    assert_eq!(profile_view.acquisitions, Vec::<AccountId>::default());
    assert_eq!(profile_view.num_offers, 0);
    assert_eq!(profile_view.num_bets, 1);
    assert_eq!(profile_view.num_claims, 0);
    assert_eq!(profile_view.bets_volume, INIT_BET_PRICE.into());

    let claim_price: Option<WrappedBalance> =
        view!(contract.get_claim_price(alice.account_id().try_into().unwrap())).unwrap_json();
    let outcome = call!(
        carol,
        contract.claim(alice.account_id().try_into().unwrap()),
        deposit = claim_price.unwrap().into()
    );
    outcome.assert_success();

    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(carol.account_id().try_into().unwrap())).unwrap_json();
    let profile_view = profile_view.unwrap();
    assert_eq!(profile_view.participation, vec!["alice"]);
    assert_eq!(profile_view.acquisitions, Vec::<AccountId>::default());
    assert_eq!(profile_view.num_offers, 0);
    assert_eq!(profile_view.num_bets, 1);
    assert_eq!(profile_view.num_claims, 1);
    assert_eq!(profile_view.bets_volume, INIT_BET_PRICE.into());
}

#[cfg(feature = "expensive_tests")]
#[test]
fn rewards_converge() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let mut accounts = vec![];
    let mut prices = Vec::<Balance>::new();

    for i in 0..20 {
        let cur_account = master_account.create_user(
            ("test".to_string() + &i.to_string()).into(),
            to_yocto("1000000000"),
        );

        let bet_price: Option<WrappedBalance> =
            view!(contract.get_bet_price(alice.account_id().try_into().unwrap())).unwrap_json();
        let outcome = call!(
            cur_account,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = bet_price.unwrap().into()
        );
        outcome.assert_success();

        accounts.push(cur_account);
        prices.push(bet_price.unwrap().into());
    }

    for i in 0..15 {
        let cur_account = &accounts[i];
        let bet_price = prices[i] as f64;
        let profile_view: Option<ProfileView> =
            view!(contract.get_profile(cur_account.account_id().try_into().unwrap())).unwrap_json();
        let reward: Balance = profile_view.unwrap().available_rewards.into();
        let ratio = reward as f64 / bet_price;
        assert!(ratio < 1.25);
        assert!(ratio > 1.24);
    }
    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(bob.account_id().try_into().unwrap())).unwrap_json();
    let reward: Balance = profile_view.unwrap().available_rewards.into();
    assert!(reward < to_yocto("0.7501"));
    assert!(reward > to_yocto("0.7499"));
}

#[test]
fn simple_acquisition() {
    let (master_account, contract) = test_init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);
    claim(&bob, &alice, &contract);

    let mut last_forfeit = 0;

    for _ in 0..10 {
        let cur_time = Instant::now();
        let forfeit = forfeit(&alice, &contract);
        assert!(forfeit >= last_forfeit);
        last_forfeit = forfeit;

        // This call is necessary due to sdk-sim not processing time otherwise
        let _ = call!(
            bob,
            contract.claim(alice.account_id().try_into().unwrap()),
            deposit = 1
        );

        sleep(Duration::from_secs(1) - (Instant::now() - cur_time));
    }

    let bet_price = bet_price(&alice, &contract);
    assert_eq!(bet_price, last_forfeit * 4);

    let outcome = call!(
        bob,
        contract.bet(alice.account_id().try_into().unwrap()),
        deposit = OFFER_DEPOSIT * 100
    );
    assert!(format!("{:?}", outcome.status()).contains(ERR_BET_ON_ACQUISITION));

    let carol = create_carol(&master_account);
    let outcome = call!(
        carol,
        contract.acquire(alice.account_id().try_into().unwrap(), to_base58_pk(&carol)),
        deposit = OFFER_DEPOSIT * 100
    );
    assert!(format!("{:?}", outcome.status()).contains(ERR_ACQUIRE_REJECTED));

    let outcome = call!(
        bob,
        contract.acquire(alice.account_id().try_into().unwrap(), to_base58_pk(&carol)),
        deposit = OFFER_DEPOSIT * 100
    );
    outcome.assert_success();

    let outcome = call!(
        bob,
        contract.acquire(alice.account_id().try_into().unwrap(), to_base58_pk(&carol)),
        deposit = OFFER_DEPOSIT * 100
    );
    assert!(!outcome.is_ok(), "Should panic");
}
