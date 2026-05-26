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
    background-color: #010b15;
    color: #fff;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  mwc-button.logout {
    --mdc-theme-primary: #9c3535;
    --mdc-theme-on-primary: #fff;
  }

  mwc-button#confirm-button {
    --mdc-theme-primary: #256aff;
    --mdc-theme-on-primary: #fff;
  }

  mwc-button#cancel-button {
    --mdc-theme-primary: #af1313;
    --mdc-theme-on-primary: #fff;
  }
/* 
  .accept-modal-button-warning:hover {
    background-color: #af1313;
  }

  .cancel-modal-button-warning:hover {
    background-color: #256aff;
  } */

  .success:hover {
    background-color: #2ecc71;
  }

  .error:hover {
    background-color: #af1313;
  }

  .warning:hover {
    background-color: #ffbc00;
  }

  .info:hover {
    background-color: #256aff;
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
    background-color: #2ecc71;
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
    background-color: #af1313;
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
    background-color: #256aff;
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
