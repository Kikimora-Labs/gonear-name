use bs58;
use std::convert::TryInto;

/// Import the generated proxy contract
use accounts_marketplace::ContractContract as AMContract;
use accounts_marketplace::{
    BidId, BidView, ProfileView, ERR_ACQUIRE_REJECTED, ERR_ALREADY_CLAIMED, ERR_ALREADY_OFFERED,
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
const ANY_ERR: Option<&str> = Some("");

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
        deposit = OFFER_DEPOSIT
    );
    outcome.assert_success();
    let result: bool = outcome.unwrap_json();
    assert!(result);
    (alice, bob)
}

fn do_offer(
    profile: &UserAccount,
    bid: &UserAccount,
    contract: &ContractAccount<AMContract>,
    err: Option<&str>,
) {
    let outcome = call!(
        bid,
        contract.offer(profile.account_id().try_into().unwrap()),
        deposit = OFFER_DEPOSIT
    );
    if let Some(msg) = err {
        assert!(format!("{:?}", outcome.status()).contains(msg));
        assert!(!outcome.is_ok(), "Should panic");
    } else {
        outcome.assert_success();
    }
}

fn do_bet(
    profile: &UserAccount,
    bid: &UserAccount,
    contract: &ContractAccount<AMContract>,
    err: Option<&str>,
) {
    let bet_price: Balance = get_bet_price(bid, contract);
    let outcome = call!(
        profile,
        contract.bet(bid.account_id().try_into().unwrap()),
        deposit = bet_price * 3
    );
    if let Some(msg) = err {
        assert!(format!("{:?}", outcome.status()).contains(msg));
        assert!(!outcome.is_ok(), "Should panic");
    } else {
        outcome.assert_success();
    }
}

fn do_claim(
    profile: &UserAccount,
    bid: &UserAccount,
    contract: &ContractAccount<AMContract>,
    err: Option<&str>,
) {
    let claim_price: Balance = get_claim_price(bid, contract);
    let outcome = call!(
        profile,
        contract.claim(bid.account_id().try_into().unwrap()),
        deposit = claim_price * 3
    );
    if let Some(msg) = err {
        assert!(format!("{:?}", outcome.status()).contains(msg));
        assert!(!outcome.is_ok(), "Should panic");
    } else {
        outcome.assert_success();
    }
}

