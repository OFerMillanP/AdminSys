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

  mwc-textfield#barcode {
    width: 100%;
  }

  mwc-textfield {
    --mdc-theme-primary: #000;
    --mdc-text-field-ink-color: #000;
    --mdc-text-field-idle-line-color: #555;
  }

  .confirm-sale-data-value {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: #008b8b;
    font-size: x-large;
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

  /* ticket css*/

  .ticket-container {
    max-width: 400px;
    background-color: white;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .ticket-header {
    text-align: center;
    border-bottom: 2px solid #333;
    padding-bottom: 15px;
    margin-bottom: 15px;
  }

  .store-name {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  .store-info {
    font-size: 11px;
    color: #666;
    margin-top: 5px;
    line-height: 1.4;
  }

  .ticket-number {
    font-size: 12px;
    color: #999;
    margin-top: 10px;
    border-top: 1px solid #ddd;
    padding-top: 10px;
  }

  .ticket-items {
    margin-bottom: 15px;
  }

  .item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 12px;
    border-bottom: 1px dotted #ccc;
  }

  .item-name {
    flex: 1;
    color: #333;
  }

  .item-qty {
    width: 40px;
    text-align: center;
    color: #666;
  }

  .item-price {
    width: 60px;
    text-align: right;
    color: #333;
    font-weight: bold;
  }

  .item-desc {
    font-size: 10px;
    color: #999;
    padding-left: 0;
    margin-top: 2px;
  }

  .totals {
    margin: 15px 0;
    padding: 10px 0;
    border-top: 2px solid #333;
    border-bottom: 2px solid #333;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 5px;
  }

  .total-row.subtotal {
    color: #666;
  }

  .total-row.tax {
    color: #666;
  }

  .total-row.total {
    font-weight: bold;
    font-size: 14px;
    color: #333;
    margin-top: 5px;
  }

  .payment-method {
    text-align: center;
    font-size: 11px;
    color: #666;
    margin: 10px 0;
    padding: 8px 0;
    border-top: 1px dotted #ccc;
  }

  .ticket-footer {
    text-align: center;
    font-size: 10px;
    color: #999;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px dotted #ccc;
  }

  .footer-message {
    line-height: 1.6;
  }

  .barcode {
    text-align: center;
    margin: 10px 0;
    font-size: 24px;
    letter-spacing: 2px;
    color: #333;
    font-family: 'Code 128', monospace;
  }

  @media print {
    body {
      background-color: white;
      padding: 0;
    }

    .ticket-container {
      box-shadow: none;
      border: none;
      max-width: 500%;
    }
  }
`;
