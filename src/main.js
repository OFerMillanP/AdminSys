import {LitElement, html, nothing} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {LoginElement} from './login/login.js';
import {HomeElement} from './home/home.js';
import {ManagerElement} from './dm/manager.js';

import '@material/mwc-button/mwc-button.js';
import '@material/mwc-formfield/mwc-formfield.js';
import '@material/mwc-icon-button/mwc-icon-button.js';
import '@material/mwc-icon/mwc-icon.js';
import '@material/mwc-radio/mwc-radio.js';
import '@material/mwc-tab-bar/mwc-tab-bar.js';
import '@material/mwc-tab/mwc-tab.js';
import '@material/mwc-textarea/mwc-textarea.js';
import '@material/mwc-textfield/mwc-textfield.js';
import '@material/mwc-select/mwc-select.js';
import '@material/mwc-list/mwc-check-list-item.js';
import '@material/mwc-menu/mwc-menu.js';

import styles from './main.css.js';

import {ticketTplToPrint, getCurrentDate, getCurrentLocale, t} from '../utils/utils.js';
/**
 * Main application root element.
 *
 * Manages authentication state, routes between the login and home views,
 * and coordinates data exchange with the manager layer.
 *
 * @listens login-page-request-login
 * @listens home-page-logout
 * @listens home-element-get-sales
 * @listens modal-element-confirm-action-success-complete-sale
 * @listens modal-element-confirm-action-success-register
 * @listens products-element-close-edit-modal
 * @listens products-element-close-success-edit-modal
 * @listens products-element-delete-product
 * @listens products-element-edit-product
 * @listens products-element-search-product
 * @listens products-element-select-product-to-edit
 * @listens products-element-sort-products
 * @listens products-element-toggle-barcodes
 * @listens products-element-toggle-image
 * @listens register-page-close-error-modal
 * @listens register-page-register-product
 * @listens sales-element-close-cash-register
 * @listens sales-element-generate-report
 * @listens sales-element-print-ticket
 * @listens sales-element-toggle-products
 * @listens sell-element-clean-posible-products
 * @listens sell-element-complete-sale
 * @listens sell-element-delete-product-to-sell
 * @listens sell-element-get-posible-product
 * @listens sell-element-get-product-to-sell
 * @listens sell-element-print-ticket
 * @listens sell-element-update-product-to-sell
 * @listens tools-element-request-change-password
 * @listens tools-element-request-generate-barcode
 * @listens tools-element-request-backup-db
 * @listens dm-database-backup-success-response
 * @listens dm-database-backup-handle-error
 * @listens api-dm-login-success-response
 * @listens api-dm-login-handle-error
 * @listens api-dm-session-active-success-response
 * @listens api-dm-session-active-handle-error
 * @listens api-dm-register-product-success-response
 * @listens api-dm-register-product-handle-error
 * @listens api-dm-edit-product-handle-error
 * @listens api-dm-generate-barcode-success-response
 * @listens dm-delete-product-success-response
 * @listens dm-edit-product-success-response
 * @listens dm-generate-report
 * @listens dm-get-close-cash-register-success-response
 * @listens dm-get-product-success-response
 * @listens dm-get-product-to-sell
 * @listens dm-get-products-success-response
 * @listens dm-get-sales-success-response
 * @listens dm-post-close-cash-register-success-response
 * @listens dm-register-sale-success-response
 * @listens dm-posible-products
 * @listens dm-sort-products
 */
export class MainElement extends ScopedElementsMixin(LitElement) {
  /** @returns {string} Registered tag name for the application root. */
  static get is() {
    return 'main-element';
  }

  /** @returns {Object} Custom elements scoped to the application root. */
  static get scopedElements() {
    return {
      'login-element': LoginElement,
      'home-element': HomeElement,
      'manager-element': ManagerElement,
    };
  }

