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

  .generator {
    align-items: center;
    text-align: center;
    padding: 1rem;
  }

  .change-password {
    text-align: center;
    padding: 1rem;
  }

  .change-password mwc-button {
    --mdc-theme-primary: #46131c;
    --mdc-theme-on-primary: #fff;
  }

  .change-password mwc-button:hover {
    --mdc-theme-primary: #6b2632;
  }
  
  .backup {
    text-align: center;
    padding: 1rem;
  }
  
  .backup mwc-button {
    --mdc-theme-primary: #14593e;
    --mdc-theme-on-primary: #fff;
  }

  .backup mwc-button:hover {
    --mdc-theme-primary: #287a59;
  }

  .backup mwc-icon {
    color: #fff;
  }

  .confirm-sale-cash-input mwc-textfield {
    margin: 0.5rem;
    width: 75%;
  }

  .pwd-message-error {
    color: #46131c;
    font-size: 10; 
  }

  mwc-textfield {
    width: 60%;
    --mdc-theme-primary: #51204d;
  }
`;
