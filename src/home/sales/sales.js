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
      _currentPage: {
        type: Number,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.level = '';
    this.sales = [];
    this.total = 0;
    this.completeSaleSuccess = false;
    this._currentPage = 1;
  }

  /**
   * Dispatches a request to print the ticket for a sale.
   *
   * @param {Object} sale - The sale object to print.
   */
  _printTicket(sale) {
    dispatchCustomEvent(this, `${SalesElement.is}-print-ticket`, sale);
  }

  /**
   * Toggles the display of products for a selected sale row.
   *
   * @param {Event} event - The click event from the sale row.
   * @param {HTMLElement} event.currentTarget - The row target element.
   * @param {string} event.currentTarget.id - The sale identifier.
   */
  _toggleProducts({currentTarget: {id}}) {
    dispatchCustomEvent(this, `${SalesElement.is}-toggle-products`, {id});
  }

  _handlePageChanged({detail: {page}}) {
    this._currentPage = page;
  }

  static get styles() {
    return [styles];
  }

  get _tplSales() {
    return html`
      <section class="sales-list">
        <header class="list-header">
          <h2>Listado de ventas</h2>
        </header>

        ${this.sales[this._currentPage - 1]?.length > 0
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
                  ${this.sales[this._currentPage - 1]?.map(
                    (sale) => html`
                      <tr
                        id="${sale.id}"
                        @click=${this._toggleProducts}
                        class="${this.level === 'admin' ? 'show-products' : ''}"
                      >
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
                                <thead></thead>
                                <tbody>
                                  ${sale.products.map(
                                    (product) =>
                                      html`
                                        <tr class="products">
                                          <td>${product.name}</td>
                                          <td class="quantity">
                                            ${product.quantity}
                                          </td>
                                          <td>
                                            $${Number(product.price).toFixed(2) * product.quantity}
                                          </td>
                                        </tr>
                                      `
                                  )}
                                </tbody>
                              </table>
                            </tr>
                            <br />
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

  get _tplPagination() {
    return html`
      <pagination-element
        .totalPages=${Math.ceil(this.sales.length)}
        @pagination-element-page-changed=${this._handlePageChanged}
      ></pagination-element>
    `;
  }

  /**
   * Renders the sales list template.
   *
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html`${this._tplSales} ${this._tplPagination}`;
  }
}

window.customElements.define('sales-element', SalesElement);
