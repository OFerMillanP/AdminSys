import {css} from 'lit';

export default css`
  :host {
    box-sizing: border-box;
    font-family: 'Lato', sans-serif;
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

  .input-container input {
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    box-sizing: border-box;
  }

  .login-button {
    background-color: #000;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 0.5rem;
    transition: 0.5s;
  }

  .login-button:hover {
    background-color: #fff;
    color: #000;
    border: 1px solid #000;
  }

  .button-container {
    margin: 1rem;
  }

  .button-container button{
    cursor: pointer;
  }

  .error-label {
    color: #c00000a0;
  }
`;
