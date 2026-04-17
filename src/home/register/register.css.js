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

  .input-container.textarea {
    align-items: normal;
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

  .input-container input[type='number'] {
    text-align: center;
    width: 4rem;
  }

  .input-container textarea {
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    box-sizing: border-box; /* Padding respete el input */
  }

  .input-container label {
    padding: 0.5rem;
    display: flex;
    font-weight: bold;
  }

  .info-label {
    padding: 0.5rem 1rem;
    color: #8e9600;
  }

  .error-label {
    color: #c00000a0;
    font-size: 0.9rem;
  }

  .register-button {
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
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

  .button-container button:hover {
    background-color: #1a3757;
  }

  .register-header {
    margin: 2rem 1rem;
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

  .list-products-header {
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: space-between; /* Separa los hijos a los extremos */
  }

  .link {
    color: #03105c;
    transition: 0.5s;
    padding: 1rem;
  }

  .link:hover {
    color: #81adda;
  }

  .list-products-navigation {
    margin: 1rem;
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
    padding: 1rem;
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
    background-color: #f5f5f5; /* Efecto hover */
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
