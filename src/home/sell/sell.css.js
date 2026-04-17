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
`;
