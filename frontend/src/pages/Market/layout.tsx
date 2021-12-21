import styled from 'styled-components'
import {break_down} from 'helpers/media'

export const Container = styled.div`
  margin: 0 var(--margin) 150px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: ${break_down}) {
    margin: 0 var(--margin__mob) 30px;
  }
`

export const Title = styled.div`
  height: 130px;
  line-height: 130px;
  font-size: 86px;
  font-weight: bold;
  margin-top: 96px;

  @media (max-width: ${break_down}) {
    height: 40px;
    line-height: 40px;
    margin-top: 40px;
    font-size: 33px;
  }
`


export const TableTitle = styled.div`
  margin-top: 50px;
  font-weight: 600;
  font-size: 24px;
  height: 36px;
  line-height: 36px;
  color: #8C95A6;

  @media (max-width: ${break_down}) {
    margin-top: 30px;
    font-size: 15px;
  }
`

export const ClaimTitle = styled(TableTitle)``

export const ActiveTitle = styled(TableTitle)`
  margin-top: 80px;

  @media (max-width: ${break_down}) {
    margin-top: 40px;
  }
`
