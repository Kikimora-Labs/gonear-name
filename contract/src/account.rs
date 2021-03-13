use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Account {
    pub bets: Vector<AccountId>,

    pub claim: Option<(AccountId, Timestamp)>,

    pub num_claims: u64,
}

// TODO remove Debug
#[derive(Serialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct AccountView {
    pub bets: Vec<AccountId>,

    pub claim: Option<(AccountId, WrappedTimestamp)>,

    pub num_claims: u64,
}

impl From<&Account> for AccountView {
    fn from(a: &Account) -> Self {
        Self {
            bets: a.bets.iter().map(|x| x.into()).collect(),
            claim: match &a.claim {
                Some((a, t)) => Some((a.clone(), t.clone().into())),
                None => None,
            },
            num_claims: a.num_claims,
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn get_num_active_accounts(&self) -> u64 {
        self.accounts.len()
    }

    pub fn get_account(&self, account_id: ValidAccountId) -> Option<AccountView> {
        self.accounts.get(account_id.as_ref()).map(|a| (&a).into())
    }

    pub fn get_top_bet_accounts(
        &self,
        from_key: Option<(WrappedBalance, AccountId)>,
        limit: u64,
    ) -> Vec<(WrappedBalance, AccountId)> {
        if let Some((balance, account_id)) = from_key {
            self.bet_to_account_id
                .iter_rev_from((balance.into(), account_id))
                .take(limit as usize)
                .map(|((balance, account_id), _)| (balance.into(), account_id))
                .collect()
        } else {
            self.bet_to_account_id
                .iter_rev()
                .take(limit as usize)
                .map(|((balance, account_id), _)| (balance.into(), account_id))
                .collect()
        }
    }

    pub fn get_top_claim_accounts(
        &self,
        from_key: Option<(WrappedBalance, AccountId)>,
        limit: u64,
    ) -> Vec<(WrappedBalance, AccountId)> {
        if let Some((balance, account_id)) = from_key {
            self.claim_to_account_id
                .iter_rev_from((balance.into(), account_id))
                .take(limit as usize)
                .map(|((balance, account_id), _)| (balance.into(), account_id))
                .collect()
        } else {
            self.claim_to_account_id
                .iter_rev()
                .take(limit as usize)
                .map(|((balance, account_id), _)| (balance.into(), account_id))
                .collect()
        }
    }
}

impl Contract {
    pub(crate) fn extract_account_or_create(&mut self, account_id: &AccountId) -> Account {
        self.accounts.remove(&account_id).unwrap_or_else(|| {
            let mut prefix = Vec::with_capacity(33);
            prefix.push(b'z');
            prefix.extend(env::sha256(account_id.as_bytes()));
            Account {
                bets: Vector::new(prefix),
                claim: None,
                num_claims: 0,
            }
        })
    }
}
