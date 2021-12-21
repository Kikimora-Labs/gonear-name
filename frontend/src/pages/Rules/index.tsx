import {
  Container,
  Details,
  Title
} from './layout'
import {Questions} from 'components/Questions'
import {useTopScroll} from 'helpers/hooks'

export const Rules = () => {
  useTopScroll()

  return (
    <Container>
      <Title>How it works</Title>
      <Details>This is NEAR Account Marketplace. It allows you to sell, bid and buy NEAR Account names.</Details>
      <Questions />
    </Container>
  )
}
