import {
  Balance,
  BidButtons,
  BalanceDetails,
  BalanceMoneyIcon,
  BalanceTitle,
  BalanceValue,
  Main,
  Question,
  Rules,
  Text,
  Title,
  Claimed,
  ClaimedBy,
  ClaimedDateTime,
  ClaimedDot,
  ClaimedIcon,
  ClaimedName,
  ProfitableText,
  NotSafeText
} from './layout'
import Competitors from 'components/Competitors'
import { IBid, IBidSafety, IProfile } from 'helpers/mappers'
import { INearProps } from 'helpers/near'
import Profitable from './Profitable'
import { AcquireBtn } from './BidActions'
import Buttons from './Buttons'


export const Bid = ({ near, bidInfo, bidSafety, profile }: { near: INearProps, bidInfo: IBid, bidSafety: IBidSafety, profile: IProfile | null}) => {
  const isSafe = !bidInfo.isAtMarket || (bidSafety.codeHash === 'DKUq738xnns9pKjpv9GifM68UoFSmfnBYNp3hsfkkUFa' && bidSafety.accessKeysLen === 0 && bidSafety.lockerOwner === near.config.contractName)

  const claimedTime = new Intl.DateTimeFormat('UK', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(bidInfo.claimedTime)

  if (!isSafe)
    return (
      <Main>
        <Title>{bidInfo.id}</Title>
        <NotSafeText>
          <h2>Account is not considered safe. What does it mean?</h2>
          You are suggested not to participate with the bid.<br />
          The validation consist of three steps to make sure everything is going properly under smart contract rules:
          <ul>
            <li>There must be a contract deployed onto the bid with hash equal to "DKUq738xnns9pKjpv9GifM68UoFSmfnBYNp3hsfkkUFa"</li>
            <li>There must be no access keys</li>
            <li>Owner of the locker must be equal to the account of the Marketplace {near.config.contractName}</li>
          </ul>
          The following conditions are found:
          <ul>
            <li>Hash of the contract is "{bidSafety.codeHash}"</li>
            <li>There are {bidSafety.accessKeysLen} keys found</li>
            <li>Owner of the locker is {bidSafety.lockerOwner}</li>
          </ul>
        </NotSafeText>
      </Main>
    )

  const isMineAcquisition = profile?.acquisitions.some(id => bidInfo.id === id)
  
  if (!bidInfo.isAtMarket)
    return (
      <Main>
        <Title>{bidInfo.id}</Title>
        { isMineAcquisition 
          ?
          <>
            <h2>This account is your acquisition</h2>
            <br />
            <AcquireBtn bidInfo={bidInfo} />
          </>
          :
          <Text>
            <h2>Not here yet. Is it a good fit?</h2>
          </Text>
        }
        
      </Main>
    )

  return (
    <>
      <Main>
        <Title>{bidInfo.id}</Title>
        <Balance>
          <BalanceTitle>Bid Balance:</BalanceTitle>
          <BalanceMoneyIcon />
          <BalanceValue>{bidSafety.balance.toFixed(2)}</BalanceValue>
        </Balance>
        
        <Profitable bid={bidInfo} balance={bidSafety.balance}>
          <ProfitableText>PROFITABLE! Bid balance is higher than claim price</ProfitableText>
        </Profitable>
        
        <BalanceDetails>You will possess all bid balance in case <br /> of successful claim</BalanceDetails>
        {bidInfo.claimedBy && (
          <Claimed>
            <ClaimedIcon />
            <ClaimedBy>Claimed by</ClaimedBy>
            <ClaimedName>{bidInfo.claimedBy}</ClaimedName>
            <ClaimedDot />
            <ClaimedDateTime>{claimedTime}</ClaimedDateTime>
          </Claimed>
        )}

        <BidButtons>
          <Buttons bidInfo={bidInfo} near={near} />
        </BidButtons>

        <Question>What do the buttons mean?</Question>
        <Text>When you believe the bid is underestimated and will be claimed for higher price, choose «Bet» option. You will receive rewards for each bet on top of yours, or for successful claim — up to 50%. <br /><br /> When you want to claim the bid, choose «Claim» option. If no one overbid you in the next 72 hours, the bid will be yours.</Text>
        <Rules to="/rules">Read the full rules</Rules>
      </Main>
      <Competitors bidInfo={bidInfo} />
    </>
  )
}

export default Bid