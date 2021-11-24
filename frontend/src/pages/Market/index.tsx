import { useContext, useEffect, useState } from 'react'
import {
  Container,
  Title,
  ClaimTitle,
  ActiveTitle,
} from './layout'
import { MarketTable } from 'components/MarketTables'
import { useTopScroll } from 'helpers/hooks'
import { NearContext, INearProps } from 'helpers/near'
import { IStat } from 'helpers/mappers'

export const Market = () => {
  const [stats, setStats] = useState<IStat | null>(null)
  const [filteredBids, setFilteredBids] = useState<string[]>([])

  const filterActiveBids = (bidId: string) => {
    if (!filteredBids.includes(bidId)) {
      setFilteredBids((bids) => {
        return [...bids, bidId]
      })
    }
  }

  useTopScroll()
  
  const { near }: { near: INearProps | null } = useContext(NearContext)

  const getStats = async () => {
    const globalstats = await near?.api.get_global_stats()
    if (globalstats) setStats(globalstats)
  }

  useEffect(() => {
    getStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near])

  if (!near || !stats) return null
  
  return (
    <Container>
      <Title>Market</Title>
      <ClaimTitle>On Claim ({stats.numBidsOnClaim})</ClaimTitle>
      <MarketTable near={near} limit={5} isClaimed={true} />
      <ActiveTitle>Active ({stats.numBids - filteredBids.length})</ActiveTitle>
      <MarketTable near={near} limit={25} isClaimed={false} filterActiveBids={filterActiveBids} />
    </Container>
  )
}
