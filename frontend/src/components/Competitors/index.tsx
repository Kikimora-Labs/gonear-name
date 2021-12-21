import {
  CompetitorsBlock,
  CompetitorsFounded,
  CompetitorsTitle,
  FoundedName,
  MoneyIcon,
  Row,
  Table,
  Name,
  NameSuffix,
  Value
} from './layout'
import { useToProfile } from 'helpers/routes'
import { IBid } from 'helpers/mappers'


const Competitors = ({ bidInfo }: { bidInfo: IBid }) => {
  const toProfile = useToProfile(bidInfo.bets?.[0]);

  if (!bidInfo.bets || !bidInfo.bets.length) return null

  const [founder, ...list] = bidInfo.bets

  const competitors = list.map((accountId, index) => {
    const amount = (1.25 * Math.pow(1.2, index)).toFixed(2)
    const [prefixName, postfixName] = accountId.split('.')
    return (
      <Row key={index}>
        <Name>{prefixName}<NameSuffix>.{postfixName}</NameSuffix></Name>
        <MoneyIcon />
        <Value>{amount}</Value>
      </Row>
    )
  })


  return (
    <CompetitorsBlock>
      <CompetitorsTitle>Competitors</CompetitorsTitle>
      <CompetitorsFounded>Founded by: <FoundedName onClick={toProfile}>{founder}</FoundedName></CompetitorsFounded>
      <Table>
        {competitors.length ? competitors : <Row><Name>No competitors</Name></Row>}
      </Table>
    </CompetitorsBlock>
  );
}

export default Competitors;