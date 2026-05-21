import {LitElement, html, nothing} from 'lit';
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

import styles from './main.css.js';

import {ticketTplToPrint, getCurrentDate} from '../../../utils/utils.js';

/**
 * Main application root element.
 *
 * Manages authentication state, routes between the login and home views,
 * and coordinates data exchange with the manager layer.
 */
export class MainElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'main-element';
  }

  static get scopedElements() {
    return {
      'login-element': LoginElement,
      'home-element': HomeElement,
      'manager-element': ManagerElement,
    };
  }

  static get properties() {
    return {
      /**
       * Whether the user is logged in.
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
       * Whether the last product edit operation succeeded.
       */
      _editProductSuccess: {
        type: Boolean,
        state: true,
      },
      /**
       * Whether the user is logged in.
       */
      _isLogged: {
        type: Boolean,
        state: true,
      },
      /**
       * Error code returned from a failed login attempt.
       */
      _loginErrorCode: {
        type: String,
        state: true,
      },
      /**
       * The product currently selected for editing.
       */
      _productToEdit: {
        type: Object,
        state: true,
      },
      /**
       * Search criteria used to filter the product list.
       */
      _productToSearch: {
        type: Object,
        state: true,
      },
      /**
       * Barcode used to request a product for sale.
       */
      _productToSell: {
        type: String,
        state: true,
      },
      /**
       * Cached list of products available in the inventory.
       */
      _products: {
        type: Array,
        state: true,
      },
      /**
       * List of products currently added to the sale transaction.
       */
      _productsToSell: {
        type: Array,
        state: true,
      },
      /**
       * Error details from a failed product registration.
       */
      _registerError: {
        type: Object,
        state: true,
      },
      /**
       * Whether the last product registration succeeded.
       */
      _registerProductSuccess: {
        type: Boolean,
        state: true,
      },
      /**
       * Whether to show the sale completion ticket.
       */
      _showTicket: {
        type: Boolean,
        state: true,
      },
      /**
       * Total amount calculated for the current sale.
       */
      _total: {
        type: Number,
        state: true,
      },
      /**
       * Current authenticated user data and permissions.
       */
      _userData: {
        type: Object,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this._completeSaleSuccess = {};
    this._deleteProductSuccess = false;
    this._editProductSuccess = false;
    this._isLogged = false;
    this._loginErrorCode = '';
    this._productToEdit = {};
    this._productToSearch = {};
    this._productToSell = '';
    this._products = [];
    this._productsToSell = [];
    this._registerError = {};
    this._registerProductSuccess = false;
    this._showTicket = false;
    this._total = 0;
    this._userData = {};
  }

  /**
   * Requests login through the data manager.
   *
   * @param {CustomEvent} event - The login request event.
   * @param {Object} event.detail - The login payload.
   */
  _requestLoginToApi({detail}) {
    this._getDataManager().login(detail);
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
    this._getDataManager().getProductList();
  }

  /**
   * Handles an active session response from the manager.
   * Reconstructs the current user session state.
   *
   * @param {CustomEvent} event - The session response event.
   * @param {Object} event.detail - The current user data.
   */
  _getUserInSessionSuccesResponse({detail}) {
    this._userData.level = detail.level;
    this._userData.name = detail.name;
    this._isLogged = !!Object.keys(detail).length;
    if (this._isLogged) {
      this._getDataManager().getProductList();
    }
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
   * Returns the nested manager-element from shadow DOM.
   *
   * @return {ManagerElement} The manager element instance.
   */
  _getDataManager() {
    return this.shadowRoot.querySelector('manager-element');
  }

  /**
   * Logs out the current user and clears session state.
   */
  _logout() {
    this._loginErrorCode = '';
    this._isLogged = false;
    this._getDataManager().logout();
  }

  /**
   * Sends a new product registration request to the manager.
   *
   * @param {CustomEvent} event - The register request event.
   * @param {Object} event.detail - The product to register.
   */
  _registerProduct({detail}) {
    this._getDataManager().createProduct(detail);
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
    this._getDataManager().getProductList();
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
   * @param {boolean} event.detail - The edit result.
   */
  _editProductSuccessResponse({detail}) {
    this._editProductSuccess = !!detail;
  }

  /**
   * Stores the loaded product list in component state.
   *
   * @param {CustomEvent} event - The products success event.
   * @param {Array} event.detail - The product list.
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
  _searchProduct({detail}) {
    this._productToSearch = detail;
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
    this._getDataManager().getProductToSell(barcode);
  }

  /**
   * Requests deletion of a product from the sale list.
   *
   * @param {CustomEvent} event - The delete product to sell event.
   * @param {Object} event.detail - The event payload.
   * @param {string} event.detail.barcode - The barcode to remove.
   */
  _deleteProductToSell({detail: {barcode}}) {
    this._getDataManager().deleteProductToSell(barcode);
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
    this._getDataManager().updateProductToSell(barcode, change);
  }

  /**
   * Triggers the manager to complete the current sale.
   */
  _completeSale({detail: {changeToGive, paymentMethod}}) {
    this._getDataManager().completeSale(changeToGive, paymentMethod);
  }

  /**
   * Requests deletion of a product from the inventory.
   *
   * @param {CustomEvent} event - The product delete event.
   * @param {Object} event.detail - The event payload.
   */
  _deleteProduct({detail}) {
    this._getDataManager().deleteProduct(detail);
  }

  /**
   * Requests the manager to load a selected product for editing.
   *
   * @param {CustomEvent} event - The select product event.
   * @param {Object} event.detail - The selected product identifier.
   */
  _selectProductToEdit({detail}) {
    this._getDataManager().getProductById(detail);
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
  _editProduct({detail}) {
    this._getDataManager().editProduct(detail);
  }

  /**
   * Closes the edit success modal by clearing the selected product.
   */
  _closeSuccessEditModal() {
    this._productToEdit = {};
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
   * Handles the successful sale completion response.
   * Clears the current sale list and resets the total amount.
   *
   * @param {CustomEvent} event - The sale success event.
   * @param {Object} event.detail - The sale response payload.
   */
  _registerSaleSuccessResponse({detail}) {
    this._completeSaleSuccess = detail;
  }

  _closeCompleteSaleSuccessModal() {
    this._completeSaleSuccess = {};
    this._productsToSell = [];
    this._total = 0;
  }

  _printTicket() {
    this._showTicket = true;
    var contenidoOriginal = document.body.innerHTML;
    setTimeout(() => {
      // Extrae el HTML del div que quieres imprimir
      var contenidoImprimir = this.shadowRoot.querySelector(
        'div.ticket-container'
      ).outerHTML;
      // Reemplaza el body de la página solo con el contenido a imprimir
      document.body.innerHTML = ticketTplToPrint(contenidoImprimir);
      // Llama a la función de impresión
      window.print();
      // Restaura el contenido original de la página
      document.body.innerHTML = contenidoOriginal;
    }, 200);
  }

  get _tplTicket() {
    return html`
      <div class="ticket-container">
        <!-- Header -->
        <div class="ticket-header">
          <div class="store-name">🛍️ Anel Store</div>
          <div class="store-info">
            Dirección: Av. Ing. Jorge Luque Loyola 71, CP. 57500, Nezahualcoyotl
            Edo Mex<br />
            Tel: +52 55 70609743<br />
            Horario: Lun-Dom 9:00-21:00
          </div>
          <div class="ticket-number">
            Ticket #${this._completeSaleSuccess.id}<br />
            Fecha: ${getCurrentDate()}
          </div>
        </div>

        <!-- Items -->
        <div class="ticket-items">
          ${this._completeSaleSuccess.products.map(
            (item) => html`
              <div class="item">
                <div class="item-name">
                  <b>${item.name}</b>
                </div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">
                  $${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
              <div class="item-desc">
                Precio unitario: $${item.price.toFixed(2)} c/u
              </div>
            `
          )}
        </div>

        <!-- Totals -->
        <div class="totals">
          <div class="total-row subtotal">
            <span>Subtotal:</span>
            <span>$${(this._completeSaleSuccess.total * 0.84).toFixed(2)}</span>
          </div>
          <div class="total-row tax">
            <span>IVA (16%):</span>
            <span>$${(this._completeSaleSuccess.total * 0.16).toFixed(2)}</span>
          </div>
          <div class="total-row total">
            <span>TOTAL:</span>
            <span>$${this._completeSaleSuccess.total.toFixed(2)}</span>
          </div>
          ${this._completeSaleSuccess.paymentMethod === 'cash'
            ? html`
                <div class="total-row total">
                  <span>Pago:</span>
                  <span>
                    $${(
                      parseFloat(this._completeSaleSuccess.total) +
                      parseFloat(this._completeSaleSuccess.changeToGive)
                    ).toFixed(2)}
                  </span>
                </div>
                <div class="total-row total">
                  <span>Cambio:</span>
                  <span>
                    $${this._completeSaleSuccess.changeToGive.toFixed(2)}
                  </span>
                </div>
              `
            : nothing}
        </div>

        <!-- Payment Method -->
        <div class="payment-method">
          <b>
            Método de pago:
            ${this._completeSaleSuccess.paymentMethod === 'card'
              ? 'Tarjeta Crédito'
              : 'Efectivo'}<br />
          </b>
        </div>

        <!-- Footer -->
        <div class="ticket-footer">
          <div class="footer-message">
            ¡Gracias por su compra!<br />
            Conserve este ticket como comprobante<br />
            <br />
            Operador: ${this._userData.name}
          </div>
        </div>
      </div>
    `;
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
        ?register-success=${this._registerProductSuccess}
        .productToEdit=${this._productToEdit}
        .registeredProducts=${this._products}
        .registerError=${this._registerError}
        .userData=${this._userData}
        .productsToSell=${this._productsToSell}
        .total=${this._total}
        @home-page-logout="${this._logout}"
        @products-element-delete-product="${this._deleteProduct}"
        @products-element-edit-product="${this._editProduct}"
        @products-element-search-product="${this._searchProduct}"
        @products-element-select-product-to-edit="${this._selectProductToEdit}"
        @products-element-close-success-edit-modal="${this
          ._closeSuccessEditModal}"
        @register-page-register-product="${this._registerProduct}"
        @register-page-close-error-modal="${this._closeErrorModal}"
        @modal-element-confirm-action-success-complete-sale="${this
          ._closeCompleteSaleSuccessModal}"
        @sell-element-complete-sale="${this._completeSale}"
        @sell-element-delete-product-to-sell="${this._deleteProductToSell}"
        @sell-element-get-product-to-sell="${this._searchProductToSell}"
        @sell-element-update-product-to-sell="${this._updateProductToSell}"
        @sell-element-print-ticket="${this._printTicket}"
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
        .productToSearch=${this._productToSearch}
        product-to-sell=${this._productToSell}
        @api-dm-login-handle-error=${this._loginHandleError}
        @api-dm-login-success-response=${this._loginSuccessResponse}
        @api-dm-register-product-handle-error=${this
          ._registerProductHandleError}
        @api-dm-register-product-success-response=${this
          ._registerProductSuccessResponse}
        @api-dm-session-active-success-response=${this
          ._getUserInSessionSuccesResponse}
        @dm-delete-product-success-response=${this
          ._deleteProductSuccessResponse}
        @dm-get-products-success-response=${this._getProductsSuccessResponse}
        @dm-get-product-success-response=${this._setProductToEdit}
        @dm-edit-product-success-response=${this._editProductSuccessResponse}
        @dm-get-product-to-sell=${this._setListProductToSell}
        @dm-register-sale-success-response=${this._registerSaleSuccessResponse}
      ></manager-element>
    `;
  }

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
      ${this._showTicket
        ? this._tplTicket
        : html`${!this._isLogged ? this._tplLogin : nothing}
          ${this._isLogged ? this._tplHome : nothing} ${this._tplManager}`}
    `;
  }
}

window.customElements.define('main-element', MainElement);
