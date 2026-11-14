import {LitElement, html, nothing} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {ModalElement} from '../../organisms/modal/modal.js';

import {dispatchCustomEvent, t} from '../../../utils/utils.js';

import styles from './register.css.js';

/**
 * Product registration page element.
 *
 * Manages form state, validation, and registration events for new products.
 *
 * @fires register-page-close-error-modal - Notifies the parent after the registration error modal is acknowledged; `event.detail` is `true`.
 * @fires register-page-search-product - Requests matching products with `{value: string}` in `event.detail`.
 * @fires register-page-register-product - Requests registration with `{name, barcode, barcodeList, price, stock, description, category}` in `event.detail`.
 * @listens modal-element-cancel-action - Resets the form after the success modal is canceled; `event.detail` is `true`.
 * @listens modal-element-confirm-action-success-register - Resets the form after success is confirmed; `event.detail` is `true`.
 * @listens modal-element-confirm-action-error-register - Closes the error modal and notifies the parent; `event.detail` is `true`.
 */
export class RegisterElement extends ScopedElementsMixin(LitElement) {
  /** @returns {string} The custom-element tag name. */
  static get is() {
    return 'register-element';
  }

  /** @returns {Object} Child custom-element constructors registered in this scope. */
  static get scopedElements() {
    return {'modal-element': ModalElement};
  }

