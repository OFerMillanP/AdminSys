import {css} from 'lit';

export default css`
  :host {
    display: block;
    box-sizing: border-box;
    font-family: 'Lato', sans-serif;
    font-size: 1rem;
    padding: 1rem;
    color: #222;
  }

  .sales-list {
    width: 100%;
    margin: 0 auto;
  }

  .list-header {
    margin-bottom: 1rem;
  }

  .list-header h2 {
    margin: 0;
    font-size: 1.6rem;
    color: #192639;
  }

  .cash-register-section mwc-button {
    --mdc-theme-primary: #51204d;
    --mdc-theme-on-primary: #fff;
  }

  .cash-register-section mwc-button:hover {
    --mdc-theme-primary: #71386d;
  }

  mwc-icon {
    color: #51204d;
  }

  .total {
    text-align: center
  }

  .payment-method {
    text-align: center
  }

  .actions {
    text-align: center
  }

  .quantity {
    text-align: center
  }

  .show-products {
    cursor: pointer;
    background: #eee;
  }

  .empty-message {
    padding: 1rem;
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    color: #444;
  }

  .input-container {
    display: flex;
    align-items: center;
    padding: 0rem 0 1rem 0rem;
  }

  .report-section {
    padding-top: 2rem;
  }

  .calendar-container {
    position: relative;
    padding: 0.5rem;
  }

  .cash-register-section{
    padding-top: 2rem;
  }

  mwc-tab-bar {
    --mdc-theme-primary: #51204d;
    --mdc-text-transform: none;
    --mdc-tab-stacked-height: 100px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.75rem;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
  }

  thead th {
    background-color: #2d2828;
    color: #fff;
    padding: 0.9rem 0.75rem;
    text-align: center;
    font-size: 0.95rem;
  }

  tbody td {
    border: 1px solid #d4d4d4;
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  tbody tr:nth-child(even) {
    background-color: #eee;
  }

  tbody tr:nth-child(odd) {
    background-color: #dfdfdf;
  }

  tbody tr.products :nth-child(even) {
    background-color: #fdfdfd;
  }

  tbody tr.products :nth-child(odd) {
    background-color: #fafafa;
  }

  tbody tr:hover {
    background-color: #f5f5f5;
  }

  td:last-child,
  th:last-child {
    text-align: center;
  }

  @media (max-width: 760px) {
    thead {
      display: none;
    }

    table,
    tbody,
    tr,
    td {
      display: block;
      width: 100%;
    }

    tr {
      margin-bottom: 1rem;
      border-bottom: 1px solid #ddd;
    }

    td {
      text-align: center;
      padding-left: 50%;
      position: relative;
    }

    td::before {
      content: attr(data-label);
      position: absolute;
      left: 0;
      width: 45%;
      padding-left: 0.75rem;
      font-weight: bold;
      text-align: center;
      color: #555;
    }
  }
`;
