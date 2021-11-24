import { useContext, useState } from 'react'
import {
  BackButton,
  Bread,
  BreadDot,
  BreadItem,
  Card,
  Cards,
  CardTitle,
  CardValue,
  Container,
  Main,
  MoneyIcon,
  InlineMoneyIcon,
  TableHeader,
  TableHeaders,
  TableIndex,
  TableTitle,
  Title,
  Value,
  DetailsButton,
  Collect,
  LowRewards
} from './layout'
import { useParams, Redirect } from 'react-router-dom'
import {useToMarket} from 'helpers/routes'
import {ProfileTable} from 'components/ProfileTable'
import {useTopScroll} from 'helpers/hooks'
import { NearContext, INearProps } from 'helpers/near'
import useSWR, { mutate } from 'swr'

export const Profile = () => {
  useTopScroll()
  const toMarket = useToMarket()
  const [tab, setTab] = useState<number>(0)
  const [disableRewards, setDisableRewards] = useState<boolean>(false)
  const { near }: { near: INearProps | null } = useContext(NearContext)
  let { accountId } = useParams<{ accountId: string | undefined }>();

  const { data: profile } = useSWR(
    ['get_profile', near?.signedAccountId, accountId],
    () => near?.api.get_profile(accountId || near?.signedAccountId)
  )

  const grabRewards = async () => {
    if (!near || !profile) return null
    setDisableRewards(true)
    lowRewards = true
    profile.profitTaken += profile.availableRewards
    profile.availableRewards = 0
    await mutate(['get_profile', near?.signedAccountId, accountId], profile, false)
    await near.api.collect_rewards()
  }

  if (!near || !profile) return null
  if (!accountId && near.signedAccountId) accountId = near.signedAccountId
  if (!accountId) {
    return <Redirect to="/" />
  }

  const { numAcquisitions, numBets, numClaims, numOffers, availableRewards, betsVolume, profitTaken, acquisitions, participation} = profile
  let lowRewards = profile && profile.availableRewards < 0.1

  return (
    <Container>
      <BackButton onClick={toMarket} />
      <Main>
        <Title>{ accountId }</Title>
        <Bread>
          <BreadItem>{numOffers} Offer{numOffers !== 1 && 's'}</BreadItem>
          <BreadDot />
          <BreadItem>{numBets} Bid{numBets !== 1 && 's'}</BreadItem>
          <BreadDot />
          <BreadItem>{numClaims} Claim{numClaims !== 1 && 's'}</BreadItem>
          <BreadDot />
          <BreadItem>{numAcquisitions} Aacquisition{numAcquisitions !== 1 && 's'}</BreadItem>
        </Bread>
        <Cards>
          <Card type="bag">
            <CardTitle>Bids volume:</CardTitle>
            <CardValue>
              <MoneyIcon />
              <Value>{betsVolume.toFixed(2)}</Value>
            </CardValue>
          </Card>
          <Card type="coin">
            <CardTitle>Profit taken</CardTitle>
            <CardValue>
              <MoneyIcon />
              <Value>{profitTaken.toFixed(2)}</Value>
            </CardValue>
          </Card>
          <Card type="cup">
            <CardTitle>Available rewards</CardTitle>
            <CardValue>
              <MoneyIcon />
              <Value>{availableRewards.toFixed(2)}</Value>
            </CardValue>
          </Card>
        </Cards>

        {accountId === near.signedAccountId && (
          <Collect>
            <DetailsButton disabled={lowRewards || disableRewards} onClick={grabRewards}>
              Collect Rewards
            </DetailsButton>
            {lowRewards && <LowRewards>
              Accumulate at least<Value>0.1</Value> <InlineMoneyIcon />&nbsp; to collect rewards
            </LowRewards>}
          </Collect>
        )}

        <TableHeaders>
          <TableHeader active={tab === 0} onClick={() => setTab(0)}>
            <TableTitle>Participating</TableTitle>
            {participation.length > 0 ? <TableIndex>{participation.length}</TableIndex> : ''}
          </TableHeader>
          <TableHeader active={tab === 1} onClick={() => setTab(1)}>
            <TableTitle>Successful claims</TableTitle>
            {acquisitions.length > 0 ? <TableIndex>{acquisitions.length}</TableIndex> : ''}
          </TableHeader>
        </TableHeaders>
        <ProfileTable list={tab === 0 ? participation : acquisitions} isAcquisition={tab === 1} />
      </Main>
    </Container>
  )
}
