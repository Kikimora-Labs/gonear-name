import { useContext, useState, useEffect } from 'react'
import {
  Container,
  BackButton
} from './layout'
import BidComponent from 'components/Bid'
import {useTopScroll} from 'helpers/hooks'
import { useParams } from 'react-router-dom'
import { useToMarket } from 'helpers/routes'
import { IBidSafety, IProfile } from 'helpers/mappers'
import { NearContext, INearProps } from 'helpers/near'
import useSWR from 'swr'

export const Bid = () => {
  useTopScroll()
  const { bidId } = useParams<{ bidId: string }>();
  const { near }: { near: INearProps | null } = useContext(NearContext)
  const [bidSafety, setBidSafety] = useState<IBidSafety>()
  const [profile, setProfile] = useState<IProfile | null>(null)
  const toMarket = useToMarket()

  const { data: bidInfo } = useSWR(
    ['get_bid', near?.connected, bidId], 
    () => near?.api.get_bid(bidId),
    { refreshInterval: 60000 }
  )
  
  const getBidSafety = async () => {
    if (!near) return
    const bs = await near.api.get_bid_safety(bidId)
    if (bs) setBidSafety(bs)
  }

  const getProfile = async () => {
    if (!near) return
    const pr = await near.api.get_profile(near.signedAccountId)
    if (pr) setProfile(pr);
  }

  useEffect(() => {
    getProfile()
    getBidSafety()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near?.signedAccountId])

  return (
    <Container>
      <BackButton onClick={toMarket} />
      { near && bidInfo && bidSafety && <BidComponent bidInfo={bidInfo} bidSafety={bidSafety} near={near} profile={profile} /> }
    </Container>
  )
}
