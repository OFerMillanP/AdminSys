import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {LoginElement} from './login/login.js';
import {HomeElement} from './home/home.js';
import {ManagerElement} from './dm/manager.js';

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
       * The name to say "Hello" to.
       */
      _registerError: {
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
      _registerSuccess: {
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
    this._isLogged = false;
    this._loginErrorCode = '';
    this._productToSearch = {};
    this._products = [];
    this._registerError = {};
    this._registerSuccess = false;
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
    this._getDataManager().registerProduct(detail);
  }

  _registerProductSuccessResponse({detail}) {
    this._registerSuccess = !!Object.keys(detail).length;
    this._getDataManager().getProductList();
  }

  _registerProductHandleError({detail}) {
    this._registerError = detail;
  }

  _deleteProductsSuccessResponse({detail}) {
    if (detail) {
      console.log('Delete successful');
    }
  }

  _getProductsSuccessResponse({detail}) {
    this._products = detail;
  }

  _searchProduct({detail}) {
    this._productToSearch = detail;
  }

  _closeErrorModal() {
    this._registerError = {};
  }

  _closeSuccessModal() {
    this._registerSuccess = false;
  }

  _deleteProduct({detail}) {
    this._getDataManager().deleteProduct(detail);
  }

  _editProduct({detail}) {
    console.log(detail);
    // this._getDataManager().editProduct(detail);
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
        ?register-success=${this._registerSuccess}
        .registeredProducts=${this._products}
        .registerError=${this._registerError}
        .userData=${this._userData}
        @home-page-logout="${this._logout}"
        @products-element-delete-product="${this._deleteProduct}"
        @products-element-edit-product="${this._editProduct}"
        @products-element-search-product="${this._searchProduct}"
        @register-page-close-error-modal=${this._closeErrorModal}
        @register-page-close-success-modal=${this._closeSuccessModal}
        @register-page-register-product="${this._registerProduct}"
      ></home-element>
    `;
  }

  get _tplManager() {
    return html`
      <manager-element
        .productToSearch=${this._productToSearch}
        @api-dm-login-handle-error=${this._loginHandleError}
        @api-dm-login-success-response=${this._loginSuccessResponse}
        @api-dm-register-product-handle-error=${this
          ._registerProductHandleError}
        @api-dm-session-active-success-response=${this
          ._getUserInSessionSuccesResponse}
        @api-dm-register-product-success-response=${this
          ._registerProductSuccessResponse}
        @dm-get-products-success-response=${this._getProductsSuccessResponse}
        @dm-delete-product-success-response=${this
          ._deleteProductsSuccessResponse}
      ></manager-element>
    `;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html`
      ${!this._isLogged ? this._tplLogin : nothing}
      ${this._isLogged ? this._tplHome : nothing} ${this._tplManager}
    `;
  }
}

window.customElements.define('main-element', MainElement);
