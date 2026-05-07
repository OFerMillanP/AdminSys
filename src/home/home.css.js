import { css } from 'lit';

export default css`
  :host {
    display: block;
    box-sizing: border-box;
    font-family: 'Lato', sans-serif;
    font-size: 1rem;
  }

  :host([hidden]),
  [hidden] {
    display: none !important;
  }

  .logout-button {
    background-color: #333;
    color: #fff;
    border: none;
    font-size: 1rem;
    border-radius: 0.5rem;
    font-weight: bold;
    transition: 0.5s;
  }

  .logout-button:hover {
    background-color: #333;
    color: #eb4545;
    border: none;
    font-weight: bold;
  }

  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: #333;
    color: white;
  }

  .nav-links {
    display: flex;
    list-style: none;
    justify-content: center;
    text-align: center;
    align-items: center;
  }

  .nav-links li {
    margin: 0.5rem 1rem;
  }

  .nav-links div {
    text-decoration: none;
    color: white;
    font-weight: bold;
    transition: 0.5s;
  }

  .nav-links div:hover {
    color: #000;
  }

  .name-header {
    font-weight: bold;
    font-size: 20px
  }

  mwc-button.logout {
    --mdc-theme-primary: #9c3535;
    --mdc-theme-on-primary: #fff;
  }

  mwc-top-app-bar {
    --mdc-theme-primary: #333;
    --mdc-theme-on-primary: #fff;
  }

  mwc-tab-bar {
    --mdc-theme-primary: #ddd;
    --mdc-text-transform: none;
    --mdc-tab-color-default: white;
    --mdc-tab-text-label-color-default: white;
    --mdc-tab-stacked-height: 100px;
  }
`;
