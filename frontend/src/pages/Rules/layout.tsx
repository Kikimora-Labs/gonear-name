import styled from 'styled-components'

import {break_down} from 'helpers/media'

export const Container = styled.div`
  margin: 96px var(--margin) 30px 150px;
  display: flex;
  flex-direction: column;

  @media (max-width: ${break_down}) {
    margin: 40px var(--margin__mob) 30px;
  }
`

export const Title = styled.div`
  line-height: 130px;
  height: 130px;
  font-size: 87px;
  font-weight: bold;

  @media (max-width: ${break_down}) {
    font-size: 33px;
    line-height: 49px;
    height: 49px;
  }
`

export const Details = styled.div`
  margin-top: 2px;
  width: 455px;
  font-weight: normal;
  font-size: 14px;
  line-height: 26px;
  color: #8C95A6;

  @media (max-width: ${break_down}) {
    margin-top: 10px;
    width: auto;
    font-size: 13px;
    line-height: 21px;
  }
`

export const Border = styled.div`
  margin-top: 60px;
  max-width: 722px;
  height: 1000px;
  border-radius: 32px;
  border: 1px solid #3F4450;
`
