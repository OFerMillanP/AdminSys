import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {SellElement} from './sell/sell.js';
import {ProductsElement} from './products/products.js';
import {RegisterElement} from './register/register.js';
import {SalesElement} from './sales/sales.js';
import {ToolsElement} from './tools/tools.js';

import {dispatchCustomEvent, t} from '../../utils/utils.js';

import styles from './home.css.js';
import { state } from 'lit/decorators.js';

/**
 * Home page container element.
 *
 * Renders the sell, product, registration, sales, and tools sections and
 * routes navigation events inside the home view.
 *
 * @fires home-page-logout - Requests that the application end the current session; `event.detail` is `true`.
 * @fires home-element-get-sales - Requests the sales data when the sales tab is selected; `event.detail` is `true`.
 */
export class HomeElement extends ScopedElementsMixin(LitElement) {
  /** @returns {string} The custom-element tag name. */
  static get is() {
    return 'home-element';
  }

  /** @returns {Object} Child custom-element constructors registered in this scope. */
  static get scopedElements() {
    return {
      'products-element': ProductsElement,
      'register-element': RegisterElement,
      'sales-element': SalesElement,
      'sell-element': SellElement,
      'tools-element': ToolsElement,
    };
  }

  /** @returns {Object} Reactive property definitions for the home page and child sections. */
  static get properties() {
    return {
      /**
       * Cash-register closing records displayed by the sales section.
       * @type {Array}
       * @attribute closed-cash-registers
       */
      closedCashRegisters: {
        type: Array,
      },
      /**
       * Whether the last sale completed successfully.
       * @type {boolean}
       * @attribute complete-sale-success
       */
      completeSaleSuccess: {
        type: Boolean,
        attribute: 'complete-sale-success',
      },
      /**
       * Whether the last product deletion succeeded.
       * @type {boolean}
       * @attribute delete-success
       */
      deleteSuccess: {
        type: Boolean,
        attribute: 'delete-success',
      },
      /**
       * Error response from the last product edit request.
       * @type {Object}
       * @attribute edit-error-response
       */
      editErrorResponse: {
        type: Object,
      },
      /**
       * Whether the last product edit succeeded.
       * @type {boolean}
       * @attribute edit-success
       */
      editSuccess: {
        type: Boolean,
        attribute: 'edit-success',
      },
      /**
       * Barcode-generation result passed to the tools section.
       * @type {Object}
       * @attribute generated-barcode
       */
      generatedBarcode: {
        type: Object,
      },
      /**
       * Product suggestions available to the sale section.
       * @type {Array}
       * @attribute posible-products
       */
      posibleProducts: {
        type: Array,
      },
      /**
       * Product selected for editing.
       * @type {Object}
       * @attribute product-to-edit
       */
      productToEdit: {
        type: Object,
      },
      /**
       * Products currently selected for sale.
       * @type {Array}
       * @attribute products-to-sell
       */
      productsToSell: {
        type: Array,
      },
      /**
       * Product registration error details.
       * @type {Object}
       * @attribute register-error
       */
      registerError: {
        type: Object,
      },
      /**
       * Products loaded from the inventory.
       * @type {Array}
       * @attribute registered-products
       */
      registeredProducts: {
        type: Array,
      },
      /**
       * Whether the last product registration succeeded.
       * @type {boolean}
       * @attribute register-success
       */
      registerSuccess: {
        type: Boolean,
        attribute: 'register-success',
      },
      /**
       * Session user data from login.
       * @type {Object}
       * @attribute user-data
       */
      userData: {
        type: Object,
      },
      /**
       * Current total amount for the sale list.
       * @type {number}
       * @attribute total
       */
      total: {
        type: Number,
      },
      /**
       * List of completed sales transactions.
       * @type {Array}
       * @attribute sales
       */
      sales: {
        type: Array,
      },
      /**
       * Toggle to show the sell tab.
       * @type {boolean}
       * @state
       */
      _isShowSell: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show the products tab.
       * @type {boolean}
       * @state
       */
      _isShowProducts: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show the register tab.
       * @type {boolean}
       * @state
       */
      _isShowRegister: {
        type: Boolean,
        state: true,
      },
      /**
       * Toggle to show the sales tab.
       * @type {boolean}
       * @state
       */
      _isShowSales: {
        type: Boolean,
        state: true,
      },
      
      /**
       * Toggle to show the tools tab.
       * @type {boolean}
       * @state
       */
      _isShowTools: {
        type: Boolean,
        state: true,
      },
    };
  }

  /** Initializes the section, tab, and child-component state. */
  constructor() {
    super();
    this.closedCashRegisters = [];
    this.completeSaleSuccess = false;
    this.deleteSuccess = false;
    this.editErrorResponse = {};
    this.editSuccess = false;
    this.generatedBarcode = {}
    this.posibleProducts = [];
    this.productToEdit = {};
    this.productsToSell = [];
    this.registerError = {};
    this.registerSuccess = false;
    this.registeredProducts = [];
    this.sales = [];
    this.total = 0;
    this.userData = {};
    this._activeIndex = 0;
    this._isShowProducts = false;
    this._isShowRegister = false;
    this._isShowSales = false;
    this._isShowSell = false;
    this._isShowTools = false;
  }

