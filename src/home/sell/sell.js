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
       * The barcode to search for.
       */
      barcode: {
        type: String,
        attribute: 'barcode',
      },
      /**
       * The list of products to sell.
       */
      productsToSell: {
        type: Array,
      },
    };
  }

  constructor() {
    super();
    this.barcode = '';
    this.productsToSell = [];
  }

  _handleInput({target: {id, value}}) {
    const inputs = {
      barcode: () => {
        this.barcode = value.toUpperCase() || '';
      },
    };
    inputs[id]?.call();
  }

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

  _updateQuantity(product, change, index) {
    const newQuantity = product.quantity + change;
    if (newQuantity > 0) {
      this.productsToSell = [
        ...this.productsToSell.slice(0, index),
        {...product, quantity: newQuantity},
        ...this.productsToSell.slice(index + 1),
      ];
    }
  }

  _deleteProductToSell(product) {
    console.log(product);
    this.productsToSell = this.productsToSell.filter(
      (p) => p.barcode !== product.barcode
    );
  }

  get _tplSell() {
    return html` ${this._tplInputBarcode} ${this._tplProductsTable} `;
  }

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
                      <div class="data-price">$${product.price}</div>
                    </td>
                    <td>
                      <div class="data-quantity">
                        <!-- <mwc-icon
                          class="quantity-icon-remove"
                          @click=${() =>
                          this._updateQuantity(product, -1, index)}
                          >remove</mwc-icon
                        > -->
                        <div class="quantity">${product.quantity}</div>
                        <!-- <mwc-icon
                          class="quantity-icon-add"
                          @click=${() =>
                          this._updateQuantity(product, 1, index)}
                          >add</mwc-icon
                        > -->
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

  get _tplInputBarcode() {
    return html`
      <section class="sell-container">
        <div class="list-products-header">
          <div class="input-container">
            <mwc-textfield
              raise
              label="Barcode"
              autocomplete="off"
              iconTrailing="add"
              id="barcode"
              type="text"
              .value="${this.barcode}"
              @input=${this._handleInput}
              @keydown=${this._sendBarcode}
            ></mwc-textfield>
          </div>
        </div>
      </section>
    `;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html` ${this._tplSell} `;
  }
}

window.customElements.define('sell-element', SellElement);
