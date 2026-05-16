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

  mwc-textfield {
    width: 100%;
    --mdc-theme-primary: #000;
    --mdc-text-field-ink-color: #000;
    --mdc-text-field-idle-line-color: #555;
  }

  .input-container {
    display: flex;
    align-items: center;
    margin: 1rem;
    width: 40%;
  }

  .data-price {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .quantity-icon-remove,
  .quantity-icon-add {
    cursor: pointer;
    user-select: none;
    padding: 0 0.5rem;
    align-content: center;
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
    color: #513737;
    text-shadow: 1px 1px 2px #00000055;
    background-color: transparent;
    cursor: pointer;
  }

  .sell-data-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sale {
    margin: 1rem;
    display: flex;
  }

  .total {
    padding: 0rem 1rem;
    font-size: 1.5rem;
    font-weight: bold;
    justify-content: center;
    display: flex;
    align-items: center;
  }

  .button-complete-sale {
    padding: 0rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  mwc-button#complete-sale {
    --mdc-theme-primary: #213aa8;
    --mdc-theme-on-primary: #fff;
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