  /** @returns {Object} Internal reactive application state. */
  static get properties() {
    return {
      /**
       * Cash register closing records available to the sales view.
       * @type {Array<Object>}
       * @state
       */
      _closedCashRegisters: {
        type: Array,
        state: true,
      },
      /**
       * Sale response retained while its success dialog and ticket are shown.
       * @type {Object}
       * @state
       */
      _completeSaleSuccess: {
        type: Object,
        state: true,
      },
      /**
       * Whether the last product deletion operation succeeded.
       */
      _deleteProductSuccess: {
        type: Boolean,
        state: true,
      },
      /**
       * Error payload returned by the last unsuccessful product edit.
       * @type {Object}
       * @state
       */
      _editProductErrorResponse: {
        type: Object,
        state: true,
      },
      /**
       * Whether the last product edit succeeded.
       * @type {boolean}
       * @state
       */
      _editProductSuccess: {
        type: Boolean,
        state: true,
      },
      /**
       * Most recently generated barcode response.
       * @type {Object}
       * @state
       */
      _generatedBarcode: {
        type: Object,
        state: true
      },
      /**
       * Whether the most recent cash register closing contained no sales.
       * @type {boolean}
       * @state
       */
      _isEmptyReport: {
        type: Boolean,
        state: true,
      },
      /**
       * Whether the user is logged in.
       * @type {boolean}
       * @state
       */
      _isLogged: {
        type: Boolean,
        state: true,
      },
      /**
       * Error code returned from a failed login attempt.
       * @type {string}
       * @state
       */
      _loginErrorCode: {
        type: String,
        state: true,
      },
      /**
       * Reference to the manager element for API communication.
       * @type {import('lit/directives/ref.js').Ref}
       * @state
       */
      _managerRef: {
        type: Object,
        state: true,
      },
      /**
       * Product suggestions matching the current search.
       * @type {Array<Object>}
       * @state
       */
      _posibleProducts: {
        type: Array,
        state: true,
      },
      /**
       * The product currently selected for editing.
       * @type {Object}
       * @state
       */
      _productToEdit: {
        type: Object,
        state: true,
      },
      /**
       * Barcode used to request a product for sale.
       * @type {string}
       * @state
       */
      _productToSell: {
        type: String,
        state: true,
      },
      /**
       * Cached list of products available in the inventory.
       * @type {Array<Array<Object>>}
       * @state
       */
      _products: {
        type: Array,
        state: true,
      },
      /**
       * List of products currently added to the sale transaction.
       * @type {Array<Object>}
       * @state
       */
      _productsToSell: {
        type: Array,
        state: true,
      },
      /**
       * Error details from a failed product registration.
       * @type {Object}
       * @state
       */
      _registerError: {
        type: Object,
        state: true,
      },
      /**
       * Whether the last product registration succeeded.
       * @type {boolean}
       * @state
       */
      _registerProductSuccess: {
        type: Boolean,
        state: true,
      },
      /**
       * Whether to show the sale completion ticket.
       * @type {boolean}
       * @state
       */
      _showTicket: {
        type: Boolean,
        state: true,
      },
      /**
       * List of completed sales transactions.
       * @type {Array<Array<Object>>}
       * @state
       */
      _sales: {
        type: Array,
        state: true,
      },
      /**
       * Total amount calculated for the current sale.
       * @type {number}
       * @state
       */
      _total: {
        type: Number,
        state: true,
      },
      /**
       * Current authenticated user data and permissions.
       * @type {Object}
       * @property {string} _userData.name - User's first name.
       * @property {string} _userData.lastName - User's last name.
       * @property {string} _userData.level - User access level.
       * @property {boolean} _userData.changePassword - Whether password change is required.
       * @state
       */
      _userData: {
        type: Object,
        state: true,
      },
    };
  }

  /**
   * Initializes application state and sets the document language.
   */
  constructor() {
    super();
    document.documentElement.lang = getCurrentLocale();
    this._closedCashRegisters = [];
    this._completeSaleSuccess = {};
    this._deleteProductSuccess = false;
    this._editProductErrorResponse = {};
    this._editProductSuccess = false;
    this._generatedBarcode = {};
    this._isEmptyReport = false;
    this._isLogged = false;
    this._loginErrorCode = '';
    this._managerRef = createRef();
    this._posibleProducts = [];
    this._productToEdit = {};
    this._productToSell = '';
    this._products = [];
    this._productsToSell = [];
    this._registerError = {};
    this._registerProductSuccess = false;
    this._sales = [];
    this._showTicket = false;
    this._total = 0;
    this._userData = {
      name: '',
      level: '',
      changePassword: false
    };
  }

  /**
   * Requests login through the data manager.
   *
   * @param {CustomEvent} event - The login request event.
   * @param {Object} event.detail - The login payload.
   */
  _requestLoginToApi({detail}) {
    this._managerRef.value.login(detail);
  }

  /**
   * Handles successful login responses from the manager.
   * Updates the user data and logged-in state.
   *
   * @param {CustomEvent} event - The login response event.
   * @param {Object} event.detail - The user data response.
   */
  _loginSuccessResponse({detail}) {
    this._userData.level = detail.level;
    this._userData.name = detail.name;
    this._isLogged = !!Object.keys(detail).length && !!detail.level;
    this._managerRef.value.getProductList();
    this._getSales();
    this._managerRef.value.getCloseCashRegister();
  }

