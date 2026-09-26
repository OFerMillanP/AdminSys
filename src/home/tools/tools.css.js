import {css} from 'lit';

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

  .tools-content {
    text-align: center;
    padding: 2rem 2rem 0rem 2rem;
    margin: 1rem 1rem 0rem 1rem;
    align-items: center;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .canvas-barcode {
    align-items: center;
    text-align: center;
    margin: 0rem 4rem 1rem 4rem;
    padding: 0rem 4rem 0rem 4rem;
  }

  .canvas-barcode img {
    width: 40%;
  }

  .generator{
    align-items: center;
    text-align: center;
    padding: 1rem;
  }

  mwc-textfield {
    width: 60%;
  }
`;
