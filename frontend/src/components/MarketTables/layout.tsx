import styled from 'styled-components'

import { RainbowButton } from 'components/Core'
import right_png from 'assets/images/right.png'
import {break_down} from 'helpers/media'
import {
  MoneyIcon as MoneyIconBase,
  OkIcon as OkIconBase
} from 'components/Icons'
import {BorderButton, GreyButton} from 'components/Core'

export const Table = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: ${break_down}) {
    margin-top: 16px;
  }
`

export const Row = styled.div<{ small?: boolean }>`
  height: ${({ small }) => small ? '95px' : '125px' };
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
    grid-template-columns: 1fr auto auto;
    grid-template-rows: 38px 38px;
  }
`

export const Client = styled.div<{ small?: boolean }>`
  flex: 1 0;
  font-weight: bold;
  font-size: ${({small}) => small ? '18px' : '30px' };
  cursor: pointer;

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

export const OkIcon = styled(OkIconBase)`
  @media (max-width: ${break_down}) {
    grid-column: 3;
    grid-row: 1 / 3;
    align-self: center;
    margin-left: 10px;
  }
`

export const Claimed = styled.div`
  font-size: 16px;
  margin-left: 6px;
  cursor: pointer;

  @media (max-width: ${break_down}) {
    margin-left: 0;
    font-size: 12px;
    grid-column: 2;
    grid-row: 2;
    height: 21px;
    line-height: 21px;
    align-self: start;
    justify-self: end;
  }
`

export const ClaimedPrefix = styled.div`
  margin-left: 8px;
  font-size: 16px;
  color: #8C95A6;

  @media (max-width: ${break_down}) {
    margin-left: 0;
    font-size: 12px;
    grid-column: 2;
    grid-row: 1;
    height: 21px;
    line-height: 21px;
    align-self: end;
    justify-self: end;
  }
`

export const Button = styled(RainbowButton)`
  margin-top: 52px;

  @media (max-width: ${break_down}) {
    margin-top: 29px;
    font-weight: bold;
    font-size: 16px;
  }
`

export const DetailsButton = styled<{ small?: boolean } | any>(GreyButton)`
  margin-left: 26px;
  width: 228px;

  @media (max-width: ${break_down}) {
    margin-left: 0;
    width: auto;
    background: none;
    grid-column: 1;
    grid-row: 2;
    height: 18px;
    line-height: 18px;
    align-self: start;
    justify-self: start;
    text-align: left;
    color: #8C95A6;
    cursor: pointer;

    &::after {
      content: ' ';
      width: 8px;
      height: 8px;
      padding-left: 8px;
      background-image: url(${right_png});
      background-position: center;
      background-repeat: no-repeat;
      background-size: 8px 8px;
    }
  }
`

export const Bids = styled.div`
  font-size: 16px;
  text-align: right;
  color: #8C95A6;

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

export const StartsButton = styled<{ small?: boolean } | any>(BorderButton)`
  margin-left: 26px;
  width: 228px;
  
  @media (max-width: ${break_down}) {
    margin-left: 0;
    width: 180px;
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: center;
  }
`
export const ProfitableText = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #fafafa;
`