  /**
   * Handles an active session response from the manager.
   * Reconstructs the current user session state.
   *
   * @param {CustomEvent} event - The session response event.
   * @param {Object} event.detail - The current user data.
   * @param {string} event.detail.level - User access level.
   * @param {string} event.detail.name - User's first name.
   * @param {string} event.detail.last_name - User's last name.
   * @param {boolean} event.detail.change_password - Whether a password update is required.
   */
  _getUserInSessionSuccesResponse({detail}) {
    this._userData.level = detail.level;
    this._userData.name = detail.name;
    this._userData.lastName = detail.last_name;
    this._userData.changePassword = detail.change_password;
    this._isLogged = !!Object.keys(detail).length;
    if (this._isLogged) {
      this._managerRef.value.getProductList();
      this._getSales();
    }

    if (this._isLogged && detail.level === 'admin') {
      this._managerRef.value.getCloseCashRegister();
    }
  }

  /**
   * Clears the authenticated state when the session check fails.
   *
   * @param {CustomEvent} event - Session check error event.
   */
  _getUserInSessionHandleErrorResponse(){
    this._isLogged = false;
  }

  /**
   * Handles login errors from the manager.
   * Stores the error state so the login view can display it.
   *
   * @param {CustomEvent} event - The login error event.
   * @param {Object} event.detail - The error detail.
   * @param {boolean} event.detail.status - The login status.
   * @param {string} event.detail.code - The error code.
   */
  _loginHandleError({detail}) {
    this._isLogged = detail.status;
    this._loginErrorCode = detail.code;
  }

  /**
   * Logs out the current user and clears session state.
   */
  _logout() {
    this._loginErrorCode = '';
    this._isLogged = false;
    this._managerRef.value.logout();
  }

  /**
   * Sends a new product registration request to the manager.
   *
   * @param {CustomEvent} event - The register request event.
   * @param {Object} event.detail - The product to register.
   */
  _registerProduct({detail}) {
    this._managerRef.value.createProduct(detail);
  }

  /**
   * Handles successful product registration responses.
   * Refreshes the product list after registration.
   *
   * @param {CustomEvent} event - The registration success event.
   * @param {Object} event.detail - The response detail.
   */
  _registerProductSuccessResponse({detail}) {
    this._registerProductSuccess = !!Object.keys(detail).length;
    this._managerRef.value.getProductList();
  }

  /**
   * Handles product registration errors.
   *
   * @param {CustomEvent} event - The registration error event.
   * @param {Object} event.detail - The error payload.
   */
  _registerProductHandleError({detail}) {
    this._registerError = detail;
  }

  /**
   * Updates the delete success flag when a product is removed.
   *
   * @param {CustomEvent} event - The delete success event.
   * @param {boolean} event.detail - The deletion result.
   */
  _deleteProductSuccessResponse({detail}) {
    this._deleteProductSuccess = !!detail;
  }

  /**
   * Updates the edit success flag when a product is updated.
   *
   * @param {CustomEvent} event - The edit success event.
   * @param {Object} event.detail - Updated product returned by the API.
   */
  _editProductSuccessResponse({detail}) {
    this._managerRef.value.getProductList();
    this._editProductSuccess = !!detail;
  }

  /**
   * Stores the error returned by a failed product edit request.
   *
   * @param {CustomEvent} event - Product edit error event.
   * @param {Object} event.detail - Error response data.
   */
  _editProductHandleErrorResponse({detail}) {
    this._editProductErrorResponse = detail;
  }

  /**
   * Stores the loaded product list in component state.
   *
   * @param {CustomEvent} event - The products success event.
   * @param {Array<Array<Object>>} event.detail - Product pages returned by the manager.
   */
  _getProductsSuccessResponse({detail}) {
    this._products = detail;
  }

  /**
   * Stores the search criteria used by the product list.
   *
   * @param {CustomEvent} event - The product search event.
   * @param {Object} event.detail - The search payload.
   */
  _searchProduct({detail: {value}}) {
    this._managerRef.value.getPosibleProducts(value.toUpperCase(), true);
  }