  /**
   * Selects the initial sell section after the component first renders.
   * @returns {void}
   */
  firstUpdated() {
    super.firstUpdated();
    const sections = {
      admin: () => {
        this._resetSections();
        this._isShowSell = true;
        this._activeIndex = 0;
      },
      manager: () => {
        this._resetSections();
        this._isShowSell = true;
        this._activeIndex = 0;
      },
      general: () => {
        this._resetSections();
        this._isShowSell = true;
        this._activeIndex = 0;
      },
    };
    sections[this.userData?.level]?.call();
  }

  /**
   * Dispatches a request for the application to end the current session.
   * @fires home-page-logout - Fired with `event.detail === true`.
   * @fires home-page-logout
   */
  _logout() {
    dispatchCustomEvent(this, 'home-page-logout');
  }

  /**
   * Hides all home page sections.
   * @returns {void}
   */
  _resetSections() {
    this._isShowSell = false;
    this._isShowProducts = false;
    this._isShowRegister = false;
    this._isShowSales = false;
    this._isShowTools = false;
  }

  /**
   * Shows the requested home page section based on the clicked tab.
   *
   * @param {Event} event - The click event from the tab.
   * @param {HTMLElement} event.target - The clicked tab.
   * @fires home-element-get-sales - Fired when the sales tab is selected with `event.detail === true`.
   */
  _showSection({target: {id}}) {
    const sections = {
      products: () => {
        this._resetSections();
        this._isShowProducts = true;
        this._activeIndex = 1;
      },
      register: () => {
        this._resetSections();
        this._isShowRegister = true;
        this._activeIndex = 2;
      },
      sales: () => {
        this._resetSections();
        this._isShowSales = true;
        this._activeIndex = 3;
        dispatchCustomEvent(this, `${HomeElement.is}-get-sales`);
      },
      sell: () => {
        this._resetSections();
        this._isShowSell = true;
        this._activeIndex = 0;
      },
      tools: () => {
        this._resetSections();
        this._isShowTools = true;
        this._activeIndex = 4;
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
        <div class="name-header">Buhonería</div>
        <nav class="navbar">
          <mwc-tab-bar activeIndex="${this._activeIndex}">
            <mwc-tab
              label="${t('home-element-nav-sell')}"
              id="sell"
              @click="${this._showSection}"
            ></mwc-tab>
            <mwc-tab
              label="${t('home-element-nav-products')}"
              id="products"
              @click="${this._showSection}"
            ></mwc-tab>
            ${this.userData?.level === 'admin' || this.userData?.level === 'manager'
              ? html`
                  <mwc-tab
                    label="${t('home-element-nav-register')}"
                    id="register"
                    @click="${this._showSection}"
                  ></mwc-tab>
                `
              : nothing}
            <mwc-tab
              label="${t('home-element-nav-sales')}"
              id="sales"
              @click="${this._showSection}"
            ></mwc-tab>
            ${this.userData?.level === 'admin' ?
              html`
                <mwc-tab
                  label="${t('home-element-nav-tools')}"
                  id="tools"
                  @click="${this._showSection}"
                ></mwc-tab>
              ` : nothing}
          </mwc-tab-bar>
        </nav>
        <mwc-button
          class="logout"
          raised
          label="${t('home-element-nav-logout')}"
          @click=${this._logout}
        ></mwc-button>
      </header>
      ${this._isShowProducts ? this._tplProducts : nothing}
      ${this._isShowRegister ? this._tplRegister : nothing}
      ${this._isShowSales ? this._tplSales : nothing}
      ${this._isShowSell ? this._tplSell : nothing}
      ${this._isShowTools ? this._tplTools : nothing}
    `;
  }

  /**
   * Returns the sell section template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplSell() {
    return html`<sell-element
      .posibleProducts="${this.posibleProducts}"
      .productsToSell="${this.productsToSell}"
      .total="${this.total}"
      ?complete-sale-success="${this.completeSaleSuccess}"
    ></sell-element>`;
  }

  /**
   * Returns the sales section template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplSales() {
    return html`<sales-element
      .closedCashRegisters="${this.closedCashRegisters}"
      .sales="${this.sales}"
      .total="${this.total}"
      level="${this.userData?.level}"
      ?complete-sale-success="${this.completeSaleSuccess}"
    ></sales-element>`;
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
      .editErrorResponse="${this.editErrorResponse}"
      .productToEdit="${this.productToEdit}"
      .registeredProducts="${this.registeredProducts}"
    ></products-element>`;
  }

  /**
   * Returns the tools section template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplRegister() {
    return html`<register-element
      ?register-success="${this.registerSuccess}"
      register-error="${this.registerError.code}"
    ></register-element>`;
  }

  /**
   * Returns the register section template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplTools() {
    return html`
      <tools-element
        .userData="${this.userData}"
        .generatedBarcode="${this.generatedBarcode}"
      ></tools-element>
    `;
  }

  /** @returns {import('lit').CSSResult[]} Styles applied to the home page. */
  static get styles() {
    return [styles];
  }

  /** Renders the home page.
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html` ${this._tplHome} `;
  }
}

window.customElements.define('home-element', HomeElement);
