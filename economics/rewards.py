import sys

bet_mult = 1.2
claim_mult = 2.0
initial_price = 0.3
first_bet = 1.25
reward_decay = 1.0 / 1.44
reward_decay_on_sell = 1.0 / 1.2
commission = 0.05
sell_reward = 0.25

num_bets = int(sys.argv[1])

price = first_bet
rewards = [0.0]
bets = [initial_price]
total_commission = initial_price

for bet in range(num_bets):
    paid = price
    bets += [paid]

    total_commission += paid * commission
    paid *= 1 - commission
    for i in reversed(range(len(rewards))):
        rewards[i] += paid * reward_decay
        paid *= (1 - reward_decay)
    rewards[0] += paid
    rewards += [0.0]

    price *= bet_mult

claim_price = price * claim_mult

print('Bet price:', round(price, 4))
print('Claim price:', round(claim_price, 4))
print('Sum of bets + placement:', round(sum(bets), 4))
total_paid = sum(bets) + claim_price
print('Total paid:', round(total_paid, 4))
print('Commission:', round(total_commission, 4))
print('Rewards before claim:')
for i in range(len(rewards)):
    print(' %d bet:  %.4f,  rewards:  %.4f,   ratio:  %.4f' % (i, bets[i], rewards[i], rewards[i] / bets[i]), end='\n')

paid = claim_price
sum_bets = sum(bets)
rewards[0] += paid * sell_reward
paid *= (1 - sell_reward)
# don't take commission on sale
for i in reversed(range(len(rewards))):
    rewards[i] += paid * reward_decay_on_sell
    paid *= (1 - reward_decay_on_sell)
rewards[0] += paid

print('Rewards after claim:')
for i in range(len(rewards)):
    print(' %d bet:  %.4f,  rewards:  %.4f,   ratio:  %.4f' % (i, bets[i], rewards[i], rewards[i] / bets[i]), end='\n')
print('Sum of rewards:', round(sum(rewards), 4))
print('Direct sale reward (the case if only owner bets):', round(sum(rewards) - sum(bets), 4))
print('Direct sale reward to claim price ratio:', round((sum(rewards) - sum(bets)) / claim_price, 4))
print('Commission ratio to claim price:', round(total_commission / claim_price, 4))
