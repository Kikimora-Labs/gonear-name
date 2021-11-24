import {
  Claimed,
  ClaimedPrefix,
  DetailsButton,
  OkIcon,
} from './layout'
import { useToProfile, useToBid } from 'helpers/routes'
import { IBid } from 'helpers/mappers'

const ClaimButton = ({ bid, small }: { bid: IBid, small?: boolean }) => {
  const toProduct = useToBid(bid.id)
  const toProfile = useToProfile(bid.id)

  return (
    <>
      <OkIcon />
      <ClaimedPrefix>Claimed by</ClaimedPrefix>
      <Claimed onClick={toProfile}>{bid?.claimedBy}</Claimed>
      <DetailsButton onClick={toProduct} small={small}>View Details</DetailsButton>
    </>
  );
}

export default ClaimButton;