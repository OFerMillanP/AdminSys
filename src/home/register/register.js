import {LitElement, html, nothing} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {ModalElement} from '../../organisms/modal/modal.js';

import {dispatchCustomEvent} from '../../../utils/utils.js';

import styles from './register.css.js';

/**
 * Product registration page element.
 *
 * Manages form state, validation, and registration events for new products.
 */
export class RegisterElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'register-element';
  }

  static get scopedElements() {
    return {'modal-element': ModalElement};
  }

  static get properties() {
    return {
      /**
       * Indicates whether the product was registered successfully.
       */
      registerSuccess: {
        type: Boolean,
        attribute: 'register-success',
      },
      /**
       * Error code returned after a failed product registration.
       */
      registerError: {
        type: String,
        attribute: 'register-error',
      },
      _barcodeList:{
        type: Array,
        state: true,
      },
      /**
       * Name of the product being registered.
       */
      _productName: {
        type: String,
        state: true,
      },
      /**
       * Primary barcode of the product.
       */
      _productBarcode: {
        type: String,
        state: true,
      },
      /**
       * Description of the product.
       */
      _productDescription: {
        type: String,
        state: true,
      },
      /**
       * Price of the product.
       */
      _productPrice: {
        type: Number,
        state: true,
      },
      /**
       * Available stock quantity for the product.
       */
      _productStock: {
        type: Number,
        state: true,
      },
      /**
       * Mapped error message text for the current registration error.
       */
      _errorMessage: {
        type: String,
        state: true,
      },
      /**
       * Reference to the error modal component.
       */
      _errorRegisterModalRef: {
        type: Object,
        state: true,
      },
      /**
       * Whether the form should display a validation error message.
       */
      _showErrorMessage: {
        type: Boolean,
        state: true,
      },
      /**
       * Whether the product list should be shown in the UI.
       */
      _showProductList: {
        type: Boolean,
        state: true,
      },
      /**
       * Reference to the success modal component.
       */
      _successRegisterModalRef: {
        type: Object,
        state: true,
      },
    };
  }

  /**
   * Initializes component state and refs.
   */
  constructor() {
    super();
    this.registerError = '';
    this.registerSuccess = false;
    this._barcodeList = [];
    this._errorMessage = '';
    this._errorRegisterModalRef = createRef();
    this._productBarcode = '';
    this._productDescription = '';
    this._productName = '';
    this._productPrice = 0;
    this._productStock = 0;
    this._showErrorMessage = false;
    this._showProductList = false;
    this._successRegisterModalRef = createRef();
  }

  /**
   * Lifecycle callback invoked when reactive properties change.
   * Updates error and success modal state.
   *
   * @param {Map} changedProperties - The properties that changed.
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('registerError') || this.registerError.length) {
      this._mapErrorMessage();
    }
    if (changedProperties.has('registerSuccess') && this.registerSuccess) {
      this._successRegisterModalRef.value.openModal();
    }
  }

  /**
   * Closes the success modal and resets the registration form.
   */
  _closeSuccessModal() {
    this.shadowRoot.querySelector('#barcode').focus();
    this._resetForm();
  }

  /**
   * Closes the error modal and notifies the parent component.
   */
  _closeErrorModal() {
    this.shadowRoot.querySelector('#barcode').focus();
    dispatchCustomEvent(this, 'register-page-close-error-modal');
  }

  /**
   * Resets the form fields and clears validation state.
   */
  _resetForm() {
    this._showErrorMessage = false;
    this._productName = '';
    this._productBarcode = '';
    this._productDescription = '';
    this._productPrice = 0;
    this._productStock = 0;
    this._barcodeList = [];
  }

  /**
   * Handles input updates for all form fields.
   *
   * @param {InputEvent} event - The input event.
   */
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

  /**
   * Toggles visibility of the product list section.
   */
  _showList() {
    this._showProductList = !this._showProductList;
  }

  /**
   * Maps the current registration error code to a user-facing message.
   * Opens the error modal if a known error message exists.
   */
  _mapErrorMessage() {
    const errors = {
      ERP001: 'Proucto Duplicado',
      ERP002: 'Valores negativos',
    };
    this._errorMessage = errors[this.registerError] ?? '';
    if (this._errorMessage.length) {
      this._errorRegisterModalRef.value.openModal();
    }
  }

  /**
   * Registers the product with the provided details.
   */
  _registerProduct() {
    this._showErrorMessage =
      !this._productBarcode.length ||
      !this._productName.length ||
      !this._productPrice;
    if (!this._showErrorMessage) {
      dispatchCustomEvent(this, 'register-page-register-product', {
        name: this._productName,
        barcode: this._productBarcode,
        barcodeList: this._barcodeList,
        price: parseFloat(this._productPrice, 10),
        stock: parseInt(this._productStock, 10),
        description: this._productDescription,
      });
    }
  }

  _addBarcode(){
    if (!!this._productBarcode) {
      this._barcodeList = [...this._barcodeList, 
        {
          label: `Extra Barcode`,
          id: `${window.crypto.randomUUID()}`,
          value: ''
        }
      ]
    }
  }

  _removeBarcode({target: {id}}){
    this._barcodeList = this._barcodeList.filter(barcode => barcode.id !== id)
  }

  _barcodeListHandleInput({target: {id, value}}){
    let updateExtraBarcode = this._barcodeList.findIndex(barcode => barcode.id === id);
    this._barcodeList[updateExtraBarcode].value = value;
  }

  /**
   * Returns the success modal template.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplSuccessModal() {
    return html`
      <modal-element
        ${ref(this._successRegisterModalRef)}
        .data=${{
          bodyText: 'El producto se ha registrado correctamente',
          code: 'success-register',
          confirmButtonText: 'Aceptar',
          titleText: '¡Producto Registrado!',
          type: 'success',
          isEnableConfirmButton: true,
        }}
        @modal-element-cancel-action=${this._closeSuccessModal}
        @modal-element-confirm-action-success-register=${this
          ._closeSuccessModal}
      ></modal-element>
    `;
  }

  /**
   * Returns the error modal template.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplErrorModal() {
    return html`
      <modal-element
        ${ref(this._errorRegisterModalRef)}
        ?show-modal=${!!this.registerError.length}
        .data=${{
          bodyText: this._errorMessage,
          code: 'error-register',
          confirmButtonText: 'Aceptar',
          titleText: '¡Error!',
          type: 'error',
          isEnableConfirmButton: true,
        }}
        @modal-element-confirm-action-error-register=${this._closeErrorModal}
      ></modal-element>
    `;
  }

  /**
   * Returns the registration form template.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplRegister() {
    return html`
      <div class="register-container">
        <div id="register-product">
          <h2 class="register-header">Register product</h2>
          <div>
            <div class="input-container">
              <mwc-textfield
                raised
                required
                label="Barcode"
                autocomplete="off"
                id="barcode"
                type="text"
                autocomplete="off"
                .value="${this._productBarcode}"
                @input=${this._handleInput}
              ></mwc-textfield>
              <mwc-icon 
                slot="icon"
                class="register-icon${this._productBarcode.length ? ' enabled' : ''}"
                @click="${this._addBarcode}"
              >add</mwc-icon>
            </div>
            ${this._barcodeList.map((barcode) =>
              html`
               <div class="input-container">
                <mwc-textfield
                  raised
                  label="${barcode.label}"
                  autocomplete="off"
                  id="${barcode.id}"
                  type="text"
                  .value="${barcode.value}"
                  @input="${this._barcodeListHandleInput}"
                ></mwc-textfield>
                <mwc-icon 
                  slot="icon"
                  class="register-icon enabled"
                  id="${barcode.id}"
                  @click="${this._removeBarcode}"
                >remove</mwc-icon>
               </div>
              `
            )}
            <div class="input-container">
              <mwc-textfield
                raised
                required
                label="Product name"
                autocomplete="off"
                id="product-name"
                type="text"
                .value="${this._productName}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            <div class="input-container">
              <mwc-textfield
                raised
                required
                label="Price"
                autocomplete="off"
                id="price"
                type="number"
                min="0"
                iconTrailing="attach_money"
                .value="${this._productPrice.toString()}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            <div class="input-container">
              <mwc-textfield
                raised
                label="Stock"
                autocomplete="off"
                id="stock"
                type="number"
                min="0"
                .value="${this._productStock.toString()}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            <div class="input-container textarea">
              <mwc-textarea
                label="Description"
                id="description"
                type="text"
                rows="4"
                cols="51"
                .value="${this._productDescription}"
                @input=${this._handleInput}
              >
              </mwc-textarea>
            </div>
            <div class="info-label">
              <label>Required Fields (*)</label>
            </div>
            <div class="button-container">
              <mwc-button
                class="save"
                raised
                label="Save"
                @click=${this._registerProduct}
              ></mwc-button>
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

  /**
   * Renders the register element.
   *
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html` ${this._tplRegister} `;
  }
}

window.customElements.define('register-element', RegisterElement);