  /** @returns {Object} Reactive property definitions for registration inputs and state. */
  static get properties() {
    return {
      /**
       * Indicates whether the product was registered successfully.
       * @type {boolean}
       * @attribute register-success
       */
      registerSuccess: {
        type: Boolean,
        attribute: 'register-success',
      },
      /**
       * Error code returned after a failed product registration.
       * @type {string}
       * @attribute register-error
       */
      registerError: {
        type: String,
        attribute: 'register-error',
      },
      /**
       * Additional barcode entries being entered for the product.
       * @type {Array}
       * @state
       */
      _barcodeList:{
        type: Array,
        state: true,
      },
      /**
       * Name of the product being registered.
       * @type {string}
       * @state
       */
      _productName: {
        type: String,
        state: true,
      },
      /**
       * Primary barcode of the product.
       * @type {string}
       * @state
       */
      _productBarcode: {
        type: String,
        state: true,
      },
      /**
       * Product category selected in the form (0 for product, 1 for service).
       * @type {number}
       * @state
       */
      _productCategory: {
        type: Number,
        state: true,
      },
      /**
       * Description of the product.
       * @type {string}
       * @state
       */
      _productDescription: {
        type: String,
        state: true,
      },
      /**
       * Price of the product.
       * @type {number}
       * @state
       */
      _productPrice: {
        type: Number,
        state: true,
      },
      /**
       * Available stock quantity for the product.
       * @type {number}
       * @state
       */
      _productStock: {
        type: Number,
        state: true,
      },
      /**
       * Mapped error message text for the current registration error.
       * @type {string}
       * @state
       */
      _errorMessage: {
        type: String,
        state: true,
      },
      /**
       * Reference to the error modal component.
       * @type {Object}
       * @state
       */
      _errorRegisterModalRef: {
        type: Object,
        state: true,
      },
      /**
       * Whether the form should display a validation error message.
       * @type {boolean}
       * @state
       */
      _showErrorMessage: {
        type: Boolean,
        state: true,
      },
      /**
       * Whether the product list should be shown in the UI.
       * @type {boolean}
       * @state
       */
      _showProductList: {
        type: Boolean,
        state: true,
      },
      /**
       * Reference to the success modal component.
       * @type {Object}
       * @state
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
    this._productCategory = 0;
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
   * @fires register-page-close-error-modal - Fired with `event.detail === true`.
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
    this._productCategory = 0;
    this._productDescription = '';
    this._productPrice = 0;
    this._productStock = 0;
    this._barcodeList = [];
  }

  /**
   * Handles input updates for all form fields.
   *
   * @param {InputEvent} event - The input event.
   * @fires register-page-search-product - Fired for the search field with `{value: string}` in `event.detail`.
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
        this._productPrice = Number(value) || 0;
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
   * Updates the selected product category and clears the stock value.
   * @param {CustomEvent} event - Category selection event with a numeric `detail.index`.
   */
  _setCategory({detail: {index}}) {
    this._productCategory = Number(index) || 0;
    this._productStock = 0;
  }

  /**
   * Toggles visibility of the product list section.
   * @returns {void}
   */
  _showList() {
    this._showProductList = !this._showProductList;
  }

  /**
   * Maps the current registration error code to a user-facing message.
   * Opens the error modal if a known error message exists.
   * @returns {void}
   */
  _mapErrorMessage() {
    const errors = {
      ERP001: t('register-element-product-duplicate'),
      ERP002: t('register-element-negative-values'),
    };
    this._errorMessage = errors[this.registerError] ?? '';
    if (this._errorMessage.length) {
      this._errorRegisterModalRef.value.openModal();
    }
  }

  /**
   * Registers the product with the provided details.
   * @fires register-page-register-product - Fired with the product data `{name, barcode, barcodeList, price, stock, description, category}` in `event.detail` when required fields are filled.
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
        category: Number(this._productCategory)
      });
    }
  }

  /** Adds an empty extra-barcode form row when a primary barcode is present. */
  _addBarcode(){
    if (!!this._productBarcode) {
      this._barcodeList = [...this._barcodeList, 
        {
          label: t('register-element-product-extra-barcode'),
          id: `${window.crypto.randomUUID()}`,
          value: ''
        }
      ]
    }
  }

  /**
   * Removes an extra-barcode row from the registration form.
   * @param {Event} event - Click event on the row's remove control.
   * @param {string} event.target.id - Identifier of the row to remove.
   */
  _removeBarcode({target: {id}}){
    this._barcodeList = this._barcodeList.filter(barcode => barcode.id !== id)
  }

  /**
   * Updates an extra barcode value from its input field.
   * @param {InputEvent} event - Input event with the row identifier and value.
   */
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
          bodyText: t('register-element-product-registered'),
          code: 'success-register',
          confirmButtonText: t('register-element-button-accept'),
          titleText: t('register-element-product-registered-title'),
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
          confirmButtonText: t('register-element-button-accept'),
          titleText: t('register-element-error-title'),
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
          <h2 class="register-header">${t('register-element-product-register-title')}</h2>
          <div>
            <div class="input-container">
              <mwc-textfield
                raised
                required
                label="${t('register-element-product-barcode')}"
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
              <mwc-select 
                label="${t('register-element-selector-label')}"
                id="category"
                @selected=${this._setCategory}
              >
                <mwc-list-item value="0" selected>${t('register-element-selector-product')}</mwc-list-item>
                <mwc-list-item value="1">${t('register-element-selector-service')}</mwc-list-item>
              </mwc-select>
            </div>
            <div class="input-container">
              <mwc-textfield
                raised
                required
                label="${t('register-element-product-name')}"
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
                label="${t('register-element-product-price')}"
                autocomplete="off"
                id="price"
                type="number"
                min="0"
                iconTrailing="attach_money"
                .step="${0.1}"
                .value="${this._productPrice.toString()}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            ${this._productCategory ?
              nothing :
              html`
                <div class="input-container">
                  <mwc-textfield
                    raised
                    label="${t('register-element-product-stock')}"
                    autocomplete="off"
                    id="stock"
                    type="number"
                    min="0"
                    .value="${this._productStock.toString()}"
                    @input=${this._handleInput}
                  ></mwc-textfield>
                </div>
              ` 
            }
            <div class="input-container textarea">
              <mwc-textarea
                label="${t('register-element-product-description')}"
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
              <label>${t('register-element-required-fields')}</label>
            </div>
            <div class="button-container">
              <mwc-button
                class="save"
                raised
                label="${t('register-element-button-save')}"
                @click=${this._registerProduct}
              ></mwc-button>
            </div>
          </div>
        </div>
      </div>
      ${this._tplSuccessModal} ${this._tplErrorModal}
    `;
  }

  /** @returns {import('lit').CSSResult[]} Styles applied to the registration page. */
  /** @returns {import('lit').CSSResult[]} Styles applied to the registration page. */
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
