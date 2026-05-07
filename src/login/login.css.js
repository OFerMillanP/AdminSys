import {css} from 'lit';

export default css`
  :host {
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .input-error {
    border: 2px solid #ff000045;
    border-radius: 0.5rem;
    outline: none;
  }

  .input-container {
    margin: 2rem 1rem;
  }

  .error-label {
    color: #c00000a0;
  }

  .label-error-containter {
    padding: 1rem 0rem;
    font-size: smaller;
  }

  mwc-textfield {
    --mdc-theme-primary: #000;
    --mdc-text-field-ink-color: #000;
    --mdc-text-field-idle-line-color: #555;
  }

  mwc-button {
    --mdc-theme-primary: #3269c7;
    --mdc-theme-on-primary: #fff;
  }
`;
