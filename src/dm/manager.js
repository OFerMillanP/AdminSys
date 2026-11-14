import {LitElement, html} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {ApiManagerElement} from '../dm/apiManager.js';

import {dispatchCustomEvent, getCurrentDate} from '../../utils/utils.js';

/**
 * Manager layer element.
 *
 * Encapsulates API calls and local cache management for products, sales, and login.
 *
 * @fires dm-get-product-success-response
 * @fires dm-get-products-success-response
 * @fires dm-delete-product-success-response
 * @fires dm-edit-product-success-response
 * @fires dm-get-product-to-sell - Carries `{products, total}` for the current sale.
 * @fires dm-posible-products - Carries checkout product suggestions.
 * @fires dm-sort-products - Carries sorted product pages.
 * @fires dm-get-sales-success-response
 * @fires dm-get-close-cash-register-success-response
 * @fires dm-post-close-cash-register-success-response
 * @fires dm-register-sale-success-response
 * @fires dm-database-backup-success-response
 * @fires dm-database-backup-handle-error
 * @fires dm-generate-report
 * @fires dm-generate-report-empty
 * @listens api-dm-post-close-cash-register-success-response
 * @listens api-dm-database-backup-success-response
 * @listens api-dm-database-backup-handle-error
 * @listens api-dm-generate-report-success-response
 * @listens api-dm-get-sales-success-response
 * @listens api-dm-get-close-cash-register-success-response
 * @listens api-dm-delete-product-success-response
 * @listens api-dm-edit-product-success-response
 * @listens api-dm-get-product-success-response
 * @listens api-dm-get-products-success-response
 * @listens api-dm-register-sale-success-response
 * @listens api-dm-update-password-success-response
 * @property {{order: string, by: string}} _configProductsSorted - Cached product sorting field and direction.
 */
export class ManagerElement extends ScopedElementsMixin(LitElement) {
  /** @returns {string} Registered tag name for the data manager. */
  static get is() {
    return 'manager-element';
  }

  /** @returns {Object} API element registered in this component's scope. */
  static get scopedElements() {
    return {
      'api-manager-element': ApiManagerElement,
    };
  }

  /** @returns {Object} Reactive API inputs and private data caches. */
  static get properties() {
    return {
      /**
       * Search criteria supplied to the data manager.
       * @type {Object}
       * @attribute producttosearch
       */
      productToSearch: {
        type: Object,
      },
      /**
       * Password used during login.
       * @type {string}
       */
      password: {
        type: String,
        attribute: 'password',
      },
      /**
       * Username used during login.
       * @type {string}
       */
      user: {
        type: String,
        attribute: 'user',
      },
      /**
       * Cached cash register closing records.
       * @type {Array<Object>}
       * @state
       */
      _cashRegisterClosing: {
        type: Array,
        state: true,
      },
      /**
       * The product selected for editing.
       * @type {Object}
       * @state
       */
      _productToEdit: {
        type: Object,
        state: true,
      },
      /**
       * Cached list of products retrieved from the API.
       * @type {Array<Object>}
       * @state
       */
      _products: {
        type: Array,
        state: true,
      },
      /**
       * Products currently added to the sale transaction.
       * @type {Array<Object>}
       * @state
       */
      _productsToSell: {
        type: Array,
        state: true,
      },
      /**
       * Raw response data from the API.
       * @type {Object}
       * @state
       */
      _responseData: {
        type: String,
        state: true,
      },
      /**
       * Cached list of sales retrieved from the API.
       * @type {Array<Object>}
       * @state
       */
      _sales: {
        type: Array,
        state: true,
      },
    };
  }

  /** Initializes API inputs, caches, and the product sorting configuration. */
  constructor() {
    super();
    this.password = '';
    this.productToSearch = {};
    this.user = '';
    this._cashRegisterClosing = [];
    this._configProductsSorted = {
      order: 'none',
      by: 'none'
    }
    this._productToEdit = {};
    this._products = [];
    this._productsToSell = [];
    this._responseData = {};
    this._sales = [];
  }

  /**
   * Checks whether a user session is active after the first render.
   *
   * @override
   */
  firstUpdated() {
    super.firstUpdated();
    this._sessionActive();
  }

