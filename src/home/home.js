import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {SellElement} from './sell/sell.js';
import {ProductsElement} from './products/products.js';
import {RegisterElement} from './register/register.js';

import {dispatchCustomEvent} from '../../utils/utils.js';

import styles from './home.css.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class HomeElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'home-element';
  }

  static get scopedElements() {
    return {
      'sell-element': SellElement,
      'products-element': ProductsElement,
      'register-element': RegisterElement,
    };
  }

  static get properties() {
    return {
      /**
       * The name to say "Hello" to.
       */
      registeredProducts: {
        type: Array,
      },
      /**
       * The name to say "Hello" to.
       */
      userData: {
        type: Object,
      },
      /**
       * The name to say "Hello" to.
       */
      registerSuccess: {
        type: Boolean,
        attribute: 'register-success',
      },
      /**
       * The name to say "Hello" to.
       */
      registerError: {
        type: Object,
      },
      /**
       * Toggle to show sell section
       */
      _isShowSell: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show sell section
       */
      _isShowProducts: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show register section
       */
      _isShowRegister: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show update section
       */
      _isShowUpdate: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show delete section
       */
      _isShowDelete: {
        type: Boolean,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.registeredProducts = [];
    this.userData = {};
    this.registerSuccess = false;
    this.registerError = {};
    this._isShowSell = false;
    this._isShowProducts = true;
    this._isShowRegister = false;
    this._isShowUpdate = false;
    this._isShowDelete = false;
  }

  _logout() {
    dispatchCustomEvent(this, 'home-page-logout');
  }

  _resetSections() {
    this._isShowSell = false;
    this._isShowProducts = false;
    this._isShowRegister = false;
    this._isShowUpdate = false;
    this._isShowDelete = false;
  }

  _showSection({target: {id}}) {
    const sections = {
      sell: () => {
        this._resetSections();
        this._isShowSell = true;
      },
      products: () => {
        this._resetSections();
        this._isShowProducts = true;
      },
      register: () => {
        this._resetSections();
        this._isShowRegister = true;
      },
      update: () => {
        this._resetSections();
        this._isShowUpdate = true;
      },
      delete: () => {
        this._resetSections();
        this._isShowDelete = true;
      },
    };
    sections[id].call();
  }

  get _tplHome() {
    return html`
      <header class="main-header">
        <div class="name-header">Hello ${this.userData?.name} !</div>
        <nav class="navbar">
          <ul class="nav-links">
            ${this.userData?.level === 'admin'
              ? html`
                  <li>
                    <div id="register" @click="${this._showSection}">
                      Register
                    </div>
                  </li>
                `
              : nothing}
            <li>
              <div id="products" @click="${this._showSection}">
                Products
              </div>
            </li>
            <li>
              <div id="sell" @click="${this._showSection}">
                Sell
              </div>
            </li>
            <li>
              <button class="logout-button" @click=${this._logout}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </header>
      ${this._isShowSell ? this._tplSell : nothing}
      ${this._isShowProducts ? this._tplProducts : nothing}
      ${this._isShowRegister ? this._tplRegister : nothing}
    `;
  }

  get _tplSell() {
    return html`<sell-element></sell-element>`;
  }

  get _tplProducts() {
    return html`<products-element
      .registeredProducts=${this.registeredProducts}
    ></products-element>`;
  }

  get _tplRegister() {
    return html`<register-element
      ?register-success=${this.registerSuccess}
      register-error=${this.registerError.code}
    ></register-element>`;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html` ${this._tplHome} `;
  }
}

window.customElements.define('home-element', HomeElement);