  /**
   * Requests a product to sell by barcode from the manager.
   *
   * @param {CustomEvent} event - The sell search event.
   * @param {Object} event.detail - The event payload.
   * @param {string} event.detail.barcode - The barcode to sell.
   */
  _searchProductToSell({detail: {barcode}}) {
    this._productToSell = barcode;
    this._managerRef.value.getProductToSell(barcode);
    this._posibleProducts = [];
  }

  /**
   * Requests deletion of a product from the sale list.
   *
   * @param {CustomEvent} event - The delete product to sell event.
   * @param {Object} event.detail - The event payload.
   * @param {string} event.detail.barcode - The barcode to remove.
   */
  _deleteProductToSell({detail: {barcode}}) {
    this._managerRef.value.deleteProductToSell(barcode);
  }

  /**
   * Requests an update to the quantity of a product in the sale list.
   *
   * @param {CustomEvent} event - The update event.
   * @param {Object} event.detail - The event payload.
   * @param {string} event.detail.barcode - The barcode of the product to update.
   * @param {number} event.detail.change - The quantity change to apply.
   */
  _updateProductToSell({detail: {barcode, change}}) {
    this._managerRef.value.updateProductToSell(barcode, change);
  }

  /**
   * Triggers the manager to complete the current sale.
   */
  _completeSale({detail: {changeToGive, paymentMethod}}) {
    this._managerRef.value.completeSale(changeToGive, paymentMethod);
  }

  /**
   * Requests deletion of a product from the inventory.
   *
   * @param {CustomEvent} event - The product delete event.
   * @param {Object} event.detail - The event payload.
   */
  _deleteProduct({detail}) {
    this._managerRef.value.deleteProduct(detail);
  }

  /**
   * Requests the manager to load a selected product for editing.
   *
   * @param {CustomEvent} event - The select product event.
   * @param {Object} event.detail - The selected product identifier.
   */
  _selectProductToEdit({detail}) {
    this._managerRef.value.getProductById(detail);
  }

  /**
   * Updates the selected product to edit.
   *
   * @param {CustomEvent} event - The set product event.
   * @param {Object} event.detail - The selected product data.
   */
  _setProductToEdit({detail}) {
    this._productToEdit = detail;
  }

  /**
   * Sends an edit request for a product to the manager.
   *
   * @param {CustomEvent} event - The edit product event.
   * @param {Object} event.detail - The edited product data.
   */
  async _editProduct({detail: product}) {
    await this._managerRef.value.editProduct(product);
  }

  /**
   * Closes the edit success modal by clearing the selected product.
   */
  _closeEditModal() {
    this._productToEdit = {};
    this._editProductSuccess = false;
    this._editProductErrorResponse = {};
  }

  /**
   * Closes the error modal by clearing the registration error.
   */
  _closeErrorModal() {
    this._registerError = {};
  }

  /**
   * Updates the sale list and total from the manager response.
   *
   * @param {CustomEvent} event - The sale list update event.
   * @param {Object} event.detail - The event payload.
   * @param {Array} event.detail.products - The products to sell.
   * @param {number} event.detail.total - The sale total.
   */
  _setListProductToSell({detail: {products, total}}) {
    this._productsToSell = products;
    this._total = total;
  }

  /**
   * Stores the sale returned after a successful checkout.
   *
   * @param {CustomEvent} event - The sale success event.
   * @param {Object} event.detail - The sale response payload.
   */
  _registerSaleSuccessResponse({detail}) {
    this._completeSaleSuccess = detail;
  }

  /**
   * Stores product suggestions received from the manager.
   *
   * @param {CustomEvent} event - Product search result event.
   * @param {Array<Object>} event.detail - Matching products.
   */
  _setPosibleProducts({detail}) {
    this._posibleProducts = detail;
  }

  /**
   * Stores the sorted pages returned by the manager.
   *
   * @param {CustomEvent} event - Product sorting result event.
   * @param {Array<Array<Object>>} event.detail - Sorted product pages.
   */
  _setSortedProducts({detail}) {
    this._products = detail;
  }

  /**
   * Closes the complete sale success modal and resets sale state.
   */
  async _closeCompleteSaleSuccessModal() {
    this._completeSaleSuccess = {};
    this._productsToSell = [];
    this._total = 0;
    this._managerRef.value.openCashRegister();
  }

  /**
   * Clears the product registration success state.
   */
  _closeRegisterSuccessModal(){
    this._registerProductSuccess = false;
  }

  /**
   * Forwards a barcode generation request unless the value is already current.
   *
   * @param {CustomEvent} event - Barcode generation request event.
   * @param {string} event.detail - Barcode value.
   */
  _requestGenerateBarcode({detail}) {
    if (this._generatedBarcode.barcode !== detail) {
      this._managerRef.value.postGenerateBarcode(detail);
    }
  }

