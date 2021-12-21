import {FC} from 'react'
import styled from 'styled-components'

import {break_down} from 'helpers/media'

const BorderButtonBack = styled.div<{ small?: boolean}>`
  ${({ small }) => small ?`
  height: 48px;
  line-height: 48px;  
  border-radius: 11px;
  `:`
  height: 67px;
  line-height: 67px;
  border-radius: 17px;
  `}
  background: linear-gradient(to right, rgba(235, 234, 255, 1), rgba(207, 226, 255, 1), rgba(218, 222, 255, 1), rgba(255, 200, 249, 1));


  @media (max-width: ${break_down}) {
    height: 40px;
    line-height: 40px;
    border-radius: 10px;
  }
`

const BorderButtonBase = styled.div<{ small?: boolean}>`
  margin: 1px;
  background: var(--root-background);
  text-align: center;
  ${({ small }) => small ? `
  height: 46px;
  line-height: 46px;
  border-radius: 10px;
  `: `
  height: 65px;
  line-height: 65px;
  border-radius: 16px;
  `}
  font-weight: bold;
  font-size: 16px;
  border: none;
  outline: none;
  cursor: pointer;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${break_down}) {
    height: 38px;
    line-height: 38px;
    border-radius: 9px;
    font-weight: 600;
    font-size: 13px;
  }
`

export const BorderButton: FC<{ className?: any, onClick?: any, small?: boolean}> =
  ({ children, className, onClick, small}) => (
  <BorderButtonBack className={className} small={small}>
    <BorderButtonBase onClick={onClick} small={small}>{children}</BorderButtonBase>
  </BorderButtonBack>
)

export const GreyButton = styled.button<{ small?: boolean}>`
  ${({ small }) => small ? `
  height: 48px;
  border-radius: 11px;
  `: `
  height: 67px;
  border-radius: 17px;
  `}
  background: #2C3139;
  font-weight: bold;
  font-size: 16px;
  border: none;
  outline: none;
  cursor: pointer;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${break_down}) {
    font-size: 12px;
    font-weight: normal;
  }
`

export const RainbowButton = styled(GreyButton)`
  background: linear-gradient(to right, rgba(235, 234, 255, 1), rgba(207, 226, 255, 1), rgba(218, 222, 255, 1), rgba(255, 200, 249, 1));
  color: #181B21;
`

