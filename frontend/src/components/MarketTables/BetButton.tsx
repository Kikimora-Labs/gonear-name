import { useEffect, useContext, useState } from 'react'
import {
  Bids,
  StartsButton,
  MoneyIcon,
  ProfitableText
} from './layout'
import { useToBid } from 'helpers/routes'
import { IBid } from 'helpers/mappers'
import { NearContext, INearProps } from 'helpers/near'
import Profitable from '../Bid/Profitable'

const BetButton = ({ bid, small }: { bid: IBid, small?: boolean }) => {
  const { near }: { near: INearProps | null } = useContext(NearContext)
  const [balance, setBalance] = useState<number>(0)
  const toBid = useToBid(bid.id)
  const bidLength = bid?.bets?.length || 0

  const getBalance = async () => {
    if (!near || !bid) return
    const b = await near.api.get_balance(bid.id)
    if (b) setBalance(b)
  }

  useEffect(() => {
    getBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Bids>
        {bidLength} {bidLength > 1 ? 'bids' : 'bid'}
        
        {!small && <Profitable bid={bid} balance={balance}>
          <ProfitableText>Profitable</ProfitableText>
        </Profitable>}
      </Bids>
      <StartsButton onClick={toBid} small={small}>Starts from <MoneyIcon /> {bid?.betPrice.toFixed(2) || 0}</StartsButton>
    </>
  );
}

export default BetButton;