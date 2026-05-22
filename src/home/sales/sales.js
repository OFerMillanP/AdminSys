import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import styles from './sales.css.js';
import {dispatchCustomEvent} from '../../../utils/utils.js';

/**
 * Sales page element.
 *
 * Renders a table of sales with id, product, quantity, and total price.
 */
export class SalesElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'sales-element';
  }

  static get properties() {
    return {
      sales: {
        type: Array,
      },
      total: {
        type: Number,
      },
      completeSaleSuccess: {
        type: Boolean,
        attribute: 'complete-sale-success',
      },
    };
  }

  constructor() {
    super();
    this.sales = [];
    this.total = 0;
    this.completeSaleSuccess = false;
  }

  _printTicket(sale) {
    dispatchCustomEvent(this, `${SalesElement.is}-print-ticket`, sale);
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html`
      <section class="sales-list">
        <header class="list-header">
          <h2>Listado de ventas</h2>
        </header>

        ${this.sales?.length > 0
          ? html`
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Total</th>
                    <th class="header-table">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.sales.map(
                    (sale) => html`
                      <tr>
                        <td>${sale.id}</td>
                        <td>${sale.date}</td>
                        <td class="payment-method">
                          ${sale.paymentMethod == 'cash'
                            ? 'Efectivo'
                            : 'Tarjeta'}
                        </td>
                        <td class="total">$${Number(sale.total).toFixed(2)}</td>
                        <td class="actions">
                          <mwc-button @click=${() => this._printTicket(sale)}>
                            <mwc-icon slot="icon">print</mwc-icon>
                          </mwc-button>
                        </td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            `
          : html` <p class="empty-message">No hay ventas registradas.</p> `}
      </section>
    `;
  }
}

window.customElements.define('sales-element', SalesElement);
