import {LitElement, html} from 'lit';
import {repeat} from 'lit/directives/repeat.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {dispatchCustomEvent} from '../../../utils/utils.js';

import styles from './sell.css.js';
import {map} from 'lit/directives/map.js';

export class SellElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'sell-element';
  }

  static get scopedElements() {
    return {};
  }

  static get properties() {
    return {
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
    };
  }

  /**
   * Initialize component state.
   */
  constructor() {
    super();
    this.barcode = '';
    this.productsToSell = [];
    this.total = 0;
  }

  update(changedProperties) {
    super.update(changedProperties);
    // this.shadowRoot.querySelector('vaadin-text-field#barcode')?.focus();
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
   * Template for the product table shown in the sell view.
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
                    <td>${product.barcodeSecondary}</td>
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
  get _tplInputBarcode() {
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
        <section class="total">Total: $${this.total.toFixed(2)}</section>
      </section>
    `;
  }

  /**
   * Combines the input and table templates into the sell view.
   */
  get _tplSell() {
    return html` ${this._tplInputBarcode} ${this._tplProductsTable} `;
  }

  static get styles() {
    return [styles];
  }

  /**
   * Renders the sell-element content.
   */
  render() {
    return html` ${this._tplSell} `;
  }
}

window.customElements.define('sell-element', SellElement);