  /**
   * Called when reactive properties change; no additional update work is
   * currently needed by the data manager.
   *
   * @param {Map} changedProperties - The changed reactive properties.
   * @override
   */
  updated(changedProperties) {
    super.updated(changedProperties);
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
   * Sends a password update request for the current user.
   *
   * @param {Object} body - Current and replacement password values.
   * @returns {Promise<void>}
   */
  async requestChangePassowrd(body) {
    await this._getDataManager().fetch(
      'POST',
      'api/v0/users/user/password',
      'dm-update-password',
      body
    );
  }

  /**
   * Loads a product by its identifier.
   * Looks up a product in the local cache when it is empty; otherwise requests
   * the selected product from the API.
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
    const {img, ...productData} = product;
    let body = productData;
    if (img) {
      body = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        body.append(
          key,
          value !== null && typeof value === 'object'
            ? JSON.stringify(value)
            : String(value)
        );
      });
      body.append('img', img);
    }
    await this._getDataManager().fetch(
      'PATCH',
      `api/v0/products/product/${product.id}`,
      'dm-edit-product',
      body
    );
  }

  /**
   * Requests all registered sales from the API.
   *
   * @returns {Promise<void>}
   */
  async getSales() {
    await this._getDataManager().fetch('GET', 'api/v0/sales', 'dm-get-sales');
  }

  /**
   * Requests cash register closing records from the API.
   *
   * @returns {Promise<void>}
   */
  async getCloseCashRegister() {
    await this._getDataManager().fetch(
      'GET',
      'api/v0/sales/cash-register',
      'dm-get-close-cash-register'
    );
  }

  /**
   * Requests a cash register closing from the API.
   *
   * @returns {Promise<void>}
   */
  async postCloseCashRegister() {
    await this._getDataManager().fetch(
      'POST',
      'api/v0/sales/cash-register',
      'dm-post-close-cash-register'
    );
  }

  /**
   * Forwards a selected product response and caches the selected product.
   *
   * @param {CustomEvent} event - The API response event.
   * @param {Object} event.detail - Retrieved product data.
   * @fires dm-get-product-success-response
   */
  _getProductSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-get-product-success-response', detail);
    this._productToEdit = detail;
  }

  /**
   * Logs out when the API confirms a password change.
   */
  _changePasswordSuccesResponse() {
    this.logout();
  }

