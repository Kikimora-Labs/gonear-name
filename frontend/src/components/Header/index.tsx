import { FC, useContext, Dispatch } from 'react'

import {
  Brand,
  Container,
  Line,
  Menu,
  MenuButton,
  MenuItem
} from './layout'
import { Link } from 'react-router-dom'
import {useRouteCheck, CheckState, useOpen} from 'helpers/routes'
import { NearContext, INearProps } from 'helpers/near'
import Authorize from './Authorize'

export const Header: FC<{className?: any}> = ({className}) => {
  const { isMarket, isOffer, isRules, isProfile } = useRouteCheck() as CheckState
  const { near, setNear }: { near: INearProps | null, setNear: Dispatch<INearProps | null> } = useContext(NearContext)
  const [open, setOpen] = useOpen()

  return (
    <Container className={className}>
      <MenuButton open={open} onClick={() => setOpen(!open)} />
      <Link to="/"><Brand /></Link>
      <Menu open={open}>
        <MenuItem onClick={() => setOpen(false)} to="/" $active={isMarket}>Market</MenuItem>
        <MenuItem onClick={() => setOpen(false)} to="/offer" $active={isOffer}>Offer</MenuItem>
        {near?.signedIn && <MenuItem onClick={() => setOpen(false)} to="/profile" $active={isProfile}>Profile</MenuItem>}
        <MenuItem onClick={() => setOpen(false)} to="/rules" $active={isRules}>{open ? 'Rules' : 'How it works'}</MenuItem>
      </Menu>
      <Authorize near={near} setNear={setNear} />
      <Line />
    </Container>
  )
}