  /** Requests a database backup through the manager. */
  _requestDatabaseBackup() {
    this._managerRef.value.backupDatabase();
  }

  /** Shows the localized result of a successful database backup. */
  _databaseBackupSuccessResponse() {
    window.alert(t('tools-element-backup-success'));
  }

  /** Shows a localized error when the database backup fails. */
  _databaseBackupHandleError() {
    window.alert(t('tools-element-backup-error'));
  }

  /**
   * Forwards the password change request to the manager.
   *
   * @param {CustomEvent} event - Password change request event.
   * @param {Object} event.detail - Current and replacement password values.
   */
  _requestChangePassword({detail}){
    this._managerRef.value.requestChangePassowrd(detail);
  }

  /**
   * Updates local state with a newly generated barcode.
   *
   * @param {CustomEvent} event - Barcode API success event.
   * @param {string} event.detail - Generated barcode value.
   */
  _generateBarcodeSuccessResponse({detail}) {
    if (this._generatedBarcode.barcode !== detail) {
      this._generatedBarcode = {...this._generatedBarcode, barcode: detail};
    }
  }

  /**
   * Opens the connected cash drawer through the manager service.
   */
  _openCahsRegister() {
    this._managerRef.value.openCashRegister();
  }

  /**
   * Requests product suggestions for the supplied search text.
   *
   * @param {CustomEvent} event - Product suggestion request event.
   * @param {string} event.detail - Search text.
   */
  _getPosibleProductsList({detail}) {
    this._managerRef.value.getPosibleProducts(detail)
  }

  /**
   * Generates the sale ticket and opens the print dialog.
   *
   * @param {CustomEvent} event - The event containing the sale.
   * @param {Object} event.detail - Sale data to print.
   */
  _printTicket({detail}) {
    let sales = detail;
    if( sales.type === 'current-sale') {
      sales.id = this._completeSaleSuccess.id;
      sales.date = this._completeSaleSuccess.date;
      sales.paymentMethod = this._completeSaleSuccess.paymentMethod;
      sales.changeToGive = this._completeSaleSuccess.changeToGive;
    }
    this._showTicket = true;
    var contenidoOriginal = document.body.innerHTML;
    setTimeout(() => {

      if ( detail.paymentMethod === 'card') {
        document.body.innerHTML = ticketTplToPrint(
          this._tplTicket(sales) + `
            <div class="ticket-footer">
              <div class="footer-message">
                ${t('main-element-ticket-store')}
              </div>
            </div>
          `);
        window.print();
      }
      
      document.body.innerHTML = ticketTplToPrint(
        this._tplTicket(sales) + `
          <div class="ticket-footer-direction">
              ${t('main-element-ticket-customer')}
          </div>
        `);
      window.print();
      // Restore the original page content
      document.body.innerHTML = contenidoOriginal;
    }, 1000);
  }

  /**
   * Requests the sales list from the manager if not already loaded.
   */
  _getSales() {
    if (!this._sales?.length) {
      this._managerRef.value.getSales();
    }
  }

  /**
   * Updates the sales list in local state.
   *
   * @param {CustomEvent} event - The event containing the sales data.
   * @param {Object[]} event.detail - The sales array.
   */
  _getSalesSuccessResponse({detail}) {
    let sales = detail.map((sale) => ({
      ...sale,
      showProducts: false,
    }));
    let salesToShow = [];
    for (let i = 0; i < detail.length; i += 20) {
      salesToShow.push(detail.slice(i, i + 20));
    }
    this._sales = salesToShow;
  }

  /**
   * Toggles the visibility of products for a specific sale.
   *
   * @param {CustomEvent} event - The event containing the sale identifier.
   * @param {Object} event.detail - The event details.
   * @param {string} event.detail.id - The sale id.
   */
  _toggleProducts({detail: {id}}) {
    this._sales = this._sales.map((salesPage) => {
      return [
        ...salesPage.map((sale) =>
          sale.id.toString() === id
            ? {...sale, showProducts: !sale.showProducts}
            : sale
        ),
      ];
    });
  }

  
  /**
   * Toggles the visibility of extra barcodes for a product.
   *
   * @param {CustomEvent} event - The event containing the sale identifier.
   * @param {Object} event.detail - The event details.
   * @param {string} event.detail.id - Product identifier.
   */
  _toggleBarcodes({detail: {id}}) {
    this._products = this._products.map((product) => {
      return [
        ...product.map((product) =>
          product.id.toString() === id
            ? {...product, showBarcodes: product.barcodeList.length ? !product.showBarcodes : product.showBarcodes}
            : product
        ),
      ];
    });
  }