  /**
   * Adds a product to the sale list by barcode and updates quantities.
   *
   * @param {string} barcode - The barcode to search for.
   * @fires dm-get-product-to-sell - Emits `{products, total}` after updating.
   */
  getProductToSell(barcode) {
    const registeredProduct = this._products.find(
      (product) =>
        (product.barcode === barcode ||
          product.name.toUpperCase() === barcode.toUpperCase()) ||
          product.barcodeList.find((barcodeObj) => barcodeObj.barcode === barcode)
    );
    const productInList = this._productsToSell.find(
      (product) =>
        (product.barcode === barcode ||
          product.name.toUpperCase() === barcode.toUpperCase()) ||
          product.barcodeList.find((barcodeObj) => barcodeObj.barcode === barcode)
    );
    if (registeredProduct) {
      this._productsToSell = productInList
        ? this._productsToSell.map((product) =>
            (product.barcode === barcode ||
              product.name.toUpperCase() === barcode.toUpperCase()) ||
              product.barcodeList.find((barcodeObj) => barcodeObj.barcode === barcode)
              ? {
                  ...product,
                  quantity:
                    product.stock > product.quantity
                      ? product.quantity + 1
                      : product.quantity,
                }
              : product
          )
        : (Number(registeredProduct.stock) > 0) || (registeredProduct.stock === '0' && registeredProduct.category === '1')
        ? [...this._productsToSell, {...registeredProduct, quantity: 1}]
        : this._productsToSell;
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
   * @fires dm-get-product-to-sell - Emits `{products, total}` after updating.
   */
  deleteProductToSell(barcode) {
    const productsToSell = this._productsToSell.filter(
      (product) =>
        product.barcode !== barcode &&
      !product.barcodeList.find((barcodeObj) => barcodeObj.barcode === barcode)
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
   * @fires dm-get-product-to-sell - Emits `{products, total}` after updating.
   */
  updateProductToSell(barcode, change) {
    this._productsToSell = this._productsToSell.map((product) =>
      product.barcode === barcode || product.barcodeList.find((barcodeObj) => barcodeObj.barcode === barcode)
        ? {...product, quantity: Math.max(1, product.quantity + change)}
        : product
    );
    dispatchCustomEvent(this, 'dm-get-product-to-sell', {
      products: this._productsToSell,
      total: this._getTotal(),
    });
  }

  /**
   * Submits the current sale when at least one product is selected.
   *
   * @param {number|string} changeToGive - Change due to the customer.
   * @param {string} paymentMethod - Payment method used for the sale.
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

  /**
   * Requests a sales report for an inclusive calendar date range.
   *
   * @param {Object} dateRange - Report start and end dates.
   * @param {{year: number|string, month: number|string, day: number|string}} dateRange.startDate - First report date.
   * @param {{year: number|string, month: number|string, day: number|string}} dateRange.endDate - Last report date.
   * @returns {Promise<void>}
   */
  generateReport(dateRange) {
    return this._getDataManager().fetch(
      'POST',
      'api/v0/sales/report',
      'dm-generate-report',
      dateRange
    );
  }

  /**
   * Emits the report for printing or signals that the selected range is empty.
   *
   * @param {CustomEvent} event - Report API success event.
   * @param {Object} event.detail - Report data including the sales list.
   * @fires dm-generate-report
   * @fires dm-generate-report-empty
   */
  _generateReportSuccessResponse({detail}) {
    if (detail.listSales.length) {
      dispatchCustomEvent(this, 'dm-generate-report', detail);
    } else {
      dispatchCustomEvent(this, 'dm-generate-report-empty');
    }
  }

  /**
   * Finds product suggestions by name or barcode, optionally including description.
   *
   * @param {string} keyWord - Search text.
   * @param {boolean} [isProductsPage=false] - Whether to return product pages
   *   and include product descriptions in matching.
   * @fires dm-get-products-success-response - When searching from the products page.
   * @fires dm-posible-products - When requesting checkout suggestions.
   */
  getPosibleProducts(keyWord, isProductsPage = false) {
    const normalize = (value) => value.toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const normalizedKeyword = normalize(keyWord);
    const keywords = normalizedKeyword.trim().split(/\s+/).filter(Boolean);
    const productsList = this._products.filter((product) => {
      const normalizedName = normalize(product.name);
      const matchesName = keywords.every((keyword) =>
        normalizedName.includes(keyword)
      );
      let matchesDescription = false;
      if (isProductsPage) {
        const normalizedDescription = normalize(product.description);
        matchesDescription = keywords.every((keyword) =>
          normalizedDescription.includes(keyword)
        );
      }
      const matchesBarcode = product.barcode
        .toUpperCase()
        .includes(normalizedKeyword) ||
        product.barcodeList.some((barcode) =>
          barcode.barcode?.toUpperCase().includes(normalizedKeyword)
        );

      return matchesName || matchesBarcode || matchesDescription;
    });
    if (isProductsPage) {
      dispatchCustomEvent(
        this,
        'dm-get-products-success-response',
        keywords.length ? this._sliceProducts(productsList) : this._sliceProducts(this._products)
      );
    } else {
      dispatchCustomEvent(
        this,
        'dm-posible-products',
        keywords.length ? productsList : []
      );
    }
  }

  /**
   * Clears the current sale, refreshes inventory and sales, and forwards success.
   *
   * @param {CustomEvent} event - Successful sale response from the API.
   * @param {Object} event.detail - The saved sale.
   * @fires dm-register-sale-success-response
   */
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
   * Caches the full product list and forwards the list divided into pages.
   *
   * @param {CustomEvent} event - Product list API response.
   * @param {Array<Object>} event.detail - Registered products.
   * @fires dm-get-products-success-response
   */
  _getProductsSuccessResponse({detail}) {
    this._products = detail;
    dispatchCustomEvent(this, 'dm-get-products-success-response', this._sliceProducts(detail));
  }

  /**
   * Divides a list into pages of at most 20 entries.
   *
   * @param {Array} list - Values to paginate.
   * @returns {Array<Array>} Pages of values.
   */
  _sliceProducts(list) {
    let products = [];
    for (let i = 0; i < list.length; i += 20) {
      products.push(list.slice(i, i + 20));
    }
    return products
  }

  /**
   * Handles a successful product deletion response.
   * Refreshes the product list after deletion.
   *
   * @param {CustomEvent} event - The API response event.
   * @param {boolean} event.detail - Whether deletion succeeded.
   * @fires dm-delete-product-success-response
   */
  _deleteProductsSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-delete-product-success-response', detail);
    this.getProductList();
  }

  /**
   * Handles a successful product edit response.
   *
   * @param {CustomEvent} event - The API response event.
   * @param {Object} event.detail - Updated product returned by the API.
   * @fires dm-edit-product-success-response
   */
  _editProductSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-edit-product-success-response', detail);
  }

  /**
   * Stores and forwards the sales list returned by the API.
   *
   * @param {CustomEvent} event - Sales API response.
   * @param {Array<Object>} event.detail - Registered sales.
   * @fires dm-get-sales-success-response
   */
  _getSalesSuccessResponse({detail}) {
    this._sales = detail;
    dispatchCustomEvent(this, 'dm-get-sales-success-response', this._sales);
  }

  /**
   * Stores and forwards cash register closing records from the API.
   *
   * @param {CustomEvent} event - Closing list API response.
   * @param {Array<Object>} event.detail - Closing records.
   * @fires dm-get-close-cash-register-success-response
   */
  _getCloseCashRegisterSuccessResponse({detail}) {
    this._cashRegisterClosing = detail;
    dispatchCustomEvent(
      this,
      'dm-get-close-cash-register-success-response',
      this._cashRegisterClosing
    );
  }

  /**
   * Refreshes the closing history and notifies listeners after an API success.
   *
   * @fires dm-post-close-cash-register-success-response
   */
  _postCloseCashRegisterSuccessResponse(){
    this.getCloseCashRegister();
    dispatchCustomEvent(this,'dm-post-close-cash-register-success-response')
  }

  /**
   * Cycles sorting direction for a product field and emits the result.
   *
   * @param {Object} options - Product sorting options.
   * @param {string} options.sortBy - Product field to sort by.
   * @fires dm-sort-products - Emits product pages in the selected order.
   */
  sortProductsBy({sortBy}){
    let productsSorted = [];
    this._configProductsSorted.order = 
      this._configProductsSorted.by !== sortBy ? 
      'none' : 
      this._configProductsSorted.order;
    this._configProductsSorted.by = sortBy;
    const orders = {
      asc: () => {
        this._configProductsSorted.order = 'desc';
        productsSorted = 
          sortBy === 'price' || sortBy === 'stock' ?
          this._products.toSorted((a, b) => b[sortBy] - a[sortBy]) :
          this._products.toSorted((a, b) => b[sortBy].localeCompare(a[sortBy]));
      },
      desc: () => {
        this._configProductsSorted.order = 'none';
        productsSorted = this._products;
      },
      none: () => {
        this._configProductsSorted.order = 'asc';
        productsSorted = 
          sortBy === 'price' || sortBy === 'stock' ?
          this._products.toSorted((a, b) => a[sortBy] - b[sortBy]) :
          this._products.toSorted((a, b) => a[sortBy].localeCompare(b[sortBy]));
      }
    };
    orders[this._configProductsSorted.order].call();
    dispatchCustomEvent(this,'dm-sort-products', this._sliceProducts(productsSorted));
  }

  /**
   * Requests an image of the specified barcode from the API.
   *
   * @param {string} barcode - Barcode value to generate.
   * @returns {Promise<void>}
   */
  async postGenerateBarcode(barcode) {
    await this._getDataManager().fetch(
      'POST',
      `api/v0/barcode/generate`,
      'dm-generate-barcode',
      { barcode: barcode }
    );
  }

  /**
   * Requests that the separate service open the cash drawer.
   *
   * @return {Promise<void>}
   */
  async openCashRegister() {
    await this._getDataManager().fetch(
      'GET',
      `api/v0/open-register`,
      'dm-open-cash-register',
      true,
      'http://localhost:8101/'
    );
  }

  /**
   * Requests a database backup from the API.
   *
   * @returns {Promise<void>}
   */
  async backupDatabase() {
    await this._getDataManager().fetch(
      'POST',
      'api/v0/database/backup',
      'dm-database-backup'
    );
  }

  /** Forwards a completed database backup response to the application. */
  _databaseBackupSuccessResponse({detail}) {
    dispatchCustomEvent(this, 'dm-database-backup-success-response', detail);
  }

  /** Forwards a database backup error response to the application. */
  _databaseBackupHandleError({detail}) {
    dispatchCustomEvent(this, 'dm-database-backup-handle-error', detail);
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
        @api-dm-database-backup-success-response=${this
          ._databaseBackupSuccessResponse}
        @api-dm-database-backup-handle-error=${this
          ._databaseBackupHandleError}
        @api-dm-generate-report-success-response=${this
          ._generateReportSuccessResponse}
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
        @api-dm-logout-success-response=${() => {window.location.reload();}}
        @api-dm-update-password-success-response=${this._changePasswordSuccesResponse}
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
