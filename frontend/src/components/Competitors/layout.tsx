import styled from 'styled-components'

import {MoneyIcon as MoneyIconBase} from 'components/Icons'
import {break_down} from 'helpers/media'

export const Table = styled.div`
  margin-top: 33px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: ${break_down}) {
    margin-top: 26px;
  }
`

export const Row = styled.div`
  height: 45px;
  display: flex;
  justify-content: stretch;
  align-items: center;

  &:nth-child(odd) {
    background-color: #20242C;
    border-radius: 7px;
  }
`

export const Name = styled.div`
  margin-left: 13px;
  font-weight: normal;
  font-size: 15px;
  line-height: 22px;
  height: 22px;
  flex: 1 0;
`

export const NameSuffix = styled.span`
  color: #8C95A6;
`

export const MoneyIcon = styled(MoneyIconBase)`
  width: 21px;
  height: 21px;
`

export const Value = styled.div`
  margin: 0 11px 0 6px;
  font-weight: 600;
  font-size: 15px;
  line-height: 22px;
  height: 22px;
  width: 40px;
`

export const CompetitorsBlock = styled.div`
  grid-column: 3;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 440px;
  margin-top: 35px;

  @media (max-width: ${break_down}) {
    width: auto;
    margin-top: 20px;
  }
`

export const CompetitorsTitle = styled.div`
  height: 42px;
  font-weight: 600;
  font-size: 28px;
  line-height: 42px;

  @media (max-width: ${break_down}) {
    height: 24px;
    line-height: 24px;
    font-size: 16px;
  }
`

export const CompetitorsFounded = styled.div`
  margin-top: 2px;
  font-weight: normal;
  font-size: 15px;
  line-height: 22px;
  height: 22px;
  color: #8C95A6;

  @media (max-width: ${break_down}) {
    margin-top: 7px;
    font-size: 14px;
    height: 21px;
    line-height: 21px;
  }
`

export const FoundedName = styled.span`
  color: #FF9494;
  cursor: pointer;
`