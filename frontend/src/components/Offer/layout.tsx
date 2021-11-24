import styled from 'styled-components'

import {RainbowButton} from 'components/Core'
import {break_down} from 'helpers/media'

export const Container = styled.div`
  margin: 116px var(--margin) 30px;
  display: grid;
  grid-template-columns: 1fr 465px 1fr 435px 2fr;

  @media (max-width: ${break_down}) {
    margin: 40px var(--margin__mob) 30px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
`
export const FullWidthContainer = styled.div`
  margin: 116px var(--margin) 30px;
  text-align:center;

  @media (max-width: ${break_down}) {
    margin: 40px var(--margin__mob) 30px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
`
export const Main = styled.div`
  grid-row: 1;
  grid-column: 2;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 2;
`

export const Title = styled.div`
  font-weight: bold;
  font-size: 87px;
  line-height: 90px;

  @media (max-width: ${break_down}) {
    font-size: 33px;
    line-height: 39px;
  }
`

export const Head = styled.div`
  font-weight: bold;
  font-size: 50px;
  line-height: 65px;
  margin-bottom: 40px;

  @media (max-width: ${break_down}) {
    font-size: 25px;
    line-height: 33px;
  }
`

export const DetailsOne = styled.div`
  margin-top: 22px;
  width: 368px;
  font-weight: normal;
  font-size: 14px;
  line-height: 26px;
  color: #8C95A6;

  @media (max-width: ${break_down}) {
    display: none;
  }
`

export const DetailsTwo = styled(DetailsOne)`
  display: none;

  @media (max-width: ${break_down}) {
    display: block;
    margin-top: 15px;
    width: auto;
    font-size: 13px;
    line-height: 21px;
  }
`

export const Form = styled.form<any>`
  margin-top: 16px;
  grid-row: 1;
  grid-column: 4;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 2;

  @media (max-width: ${break_down}) {
    margin-top: 33px;
  }
`

export const HeadOne = styled.div`
  font-weight: 500;
  font-size: 23px;
  line-height: 34px;
  height: 34px;

  @media (max-width: ${break_down}) {
    font-size: 16px;
    line-height: 24px;
    height: 24px;
  }
`

export const HeadTwo = styled(HeadOne)`
  margin-top: 43px;

  @media (max-width: ${break_down}) {
    margin-top: 28px;
  }
`

export const Helper = styled.div`
  margin-top: 12px;
  font-weight: normal;
  font-size: 13px;
  line-height: 20px;
  height: 20px;
  color: #8C95A6;

  @media (max-width: ${break_down}) {
    margin-top: 7px;
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

export const InputContainer = styled.div`
  margin-top: 16px;
  height: 72px;
  line-height: 72px;
  background: #20242C;
  border-radius: 17px;
  display: flex;
  justify-content: stretch;
  align-items: center;

  @media (max-width: ${break_down}) {
    margin-top: 13px;
    height: 56px;
    line-height: 56px;
    border-radius: 12px;
  }
`

export const Input = styled.input<any>`
  margin-left: 25px;
  height: 32px;
  line-height: 32px;
  font-weight: 600;
  font-size: 17px;
  border: none;
  background: transparent;
  outline: none;
  flex: 1 0;
  color: #FFFFFF;

  @media (max-width: ${break_down}) {
    margin-left: 21px;
    height: 28px;
    line-height: 28px;
    font-size: 15px;
    width: calc(100vw - 135px);
  }
`

export const InputSuffix = styled.div`
  margin-left: 4px;
  margin-right: 25px;
  font-weight: 500;
  font-size: 17px;
  line-height: 24px;
  height: 24px;
  color: #8C95A6;

  @media (max-width: ${break_down}) {
    margin-right: 16px;
    font-size: 15px;
  }
`

export const Red = styled.span`
  color: #ff7e7e;
`

export const Green = styled.span`
  color: #90ffac;
`