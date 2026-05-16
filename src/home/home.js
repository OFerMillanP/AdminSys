import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {SellElement} from './sell/sell.js';
import {ProductsElement} from './products/products.js';
import {RegisterElement} from './register/register.js';

import {dispatchCustomEvent} from '../../utils/utils.js';

import styles from './home.css.js';

/**
 * Home page container element.
 *
 * Renders the main product, register, and sell sections and routes
 * navigation events inside the home view.
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
       * Whether a complete sale operation completed successfully.
       */
      completeSaleSuccess: {
        type: Boolean,
        attribute: 'complete-sale-success',
      },
      /**
       * Whether a delete operation completed successfully.
       */
      deleteSuccess: {
        type: Boolean,
        attribute: 'delete-success',
      },
      /**
       * Whether an edit operation completed successfully.
       */
      editSuccess: {
        type: Boolean,
        attribute: 'edit-success',
      },
      /**
       * Product selected for editing.
       */
      productToEdit: {
        type: Object,
      },
      /**
       * Products currently selected for sale.
       */
      productsToSell: {
        type: Array,
      },
      /**
       * Product registration error details.
       */
      registerError: {
        type: Object,
      },
      /**
       * Products loaded from the inventory.
       */
      registeredProducts: {
        type: Array,
      },
      /**
       * Whether the last product registration succeeded.
       */
      registerSuccess: {
        type: Boolean,
        attribute: 'register-success',
      },
      /**
       * Session user data from login.
       */
      userData: {
        type: Object,
      },
      /**
       * Current total amount for the sale list.
       */
      total: {
        type: Number,
      },
      /**
       * Toggle to show the sell section.
       */
      _isShowSell: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show the products section.
       */
      _isShowProducts: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show the register section.
       */
      _isShowRegister: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show the update section.
       */
      _isShowUpdate: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show the delete section.
       */
      _isShowDelete: {
        type: Boolean,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.completeSaleSuccess = false;
    this.deleteSuccess = false;
    this.editSuccess = false;
    this.productToEdit = {};
    this.productsToSell = [];
    this.registerError = {};
    this.registerSuccess = false;
    this.registeredProducts = [];
    this.userData = {};
    this.total = 0;
    this._isShowSell = true;
    this._isShowProducts = false;
    this._isShowRegister = false;
  }

  /**
   * Dispatches a logout request event to the application root.
   */
  _logout() {
    dispatchCustomEvent(this, 'home-page-logout');
  }

  /**
   * Hides all home page sections.
   */
  _resetSections() {
    this._isShowSell = false;
    this._isShowProducts = false;
    this._isShowRegister = false;
  }

  /**
   * Shows the requested home page section based on the clicked tab.
   *
   * @param {Event} event - The click event from the tab.
   * @param {HTMLElement} event.target - The clicked tab.
   */
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

  /**
   * Returns the home view template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplHome() {
    return html`
      <header class="main-header">
        <div class="name-header">Welcome ${this.userData?.name}</div>
        <nav class="navbar">
          <mwc-tab-bar activeIndex="2">
            <mwc-tab
              label="Products"
              id="products"
              @click="${this._showSection}"
            ></mwc-tab>
            ${this.userData?.level === 'admin' || this.userData?.level === 'manager'
              ? html`
                  <mwc-tab
                    label="Register"
                    id="register"
                    @click="${this._showSection}"
                  ></mwc-tab>
                `
              : nothing}
            <mwc-tab
              label="Sell"
              id="sell"
              @click="${this._showSection}"
            ></mwc-tab>
          </mwc-tab-bar>
        </nav>
        <mwc-button
          class="logout"
          raised
          label="Logout"
          @click=${this._logout}
        ></mwc-button>
      </header>
      ${this._isShowSell ? this._tplSell : nothing}
      ${this._isShowProducts ? this._tplProducts : nothing}
      ${this._isShowRegister ? this._tplRegister : nothing}
    `;
  }

  /**
   * Returns the sell section template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplSell() {
    return html`<sell-element
      .productsToSell="${this.productsToSell}"
      .total="${this.total}"
      ?complete-sale-success="${this.completeSaleSuccess}"
    ></sell-element>`;
  }

  /**
   * Returns the products section template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplProducts() {
    return html`<products-element
      level-user="${this.userData?.level}"
      ?delete-success="${this.deleteSuccess}"
      ?edit-success="${this.editSuccess}"
      .productToEdit="${this.productToEdit}"
      .registeredProducts="${this.registeredProducts}"
    ></products-element>`;
  }

  /**
   * Returns the register section template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplRegister() {
    return html`<register-element
      ?register-success="${this.registerSuccess}"
      register-error="${this.registerError.code}"
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