  /**
   * Toggles the visibility of a product image.
   *
   * @param {CustomEvent} event - The event containing the sale identifier.
   * @param {Object} event.detail - The event details.
   * @param {string} event.detail.id - Product identifier.
   */
  _toggleImage({detail: {id}}) {
    this._products = this._products.map((product) => {
      return [
        ...product.map((product) =>
          product.id.toString() === id
            ? {...product, showImage: product.image ? !product.showImage : product.showImage}
            : product
        ),
      ];
    });
  }

  /**
   * Asks the manager to sort the product list.
   *
   * @param {CustomEvent} event - Product sorting request event.
   * @param {Object} event.detail - Sort configuration, including `sortBy`.
   */
  _sortProductsBy({detail}) {
    this._managerRef.value.sortProductsBy(detail);
  }

  /**
   * Prints the report returned by the data manager.
   *
   * @param {CustomEvent} event - Generated report event.
   * @param {Object} event.detail - Date range, sales list and total.
   */
  _generateReportDocument({detail}) {
    var contenidoOriginal = document.body.innerHTML;
    setTimeout(() => {
      // Replace the page body only with the content to print
      document.body.innerHTML = ticketTplToPrint(this._tplReport(detail));
      // Call the print function
      window.print();
      // Restore the original page content
      document.body.innerHTML = contenidoOriginal;
    }, 200);
  }

  /**
   * Forwards the selected report date range to the manager.
   *
   * @param {CustomEvent} event - Report generation request.
   * @param {Object} event.detail - Start and end date parts.
   */
  _generateReport({detail}) {
    this._managerRef.value.generateReport(detail);
  }

  /**
   * Requests a cash register closing and resets the empty closing indicator.
   */
  _closeCashRegister() {
    this._managerRef.value.postCloseCashRegister();
    this._isEmptyReport = false;
  }

  /**
   * Updates local state with cash register closing records.
   *
   * @param {CustomEvent} event - Cash register list response.
   * @param {Array<Object>} event.detail - Closing records.
   */
  _getCloseCashRegisterSuccessResponse({detail}) {
    this._closedCashRegisters = detail;
  }

  /**
   * Sets the empty-closing indicator from the refreshed closing list.
   *
   * @param {CustomEvent} event - Cash register closing response.
   * @param {Array<Object>} event.detail - Closing records.
   */
  _postCloseCashRegisterSuccessResponse({detail}) {
    this._isEmptyReport = !detail.length;
  }

  /**
   * Builds report markup for printing.
   *
   * @param {Object} report - Sales report data.
   * @param {Array<Object>} report.listSales - Sales in the selected date range.
   * @param {number} report.totalSales - Sum of the sales in the range.
   * @param {{year: string, month: string, day: string}} report.startDate - Start date.
   * @param {{year: string, month: string, day: string}} report.endDate - End date.
   * @returns {string} HTML for the printable report.
   */
  _tplReport({listSales, totalSales, startDate, endDate}) {
    return `
      <div class="report-container">
        <h1>${t('main-element-report-title')}</h1>
        <p><strong>${t('main-element-report-from')}</strong> ${startDate.year}-${startDate.month}-${
      startDate.day
    }</p>
        <p><strong>${t('main-element-report-to')}</strong> ${endDate.year}-${endDate.month}-${
      endDate.day
    }</p>
        <br>
        <ul>
          ${listSales
            .map(
              (sale) => `
                <li>
                  <h3>${t('main-element-report-sale')} #${sale.id} - ${sale.date}</h3>
                  <h4>${t('main-element-report-sale-payment')} ${sale.paymentMethod === 'cash' ? t('main-element-payment-cash') : t('main-element-payment-card')}</h4>
                  <br>
                  <ul>
                    ${sale.products
                      .map(
                        (product) => `
                          <li>> ${product.name} 
                          <br> &nbsp; $${product.price.toFixed(2)} x ${
                          product.quantity
                        } = $${(product.price * product.quantity).toFixed(
                          2
                        )}</li>
                        `
                      )
                      .join('')}
                  </ul>
                  <h2>${t('main-element-sales-column-total')}: $${sale.total}</h2>
                  __________________________________________________________
                </li>
                <br>
              `
            )
            .join('')}
        </ul>
        <br>
        <h2>${t('main-element-report-total-sales')} $${totalSales}</h2>
      </div>
    `;
  }

