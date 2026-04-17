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
      _products: {
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
    this._products = [];
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
      Object.keys(this.productToSearch).length > 0
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
  async getProductList() {
    await this._getDataManager().fetch(
      'GET',
      'api/v0/products',
      'dm-get-products'
    );
  }

  async registerProduct(body) {
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

  _getProductsSuccessResponse({detail}) {
    this._products = detail;
    dispatchCustomEvent(this, 'dm-get-products-success-response', detail);
  }

  _deleteProductsSuccessResponse({detail}){
    dispatchCustomEvent(this, 'dm-delete-product-success-response', detail);
    this.getProductList();
  }

  get _tplApiManager() {
    return html`
      <api-manager-element
        @api-dm-get-products-success-response=${this
          ._getProductsSuccessResponse}
        @api-dm-delete-product-success-response=${this
          ._deleteProductsSuccessResponse}
      ></api-manager-element>
    `;
  }

  render() {
    return html` ${this._tplApiManager} `;
  }
}

window.customElements.define('manager-element', ManagerElement);
