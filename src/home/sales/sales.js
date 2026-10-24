import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {dispatchCustomEvent, t} from '../../../utils/utils.js';
import {ref, createRef} from 'lit/directives/ref.js';

import {ModalElement} from '../../organisms/modal/modal.js';

import styles from './sales.css.js';

/**
 * Sales page element.
 *
 * Renders a table of sales with id, product, quantity, and total price.
 */
export class SalesElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'sales-element';
  }
  
  static get scopedElements() {
    return {
      'modal-element': ModalElement
    };
  }

  static get properties() {
    return {
      closedCashRegisters:{
        type: Array
      },
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
      _activeIndex: {
        type: Number,
        state: true,
      },
      _confirmClosedCashRegisterModalRef: {
        type: Object,
        state: true
      },
      _currentPage: {
        type: Number,
        state: true,
      },
      _endDate: {
        type: String,
        state: true,
      },
      _isShowCashRegister: {
        type: Boolean,
        state: true,
      },
      _isShowSales: {
        type: Boolean,
        state: true,
      },
      _isShowReport: {
        type: Boolean,
        state: true,
      },
      _startDate: {
        type: String,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.closedCashRegisters = [];
    this.completeSaleSuccess = false;
    this.level = '';
    this.sales = [];
    this.total = 0;
    this._activeIndex = 0;
    this._confirmClosedCashRegisterModalRef = createRef();
    this._currentPage = 1;
    this._endDate = '';
    this._isShowCashRegister = false;
    this._isShowReport = false;
    this._isShowSales = true;
    this._startDate = '';
    this._maxDate = new Date().toISOString().split('T')[0];
  }

  firstUpdated() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diferencia = diaSemana === 0 ? 6 : diaSemana - 1;
    hoy.setDate(hoy.getDate() - diferencia);
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaLunes = `${anio}-${mes}-${dia}`;
    this._startDate = fechaLunes;
    this._endDate = new Date().toISOString().split('T')[0];
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

  /**
   * Shows the requested home page section based on the clicked tab.
   *
   * @param {Event} event - The click event from the tab.
   * @param {HTMLElement} event.target - The clicked tab.
   */
  _showSection({target: {id}}) {
    const sections = {
      sales: () => {
        this._resetSections();
        this._isShowSales = true;
        this._activeIndex = 0;
      },
      'cash-register': () => {
        this._resetSections();
        this._isShowCashRegister = true;
        this._activeIndex = 1;
      },
      reports: () => {
        this._resetSections();
        this._isShowReport = true;
        this._activeIndex = 2;
      },
    };
    sections[id]?.call();
  }

  /**
   * Hides all home page sections.
   */
  _resetSections() {
    this._isShowSales = false;
    this._isShowReport = false;
    this._isShowCashRegister = false;
  }

  _abrirSelector({target}) {
    const input = target.shadowRoot.querySelector('input');
    if (input) {
      input.showPicker();
    }
  }

  _generateReport() {
   if (this._startDate.length && this._endDate.length) {
    const startDateParts = this._startDate.split('-');
    const endDateParts = this._endDate.split('-');
    dispatchCustomEvent(this, `${SalesElement.is}-generate-report`, {
      startDate: {
        year: startDateParts[0],
        month: startDateParts[1],
        day: startDateParts[2],
      },
      endDate: {
        year: endDateParts[0],
        month: endDateParts[1],
        day: endDateParts[2],
      },
    });
   }
  }

  _closeCashRegister() {
    this._confirmClosedCashRegisterModalRef.value.openModal();
  }

  get _tplSales() {
    return html`
      <section class="sales-list">
        <h2>${t('sales-element-sales-list-title')}</h2>

        ${this.sales[this._currentPage - 1]?.length > 0
          ? html`
              <table>
                <thead>
                  <tr>
                    <th>${t('sales-element-sales-column-date')}</th>
                    <th>${t('sales-element-sales-column-payment')}</th>
                    <th>${t('sales-element-sales-column-total')}</th>
                    <th class="header-table">${t('sales-element-sales-column-actions')}</th>
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
                          ${sale.paymentMethod == 'cash' ? t('sales-element-payment-cash') : t('sales-element-payment-card')}
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
                                            $${Number(product.price).toFixed(
                                              2
                                            ) * product.quantity}
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
          : html` <p class="empty-message">${t('sales-element-sales-empty')}</p> `}
      </section>
    `;
  }

  get _tplSalesSection() {
    return html`
      <mwc-tab-bar activeIndex="${this._activeIndex}">
        <mwc-tab
          label="${t('sales-element-nav-sales')}"
          id="sales"
          @click="${this._showSection}"
        ></mwc-tab>
        <mwc-tab
          label="${t('sales-element-sales-tab-cash-register')}"
          id="cash-register"
          @click="${this._showSection}"
        ></mwc-tab>
        ${this.level === 'admin' ? 
          html`
            <mwc-tab
              label="${t('sales-element-sales-tab-reports')}"
              id="reports"
              @click="${this._showSection}"
            ></mwc-tab>
          ` : nothing}
      </mwc-tab-bar>
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

  get _tplReport() {
    return html`
      <section class="report-section">
        <h2>${t('sales-element-report-title')}</h2>
        <div class="input-container">
          <div class="calendar-container">
            <mwc-textfield
              raised
              label="${t('sales-element-report-start-date')}"
              id="calendar"
              type="date"
              iconTrailing="event"
              max="${this._maxDate}"
              value="${this._startDate}"
              @click="${this._abrirSelector}"
              @change="${(e) => (this._startDate = e.target.value)}"
            ></mwc-textfield>
          </div>
          <div class="calendar-container">
            <mwc-textfield
              raised
              label="${t('sales-element-report-end-date')}"
              id="calendar"
              type="date"
              iconTrailing="event"
              max="${this._maxDate}"
              value="${this._endDate}"
              @click="${this._abrirSelector}"
              @change="${(e) => (this._endDate = e.target.value)}"
            ></mwc-textfield>
          </div>
        </div>
        <mwc-button
          raised
          label="${t('sales-element-report-generate')}"
          @click="${this._generateReport}"
        ></mwc-button>
      </section>
    `;
  }

  get _tplCashRegisterClosing () {
    return html`
      <section class="cash-register-section">
        <h2>${t('sales-element-cash-register-title')}</h2>
        <section>
          <table>
            <thead>
              <tr>
                <th>${t('sales-element-sales-column-date')}</th>
                <th>${t('sales-element-cash-register-total-cash')}</th>
                <th>${t('sales-element-cash-register-total-card')}</th>
                <th>${t('sales-element-sales-column-total')}</th>
              </tr>
            </thead>
            <tbody>
              ${this.closedCashRegisters.map(
                (ccr) => html`
                  <tr>
                    <td>${ccr.date}</td>
                    <td class="total">$${ccr.totalCash}</td>
                    <td class="total">$${ccr.totalCard}</td>
                    <td class="total">$${ccr.total}</td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </section>
        <br>
        <mwc-button
          raised
          label="${t('sales-element-cash-register-close')}"
          @click="${this._closeCashRegister}"
        ></mwc-button>
      </section>
    `;
  }
  // @click="${() => dispatchCustomEvent(this, `${SalesElement.is}-close-cash-register`)}"

  /**
     * Returns the success modal template.
     *
     * @returns {import('lit').TemplateResult}
     */
    get _tplConfirmClosedCashRegisterModal() {
      return html`
        <modal-element
          ${ref(this._confirmClosedCashRegisterModalRef)}
          .data=${{
            titleText: t('sales-element-cash-register-confirm-title'),
            bodyText: t('sales-element-cash-register-confirm-body'),
            cancelButtonText: t('sales-element-button-cancel'),
            code: 'confirm-closed-register-cash',
            confirmButtonText: t('sales-element-button-confirm'),
            type: 'warning',
            isEnableConfirmButton: true,
          }}
          @modal-element-confirm-action-confirm-closed-register-cash=${() =>
            dispatchCustomEvent(this, `${SalesElement.is}-close-cash-register`)}
        ></modal-element>
      `;
    }

  static get styles() {
    return [styles];
  }

  /**
   * Renders the sales list template.
   *
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html`
      ${this._tplSalesSection}
      ${this._tplConfirmClosedCashRegisterModal}
      ${this._isShowSales ? html`${this._tplSales} ${this._tplPagination}` : nothing}
      ${this._isShowReport ? html`${this._tplReport}` : nothing}
      ${this._isShowCashRegister ? html`${this._tplCashRegisterClosing}` : nothing}
    `;
  }
}

window.customElements.define('sales-element', SalesElement);
