import {FC} from 'react'

import {
  InnerContainer,
  OuterContainer,
  Content,
  Header,
  Light,
  BackgroundOffer,
  BackgroundRules
} from './layout'
import {useRouteCheck, CheckState} from 'helpers/routes'

export const Layout: FC<{}> = ({children}) => {
  const {isOffer, isRules} = useRouteCheck() as CheckState

  return (
    <OuterContainer>
      {isOffer && <BackgroundOffer />}
      {isRules && <BackgroundRules />}
      <InnerContainer>
        <Header />
        <Light />
        <Content>{children}</Content>
      </InnerContainer>
    </OuterContainer>
  )
}
