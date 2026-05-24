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
      completeSaleSuccess: {
        type: Boolean,
        attribute: 'complete-sale-success',
      },
      level: {
        type: String,
      },
      sales: {
        type: Array,
      },
      total: {
        type: Number,
      },
    };
  }

  constructor() {
    super();
    this.level = '';
    this.sales = [];
    this.total = 0;
    this.completeSaleSuccess = false;
  }

  _printTicket(sale) {
    dispatchCustomEvent(this, `${SalesElement.is}-print-ticket`, sale);
  }

  _toggleProducts({currentTarget: {id}}) {
    dispatchCustomEvent(this, `${SalesElement.is}-toggle-products`, {id});
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
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Total</th>
                    <th class="header-table">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.sales.map(
                    (sale) => html`
                      <tr id="${sale.id}" @click=${this._toggleProducts} class="${this.level === 'admin' ? 'show-products' : ''}">
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
                      ${this.level === 'admin' && sale.showProducts
                        ? html`
                            <tr class="products-row">
                              <table class="products-row">
                                <thead>
                                </thead>
                                <tbody>
                                  ${sale.products.map(
                                    (product) =>
                                      html`
                                        <tr class="products">
                                          <td>${product.name}</td>
                                          <td class="quantity">${product.quantity}</td>
                                          <td>
                                            $${Number(product.price).toFixed(2)}
                                          </td>
                                        </tr>
                                      `
                                  )}
                                </tbody>
                              </table>
                            </tr>
                            <br>
                          `
                        : nothing}
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
