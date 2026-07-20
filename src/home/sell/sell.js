import {LitElement, html, nothing} from 'lit';
import {repeat} from 'lit/directives/repeat.js';
import {ref, createRef} from 'lit/directives/ref.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {
  dispatchCustomEvent,
  ticketTplToPrint,
  getCurrentDate,
} from '../../../utils/utils.js';

import styles from './sell.css.js';
import {map} from 'lit/directives/map.js';
import {state} from 'lit/decorators.js';

/**
 * Sales page element.
 *
 * Handles barcode entry, product quantity updates, and sale completion events.
 */
export class SellElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'sell-element';
  }

  static get scopedElements() {
    return {};
  }

  static get properties() {
    return {
      completeSaleSuccess: {
        type: Boolean,
        attribute: 'complete-sale-success',
      },
      /**
       * Barcode entered by the user to add a product to the sale.
       */
      barcode: {
        type: String,
        attribute: 'barcode',
      },
      /**
       * Products currently added to the sale list.
       */
      productsToSell: {
        type: Array,
      },
      /**
       * Total cost for the products currently in the sale.
       */
      total: {
        type: Number,
      },
      /**
       * Change to give to the customer after completing the sale.
       */
      _changeToGive: {
        type: Number,
        state: true,
      },
      /**
       * Reference to the success modal for confirm to completing a sale
       * @type {Object}
       * @default createRef()
       */
      _confirmCompleteSaleModalRef: {
        type: Object,
        state: true,
      },
      /**
       * Flag to enable the confirm button in the complete sale confirmation modal.
       * @type {Boolean}
       * @default false
       */
      _enableCompleteSale: {
        type: Boolean,
        state: true,
      },
      /**
       * Flag to show the cash input field when the user selects cash as the payment method.
       * @type {Boolean}
       * @default false
       */
      _showInputForCash: {
        type: Boolean,
        state: true,
      },
      /**
       * Flag to show the ticket after completing the sale.
       * @type {Boolean}
       * @default false
       */
      _showTicket: {
        type: Boolean,
        state: true,
      },
      /**
       * Reference to the success modal for completing a sale.
       * @type {Object}
       * @default createRef()
       */
      _successCompleteSaleModalRef: {
        type: Object,
        state: true,
      },
    };
  }

  /**
   * Initialize component state.
   */
  constructor() {
    super();
    this.completeSaleSuccess = false;
    this.barcode = '';
    this.productsToSell = [];
    this.total = 0;
    this._changeToGive = 0;
    this._confirmCompleteSaleModalRef = createRef();
    this._enableCompleteSale = false;
    this._showInputForCash = false;
    this._showTicket = false;
    this._successCompleteSaleModalRef = createRef();
  }

  /**
   * Lifecycle callback invoked when reactive properties change.
   * Updates error and success modal state.
   *
   * @param {Map} changedProperties - The properties that changed.
   */
  updated(changedProperties) {
    if (
      changedProperties.has('completeSaleSuccess') &&
      this.completeSaleSuccess
    ) {
      this._successCompleteSaleModalRef.value.openModal();
    }
  }

  /**
   * Handles input changes for form fields.
   *
   * @param {Event} event - The input event.
   */
  _handleInput({target: {id, value}}) {
    const inputs = {
      barcode: () => {
        this.barcode = value.toUpperCase() || '';
      },
    };
    inputs[id]?.call();
  }

  /**
   * Sends the barcode search event when the user presses Enter.
   *
   * @param {KeyboardEvent} event - The keydown event.
   * @event sell-element-get-product-to-sell - Dispatched when the user presses Enter with a barcode.
   */
  _sendBarcode(event) {
    if (event.key === 'Enter') {
      if (this.barcode) {
        dispatchCustomEvent(this, `${SellElement.is}-get-product-to-sell`, {
          barcode: this.barcode,
        });
        this.barcode = '';
      }
    }
  }

  /**
   * Dispatches an updated quantity event for a product in the sale list.
   *
   * @param {Event} event - The input event.
   * @param {HTMLElement} event.target - The input target element.
   * @param {string|number} event.target.value - The new quantity value.
   * @param {Object} event.target.product - The product object tied to the input.
   * @event sell-element-update-product-to-sell - Dispatched when a product quantity is updated, with details of the change.
   */
  _updateQuantity({target: {value, product}}) {
    const newQuantity = parseInt(value) || 1;
    dispatchCustomEvent(this, `${SellElement.is}-update-product-to-sell`, {
      barcode: product.barcode,
      change: newQuantity - product.quantity,
    });
  }

  /**
   * Dispatches an event to remove a product from the current sale.
   *
   * @param {Object} product - The product to remove.
   * @event sell-element-delete-product-to-sell - Dispatched when the user removes a product from the sale.
   */
  _deleteProductToSell(product) {
    dispatchCustomEvent(this, `${SellElement.is}-delete-product-to-sell`, {
      barcode: product.barcode,
    });
  }

  /**
    * Confirms the sale and dispatches the sale completion event.
   *
   * @returns {void}
   */
  _confirmCompleteSale() {
    if (this._showInputForCash) {
      this.shadowRoot.querySelector('#payment-cash-input').value = '';
    }
    dispatchCustomEvent(this, `${SellElement.is}-complete-sale`,{
      changeToGive: this._changeToGive,
      paymentMethod: this._showInputForCash ? 'cash' : 'card',
    });
    this._changeToGive = 0;
  }

  /**
   * Selects the payment method and updates the form state.
   *
   * @param {Event} event - The payment option change event.
   * @param {HTMLElement} event.target - The selected payment option element.
   * @param {string} event.target.id - The payment method identifier.
   */
  _selectPaymentMethod({target: {id}}) {
    const paymentMethod = {
      'payment-card': () => {
        this._showInputForCash = false;
        this._enableCompleteSale = true;
      },
      'payment-cash': () => {
        this._showInputForCash = true;
        this._enableCompleteSale = false;
      },
    };
    paymentMethod[id]?.call();
  }

  /**
   * Calculates cash change and enables or disables the complete sale button.
   *
   * @param {Event} event - The received cash amount input event.
   * @param {HTMLElement} event.target - The cash input field.
   * @param {string|number} event.target.value - The entered value.
   */
  _getChangeForCashPayment({target: {value}}) {
    const change = parseFloat(value !== '' ? value : 0) - this.total;
    if (change >= 0) {
      this._changeToGive = change;
      this._enableCompleteSale = true;
    } else {
      this._changeToGive = 0;
      this._enableCompleteSale = false;
    }
  }

  /**
    * Dispatches the action to print the sale ticket.
   */
  _printTicket() {
    dispatchCustomEvent(this, `${SellElement.is}-print-ticket`);
  }

  /**
   * Returns the confirmation modal template for completing a sale.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplConfirmCompleteSaleModal() {
    return html`
      <modal-element
        id="data-ticket-modal"
        ${ref(this._confirmCompleteSaleModalRef)}
        .data=${{
          bodyText: 'Would you like to complete the sale?',
          code: 'confirm-complete-sale',
          confirmButtonText: 'Yes, complete',
          cancelButtonText: 'No, cancel',
          titleText: 'Confirm Sale',
          type: 'info',
          isEnableConfirmButton: this._enableCompleteSale,
        }}
        @modal-element-confirm-action-confirm-complete-sale="${this
          ._confirmCompleteSale}"
      >
        <section slot="content-data" class="confirm-sale-data">
          <div class="confirm-sale-data-row">
            <b>
              <span class="confirm-sale-data-label">Total a pagar:</span>
              <span class="confirm-sale-data-value"
                >$${this.total.toFixed(2)}</span
              >
            </b>
          </div>
          <section class="confirm-sale-payment-methods">
            <p class="confirm-sale-data-label"><b>Payment Method:</b></p>
            <mwc-formfield label="Credit/Debit Card">
              <mwc-radio
                name="payment-method"
                id="payment-card"
                @change="${this._selectPaymentMethod}"
              ></mwc-radio>
            </mwc-formfield>
            <mwc-formfield label="Cash">
              <mwc-radio
                name="payment-method"
                id="payment-cash"
                @change="${this._selectPaymentMethod}"
              ></mwc-radio>
            </mwc-formfield>
            ${this._showInputForCash
              ? html`
                  <div class="confirm-sale-cash-input">
                    <mwc-textfield
                      id="payment-cash-input"
                      label="Amount Received"
                      type="number"
                      min="${this.total.toFixed(2)}"
                      step="0.50"
                      value=""
                      @input="${this._getChangeForCashPayment}"
                    ></mwc-textfield>
                    <p class="confirm-sale-change">
                      <b>Cambio: $${this._changeToGive.toFixed(2)}</b>
                    </p>
                  </div>
                `
              : nothing}
          </section>
        </section>
      </modal-element>
    `;
  }

  /**
   * Returns the success modal template.
   *
   * @returns {import('lit').TemplateResult}
   */
  /**
   * Returns the modal template shown when a sale completes successfully.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplSuccessModal() {
    return html`
      <modal-element
        ${ref(this._successCompleteSaleModalRef)}
        .data=${{
          bodyText: 'The sale has been completed successfully.',
          code: 'success-complete-sale',
          confirmButtonText: 'Accept',
          titleText: 'Sale Completed!',
          type: 'success',
          isEnableConfirmButton: true,
        }}
      >
        <section slot="content-data" class="confirm-sale-data">
          <mwc-button
            id="print-ticket-button"
            label="Print Ticket"
            @click="${this._printTicket}"
          ></mwc-button>
        </section>
      </modal-element>
    `;
  }

  /**
   * Template for the product table shown in the sell view.
   */
  /**
   * Returns the products table template for the current sale.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplProductsTable() {
    return html`
      <section class="sell-container">
        <table>
          <thead>
            <tr>
              <th>
                <div class="header-table"></div>
              </th>
              <th>
                <div class="header-table">Barcode</div>
              </th>
              <th>
                <div class="header-table">Barcode (Secondary)</div>
              </th>
              <th>
                <div class="header-table">Product Name</div>
              </th>
              <th>
                <div class="header-table">Price</div>
              </th>
              <th>
                <div class="header-table">Quantity</div>
              </th>
              <th>
                <div class="header-table">Description</div>
              </th>
            </tr>
          </thead>
          <tbody>
            ${map(
              this.productsToSell || [],
              (product, index) =>
                html`
                  <tr>
                    <td>
                      <div class="product-tools">
                        <button
                          class="delete-product"
                          id="${product.barcode}"
                          @click=${() => this._deleteProductToSell(product)}
                        >
                          ✖
                        </button>
                      </div>
                    </td>
                    <td>${product.barcode}</td>
                    <td>${product['barcode_secondary']}</td>
                    <td>${product.name}</td>
                    <td>
                      <div class="data-price">
                        <mwc-icon class="money-icon">attach_money</mwc-icon>
                        ${product.price}
                      </div>
                    </td>
                    <td style="width: 10%;">
                      <div class="data-quantity">
                        <div class="quantity">
                          <mwc-textfield
                            type="number"
                            class="quantity-input"
                            min="1"
                            max="${product.stock}"
                            .product="${product}"
                            .value="${product.quantity}"
                            @input=${this._updateQuantity}
                          ></mwc-textfield>
                        </div>
                      </div>
                    </td>
                    <td>${product.description}</td>
                  </tr>
                `
            )}
          </tbody>
        </table>
      </section>
    `;
  }

  /**
   * Template for the barcode input section and current total.
   */
  /**
   * Returns the barcode input section template and current total display.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplInputDataSection() {
    return html`
      <section class="sell-data-container">
        <section class="input-container">
          <mwc-textfield
            raise
            label="Barcode"
            autocomplete="off"
            iconTrailing="add"
            autofocus
            id="barcode"
            .value="${this.barcode}"
            @input=${this._handleInput}
            @keydown=${this._sendBarcode}
          ></mwc-textfield>
        </section>
        <section class="sale">
          <section class="total">Total: $${this.total.toFixed(2)}</section>
          <section class="button-complete-sale">
            <mwc-button
              id="complete-sale"
              raised
              label="Complete Sale"
              ?disabled=${!this.productsToSell?.length}
              @click="${() => {
                this._confirmCompleteSaleModalRef.value.openModal();
              }}"
            ></mwc-button>
          </section>
        </section>
      </section>
    `;
  }

  /**
   * Combines the input and table templates into the sell view.
   */
  /**
   * Returns the full sell section template combining input and product table.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplSell() {
    return html` ${this._tplInputDataSection} ${this._tplProductsTable} `;
  }

  /**
   * Returns the styles for the sell element.
   *
   * @returns {import('lit').CSSResult[]}
   */
  static get styles() {
    return [styles];
  }

  /**
   * Renders the sell-element template.
   *
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html`
      ${this._tplSell} ${this._tplSuccessModal}
      ${this._tplConfirmCompleteSaleModal}
    `;
  }
}

window.customElements.define('sell-element', SellElement);
