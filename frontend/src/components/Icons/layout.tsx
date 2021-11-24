import styled from 'styled-components'

import money_png from 'assets/images/money.png'
import money_invert_png from 'assets/images/money_invert.png'
import ok_png from 'assets/images/ok.png'
import {break_down} from 'helpers/media'

export const MoneyIcon = styled.img`
  width: 26px;
  height: 26px;
  object-fit: contain;

  @media (max-width: ${break_down}) {
    width: 20px;
    height: 20px;
  }
`

MoneyIcon.defaultProps = {
  src: money_png
}

export const MoneyInvertIcon = styled.img`
  width: 26px;
  height: 26px;
  object-fit: contain;

  @media (max-width: ${break_down}) {
    width: 20px;
    height: 20px;
  }
`

MoneyInvertIcon.defaultProps = {
  src: money_invert_png
}

export const OkIcon = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;

  @media (max-width: ${break_down}) {
    width: 20px;
    height: 20px;
  }
`

OkIcon.defaultProps = {
  src: ok_png
}