fn do_finalize(
    profile: &UserAccount,
    bid: &UserAccount,
    contract: &ContractAccount<AMContract>,
    err: Option<&str>,
) {
    let outcome = call!(
        profile,
        contract.finalize(bid.account_id().try_into().unwrap()),
        deposit = 0
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
    bid: &UserAccount,
    contract: &ContractAccount<AMContract>,
    err: Option<&str>,
) {
    let outcome = call!(
        profile,
        contract.acquire(bid.account_id().try_into().unwrap(), to_base58_pk(&profile)),
        deposit = 0
    );
    if let Some(msg) = err {
        assert!(format!("{:?}", outcome.status()).contains(msg));
        assert!(!outcome.is_ok(), "Should panic");
    } else {
        outcome.assert_success();
    }
}

fn get_forfeit(bid: &UserAccount, contract: &ContractAccount<AMContract>) -> Balance {
    let bw: Option<BidView> =
        view!(contract.get_bid(bid.account_id().try_into().unwrap())).unwrap_json();
    bw.unwrap().forfeit.unwrap().into()
}

fn get_bet_price(bid: &UserAccount, contract: &ContractAccount<AMContract>) -> Balance {
    let bw: Option<BidView> =
        view!(contract.get_bid(bid.account_id().try_into().unwrap())).unwrap_json();
    bw.unwrap().bet_price.into()
}

fn get_claim_price(bid: &UserAccount, contract: &ContractAccount<AMContract>) -> Balance {
    let bw: Option<BidView> =
        view!(contract.get_bid(bid.account_id().try_into().unwrap())).unwrap_json();
    bw.unwrap().claim_price.unwrap().into()
}

fn get_bid_view(bid: &UserAccount, contract: &ContractAccount<AMContract>) -> Option<BidView> {
    view!(contract.get_bid(bid.account_id().try_into().unwrap())).unwrap_json()
}

fn get_profile(profile: &UserAccount, contract: &ContractAccount<AMContract>) -> ProfileView {
    let profile_view: Option<ProfileView> =
        view!(contract.get_profile(profile.account_id().try_into().unwrap())).unwrap_json();
    profile_view.unwrap()
}

fn sdk_sim_tick_tock(profile: &UserAccount, contract: &ContractAccount<AMContract>) {
    let _outcome = call!(
        profile,
        contract.bet("123".try_into().unwrap()),
        deposit = 456
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

    let bet_price = get_bet_price(&alice, &contract);
    assert_eq!(bet_price, INIT_BET_PRICE);
    assert!(get_bid_view(&bob, &contract).is_none());

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

    let bet_price = get_bet_price(&alice, &contract);
    assert_eq!(bet_price, INIT_BET_PRICE * 6 / 5);
}

#[cfg(feature = "expensive_tests")]
#[test]
fn view_100_bets() {
    let (master_account, contract) = init();

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);

    let mut proven_price = INIT_BET_PRICE;
    let mut bets_volume = 0;

    for _ in 0..100 {
        let bet_price = get_bet_price(&alice, &contract);
        assert_eq!(bet_price, proven_price);

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

    let claim_price = get_claim_price(&alice, &contract);
    assert_eq!(claim_price, INIT_BET_PRICE * 2);
    assert!(get_bid_view(&bob, &contract).is_none());

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

    let bet_price = get_bet_price(&alice, &contract);
    assert_eq!(bet_price, INIT_BET_PRICE);
    assert!(get_bid_view(&alice, &contract)
        .unwrap()
        .claim_price
        .is_none());
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
        do_claim(&bob, &alice, &contract, None);
        let mut deposit = get_bet_price(&alice, &contract);
        let outcome = call!(
            bob,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = deposit
        );
        assert!(format!("{:?}", outcome.status()).contains(ERR_BET_FORFEIT_NOT_ENOUGH));

        let forfeit = get_forfeit(&alice, &contract);
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

    let bet_price = get_bet_price(&alice, &contract);

    let outcome = call!(
        carol,
        contract.bet(alice.account_id().try_into().unwrap()),
        deposit = bet_price
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

    let claim_price = get_claim_price(&alice, &contract);
    let outcome = call!(
        carol,
        contract.claim(alice.account_id().try_into().unwrap()),
        deposit = claim_price
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

        let bet_price = get_bet_price(&alice, &contract);
        let outcome = call!(
            cur_account,
            contract.bet(alice.account_id().try_into().unwrap()),
            deposit = bet_price
        );
        outcome.assert_success();

        accounts.push(cur_account);
        prices.push(bet_price);
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
    do_claim(&bob, &alice, &contract, None);

    let mut last_forfeit = 0;

    for _ in 0..10 {
        let forfeit = get_forfeit(&alice, &contract);
        assert!(forfeit >= last_forfeit);
        last_forfeit = forfeit;

        sdk_sim_tick_tock(&alice, &contract);
    }

    let bet_price = get_bet_price(&alice, &contract);
    assert_eq!(bet_price, last_forfeit * 4);

    do_bet(&bob, &alice, &contract, Some(ERR_BET_ON_ACQUISITION));

    do_finalize(&bob, &alice, &contract, None);

    let carol = create_carol(&master_account);
    let outcome = call!(
        carol,
        contract.acquire(alice.account_id().try_into().unwrap(), to_base58_pk(&carol))
    );
    assert!(format!("{:?}", outcome.status()).contains(ERR_ACQUIRE_REJECTED));

    let outcome = call!(
        bob,
        contract.acquire(alice.account_id().try_into().unwrap(), to_base58_pk(&carol)),
        deposit = 0
    );
    outcome.assert_success();

    let outcome = call!(
        bob,
        contract.acquire(alice.account_id().try_into().unwrap(), to_base58_pk(&carol)),
        deposit = OFFER_DEPOSIT * 100
    );
    assert!(!outcome.is_ok(), "Should panic");
}

#[test]
fn top_bets_claims() {
    let (master_account, contract) = test_init();

    let bets: Vec<(WrappedBalance, BidId)> = view!(contract.get_top_bets(None, 100)).unwrap_json();
    assert_eq!(bets.len(), 0);
    let claims: Vec<(WrappedBalance, BidId)> =
        view!(contract.get_top_claims(None, 100)).unwrap_json();
    assert_eq!(claims.len(), 0);

    let (alice, bob) = create_bob_sells_alice(&master_account, &contract);
    let mut bet_price = INIT_BET_PRICE;

    // bet = 0.5, claim = 1.0

    let bets: Vec<(WrappedBalance, BidId)> = view!(contract.get_top_bets(None, 100)).unwrap_json();
    assert_eq!(bets, vec![(bet_price.into(), "alice".to_string())]);
    let claims: Vec<(WrappedBalance, BidId)> =
        view!(contract.get_top_claims(None, 100)).unwrap_json();
    assert_eq!(claims.len(), 0);

    do_claim(&bob, &alice, &contract, None);
    let mut claim_price = INIT_BET_PRICE * 2;

    // bet = 0.5, claim = impossible

    let bets: Vec<(WrappedBalance, BidId)> = view!(contract.get_top_bets(None, 100)).unwrap_json();
    assert_eq!(bets, vec![(bet_price.into(), "alice".to_string())]);
    let claims: Vec<(WrappedBalance, BidId)> =
        view!(contract.get_top_claims(None, 100)).unwrap_json();
    assert_eq!(claims, vec![(claim_price.into(), "alice".to_string())]);

    do_bet(&bob, &alice, &contract, None);
    bet_price = bet_price * 6 / 5;

    // bet = 0.6, claim = 1.2

    let bets: Vec<(WrappedBalance, BidId)> = view!(contract.get_top_bets(None, 100)).unwrap_json();
    assert_eq!(bets, vec![(bet_price.into(), "alice".to_string())]);
    let claims: Vec<(WrappedBalance, BidId)> =
        view!(contract.get_top_claims(None, 100)).unwrap_json();
    assert_eq!(claims.len(), 0);

    do_claim(&bob, &alice, &contract, None);
    claim_price = claim_price * 6 / 5;

    // bet = 0.6, claim = impossible

    let bets: Vec<(WrappedBalance, BidId)> = view!(contract.get_top_bets(None, 100)).unwrap_json();
    assert_eq!(bets, vec![(bet_price.into(), "alice".to_string())]);
    let claims: Vec<(WrappedBalance, BidId)> =
        view!(contract.get_top_claims(None, 100)).unwrap_json();
    assert_eq!(claims, vec![(claim_price.into(), "alice".to_string())]);

    for _ in 0..10 {
        sdk_sim_tick_tock(&alice, &contract);
    }

    let bets: Vec<(WrappedBalance, BidId)> = view!(contract.get_top_bets(None, 100)).unwrap_json();
    assert_eq!(bets, vec![(bet_price.into(), "alice".to_string())]);
    let claims: Vec<(WrappedBalance, BidId)> =
        view!(contract.get_top_claims(None, 100)).unwrap_json();
    assert_eq!(claims, vec![(claim_price.into(), "alice".to_string())]);

    do_finalize(&bob, &alice, &contract, None);

    let bets: Vec<(WrappedBalance, BidId)> = view!(contract.get_top_bets(None, 100)).unwrap_json();
    assert_eq!(bets.len(), 0);
    let claims: Vec<(WrappedBalance, BidId)> =
        view!(contract.get_top_claims(None, 100)).unwrap_json();
    assert_eq!(claims.len(), 0);

    do_acquire(&bob, &alice, &contract, None);

    let bets: Vec<(WrappedBalance, BidId)> = view!(contract.get_top_bets(None, 100)).unwrap_json();
    assert_eq!(bets.len(), 0);
    let claims: Vec<(WrappedBalance, BidId)> =
        view!(contract.get_top_claims(None, 100)).unwrap_json();
    assert_eq!(claims.len(), 0);
}

#[test]
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