  /**
   * Builds the sale ticket HTML ready for printing.
   *
   * @param {Object} sales - The sale data to print.
   * @returns {string} The ticket HTML.
   */
  _tplTicket(sales) {
    let ticket =  `
      <div class="ticket-container">
        <!-- Header -->
        <div class="ticket-header">
          <div class="store-name">🛍️ Buhoneria</div>
          <div class="store-info">
            Av. Ing. Jorge Luque Loyola 71, CP. 57500, Nezahualcoyotl
            Edo Mex<br />
            55 7060 9743<br />
            ${t('main-element-ticket-weekdays')} 7:00-20:00
          </div>
          <div class="ticket-number">
            ${t('main-element-ticket-title')} #${sales.id}<br />
            ${t('main-element-ticket-date')} ${getCurrentDate()}
          </div>
        </div>

        <!-- Items -->
        <div class="ticket-items">
          ${ 
            sales.products.map(
              (product) => `<div class="item">
                <div class="item-name">
                  <b>${product.name}</b>
                </div>
                <div class="item-qty">${product.quantity}</div>
                <div class="item-price">
                  $${(product.price * product.quantity).toFixed(2)}
                </div>
              </div>
              <div class="item-desc">
                ${t('main-element-ticket-unit-price')} $${product.price.toFixed(2)} c/u
              </div>`
            )
            .join('')}
        </div>

        <!-- Totals -->
        <div class="totals">
          <div class="total-row subtotal">
            <span>${t('main-element-ticket-subtotal')}</span>
            <span>$${(sales.total * 0.84).toFixed(2)}</span>
          </div>
          <div class="total-row tax">
            <span>${t('main-element-ticket-tax')}</span>
            <span>$${(sales.total * 0.16).toFixed(2)}</span>
          </div>
          <div class="total-row total">
            <span>${t('main-element-ticket-total')}</span>
            <span>$${Number(sales.total).toFixed(2)}</span>
          </div>
          ${
            sales.paymentMethod === 'cash'
              ? `
                <div class="total-row total">
                  <span>${t('main-element-ticket-payment')}</span>
                  <span>
                    $${(
                      parseFloat(sales.total) + parseFloat(sales.changeToGive)
                    ).toFixed(2)}
                  </span>
                </div>
                <div class="total-row total">
                  <span>${t('main-element-ticket-change')}</span>
                  <span> $${parseFloat(sales.changeToGive).toFixed(2)} </span>
                </div>
              `
              : ''
          }
        </div>

        <!-- Payment Method -->
        <div class="payment-method">
          <b>
            ${t('main-element-ticket-payment-method')}
            ${sales.paymentMethod === 'card' ? t('main-element-payment-card') : t('main-element-payment-cash')}<br />
          </b>
        </div>

        <!-- Footer -->
        <div class="ticket-footer">
            ${t('main-element-ticket-thanks')}<br />
            ${t('main-element-ticket-keep')}<br />
            <br />
            ${t('main-element-ticket-operator')} ${this._userData.name} ${this._userData.lastName}
        </div>
      </div>
    `;
    return Object.keys(sales).length > 0 ? ticket : '';
  }

  /**
   * Template for the login view.
   *
   * @returns {import('lit').TemplateResult} The login template.
   */
  get _tplLogin() {
    return html`
      <login-element
        login-error=${this._loginErrorCode}
        @login-page-request-login="${this._requestLoginToApi}"
      ></login-element>
    `;
  }

