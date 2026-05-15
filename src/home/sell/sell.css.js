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

  mwc-textfield {
    width: 35%;
    --mdc-theme-primary: #000;
    --mdc-text-field-ink-color: #000;
    --mdc-text-field-idle-line-color: #555;
  }

  .input-container {
    display: flex;
    align-items: center;
    margin: 1rem;
  }

  .data-quantity {
    display: flex;
    justify-content: center;
  }

  .data-price {
    display: flex;
    justify-content: center;
  }

  .quantity-icon-remove,
  .quantity-icon-add {
    cursor: pointer;
    user-select: none;
    padding: 0 0.5rem;
  }

  .quantity-icon-remove:hover,
  .quantity-icon-add:hover {
    color: #555;
  }

  .product-tools {
    text-align: center;
  }

  .delete-product {
    border: none;
    border-radius: 0.5rem;
    font-size: x-large;
    color: #af1313;
    text-shadow: 1px 1px 2px #00000055;
    background-color: transparent;
    cursor: pointer;
  }
  
  table {
    width: 100%;
    border-collapse: collapse; /* Bordes unidos */
    margin: 20px 0;
    /*table-layout: fixed;  Columnas de igual ancho */
  }

  .header-table {
    text-align: center;
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
`;
