
import { useContext, useEffect, useState } from 'react';
import {
  Row,
  Client,
  DetailsButton,
  ClientSuffix
} from './layout'
import { NearContext, INearProps } from 'helpers/near'
import { IBid } from 'helpers/mappers'
import { useToBid, useToAcquire } from 'helpers/routes'
import ClaimButton from './ClaimButton'
import BetButton from './BetButton'

const BidPreview = ({ bidId, isClaimed, isAcquisition, filterActiveBids, small }: { bidId: string, isClaimed: boolean, isAcquisition?: boolean, filterActiveBids?: any, small?: boolean }) => {
  const [bid, setBid] = useState<IBid>()
  const toBid = useToBid(bidId)
  const toAcquire = useToAcquire(bidId)
  const { near }: { near: INearProps | null } = useContext(NearContext)

  const getBid = async () => {
    if (isAcquisition) return
    const _bid = await near?.api.get_bid(bidId)
    if (_bid) {
      if (_bid.claimedBy && !isClaimed && filterActiveBids) {
        filterActiveBids(_bid.id)
      }
      setBid(_bid)
    }
  }

  useEffect(() => {
    getBid()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near])


  const [prefixName, postfixName] = bidId.split('.')
  if (isAcquisition) {
    return (
      <Row small={small}>
        <Client onClick={toAcquire} small={small}>{prefixName}<ClientSuffix>.{postfixName}</ClientSuffix></Client>
        <DetailsButton small={small} onClick={toAcquire}>Acquire</DetailsButton>
      </Row>
    )
  }


  if (bid?.claimedBy) {
    if (!isClaimed && filterActiveBids) {
      return null
    }
    return (
      <Row small={small}>
        <Client onClick={toBid} small={small}>{prefixName}<ClientSuffix>.{postfixName}</ClientSuffix></Client>
        <ClaimButton small={small} bid={bid} />
      </Row>
    )
  }
  return (
    <Row small={small}>
      <Client onClick={toBid} small={small}>{prefixName}<ClientSuffix>.{postfixName}</ClientSuffix></Client>
      {bid && <BetButton small={small} bid={bid} />}
    </Row>
  );
}

export default BidPreview;