  /**
   * Template for the home view.
   *
   * @returns {import('lit').TemplateResult} The home template.
   */
  get _tplHome() {
    return html`
      <home-element
        ?complete-sale-success="${Object.keys(this._completeSaleSuccess)
          .length > 0}"
        ?delete-success=${this._deleteProductSuccess}
        ?edit-success=${this._editProductSuccess}
        ?is-empty-report=${this._isEmptyReport}
        ?register-success=${this._registerProductSuccess}
        .closedCashRegisters=${this._closedCashRegisters}
        .editErrorResponse=${this._editProductErrorResponse}
        .generatedBarcode="${this._generatedBarcode}"
        .posibleProducts="${this._posibleProducts}"
        .productToEdit=${this._productToEdit}
        .productsToSell=${this._productsToSell}
        .registerError=${this._registerError}
        .registeredProducts=${this._products}
        .sales=${this._sales}
        .total=${this._total}
        .userData=${this._userData}
        @home-element-get-sales="${this._getSales}"
        @home-page-logout="${this._logout}"
        @modal-element-confirm-action-success-complete-sale="${this._closeCompleteSaleSuccessModal}"
        @modal-element-confirm-action-success-register="${this._closeRegisterSuccessModal}"
        @products-element-close-edit-modal="${this._closeEditModal}"
        @products-element-close-success-edit-modal="${this._closeEditModal}"
        @products-element-delete-product="${this._deleteProduct}"
        @products-element-edit-product="${this._editProduct}"
        @products-element-search-product="${this._searchProduct}"
        @products-element-select-product-to-edit="${this._selectProductToEdit}"
        @products-element-sort-products="${this._sortProductsBy}"
        @products-element-toggle-barcodes="${this._toggleBarcodes}"
        @products-element-toggle-image="${this._toggleImage}"
        @register-page-close-error-modal="${this._closeErrorModal}"
        @register-page-register-product="${this._registerProduct}"
        @sales-element-close-cash-register="${this._closeCashRegister}"
        @sales-element-generate-report="${this._generateReport}"
        @sales-element-print-ticket="${this._printTicket}"
        @sales-element-toggle-products="${this._toggleProducts}"
        @sell-element-clean-posible-products="${() => { this._posibleProducts = []}}"
        @sell-element-complete-sale="${this._completeSale}"
        @sell-element-delete-product-to-sell="${this._deleteProductToSell}"
        @sell-element-get-posible-product="${this._getPosibleProductsList}"
        @sell-element-get-product-to-sell="${this._searchProductToSell}"
        @sell-element-print-ticket="${this._printTicket}"
        @sell-element-update-product-to-sell="${this._updateProductToSell}"
        @tools-element-request-change-password="${this._requestChangePassword}"
        @tools-element-request-generate-barcode="${this._requestGenerateBarcode}"
        @tools-element-request-backup-db=${this._requestDatabaseBackup}
      ></home-element>
    `;
  }

  /**
   * Template for the manager element that handles API communication.
   *
   * @returns {import('lit').TemplateResult} The manager template.
   */
  get _tplManager() {
    return html`
      <manager-element
        ${ref(this._managerRef)}
        product-to-sell=${this._productToSell}
        @api-dm-login-handle-error=${this._loginHandleError}
        @api-dm-login-success-response=${this._loginSuccessResponse}
        @api-dm-register-product-handle-error=${this
          ._registerProductHandleError}
        @api-dm-register-product-success-response=${this
          ._registerProductSuccessResponse}
        @api-dm-session-active-success-response=${this
          ._getUserInSessionSuccesResponse}
        @api-dm-session-active-handle-error=${this
          ._getUserInSessionHandleErrorResponse}
        @api-dm-generate-barcode-success-response=${this._generateBarcodeSuccessResponse}
        @api-dm-edit-product-handle-error=${this
          ._editProductHandleErrorResponse}
        @dm-delete-product-success-response=${this
          ._deleteProductSuccessResponse}
        @dm-edit-product-success-response=${this._editProductSuccessResponse}
        @dm-generate-report=${this._generateReportDocument}
        @dm-get-close-cash-register-success-response="${this
          ._getCloseCashRegisterSuccessResponse}"
        @dm-get-product-success-response=${this._setProductToEdit}
        @dm-get-product-to-sell=${this._setListProductToSell}
        @dm-get-products-success-response=${this._getProductsSuccessResponse}
        @dm-get-sales-success-response=${this._getSalesSuccessResponse}
        @dm-database-backup-success-response=${this
          ._databaseBackupSuccessResponse}
        @dm-database-backup-handle-error=${this
          ._databaseBackupHandleError}
        @dm-post-close-cash-register-success-response=${this
          ._postCloseCashRegisterSuccessResponse}
        @dm-register-sale-success-response=${this._registerSaleSuccessResponse}
        @dm-posible-products=${this._setPosibleProducts}
        @dm-sort-products=${this._setSortedProducts}
      ></manager-element>
    `;
  }

  /** @returns {import('lit').CSSResult[]} Component styles. */
  static get styles() {
    return [styles];
  }

  /**
   * Renders the main application layout.
   *
   * @returns {import('lit').TemplateResult} The rendered template.
   */
  render() {
    return html`
      ${!this._isLogged ? this._tplLogin : nothing}
      ${this._isLogged ? this._tplHome : nothing} ${this._tplManager}
    `;
  }
}

window.customElements.define('main-element', MainElement);
