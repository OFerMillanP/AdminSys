import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {LoginElement} from './login/login.js';
import {HomeElement} from './home/home.js';
import {ManagerElement} from './dm/manager.js';

import '@material/mwc-textfield/mwc-textfield.js';
import '@material/mwc-textarea/mwc-textarea.js';
import '@material/mwc-button/mwc-button.js';
import '@material/mwc-icon/mwc-icon.js';
import '@material/mwc-icon-button/mwc-icon-button.js';
import '@material/mwc-tab-bar/mwc-tab-bar.js';
import '@material/mwc-tab/mwc-tab.js';
import '@material/mwc-formfield/mwc-formfield.js';

import styles from './main.css.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
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
      _isLogged: {
        type: Boolean,
        state: true,
      },
      /**
       * Contain level of user's name.
       */
      _loginErrorCode: {
        type: String,
        state: true,
      },
      /**
       * Caontains List Products.
       */
      _products: {
        type: Array,
        state: true,
      },
      /**
       * Caontains List Products.
       */
      _productsToSell: {
        type: Array,
        state: true,
      },
      /**
       * The name to say "Hello" to.
       */
      _registerError: {
        type: Object,
        state: true,
      },
      /**
       * The name to say "Hello" to.
       */
      _productToEdit: {
        type: Object,
        state: true,
      },
      /**
       * The name to say "Hello" to.
       */
      _productToSearch: {
        type: Object,
        state: true,
      },
      /**
       * The name to say "Hello" to.
       */
      _productToSell: {
        type: String,
        state: true,
      },
      /**
       * The name to say "Hello" to.
       */
      _registerProductSuccess: {
        type: Boolean,
        state: true,
      },
      /**
       * The name to say "Hello" to.
       */
      _editProductSuccess: {
        type: Boolean,
        state: true,
      },
      /**
       * The name to say "Hello" to.
       */
      _deleteProductSuccess: {
        type: Boolean,
        state: true,
      },
      /**
       * Contain level of user's permision.
       */
      _userData: {
        type: Object,
        state: true,
      },
    };
  }

  constructor() {
    super();
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
    this._userData = {};
  }

  _requestLoginToApi({detail}) {
    this._getDataManager().login(detail);
  }

  _loginSuccessResponse({detail}) {
    this._userData.level = detail.level;
    this._userData.name = detail.name;
    this._isLogged = !!Object.keys(detail).length && !!detail.level;
  }

  _getUserInSessionSuccesResponse({detail}) {
    this._userData.level = detail.level;
    this._userData.name = detail.name;
    this._isLogged = !!Object.keys(detail).length;
  }

  _loginHandleError({detail}) {
    this._isLogged = detail.status;
    this._loginErrorCode = detail.code;
  }

  _getDataManager() {
    return this.shadowRoot.querySelector('manager-element');
  }

  _logout() {
    this._loginErrorCode = '';
    this._isLogged = false;
    this._getDataManager().logout();
  }

  _registerProduct({detail}) {
    this._getDataManager().createProduct(detail);
  }

  _registerProductSuccessResponse({detail}) {
    this._registerProductSuccess = !!Object.keys(detail).length;
    this._getDataManager().getProductList();
  }

  _registerProductHandleError({detail}) {
    this._registerError = detail;
  }

  _deleteProductSuccessResponse({detail}) {
    this._deleteProductSuccess = !!detail;
  }

  _editProductSuccessResponse({detail}) {
    this._editProductSuccess = !!detail;
  }

  _getProductsSuccessResponse({detail}) {
    this._products = detail;
  }

  _searchProduct({detail}) {
    this._productToSearch = detail;
  }

  _searchProductToSell({detail: {barcode}}) {
    this._productToSell = barcode;
    this._getDataManager().getProductToSell(barcode);
  }

  _deleteProduct({detail}) {
    this._getDataManager().deleteProduct(detail);
  }

  _selectProductToEdit({detail}) {
    this._getDataManager().getProductById(detail);
  }

  _setProductToEdit({detail}) {
    this._productToEdit = detail;
  }

  _editProduct({detail}) {
    this._getDataManager().editProduct(detail);
  }

 _closeSuccessEditModal() {
    this._productToEdit = {};
  }

  _closeErrorModal() {
    this._registerError = {};
  }

  _setListProductToSell({detail}) {
    this._productsToSell = detail;
  }

  get _tplLogin() {
    return html`
      <login-element
        login-error=${this._loginErrorCode}
        @login-page-request-login="${this._requestLoginToApi}"
      ></login-element>
    `;
  }

  get _tplHome() {
    return html`
      <home-element
        ?delete-success=${this._deleteProductSuccess}
        ?edit-success=${this._editProductSuccess}
        ?register-success=${this._registerProductSuccess}
        .productToEdit=${this._productToEdit}
        .registeredProducts=${this._products}
        .registerError=${this._registerError}
        .userData=${this._userData}
        .productsToSell=${this._productsToSell}
        @home-page-logout="${this._logout}"
        @products-element-delete-product="${this._deleteProduct}"
        @products-element-edit-product="${this._editProduct}"
        @products-element-search-product="${this._searchProduct}"
        @products-element-select-product-to-edit="${this._selectProductToEdit}"
        @products-element-close-success-edit-modal="${this._closeSuccessEditModal}"
        @register-page-register-product="${this._registerProduct}"
        @register-page-close-error-modal="${this._closeErrorModal}"
        @sell-element-get-product-to-sell="${this._searchProductToSell}"
      ></home-element>
    `;
  }

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
      ></manager-element>
    `;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html`
      ${!this._isLogged ? this._tplLogin : nothing}
      ${this._isLogged ? this._tplHome : nothing}
      ${this._tplManager}
    `;
  }
}

window.customElements.define('main-element', MainElement);
