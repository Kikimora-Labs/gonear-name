import {useState, FC} from 'react'

import {
  Container,
  ItemContainer,
  TitleRow,
  ArrowOpen,
  ArrowClose,
  Title,
  ContentBlock,
  Content,
  Text,
  Help,
  Akcent,
  Ul,
  Li
} from './layout'

const Question: FC<{title: string}> = ({title}) => {
  const [open, setOpen] = useState(false)

  return (
    <ItemContainer>
      <TitleRow onClick={() => setOpen(!open)}>
        {open && (<ArrowOpen />)}
        {!open && (<ArrowClose />)}
        <Title>{title}</Title>
      </TitleRow>
      {open && (
        <ContentBlock>
          <Content>
          <Text>Initial placement costs 0.3 NEAR + ~1.6 NEAR to de1ploy a locker contract.&nbsp;<Help>(The system expects at least 2 NEAR in available balance)</Help>. Initial claim price is 2.5 NEAR. There are two operations available:</Text>
          <Ul>
            <Li><Akcent>Place a bet.</Akcent> This costs half of the current price (starts from 1.25 NEAR at initial state). The payment goes to previous believers, and the price increases for x1.2 times.</Li>
            <Li><Akcent>Claim an account.</Akcent> This costs full price. You need to wait 72 hours to make sure no one wants to bet on the account. If someone will bet within 72 hours, you will receive all your funds back plus forfeits paid   by believer who bets. If no one will bet, the account is totally yours, congratulations!</Li>
          </Ul>
          </Content>
        </ContentBlock>
      )}
    </ItemContainer>
  )
}

export const Questions = () => {
  return (
    <Container>
      <Question title="For whom" />
      <Question title="Basics" />
      <Question title="Rewards for bets" />
      <Question title="Rewards for claims" />
      <Question title="How to claim rewards" />
      <Question title="Commission" />
      <Question title="Forfeits" />
      <Question title="Specific cases" />
      <Question title="Account acquiring procedure" />
      <Question title="Example of distribution" />
      <Question title="Global Stats" />
    </Container>
  )
}
