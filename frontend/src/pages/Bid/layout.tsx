import styled from 'styled-components'

import back_png from 'assets/images/back.png'
import {break_down} from 'helpers/media'

export const Container = styled.div`
  margin: 0 var(--margin) 150px;
  display: grid;
  grid-template-columns: 120px 1fr 440px; 

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