import {LitElement, html} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {ApiManagerElement} from '../dm/apiManager.js';

import {dispatchCustomEvent, getCurrentDate} from '../../utils/utils.js';

/**
 * Manager layer element.
 *
 * Encapsulates API calls and local cache management for products, sales, and login.
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
       * Search criteria used to filter the product list.
       */
      productToSearch: {
        type: Object,
      },
      /**
       * Password used during login.
       */
      password: {
        type: String,
        attribute: 'password',
      },
      /**
       * Username used during login.
       */
      user: {
        type: String,
        attribute: 'user',
      },
      /**
       * Cached Cash Register Closing
       */
      _cashRegisterClosing: {
        type: Array,
        state: true,
      },
      /**
       * The product selected for editing.
       */
      _productToEdit: {
        type: Object,
        state: true,
      },
      /**
       * Cached list of products retrieved from the API.
       */
      _products: {
        type: Array,
        state: true,
      },
      /**
       * Products currently added to the sale transaction.
       */
      _productsToSell: {
        type: Array,
        state: true,
      },
      /**
       * Raw response data from the API.
       */
      _responseData: {
        type: String,
        state: true,
      },
      /**
       * Cached list of sales retrieved from the API.
       */
      _sales: {
        type: Array,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.password = '';
    this.productToSearch = {};
    this.user = '';
    this._cashRegisterClosing = [];
    this._productToEdit = {};
    this._products = [];
    this._productsToSell = [];
    this._responseData = {};
    this._sales = [];
  }

  /**
   * Called after the component is first updated.
   * Initializes the session and loads the product list.
   *
   * @override
   */
  firstUpdated() {
    super.firstUpdated();
    this._sessionActive();
  }

  /**
   * Called when reactive properties change.
   * Filters the current product list when the search criteria change.
   *
   * @param {Map} changedProperties - The changed reactive properties.
   * @override
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

  /**
   * Returns the nested api-manager-element from shadow DOM.
   *
   * @return {ApiManagerElement} The API manager element instance.
   */
  _getDataManager() {
    return this.shadowRoot.querySelector('api-manager-element');
  }

  /**
   * Logs out the current user through the API manager.
   *
   * @return {Promise<void>}
   */
  async logout() {
    await this._getDataManager().fetch('GET', 'api/v0/logout', 'dm-logout');
  }

  /**
   * Checks whether there is an active session.
   *
   * @return {Promise<void>}
   */
  async _sessionActive() {
    await this._getDataManager().fetch(
      'GET',
      'api/v0/login',
      'dm-session-active'
    );
  }

  /**
   * Sends a login request to the API manager.
   *
   * @param {Object} body - The login payload containing user credentials.
   * @return {Promise<void>}
   */
  async login(body) {
    await this._getDataManager().fetch(
      'POST',
      'api/v0/login',
      'dm-login',
      body
    );
  }

  /**
   * Loads a product by its identifier.
   * If the product list is already cached, it dispatches a success event locally.
   * Otherwise, it requests the product from the API.
   *
   * @param {Object} params
   * @param {string|number} params.id - The ID of the product.
   * @return {Promise<void>}
   */
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

  /**
   * Requests the full product list from the API.
   *
   * @return {Promise<void>}
   */
  async getProductList() {
    await this._getDataManager().fetch(
      'GET',
      'api/v0/products',
      'dm-get-products'
    );
  }

  /**
   * Creates a new product through the API.
   *
   * @param {Object} body - The new product payload.
   * @return {Promise<void>}
   */
  async createProduct(body) {
    await this._getDataManager().fetch(
      'POST',
      'api/v0/products/product',
      'dm-register-product',
      body
    );
  }

  /**
   * Deletes a product by its ID through the API.
   *
   * @param {Object} params
   * @param {string|number} params.id - The ID of the product to delete.
   * @return {Promise<void>}
   */
  async deleteProduct({id}) {
    await this._getDataManager().fetch(
      'DELETE',
      `api/v0/products/product/${id}`,
      'dm-delete-product'
    );
  }

  /**
   * Updates a product through the API.
   *
   * @param {Object} product - The updated product object.
   * @return {Promise<void>}
   */
  async editProduct(product) {
    await this._getDataManager().fetch(
      'PATCH',
      `api/v0/products/product/${product.id}`,
      'dm-edit-product',
      product
    );
  }

  async getSales() {
    await this._getDataManager().fetch('GET', 'api/v0/sales', 'dm-get-sales');
  }

  async getCloseCashRegister() {
    await this._getDataManager().fetch(
      'GET',
      'api/v0/sales/cash-register',
      'dm-get-close-cash-register'
    );
  }

  async postCloseCashRegister() {
    let lastClosedCashRegister = this._cashRegisterClosing.length
      ? this._cashRegisterClosing.at(-1)
      : [];
    let sales = [];
    let formattedDateLastClosedCashRegister = lastClosedCashRegister.date?.substring(0, 10)
      .split('/');
    let formattedHourLastClosedCashRegister = lastClosedCashRegister.date?.substring(11)
      .split(':');
    const lastCashRegisterDate = Object.keys(lastClosedCashRegister).length
      ? new Date(
          formattedDateLastClosedCashRegister[2],
          formattedDateLastClosedCashRegister[1] - 1,
          formattedDateLastClosedCashRegister[0],
          formattedHourLastClosedCashRegister[0],
          formattedHourLastClosedCashRegister[1],
          formattedHourLastClosedCashRegister[2]
        )
      : new Date(0);
    sales = this._sales.filter((sale) => {
      const formattedDate = sale.date.substring(0, 10).split('/');
      const formattedHour = sale.date.substring(13).split(':');
      const saleDate = new Date(
        formattedDate[2],
        formattedDate[1] - 1,
        formattedDate[0],
        formattedHour[0],
        formattedHour[1],
        formattedHour[2].substring(0,2)
      );

      return lastCashRegisterDate < saleDate && saleDate < new Date();
    });
    let totalCard = 0;
    let totalCash = 0;
    sales.forEach((sale) => {
      totalCard = totalCard + parseFloat(sale.paymentMethod === 'card' ? parseFloat(sale.total) : 0);
      totalCash = totalCash + parseFloat(sale.paymentMethod === 'cash' ? parseFloat(sale.total) : 0);
    });
    if (sales.length) {
      await this._getDataManager().fetch(
        'POST',
        'api/v0/sales/cash-register',
        'dm-post-close-cash-register',
        {
          total: parseFloat(totalCard + totalCash).toFixed(2),
          totalCard: parseFloat(totalCard).toFixed(2),
          totalCash: parseFloat(totalCash).toFixed(2),
        }
      );
    } else {
      dispatchCustomEvent(this, 'dm-post-close-cash-register-success-response', []);
    }
  }

  /**
   * Handles a successful product retrieval and dispatches the event.
   *
   * @param {CustomEvent} event - The API response event.
   */
  _getProductSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-get-product-success-response', detail);
    this._productToEdit = detail;
  }

  /**
   * Filters the cached product list using the current search value.
   * Dispatches the filtered list as a custom event.
   */
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

  /**
   * Adds a product to the sale list by barcode and updates quantities.
   *
   * @param {string} barcode - The barcode to search for.
   */
  getProductToSell(barcode) {
    const registeredProduct = this._products.find(
      (product) =>
        product.barcode === barcode || product.barcodeSecondary === barcode
    );
    const productInList = this._productsToSell.find(
      (product) =>
        product.barcode === barcode || product.barcodeSecondary === barcode
    );
    if (registeredProduct) {
      this._productsToSell = productInList
        ? this._productsToSell.map((product) =>
            product.barcode === barcode || product.barcodeSecondary === barcode
              ? {
                  ...product,
                  quantity:
                    product.stock > product.quantity
                      ? product.quantity + 1
                      : product.quantity,
                }
              : product
          )
        : [...this._productsToSell, {...registeredProduct, quantity: 1}];
    }
    dispatchCustomEvent(this, 'dm-get-product-to-sell', {
      products: this._productsToSell,
      total: this._getTotal(),
    });
  }

  /**
   * Removes a product from the sale list by barcode.
   *
   * @param {string} barcode - The barcode of the product to remove.
   */
  deleteProductToSell(barcode) {
    const productsToSell = this._productsToSell.filter(
      (product) =>
        product.barcode !== barcode && product.barcodeSecondary !== barcode
    );
    this._productsToSell = productsToSell;
    dispatchCustomEvent(this, 'dm-get-product-to-sell', {
      products: this._productsToSell,
      total: this._getTotal(),
    });
  }

  /**
   * Updates the quantity of a product already added to the current sale.
   *
   * @param {string} barcode - The product barcode to update.
   * @param {number} change - The change to apply to the quantity.
   */
  updateProductToSell(barcode, change) {
    this._productsToSell = this._productsToSell.map((product) =>
      product.barcode === barcode || product.barcodeSecondary === barcode
        ? {...product, quantity: Math.max(1, product.quantity + change)}
        : product
    );
    dispatchCustomEvent(this, 'dm-get-product-to-sell', {
      products: this._productsToSell,
      total: this._getTotal(),
    });
  }

  /**
   * Completes the current sale by sending the selected products to the API.
   */
  completeSale(changeToGive, paymentMethod) {
    if (this._productsToSell.length > 0) {
      const sale = {
        products: this._productsToSell,
        total: this._getTotal(),
        date: getCurrentDate(),
        changeToGive,
        paymentMethod,
      };
      this._getDataManager().fetch(
        'POST',
        'api/v0/sales',
        'dm-register-sale',
        sale
      );
    }
  }

  generateReport({startDate, endDate}, sales) {
    const salesInRangeToReport = sales.filter((sale) => {
      const formattedDate = sale.date.substring(0, 10).split('/');
      const saleDate = new Date(
        formattedDate[2],
        formattedDate[1] - 1,
        formattedDate[0]
      );
      const startDateTmp = new Date(
        startDate.year,
        startDate.month - 1,
        startDate.day
      );
      const endDateTmp = new Date(endDate.year, endDate.month - 1, endDate.day);
      return saleDate >= startDateTmp && saleDate <= endDateTmp;
    });
    if (salesInRangeToReport.length) {
      dispatchCustomEvent(this, 'dm-generate-report', {
        listSales: salesInRangeToReport,
        startDate,
        endDate,
        totalSales: salesInRangeToReport.reduce(
          (total, sale) => total + Number(sale.total),
          0
        ),
      });
    } else {
      dispatchCustomEvent(this, 'dm-generate-report-empty');
    }
  }

  _registerSaleSuccessResponse({detail}) {
    this._productsToSell = [];
    this.getProductList();
    this.getSales();
    dispatchCustomEvent(this, 'dm-register-sale-success-response', detail);
  }

  /**
   * Computes the total value of the current sale list.
   *
   * @return {number} The total sale price.
   */
  _getTotal() {
    let total = 0;
    this._productsToSell.forEach(
      (product) => (total += product.price * product.quantity)
    );
    return total;
  }

  /**
   * Handles the product list response from the API manager.
   *
   * @param {CustomEvent} event - The API response event.
   */
  _getProductsSuccessResponse({detail}) {
    this._products = detail;
    dispatchCustomEvent(this, 'dm-get-products-success-response', detail);
  }

  /**
   * Handles a successful product deletion response.
   * Refreshes the product list after deletion.
   *
   * @param {CustomEvent} event - The API response event.
   */
  _deleteProductsSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-delete-product-success-response', detail);
    this.getProductList();
  }

  /**
   * Handles a successful product edit response.
   * Refreshes the product list after editing.
   *
   * @param {CustomEvent} event - The API response event.
   */
  _editProductSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-edit-product-success-response', detail);
    this.getProductList();
  }

  _getSalesSuccessResponse({detail}) {
    this._sales = detail;
    dispatchCustomEvent(this, 'dm-get-sales-success-response', this._sales);
  }

  _getCloseCashRegisterSuccessResponse({detail}) {
    this._cashRegisterClosing = detail;
    dispatchCustomEvent(
      this,
      'dm-get-close-cash-register-success-response',
      this._cashRegisterClosing
    );
  }

  _postCloseCashRegisterSuccessResponse({detail}){
    this.getCloseCashRegister();
    dispatchCustomEvent(this,'dm-post-close-cash-register-success-response')
  }

  /**
   * Template getter for the internal API manager element.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplApiManager() {
    return html`
      <api-manager-element
        @api-dm-post-close-cash-register-success-response="${this
          ._postCloseCashRegisterSuccessResponse}"
        @api-dm-get-sales-success-response=${this._getSalesSuccessResponse}
        @api-dm-get-close-cash-register-success-response=${this
          ._getCloseCashRegisterSuccessResponse}
        @api-dm-delete-product-success-response=${this
          ._deleteProductsSuccessResponse}
        @api-dm-edit-product-success-response=${this
          ._editProductSuccessResponse}
        @api-dm-get-product-success-response=${this._getProductSuccessResponse}
        @api-dm-get-products-success-response=${this
          ._getProductsSuccessResponse}
        @api-dm-register-sale-success-response=${this
          ._registerSaleSuccessResponse}
      ></api-manager-element>
    `;
  }

  /**
   * Renders the manager element.
   *
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html` ${this._tplApiManager} `;
  }
}

window.customElements.define('manager-element', ManagerElement);
