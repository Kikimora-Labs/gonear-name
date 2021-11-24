import styled from 'styled-components'

import {break_down} from 'helpers/media'
import arrow_close_png from 'assets/images/arrow_close.png'
import arrow_open_png from 'assets/images/arrow_open.png'

export const Container = styled.div`
  margin-top: 60px;
  max-width: 722px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: ${break_down}) {
    margin-top: 26px;
  }
`

export const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
 
  &:not(:first-child) {
    margin-top: 36px;
  }

  @media (max-width: ${break_down}) {
    &:not(:first-child) {
      margin-top: 19px;
    }
  }
`

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`

export const ArrowOpen = styled.div`
  width: 24px;
  height: 24px;
  background-image: url(${arrow_open_png});
  background-size: contain;
  background-repeat: no-repeat;
  margin-right: 16px;

  @media (max-width: ${break_down}) {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
`

export const ArrowClose = styled(ArrowOpen)`
  background-image: url(${arrow_close_png});
`

export const Title = styled.div`
  font-weight: 600;
  font-size: 28px;
  line-height: 42px;
  height: 42px;

  @media (max-width: ${break_down}) {
    font-size: 15px;
    line-height: 22px;
    height: 22px;
  }
`

export const ContentBlock = styled.div`
  margin-top: 20px;
  border-radius: 32px;
  border: 1px solid #3F4450;

  @media (max-width: ${break_down}) {
    margin-top: 18px;
    border-radius: 0;
    border: none;
  }
`

export const Content = styled.div`
  margin: 36px 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: ${break_down}) {
    margin: 0;
  }
`

export const Text = styled.div`
  font-weight: normal;
  font-size: 16px;
  line-height: 26px;

  @media (max-width: ${break_down}) {
    font-size: 14px;
    line-height: 24px;
  }
`

export const Help = styled.span`
  color: #8C95A6;
`

export const Akcent = styled.span`
  font-weight: bold;
`

export const Ul = styled.ul`
  margin-top: 6px;
  padding-left: 2em;

  @media (max-width: ${break_down}) {
    margin-top: 0;
    padding-left: 1em;
  }
`

export const Li = styled.li`
  font-weight: normal;
  font-size: 16px;
  line-height: 26px;
  margin-top: 14px;

  @media (max-width: ${break_down}) {
    font-size: 14px;
    line-height: 24px;
  }
`
