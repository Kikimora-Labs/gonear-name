import {createGlobalStyle} from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    --root-background: #181B21;
    --header-height: 90px;
    --header-height__mob: 56px;
    --margin: 30px;
    --margin__mob: 25px;
  }

  body {
    background: var(--root-background);
    font-family: 'Poppins', sans-serif;
    color: #ffffff;
  }
`
