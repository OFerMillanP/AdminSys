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

  .button-container {
    padding: 0.5rem;
  }

  button {
    background-color: #192639;
    color: #fff;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #2c4563;
  }

  mwc-button.logout {
    --mdc-theme-primary: #46131c;
    --mdc-theme-on-primary: #fff;
  }

  mwc-button.logout:hover {
    --mdc-theme-primary: #6b2632;
  }

  mwc-button#confirm-button {
    --mdc-theme-primary: #192639;
    --mdc-theme-on-primary: #fff;
  }

  mwc-button#confirm-button:hover {
    --mdc-theme-primary: #2c4563;
  }

  mwc-button#cancel-button {
    --mdc-theme-primary: #46131c;
    --mdc-theme-on-primary: #fff;
  }

  mwc-button#cancel-button:hover {
    --mdc-theme-primary: #6b2632;
  }
/* 
  .accept-modal-button-warning:hover {
    background-color: #6b2632;
  }

  .cancel-modal-button-warning:hover {
    background-color: #2c4563;
  } */

  .success:hover {
    background-color: #287a59;
  }

  .error:hover {
    background-color: #6b2632;
  }

  .warning:hover {
    background-color: #ffbc00;
  }

  .info:hover {
    background-color: #2c4563;
  }

  dialog {
    border: none;
    border-radius: 0.75rem;
    background: transparent;
  }

  /* Contenedor del Modal - Oculto por defecto */
  .modal-container {
    display: none; /* Cambiar a flex para mostrar */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    z-index: 1000;
    transition: 0.5s;
  }

  /* Mostrar modal cuando la clase está activa */
  .modal-container.show {
    display: flex;
    transition: 0.5s;
  }

  /* Caja del modal */
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.3s;
  }

  /* Ícono de éxito */
  .success-icon {
    width: 60px;
    height: 60px;
    background-color: #14593e;
    color: white;
    border-radius: 50%;
    font-size: 40px;
    line-height: 60px;
    margin: 0 auto 15px;
  }

  /* Ícono de error */
  .error-icon {
    width: 60px;
    height: 60px;
    background-color: #46131c;
    color: white;
    border-radius: 50%;
    font-size: 40px;
    line-height: 60px;
    margin: 0 auto 15px;
  }

  /* Ícono de advertencia */
  .warning-icon {
    color: #ffbc00;
    border-radius: 50%;
    font-size: 80px;
    line-height: 60px;
    margin: 0 auto 15px;
  }

  /* Ícono de información */
  .info-icon {
    width: 60px;
    height: 60px;
    background-color: #192639;
    color: white;
    border-radius: 50%;
    font-size: 40px;
    line-height: 60px;
    margin: 0 auto 15px;
  }

  /* Animación básica */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
      transition: 0.5s;
    }
    to {
      opacity: 1;
      transform: translateY(0);
      transition: 0.5s;
    }
  }
`;
