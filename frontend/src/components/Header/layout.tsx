import styled from 'styled-components'
import {Link} from 'react-router-dom'

import brand_png from 'assets/images/brand.png'
import logout_png from 'assets/images/logout.png'
import menu_png from 'assets/images/menu.png'
import close_png from 'assets/images/close.png'
import {break_down} from 'helpers/media'

export const Container = styled.div`
  height: var(--header-height);
  margin: 0 var(--margin);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 1fr 1px;
  align-items: center;

  @media (max-width: ${break_down}) {
    height: var(--header-height__mob);
    margin: 0;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr 1px;
  }
`

const openMenuStyle = `
  margin-left: 18px;
  width: 29px;
  height: 28px;
  background-image: url(${close_png});
`
const closeMenuStyle = `
  margin-left: 15px;
  width: 43px;
  height: 38px;
  background-image: url(${menu_png});
`


export const MenuButton = styled.div<{open: boolean}>`
  display: none;

  @media (max-width: ${break_down}) {
    ${({open}) => open ? openMenuStyle : closeMenuStyle}
    display: block;
    grid-column: 1;
    grid-row: 1 / 3;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    cursor: pointer;
  }
`

export const Brand = styled.img`
  grid-column: 1;
  grid-row: 1 / 3;
  z-index: 2;
  width: 128px;
  height: 32px;
  object-fit: contain;

  @media (max-width: ${break_down}) {
    width: 100px;
    height: 25px;
    grid-column: 1 / 3;
    justify-self: center;
  }
`

Brand.defaultProps = {
  src: brand_png
}

export const Menu = styled.div<{open: boolean}>`
  grid-column: 2;
  grid-row: 1 / 3;
  z-index: 2;
  display: flex;

  @media (max-width: ${break_down}) {
    ${({open}) => open ? 'display: flex;' : 'display: none;'}
    position: fixed;
    top: var(--header-height__mob);
    right: 0;
    bottom: 0;
    left: 0;
    flex-direction: column;
    align-items: stretch;
    background-color: var(--root-background);
  }
`

const menuItemActive = `
  border-bottom: 2px solid #FF9494;
  color: #FF9494;
`

const menuItemActiveMob = `
  border: none;
  color: #FFFFFF;
`

export const MenuItem = styled(Link)<{$active?: boolean}>`
  height: var(--header-height);
  line-height: var(--header-height);
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  ${({$active}) => $active ? menuItemActive : ''}

  &:not(:first-child) {
    margin-left: 40px;
  }

  @media (max-width: ${break_down}) {
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-weight: bold;
    font-size: 45px;
    color: #8C95A6;
    ${({$active}) => $active ? menuItemActiveMob : ''}

    &:first-child {
      margin-top: 96px;
    }

    &:not(:first-child) {
      margin-top: 60px;
      margin-left: 0;
    }
  }
`;

export const Auth = styled.div<{open: boolean}>`
  grid-column: 3;
  grid-row: 1 / 3;
  z-index: 2;
  justify-self: right;
  display: flex;
  align-items: center;

  @media (max-width: ${break_down}) {
    position: fixed;
    bottom: 35px;
    width: 100%;
    flex-direction: column;
    ${({open}) => open ? 'display: flex;' : 'display: none;'}
  }
`

export const UserName = styled.div`
  font-weight: 500;
  font-size: 14px;
  margin-right: 12px;
  cursor: pointer;

  @media (max-width: ${break_down}) {
    margin-right: 0;
  }
`

export const LogOut = styled.div`
  cursor: pointer;
  width: 34px;
  height: 34px;
  border-radius: 27px;
  background: #2C3139;
  background-image: url(${logout_png});
  background-position: center;
  background-repeat: no-repeat;
  background-size: 14px 10px;

  @media (max-width: ${break_down}) {
    margin-top: 10px;
  }
`

export const Line = styled.div`
  height: 1px;
  background-color: #535D71;
  z-index: 1;
  grid-column: 1 / 4;
  grid-row: 2;
`
