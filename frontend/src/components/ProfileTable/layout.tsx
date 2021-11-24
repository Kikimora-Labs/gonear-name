import {FC} from 'react'
import styled from 'styled-components'

import {MoneyIcon as MoneyIconBase} from 'components/Icons'
import {break_down} from 'helpers/media'

export const Table = styled.div`
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: ${break_down}) {
    margin-top: 32px;
  }
`

export const Row = styled.div`
  height: 95px;
  border-bottom: 1px solid #3F4450;
  display: flex;
  justify-content: stretch;
  align-items: center;

  &:first-child {
    border-top: 1px solid #3F4450;
  }

  @media (max-width: ${break_down}) {
    height: 76px;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: 38px 38px;
  }
`

export const Client = styled.div`
  flex: 1 0;
  font-weight: normal;
  font-size: 18px;

  @media (max-width: ${break_down}) {
    grid-column: 1;
    grid-row: 1;
    align-self: end;
    height: 21px;
    line-height: 21px;
    font-weight: 600;
    font-size: 14px;
  }
`

export const ClientSuffix = styled.span`
  color: #8C95A6;
`


export const Bids = styled.div`
  font-size: 16px;
  color: #8C95A6;
  font-weight: normal;

  @media (max-width: ${break_down}) {
    font-size: 12px;
    grid-column: 1;
    grid-row: 2;
    height: 18px;
    line-height: 18px;
    align-self: start;
    justify-self: start;
    text-align: left;
  }
`

export const MoneyIcon = styled(MoneyIconBase)`
  margin: 0 8px;
`

const BorderButtonBack = styled.div<{big?: boolean}>`
  height: 50px;
  line-height: 50px;
  background: linear-gradient(to right, rgba(235, 234, 255, 1), rgba(207, 226, 255, 1), rgba(218, 222, 255, 1), rgba(255, 200, 249, 1));
  border-radius: 12px;

  @media (max-width: ${break_down}) {
    height: 40px;
    line-height: 40px;
    border-radius: 10px;
  }
`

const BorderButtonBase = styled.div<{big?: boolean}>`
  margin: 1px;
  background: var(--root-background);
  border-radius: 11px;
  text-align: center;
  height: 48px;
  line-height: 48px;
  font-weight: bold;
  font-size: 14px;
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
    font-size: 13px;
    border-radius: 9px;
  }
`

const BorderButton: FC<{className?: any, onClick?: any}> =
  ({children, className, onClick}) => (
  <BorderButtonBack className={className}>
    <BorderButtonBase onClick={onClick}>{children}</BorderButtonBase>
  </BorderButtonBack>
)

export const StartsButton = styled(BorderButton)`
  margin-left: 38px;
  width: 190px;

  @media (max-width: ${break_down}) {
    margin-left: 0;
    width: 170px;
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: center;
  }
`
