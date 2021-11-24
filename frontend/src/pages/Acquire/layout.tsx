import styled from 'styled-components'

import {RainbowButton} from 'components/Core'
import {break_down} from 'helpers/media'

export const Container = styled.div`
  margin: 116px var(--margin) 30px;
  display: grid;
  grid-template-columns: 1fr 900px 1fr;

  @media (max-width: ${break_down}) {
    margin: 40px var(--margin__mob) 30px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
`

export const Title = styled.div`
  font-weight: bold;
  font-size: 70px;
  line-height: 80px;

  @media (max-width: ${break_down}) {
    font-size: 33px;
    line-height: 39px;
  }
`

export const DetailsOne = styled.div`
  margin: 26px 0 26px;
  width: 368px;
  font-weight: normal;
  font-size: 17px;
  line-height: 26px;
  color: #fff;

  @media (max-width: ${break_down}) {
    display: none;
  }
`

export const Form = styled.div`
  margin: 16px 0 40px 0;
  grid-row: 1;
  grid-column: 2;
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

export const HelperSeed = styled.div`
  margin-top: 12px;
  font-weight: normal;
  font-size: 16px;
  line-height: 22px;
  color: #a5a7aa;

  @media (max-width: ${break_down}) {
    margin-top: 7px;
  }
`

export const Link = styled.a<{ href: string }>`
  color: #fff;
`

export const Button = styled(RainbowButton)`
  margin-top: 15px;

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

export const Input = styled.input`
  margin-left: 25px;
  height: 32px;
  line-height: 32px;
  font-weight: 400;
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
