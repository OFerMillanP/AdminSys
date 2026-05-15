import {LitElement, html} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {ApiManagerElement} from '../dm/apiManager.js';

import {dispatchCustomEvent} from '../../utils/utils.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class ManagerElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'manager-element';
  }

  static get scopedElements() {
    return {
      'api-manager-element': ApiManagerElement,
    };
  }

  static get properties() {
    return {
      /**
       * The password to login
       */
      productToSearch: {
        type: Object,
      },
      /**
       * The password to login
       */
      password: {
        type: String,
        attribute: 'password',
      },
      /**
       * The user to login
       */
      user: {
        type: String,
        attribute: 'user',
      },
      /**
       * The password to login
       */
      _productToEdit: {
        type: Object,
        state: true,
      },
      /**
       * The password to login
       */
      _products: {
        type: Array,
        state: true,
      },
      /**
       * Products to sell.
       */
      _productsToSell: {
        type: Array,
        state: true,
      },
      /**
       * The password to login
       */
      _responseData: {
        type: String,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.password = '';
    this.productToSearch = {};
    this.user = '';
    this._apiManager = {};
    this._productToEdit = {};
    this._products = [];
    this._productsToSell = [];
    this._responseData = {};
  }

  /**
   * Lifecycle method who calls after build the component
   */
  firstUpdated() {
    super.firstUpdated();
    this._sessionActive();
    this.getProductList();
  }

  /**
   * Updated function from lifecycle
   * @param {Object} changedProperties checked value
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (
      changedProperties.has('productToSearch') &&
      Object.keys(this.productToSearch).length
    ) {
      this._filterProducts();
    }
  }

  _getDataManager() {
    return this.shadowRoot.querySelector('api-manager-element');
  }

  async logout() {
    await this._getDataManager().fetch('GET', 'api/v0/logout', 'dm-logout');
  }

  async _sessionActive() {
    await this._getDataManager().fetch(
      'GET',
      'api/v0/login',
      'dm-session-active'
    );
  }

  async login(body) {
    await this._getDataManager().fetch(
      'POST',
      'api/v0/login',
      'dm-login',
      body
    );
  }

  async getProductById({id}) {
    if (!this._products.length) {
      this._productToEdit = this._products.find((product) => product.id === id);
      dispatchCustomEvent(
        this,
        'dm-get-product-success-response',
        this._productToEdit
      );
    } else {
      await this._getDataManager().fetch(
        'GET',
        `api/v0/products/product/${id}`,
        'dm-get-product'
      );
    }
  }

  async getProductList() {
    await this._getDataManager().fetch(
      'GET',
      'api/v0/products',
      'dm-get-products'
    );
  }

  async createProduct(body) {
    await this._getDataManager().fetch(
      'POST',
      'api/v0/products/product',
      'dm-register-product',
      body
    );
  }

  async deleteProduct({id}) {
    await this._getDataManager().fetch(
      'DELETE',
      `api/v0/products/product/${id}`,
      'dm-delete-product'
    );
  }

  async editProduct(product) {
    await this._getDataManager().fetch(
      'PATCH',
      `api/v0/products/product/${product.id}`,
      'dm-edit-product',
      product
    );
  }

  _getProductSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-get-product-success-response', detail);
    this._productToEdit = detail;
  }

  _filterProducts() {
    let filteredProducts = [];
    if (this.productToSearch.value !== '') {
      filteredProducts = this._products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(this.productToSearch.value.toLowerCase()) ||
          product.barcode
            .toLowerCase()
            .includes(this.productToSearch.value.toLowerCase()) ||
          product.barcodeSecondary
            .toLowerCase()
            .includes(this.productToSearch.value.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(this.productToSearch.value.toLowerCase())
      );
    } else {
      filteredProducts = this._products;
    }
    dispatchCustomEvent(
      this,
      'dm-get-products-success-response',
      filteredProducts
    );
  }

  getProductToSell(barcode) {
    const registeredProduct = this._products.find((product) => 
      product.barcode === barcode || product.barcodeSecondary === barcode
    );
    const productInList = this._productsToSell.find((product) => 
      product.barcode === barcode || product.barcodeSecondary === barcode
    );
    if (registeredProduct) {
      this._productsToSell = productInList
        ? this._productsToSell.map((product) =>
            (product.barcode === barcode || product.barcodeSecondary === barcode)
              ? { ...product, quantity: product.stock > product.quantity ? product.quantity + 1 : product.quantity }
              : product
          )
        : [...this._productsToSell, { ...registeredProduct, quantity: 1 }];
    }
    dispatchCustomEvent(this, 'dm-get-product-to-sell', this._productsToSell);
  }

  _getProductsSuccessResponse({detail}) {
    this._products = detail;
    dispatchCustomEvent(this, 'dm-get-products-success-response', detail);
  }

  _deleteProductsSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-delete-product-success-response', detail);
    this.getProductList();
  }

  _editProductSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-edit-product-success-response', detail);
    this.getProductList();
  }

  get _tplApiManager() {
    return html`
      <api-manager-element
        @api-dm-delete-product-success-response=${this
          ._deleteProductsSuccessResponse}
        @api-dm-edit-product-success-response=${this
          ._editProductSuccessResponse}
        @api-dm-get-product-success-response=${this._getProductSuccessResponse}
        @api-dm-get-products-success-response=${this
          ._getProductsSuccessResponse}
      ></api-manager-element>
    `;
  }

  render() {
    return html` ${this._tplApiManager} `;
  }
}

window.customElements.define('manager-element', ManagerElement);
