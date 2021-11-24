import styled from 'styled-components'

import back_png from 'assets/images/back.png'
import point_png from 'assets/images/point.png'
import bag_png from 'assets/images/bag.png'
import coin_png from 'assets/images/coin.png'
import cup_png from 'assets/images/cup.png'
import bag_min_png from 'assets/images/bag_min.png'
import coin_min_png from 'assets/images/coin_min.png'
import cup_min_png from 'assets/images/cup_min.png'
import {MoneyIcon as MoneyIconBase} from 'components/Icons'
import {break_down} from 'helpers/media'
import { GreyButton } from 'components/Core'

export const Container = styled.div`
  margin: 0 var(--margin) 150px;
  display: grid;
  grid-template-columns: 120px 1fr; 

  @media (max-width: ${break_down}) {
    margin: 0 var(--margin__mob) 30px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
`

export const BackButton = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #2C3139;
  margin-top: 45px;
  grid-column: 1;
  grid-row: 1;
  justify-self: start;
  background-image: url(${back_png});
  background-position: center;
  background-repeat: no-repeat;
  background-size: 14px 14px;
  cursor: pointer;

  @media (max-width: ${break_down}) {
    width: 44px;
    height: 44px;
    border-radius: 22px;
    margin-top: 22px;
    background-color: #181B21;
  }
`

export const Main = styled.div`
  grid-column: 2;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: ${break_down}) {
    margin-top: 16px;
    max-width: calc(100vw - var(--margin__mob) - var(--margin__mob));
  }
`

export const Title = styled.div`
  height: 130px;
  line-height: 130px;
  font-weight: bold;
  font-size: 88px;

  @media (max-width: ${break_down}) {
    height: 40px;
    line-height: 40px;
    font-weight: bold;
    font-size: 33px;
  }
`

export const Bread = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: ${break_down}) {
    margin-top: 16px;
  }
`

export const BreadItem = styled.div`
  font-weight: normal;
  font-size: 17px;
  height: 22px;
  line-height: 22px;

  &:not(:first-child) {
    margin-left: 14px;
  }

  @media (max-width: ${break_down}) {
    height: 20px;
    line-height: 20px;
    font-size: 13px;

    &:not(:first-child) {
      margin-left: 10px;
    }
  }
`

export const BreadDot = styled.img`
  width: 6px;
  height: 6px;
  object-fit: contain;

  &:not(:first-child) {
    margin-left: 14px;
  }

  @media (max-width: ${break_down}) {
    &:not(:first-child) {
      margin-left: 10px;
    }
  }
`

BreadDot.defaultProps = {
  src: point_png
}

export const Cards = styled.div`
  margin-top: 45px;
  display: flex;
  justify-content: stretch;
  flex-wrap: nowrap;

  @media (max-width: ${break_down}) {
    margin-top: 32px;
    gap: 16px;
    overflow: auto;
    margin-right: -25px;
  }
`

const bagBack = `
  background-image: url(${bag_png});
  background-position: top 0px right 0px;
  background-size: 262px 180px;

  @media (max-width: ${break_down}) {
    background-image: url(${bag_min_png});
    background-position: top 0px left 20px;
    background-size: 180px 180px;
  }
`

const coinBack = `
  background-image: url(${coin_png});
  background-position: top 0px right 0px;
  background-size: 230px 180px;

  @media (max-width: ${break_down}) {
    background-image: url(${coin_min_png});
    background-position: top 0px left 36px;
    background-size: 159px 180px;
  }
`

const cupBack = `
  background-image: url(${cup_png});
  background-position: top 0px right 0px;
  background-size: 261px 180px;

  @media (max-width: ${break_down}) {
    background-image: url(${cup_min_png});
    background-position: top 0px left 32px;
    background-size: 180px 180px;
  }
`

const backByType = (type: string) => {
  if(type === 'bag') return bagBack
  if(type === 'coin') return coinBack
  if(type === 'cup') return cupBack
  return ''
}

export const Card = styled.div<{type: string}>`
  height: 180px;
  flex: 1 0;
  background: #2C3139;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  background-repeat: no-repeat;
  ${({type}) => backByType(type)}

  @media (max-width: ${break_down}) {
    flex: 1 0 180px;

    &:last-child {
      margin-right: var(--margin__mob);
    }
  }

  &:not(:first-child) {
    margin-left: 23px;
  }
`

export const CardTitle = styled.div`
  margin: 33px 0 0 35px;
  font-weight: normal;
  font-size: 19px;
  line-height: 24px;
  height: 24px;

  @media (max-width: ${break_down}) {
    margin: 19px 0 0 22px;
    font-size: 15px;
  }
`

export const CardValue = styled.div`
  margin: 8px 0 0 35px;
  display: flex;
  align-items: center;

  @media (max-width: ${break_down}) {
    margin: 6px 0 0 22px;
  }
`

export const MoneyIcon = styled(MoneyIconBase)`
  width: 27px;
  height: 27px;

  @media (max-width: ${break_down}) {
    width: 24px;
    height: 24px;
  }
`

export const InlineMoneyIcon = styled(MoneyIcon)`
  position: relative;
  top: 5px;
`

export const DetailsButton = styled<{ small?: boolean } | any>(GreyButton)`
  margin-left: 26px;
  height: auto;
  padding: 22px 30px;
  margin-top: 7px;
  background: #b8cae7;
  color: #000;
  width: 226px;

  &:disabled {
    opacity: 0.2;
    pointer-events: none;
  }

  @media (max-width: ${break_down}) {
    padding: 16px 12px;
  }
`

export const LowRewards = styled.div`
  font-size: 19px;

  @media (max-width: ${break_down}) {
    font-size: 13px;
  }
`

export const Collect = styled.div`
  margin: 15px 0 0 0;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
`

export const Value = styled.span`
  margin-left: 9px;
  font-weight: 600;
  font-size: 21px;
  height: 32px;
  line-height: 32px;

  @media (max-width: ${break_down}) {
    margin-left: 6px;
    font-size: 16px;
    height: 24px;
    line-height: 24px;
  }
`

export const TableHeaders = styled.div`
  margin-top: 58px;
  display: flex;

  @media (max-width: ${break_down}) {
    margin-top: 39px;
  }
`

export const TableHeader = styled.div<{active?: boolean}>`
  display: flex;
  align-items: start;
  cursor: pointer;
  ${({active}) => active ? 'color: #FFFFFF;' : 'color: #8C95A6;'}

  &:not(:first-child) {
    margin-left: 32px;
  }

  @media (max-width: ${break_down}) {
    &:not(:first-child) {
      margin-left: 27px;
    }
  }
`

export const TableTitle = styled.div`
  height: 42px;
  line-height: 42px;
  font-weight: 600;
  font-size: 28px;

  @media (max-width: ${break_down}) {
    height: 26px;
    line-height: 26px;
    font-size: 17px;
  }
`

export const TableIndex = styled.div`
  margin-left: 8px;
  font-weight: 600;
  font-size: 19px;
  line-height: 20px;
  height: 20px;

  @media (max-width: ${break_down}) {
    margin-left: 4px;
    font-size: 15px;
    line-height: 16px;
    height: 16px;
  }
`
