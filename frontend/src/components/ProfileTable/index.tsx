import {
  Table
} from './layout'
import BidPreview from '../MarketTables/BidPreview'
export const ProfileTable = ({ list, isAcquisition }: { list: string[], isAcquisition?: boolean }) => {

  const bids = list.map(bidId => {
    return (
      <BidPreview bidId={bidId} key={bidId} isClaimed={false} isAcquisition={isAcquisition} small={true} />
    )
  })

  return (
    <Table>
      {bids}
    </Table>
  )
}

