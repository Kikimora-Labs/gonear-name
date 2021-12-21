import { useState } from 'react'
import {
  BalanceMoneyIcon,
  BalanceInvertIcon,
  Button,
  ColoredButton,
  WillButton,
  WillPrefix
} from './layout'
import { INearProps } from 'helpers/near'
import { IBid } from 'helpers/mappers'
import { useToAcquire } from 'helpers/routes'
import { BeatLoader } from "react-spinners";
import Moment from 'react-moment'

const BetBtn = ({ bidInfo, near, nowTime }: { bidInfo: IBid, near: INearProps, nowTime: number }) => {
  const { betPrice, claimedTime } = bidInfo
  const forfeit = bidInfo.forfeit ? (Math.floor(nowTime - claimedTime) / 1000 / near.config.claimPeriod) * (bidInfo.betPrice / 40) + bidInfo.betPrice / 40 : 0
  const totalBetPrice = betPrice + forfeit
  const betBid = async () => {
    if (bidInfo.forfeit < 0.001) {
      await near.api.bet(bidInfo.id, totalBetPrice + 1e-5)
    } else {
      await near.api.bet(bidInfo.id, (totalBetPrice + 1e-5) * 1.001)
    }
  }

  return (
    <Button big onClick={betBid} disabled={!near.signedAccountId}>Bid <BalanceMoneyIcon /> {totalBetPrice.toFixed(5)}</Button>
  )
}



const ClaimBtn = ({ bidInfo, near, nowTime }: { bidInfo: IBid, near: INearProps, nowTime: number }) => {
  const { claimedBy, claimPrice, claimedTime } = bidInfo
  const claimBid = async () => {
    await near.api.claim(bidInfo.id, claimPrice + 1e-5)
  }

  return (
    !claimedBy ? (
      <ColoredButton onClick={claimBid} disabled={!near.signedAccountId}>Claim for <BalanceInvertIcon /> {claimPrice.toFixed(5)}</ColoredButton>
    ) : (
      <WillButton>
        <WillPrefix>Will be claimed after</WillPrefix>
        <Moment date={claimedTime} format='hh:mm:ss' add={{ seconds: near.config.claimPeriod }} duration={nowTime} />
      </WillButton>
    )
  )
}

const FinalizeBtn = ({ bidInfo, near }: { bidInfo: IBid, near: INearProps }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const toAcquire = useToAcquire(bidInfo.id)

  const finalizeBid = async () => {
    setLoading(true)
    await near.api.finalize(bidInfo.id)
    toAcquire()
  }

  if (loading) return (
    <ColoredButton><BeatLoader /></ColoredButton>
  )

  return (
    <ColoredButton onClick={finalizeBid} disabled={bidInfo.claimedBy !== near.signedAccountId}>Finalize</ColoredButton>
  )
}

const AcquireBtn = ({ bidInfo }: { bidInfo: IBid }) => {
  const toAcquire = useToAcquire(bidInfo.id)

  return (
    <ColoredButton onClick={toAcquire}>Acquire</ColoredButton>
  )
}

export { BetBtn, ClaimBtn, FinalizeBtn, AcquireBtn }
