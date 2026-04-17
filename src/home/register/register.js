import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {dispatchCustomEvent} from '../../../utils/utils.js';

import styles from './register.css.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class RegisterElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'register-element';
  }

  static get scopedElements() {
    return {};
  }

  static get properties() {
    return {
      /**
       * The name to say "Hello" to.
       */
      registerSuccess: {
        type: Boolean,
        attribute: 'register-success',
      },
      /**
       * The name to say "Hello" to.
       */
      registerError: {
        type: String,
        attribute: 'register-error',
      },
      /**
       * Contains product's name.
       */
      _productName: {
        type: String,
        state: true,
      },
      /**
       * Contains product's barcode.
       */
      _productBarcode: {
        type: String,
        state: true,
      },
      /**
       * Contains product's description.
       */
      _productDescription: {
        type: String,
        state: true,
      },
      /**
       * Contains product's price.
       */
      _productPrice: {
        type: Number,
        state: true,
      },
      /**
       * Contains product's stock.
       */
      _productStock: {
        type: Number,
        state: true,
      },
      /**
       * Allows show error message
       */
      _errorMessage: {
        type: String,
        state: true,
      },
      /**
       * Allows show error message
       */
      _showErrorMessage: {
        type: Boolean,
        state: true,
      },
      /**
       * Allows show product list
       */
      _showProductList: {
        type: Boolean,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.registerError = '';
    this.registerSuccess = false;
    this._errorMessage = '';
    this._showErrorMessage = false;
    this._showProductList = false;
    this._productName = '';
    this._productBarcode = '';
    this._productDescription = '';
    this._productPrice = 0;
    this._productStock = 0;
  }

  /**
   * Updated function from lifecycle
   * @param {Object} changedProperties checked value
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (
      changedProperties.has('registerError') ||
      this.registerError.length > 0
    ) {
      this._mapErrorMessage();
    }
  }

  _closeSuccessModal() {
    this.shadowRoot.querySelector('#barcode').focus();
    dispatchCustomEvent(this, 'register-page-close-success-modal');
    this._resetForm();
  }

  _closeErrorModal() {
    this.shadowRoot.querySelector('#barcode').focus();
    dispatchCustomEvent(this, 'register-page-close-error-modal');
  }

  _resetForm() {
    this._showErrorMessage = false;
    this._productName = '';
    this._productBarcode = '';
    this._productDescription = '';
    this._productPrice = 0;
    this._productStock = 0;
  }

  _handleInput({target: {id, value}}) {
    const inputs = {
      barcode: () => {
        this._productBarcode = value.toUpperCase() || '';
      },
      'product-name': () => {
        this._productName = value.toUpperCase() || '';
      },
      price: () => {
        this._productPrice = value || 0;
      },
      stock: () => {
        this._productStock = value || 0;
      },
      description: () => {
        this._productDescription = value || '';
      },
      search: () => {
        dispatchCustomEvent(this, 'register-page-search-product', {
          value,
        });
      },
    };
    inputs[id]?.call();
  }

  _showList() {
    this._showProductList = !this._showProductList;
  }

  _mapErrorMessage() {
    const errors = {
      ERP001: 'Proucto Duplicado',
      ERP002: 'Valores negativos',
    };
    this._errorMessage = errors[this.registerError] ?? '';
  }

  _registerProduct() {
    this._showErrorMessage =
      !this._productBarcode.length ||
      !this._productName.length ||
      !this._productPrice;
    if (!this._showErrorMessage) {
      dispatchCustomEvent(this, 'register-page-register-product', {
        name: this._productName,
        barcode: this._productBarcode,
        price: parseFloat(this._productPrice, 10),
        stock: parseInt(this._productStock, 10),
        description: this._productDescription,
      });
    }
  }

  get _tplSuccessModal() {
    return html`
      <modal-element
        ?show-modal=${this.registerSuccess}
        body-text="El producto se ha registrado correctamente"
        code="success-register"
        confirm-button-text="Aceptar"
        title-text="¡Producto Registrado!"
        type="success"
        @modal-element-confirm-action-success-register=${this._closeSuccessModal}
      ></modal-element>
    `;
  }

  get _tplErrorModal() {
    return html`
      <modal-element
        ?show-modal=${!!this.registerError.length}
        body-text="${this._errorMessage}"
        code="error-register"
        confirm-button-text="Aceptar"
        title-text="¡Error!"
        type="error"
        @modal-element-confirm-action-error-register=${this._closeErrorModal}
      ></modal-element>
    `;
  }

  get _tplRegister() {
    return html`
      <div class="register-container">
        <div id="register-product">
          <h2 class="register-header">Register product</h2>
          <div>
            <div class="input-container">
              <label for="barcode">Barcode * :</label>
              <input
                id="barcode"
                type="text"
                autofocus
                autocomplete="off"
                .value="${this._productBarcode}"
                @input=${this._handleInput}
              />
              <label class="error-label"
                >${this._showErrorMessage && !this._productBarcode.length
                  ? html`Empty Field`
                  : nothing}</label
              >
            </div>
            <div class="input-container">
              <label for="product-name">Product name * :</label>
              <input
                id="product-name"
                type="text"
                .value="${this._productName}"
                @input=${this._handleInput}
              />
              <label class="error-label"
                >${this._showErrorMessage && !this._productName.length
                  ? html`Empty Field`
                  : nothing}</label
              >
            </div>
            <div class="input-container">
              <label for="price">Price * :</label>
              <label>$</label>
              <input
                id="price"
                type="number"
                min="0"
                .value="${this._productPrice.toString()}"
                @input=${this._handleInput}
              />
              <label class="error-label"
                >${this._showErrorMessage && !this._productPrice
                  ? html`Empty Field`
                  : nothing}</label
              >
            </div>
            <div class="input-container">
              <label for="stock">Stock:</label>
              <input
                id="stock"
                type="number"
                min="0"
                .value="${this._productStock.toString()}"
                @input=${this._handleInput}
              />
            </div>
            <div class="input-container textarea">
              <label for="description">Description:</label>
              <textarea
                id="description"
                type="text"
                placeholder="Description..."
                rows="4"
                cols="50"
                .value="${this._productDescription}"
                @input=${this._handleInput}
              ></textarea>
            </div>
            <div class="info-label">
              <label>Required Fields (*)</label>
            </div>
            <div class="button-container">
              <button class="register-button" @click="${this._registerProduct}">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      ${this._tplSuccessModal} ${this._tplErrorModal}
    `;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html` ${this._tplRegister} `;
  }
}

window.customElements.define('register-element', RegisterElement);
