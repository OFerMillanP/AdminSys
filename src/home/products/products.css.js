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

  .input-container {
    display: flex;
    align-items: center;
    margin: 1rem;
  }

  .input-container input {
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    box-sizing: border-box;
  }

  .input-container input:focus {
    border-color: #007bff;
    outline: none;
  }

  .input-container label {
    padding: 0.5rem;
    display: flex;
    font-weight: bold;
  }

  .button-container {
    padding: 0.5rem;
  }

  .button-container button {
    background-color: #010b15;
    color: #fff;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  /* .button-container button:hover {
    background-color: #982929;
  } */

  .accept-modal-button.delete:hover {
    background-color: #982929;
  }

  .close-modal-button:hover {
    background-color: #5f5f5f;
  }

  .list-header {
    margin: 1rem 6rem 1rem 1rem;
  }
  .list-products {
    margin: 2rem 1rem;
  }

  .list-header:hover {
    color: #a09999;
  }

  .data-number {
    text-align: center;
  }

  .header-table {
    text-align: center;
  }

  .product-tools {
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: space-around; /* Separa los hijos a los extremos */
  }

  .edit-product {
    border: none;
    border-radius: 0.5rem;
    font-size: x-large;
    margin: 0.25rem 0.5rem;
    color: #cc9600;
    text-shadow: 2px 2px 4px #00000099;
  }

  .delete-product {
    border: none;
    border-radius: 0.5rem;
    font-size: x-large;
    margin: 0.25rem 0.5rem;
    color: #af1313;
    text-shadow: 2px 2px 4px #00000055;
  }

  .edit-product:hover {
    text-shadow: 2px 2px 4px #000000dd;
    transform: translateY(-4px);
    cursor: pointer;
  }

  .delete-product:hover {
    text-shadow: 2px 2px 4px #000000aa;
    transform: translateY(-4px);
    cursor: pointer;
  }

  .list-products-navigation {
    margin: 1rem 0rem;
  }

  /* Ícono de éxito */
  .warning-icon {
    color: #ffbc00;
    border-radius: 50%;
    font-size: 80px;
    line-height: 60px;
    margin: 0 auto 15px;
  }

  table {
    width: 100%;
    border-collapse: collapse; /* Bordes unidos */
    margin: 20px 0;
    /*table-layout: fixed;  Columnas de igual ancho */
  }

  th,
  td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }

  th {
    background-color: #2d2828;
    font-weight: bold;
    color: #fff;
  }

  tr {
    transition: 0.5s;
    background-color: #ffffff00;
  }

  tr:hover {
    transition: 0.3s;
    background-color: #f5f5f5;
  }

  mwc-textfield {
    width: 35%;
    --mdc-theme-primary: #000;
    --mdc-text-field-ink-color: #000;
    --mdc-text-field-idle-line-color: #555;
  }

  mwc-button {
    --mdc-theme-primary: #3269c7;
    --mdc-theme-on-primary: #fff;
  }

  mwc-textarea {
    --mdc-theme-primary: #000;
  }

  mwc-button {
    --mdc-theme-primary: #000000;
    --mdc-theme-on-primary: #fff;
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

  .register-header {
    margin: 2rem 1rem;
  }

  .info-label {
    padding: 0.5rem 1rem;
    color: #8e9600;
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
