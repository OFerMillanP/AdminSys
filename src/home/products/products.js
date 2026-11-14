import {LitElement, html, nothing} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {ModalElement} from '../../organisms/modal/modal.js';
import {PaginationElement} from '../../organisms/pagination/pagination.js';

import {dispatchCustomEvent, t} from '../../../utils/utils.js';

import {repeat} from 'lit/directives/repeat.js';
import styles from './products.css.js';

/**
 * Products administration page element.
 *
 * Renders the product list, edit form, and delete confirmation modal.
 * Dispatches edit and delete events to the parent container.
 *
 * @fires products-element-search-product - Requests a product search with `{value: string}` in `event.detail`.
 * @fires products-element-select-product-to-edit - Requests product details with `{id: string}` in `event.detail`.
 * @fires products-element-delete-product - Requests deletion with `{id: string}` in `event.detail`.
 * @fires products-element-close-edit-modal - Notifies the parent that the edit modal closed; `event.detail` is `true`.
 * @fires products-element-close-success-edit-modal - Notifies the parent that editing was canceled; `event.detail` is `true`.
 * @fires products-element-edit-product - Requests an update with the edited product object in `event.detail`; `img` is included only when a new image was selected.
 * @fires products-element-toggle-barcodes - Toggles a product's extra barcodes with `{id: string}` in `event.detail`.
 * @fires products-element-toggle-image - Toggles a product image with `{id: string}` in `event.detail`.
 * @fires products-element-sort-products - Requests sorting with `{sortBy: string}` in `event.detail`.
 * @listens modal-element-confirm-action-confirm-delete - Confirms deletion; `event.detail` is `true`, and the component then emits `products-element-delete-product`.
 * @listens modal-element-confirm-action-success-update - Closes the successful product update modal; `event.detail` is `true`.
 * @listens pagination-element-page-changed - Changes the visible product page from `event.detail.page`.
 */
export class ProductsElement extends ScopedElementsMixin(LitElement) {
  /** @returns {string} The custom-element tag name. */
  static get is() {
    return 'products-element';
  }

  /** @returns {Object} Child custom-element constructors registered in this scope. */
  static get scopedElements() {
    return {
      'modal-element': ModalElement,
      'pagination-element': PaginationElement
    };
  }

  /** @returns {Object} Reactive property definitions for product data and UI state. */
  static get properties() {
    return {
      /**
       * Whether the last delete operation succeeded.
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
       * Whether the last edit operation succeeded.
       * @type {boolean}
       * @attribute edit-success
       */
      editSuccess: {
        type: Boolean,
        attribute: 'edit-success',
      },
      /**
       * Current authenticated user level for permission checks.
       * @type {string}
       * @attribute level-user
       */
      levelUser: {
        type: String,
        attribute: 'level-user',
      },
      /**
       * Product currently selected for editing.
       * @type {Object}
       * @attribute product-to-edit
       */
      productToEdit: {
        type: Object,
      },
      /**
       * Registered products loaded from the API.
       * @type {Array}
       * @attribute registered-products
       */
      registeredProducts: {
        type: Array,
      },
      /**
       * Whether the delete confirmation modal is visible.
       * @type {boolean}
       * @state
       */
      _confirmDelete: {
        type: Boolean,
        state: true,
      },
      /**
       * Current page index in the registered-products list.
       * @type {number}
       * @state
       */
      _currentPage: {
        type: Number,
        state: true,
      },
      /**
       * Reference to the product deletion confirmation modal.
       * @type {Object}
       * @state
       */
      _deleteModalRef: {
        type: Object,
        state: true,
      },
      /**
       * Reference to the successful deletion modal.
       * @type {Object}
       * @state
       */
      _successDeleteModalRef: {
        type: Object,
        state: true,
      },
      /**
       * Reference to the product update error modal.
       * @type {Object}
       * @state
       */
      _editErrorResponseModalRef: {
        type: Object,
        state: true,
      },
      /**
       * Reference to the successful product update modal.
       * @type {Object}
       * @state
       */
      _editSuccessModalRef: {
        type: Object,
        state: true,
      },
      /**
       * Localized messages keyed by known product-edit error codes.
       * @type {Object}
       * @state
       */
      _messageByCode: {
        type: Object,
        state: true,
      },
      /**
       * The id of the product currently pending deletion.
       * @type {Object}
       * @state
       */
      _productIdToAction: {
        type: Object,
        state: true,
      },
      /**
       * Selected image file and its preview data URL.
       * @type {Object}
       * @state
       */
      _selectedImage: {
        type: Object,
        state: true,
      },
      /**
       * Whether the edit form is currently displayed.
       * @type {boolean}
       * @state
       */
      _showEditForm: {
        type: Boolean,
        state: true,
      },
    };
  }

  /** Initializes product data, form state, and modal references. */
  constructor() {
    super();
    this.deleteSuccess = false;
    this.editErrorResponse = {};
    this.editSuccess = false;
    this.levelUser = '';
    this.productToEdit = {};
    this.registeredProducts = [];
    this._confirmDelete = false;
    this._currentPage = 1;
    this._deleteModalRef = createRef();
    this._editErrorResponseModalRef = createRef();
    this._editSuccessModalRef = createRef();
    this._messageByCode = {
      'EDP003': t('products-element-product-barcode-duplicate'),
      'EDP004': t('products-element-product-extra-barcode-duplicate'),
    }
    this._productIdToAction = {};
    this._selectedImage = {
      file: {},
      src: ''
    };
    this._showEditForm = false;
    this._successDeleteModalRef = createRef();
  }

  /**
   * Lit lifecycle callback invoked after reactive properties change.
   * Used to open edit and delete modals when incoming state changes.
   *
   * @param {Map} changedProperties - The changed reactive properties.
   * @returns {void}
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (
      changedProperties.has('productToEdit') &&
      Object.keys(this.productToEdit).length > 0
    ) {
      this._showEditForm = true;
    }
    if (changedProperties.has('deleteSuccess') && this.deleteSuccess) {
      this._successDeleteModalRef.value.openModal();
    }
    if (changedProperties.has('editSuccess') && this.editSuccess) {
      this._editSuccessModalRef.value.openModal();
    }
    if (changedProperties.has('editErrorResponse') && Object.keys(this.editErrorResponse).length > 0) {
      this._editErrorResponseModalRef.value.openModal();
    }
  }

  /**
   * Clears the product search field when Escape is pressed.
   * @param {KeyboardEvent} event - Keyboard event from the search input.
   */
  _manageKeyDowns({key, target}) {
    if (key === 'Escape') {
      target.value = '';
      this._handleInput({target: {id: target.id, value: ''}});
    }
  }

  /**
   * Handles input changes for the product edit form and search field.
   *
   * @param {InputEvent} event - The input event.
   * @fires products-element-search-product - Fired with `{value: string}` for search input.
   */
  _handleInput({target: {id, value}}) {
    if (Object.keys(this.productToEdit).length) {
      this.productToEdit.barcodeList = [...
        this.productToEdit?.barcodeList.map((barcode) => {
          if (barcode.id === id) {
            return {
              ...barcode,
              barcode: value,
              action: barcode.action?.length ? barcode.action : 'edit'
            }
          }
          return barcode
        })
      ]
    }
    const inputs = {
      barcode: () => {
        this.productToEdit = {...this.productToEdit, barcode:  value.toUpperCase() || ''};
      },
      'product-name': () => {
        this.productToEdit = {...this.productToEdit, name:  value.toUpperCase() || ''};
      },
      price: () => {
        this.productToEdit = {...this.productToEdit, price:  value.toUpperCase() || ''};
      },
      stock: () => {
        this.productToEdit = {...this.productToEdit, stock:  value.toUpperCase() || ''};
      },
      description: () => {
        this.productToEdit = {...this.productToEdit, description:  value || ''};
      },
      search: () => {
        dispatchCustomEvent(this, `${ProductsElement.is}-search-product`, {
          value,
        });
      },
    };
    inputs[id]?.call();
  }

  /**
   * Updates the product category selected in the edit form.
   * @param {CustomEvent} event - Category selection event with `detail.index`.
   */
  _setCategory({detail: {index}}){
    this.productToEdit = {...this.productToEdit, category: `${index}`};
  }

  /**
   * Requests the selected product for editing.
   *
   * @param {Event} event - The click event on the edit button.
   * @fires products-element-select-product-to-edit - Fired with `{id: string}` in `event.detail`.
   */
  _selectProductToEdit({target: {id}}) {
    dispatchCustomEvent(this, `${ProductsElement.is}-select-product-to-edit`, {
      id: id,
    });
  }

  /**
   * Opens the delete confirmation modal for the selected product.
   *
   * @param {Event} event - The click event on the delete button.
   * @param {string} event.target.id - Identifier of the product to delete.
   */
  _deleteProduct({target: {id}}) {
    this._productIdToAction = {id};
    this._confirmDelete = true;
    this._deleteModalRef.value.openModal();
  }

  /**
   * Dispatches the event that confirms deletion of the currently selected product.
   * @fires products-element-delete-product - Fired with `{id: string}` in `event.detail`.
   */
  _confirmDeleteProduct() {
    dispatchCustomEvent(
      this,
      `${ProductsElement.is}-delete-product`,
      this._productIdToAction
    );
  }

  /**
   * Closes the edit success modal and resets the edit form state.
   * @fires products-element-close-edit-modal - Fired with `event.detail === true`.
   */
  _closeEditModal() {
    this._showEditForm = false;
    this._selectedImage = {};
    dispatchCustomEvent(this, `${ProductsElement.is}-close-edit-modal`);
  }

  /**
   * Cancels edit mode and closes the edit view.
   * @fires products-element-close-success-edit-modal - Fired with `event.detail === true`.
   */
  _cancelEdit() {
    this._showEditForm = false;
    this._selectedImage = {};
    dispatchCustomEvent(this, `${ProductsElement.is}-close-success-edit-modal`);
  }

  /**
   * Sends the edited product to the parent and opens the success modal.
   * @fires products-element-edit-product - Fired with the edited product object in `event.detail`; includes `img` only for a newly selected image.
   */
  _updateProduct() {
    const productToEdit = {...this.productToEdit};
    if (this._selectedImage?.file?.name) {
      productToEdit.img = this._selectedImage.file;
    } else {
      delete productToEdit.img;
    }
    dispatchCustomEvent(
      this,
      `${ProductsElement.is}-edit-product`,
      productToEdit
    );
  }

  /**
   * Handles page changes in the products list.
   * @param {CustomEvent} event - The page change event.
   * @param {number} event.detail.page - Selected page number.
   */
  _handlePageChanged({detail: {page}}) {
    this._currentPage = page;
  }

  /**
   * Toggles the display of barcodes for a selected product row.
   *
   * @param {Event} event - The click event from the sale row.
   * @param {HTMLElement} event.currentTarget - The row target element.
   * @param {string} event.currentTarget.id - The product identifier.
   * @fires products-element-toggle-barcodes - Fired with `{id: string}` in `event.detail`.
   */
  _toggleBarcodes({currentTarget: {id}}) {
    dispatchCustomEvent(this, `${ProductsElement.is}-toggle-barcodes`, {id});
  }

  /**
   * Toggles the display of the image for a selected product row.
   *
   * @param {Event} event - The click event from the sale row.
   * @param {HTMLElement} event.currentTarget - The row target element.
   * @param {string} event.currentTarget.id - The product identifier.
   * @fires products-element-toggle-image - Fired with `{id: string}` in `event.detail`.
   */
  _toggleImage({currentTarget: {id}}) {
    dispatchCustomEvent(this, `${ProductsElement.is}-toggle-image`, {id});
  }

  /**
   * Marks an extra barcode for removal from the edited product.
   * @param {Event} event - Click event on the barcode remove control.
   * @param {string} event.target.id - Barcode row identifier.
   */
  _removeBarcode({target: {id}}){
    this.productToEdit = {
      ...this.productToEdit,
      barcodeList: [...
        this.productToEdit.barcodeList?.map((barcode) => {
          if (barcode.id === id) {
            return {
              ...barcode,
              action: 'remove'
            }
          }
          return barcode
        })
      ]
    }
  }

  /** Adds an empty extra-barcode entry for admin users. */
  _addBarcode(){
    if (!!this.productToEdit && this.levelUser === 'admin') {
      this.productToEdit = 
        {
          ...this.productToEdit,
          barcodeList: [
            ...this.productToEdit.barcodeList || [], 
            {
              product_id: this.productToEdit.id,
              barcode: '',
              primary_barcode: this.productToEdit.barcode,
              id: `${window.crypto.randomUUID()}`,
              action: 'add'
            }
          ]
        }
    }
  }

  /**
   * Checks whether required fields are missing from the edit form.
   * @returns {boolean} Whether the form is incomplete.
   */
  _isFilledForm(){
    return !this.productToEdit.barcode.length ||
    !this.productToEdit.name.length ||
    !this.productToEdit.stock.length ||
    !this.productToEdit.price
  }

  /**
   * Requests product sorting by the clicked column.
   * @param {Event} event - Click event on a sortable column.
   * @param {string} event.target.id - Name of the sort field.
   * @fires products-element-sort-products - Fired with `{sortBy: string}` in `event.detail`.
   */
  _sortBy({target: {id}}){
    dispatchCustomEvent(this, `${ProductsElement.is}-sort-products`, {
      sortBy: id,
    });
  }

  /**
   * Reads the selected product image and updates its preview.
   * @param {Event} event - Change event from the image file input.
   */
  _onFileSelected({target: {files}}) {
    const file = files?.[0];
    if (!file) return;

    this._selectedImage = {file, src: ''};
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this._selectedImage = {...this._selectedImage, src: reader.result};
      }
    };

    reader.readAsDataURL(file);
  }

  /**
   * Returns the edit form template for the selected product.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplEditForm() {
    return html`
      <div class="register-container">
        <div id="register-product">
          <h2 class="register-header">${t('products-element-product-register-title')}</h2>
          <div>
            <div class="input-container">
              <mwc-textfield
                raised
                required
                ?disabled="${!(this.levelUser === 'admin')}"
                label="${t('products-element-product-barcode')}"
                autocomplete="off"
                id="barcode"
                type="text"
                autocomplete="off"
                .value="${this.productToEdit.barcode}"
                @input=${this._handleInput}
              ></mwc-textfield>
              ${this.levelUser === 'admin' ? 
                html`
                  <mwc-icon 
                    slot="icon"
                    class="register-icon${this.productToEdit.barcode.length ? ' enabled' : ''}"
                    @click="${this._addBarcode}"
                  >add</mwc-icon>
                ` : nothing}
              </div>

            ${this.productToEdit.barcodeList?.map((barcode) => 
              barcode.action !== 'remove' ? 
                html`
                  <div class="input-container">
                    <mwc-textfield
                      raised
                      ?disabled="${!(this.levelUser === 'admin')}"
                      label="${t('products-element-product-extra-barcode')}"
                      autocomplete="off"
                      id="${barcode.id}"
                      type="text"
                      autocomplete="off"
                      .value="${barcode.barcode}"
                      @input=${this._handleInput}
                    ></mwc-textfield>
                    <mwc-icon 
                      slot="icon"
                      class="register-icon enabled"
                      id="${barcode.id}"
                      @click="${this._removeBarcode}"
                    >remove</mwc-icon>
                  </div>
                ` : nothing
            )}

            <div class="input-container">
              <mwc-select 
                label="${t('products-element-selector-label')}"
                id="category"
                @selected=${this._setCategory}
              >
                <mwc-list-item value="0" .selected="${this.productToEdit.category === '0'}">${t('products-element-selector-product')}</mwc-list-item>
                <mwc-list-item value="1" .selected="${this.productToEdit.category === '1'}">${t('products-element-selector-service')}</mwc-list-item>
              </mwc-select>
            </div>
            <div class="input-container">
              <mwc-textfield
                raised
                required
                ?disabled="${!(this.levelUser === 'admin')}"
                label="${t('products-element-product-name')}"
                autocomplete="off"
                id="product-name"
                type="text"
                .value="${this.productToEdit.name}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            <div class="input-container">
              <mwc-textfield
                raised
                required
                ?disabled="${!(this.levelUser === 'admin')}"
                label="${t('products-element-product-price')}"
                autocomplete="off"
                id="price"
                type="number"
                min="0"
                iconTrailing="attach_money"
                .step="${0.1}"
                .value="${this.productToEdit.price}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            ${this.productToEdit.category === '0' ? 
              html`
                <div class="input-container">
                  <mwc-textfield
                    raised
                    label="${t('products-element-product-stock')}"
                    autocomplete="off"
                    id="stock"
                    type="number"
                    min="0"
                    .value="${this.productToEdit.stock}"
                    @input=${this._handleInput}
                  ></mwc-textfield>
                </div>
              ` : nothing}
            <div class="input-container textarea">
              <mwc-textarea
                label="${t('products-element-product-description')}"
                id="description"
                type="text"
                rows="4"
                cols="51"
                .value="${this.productToEdit.description}"
                @input=${this._handleInput}
              >
              </mwc-textarea>
            </div>
            <div class="input-container textarea">
              <mwc-button
                raised
                @click="${() => this.shadowRoot.querySelector('#file-input').click()}"
              >
                <mwc-icon 
                  slot="icon"
                >upload_file</mwc-icon>${t('products-element-product-image-chosen-label')}
              </mwc-button>
              <span class="file-name">${this._selectedImage.file?.name || this.productToEdit.image || t('products-element-product-no-image-chosen')}</span>
              <input 
                id="file-input" 
                type="file" 
                accept="image/*" 
                @change="${this._onFileSelected}" 
                hidden 
              />
            </div>
            <div class="product-image">
              ${this._selectedImage.src ?
                html`
                  <img src="${this._selectedImage.src}" alt="${this._selectedImage.file?.name || ''}"/>
                ` : nothing
              }
              ${!this._selectedImage.src && this.productToEdit?.image ?
                html`
                  <img src="http://localhost:8100/resources/img/products/${this.productToEdit.image}" alt="${this.productToEdit.image}"/>
                ` : nothing
              }
            </div>
            <div class="info-label">
              <label>${t('products-element-required-fields')}</label>
            </div>
            <div class="button-container">
              <mwc-button
                class="save"
                raised
                label="${t('products-element-button-save')}"
                ?disabled="${this._isFilledForm()}"
                @click=${this._updateProduct}
              ></mwc-button>
              <mwc-button
                class="register-button"
                raised
                label="${t('products-element-button-cancel')}"
                @click=${this._cancelEdit}
              ></mwc-button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Returns the product list template for the registered products.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplProductList() {
    return html`
      <div class="list-products-navigation">
        <div class="list-products-header">
          <div class="input-container">
            <mwc-textfield
              raise
              label="${t('products-element-button-search')}"
              autocomplete="off"
              iconTrailing="search"
              id="search"
              type="text"
              @input=${this._handleInput}
              @keydown=${this._manageKeyDowns}
            ></mwc-textfield>
          </div>
        </div>
        ${this.registeredProducts?.length
          ? html` <table>
              <thead>
                <tr>
                  <th>
                    <div 
                      class="header-table selectable"
                      id="barcode"
                      @click="${this._sortBy}"
                    >
                        ${t('products-element-product-barcode')}
                    </div>
                  </th>
                  <th>
                    <div
                      class="header-table selectable"
                      id="name"
                      @click="${this._sortBy}"
                    >
                      ${t('products-element-product-name')}
                    </div>
                  </th>
                  <th>
                    <div
                      class="header-table selectable"
                      id="price"
                      @click="${this._sortBy}"
                    >
                      ${t('products-element-product-price')}
                    </div>
                  </th>
                  <th>
                    <div
                      class="header-table selectable"
                      id="stock"
                      @click="${this._sortBy}"
                    >
                      ${t('products-element-product-stock')}
                    </div>
                  </th>
                  <th>
                    <div class="header-table">${t('products-element-product-description')}</div>
                  </th>
                  ${this.levelUser === 'admin'
                    ? html`
                      <th>
                        <div
                          class="header-table selectable"
                          id="date"
                          @click="${this._sortBy}"
                        >
                          ${t('products-element-products-column-date')}
                        </div>
                      </th>
                      `
                    : nothing}
                    <th>
                      <div class="header-table">${t('products-element-products-column-tools')}</div>
                    </th>
                </tr>
              </thead>
              <tbody>
                ${repeat(
                  this.registeredProducts[this._currentPage - 1] || {},
                  (product) =>
                    html`
                      <tr
                        class="${product.barcodeList.length ? 'extra-barcodes' : ''}"
                      >
                      <td
                        id="${product.id}"
                        class="barcode-actionable"
                        @click=${this._toggleBarcodes}>${product.barcode}</td>
                      <td
                        id="${product.id}"
                        class="barcode-actionable"
                        @click=${this._toggleBarcodes}>${product.name}</td>
                      <td>
                        <div class="data-number">$ ${product.price}</div>
                      </td>
                      <td>
                        <div class="data-number">${product.category === '0' ? product.stock : t('products-element-not-applicable')}</div>
                      </td>
                      <td>${product.description}</td>
                      ${this.levelUser === 'admin'
                        ? html`
                          <td>
                            ${new Date(product.date).toLocaleDateString()} - ${new Date(product.date).toLocaleTimeString()}
                          </td>
                          `
                        : nothing}
                      ${this.levelUser
                        ? html`
                            <td>
                              <div class="product-tools">
                                ${product.image ?
                                  html`
                                    <button
                                      class="show-product-image"
                                      id="${product.id}"
                                      @click=${this._toggleImage}
                                    >
                                      &#128065;
                                    </button>
                                  `: nothing}
                                <button
                                  class="edit-product"
                                  id="${product.id}"
                                  @click=${this._selectProductToEdit}
                                  popovertarget="my-dialog"
                                >
                                  &#9998;
                                </button>
                                ${this.levelUser === 'admin'
                                  ? html`
                                      <button
                                        class="delete-product"
                                        id="${product.id}"
                                        @click=${this._deleteProduct}
                                        popovertarget="my-dialog"
                                      >
                                        ✖
                                      </button>
                                    `
                                  : nothing}
                              </div>
                            </td>
                            <br>
                          `
                        : nothing}
                    </tr>
                    ${product.barcodeList && product.showBarcodes
                      ? html`
                          <tr class="products-row">
                            <table class="products-row">
                              <thead></thead>
                              <tbody>
                                ${product.barcodeList.map(
                                  (barcode) =>
                                    html`
                                      <tr class="barcodes">
                                        <td class="barcode">
                                          ${barcode.barcode}
                                        </td>
                                      </tr>
                                    `
                                )}
                              </tbody>
                            </table>
                          </tr>
                          <br />
                        `
                      : nothing}
                    ${product.showImage
                      ? html`
                          <tr></tr>
                          <tr>
                             <img class="product-image" src="http://localhost:8100/resources/img/products/${product.image}" alt="${product.image}"/>
                          </tr>
                          <br />
                        `
                      : nothing}`
                    
                )}
              </tbody>
            </table>
            `
          : t('products-element-products-not-found')}
      </div>
    `;
  }

  /**
   * Returns the delete confirmation modal template.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplDeleteModal() {
    return html`
      <modal-element
        ${ref(this._deleteModalRef)}
        .data=${{
          bodyText: t('products-element-product-delete-confirm-body'),
          cancelButtonText: t('products-element-button-cancel'),
          code: 'confirm-delete',
          confirmButtonText: t('products-element-button-delete'),
          titleText: t('products-element-product-delete-confirm-title'),
          type: 'warning',
          isEnableConfirmButton: true,
        }}
        @modal-element-confirm-action-confirm-delete=${this
          ._confirmDeleteProduct}
      ></modal-element>
    `;
  }

  /**
   * Returns the delete success modal template.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplDeleteSuccessModal() {
    return html`
      <modal-element
        ${ref(this._successDeleteModalRef)}
        .data=${{
          bodyText: t('products-element-product-deleted'),
          code: 'success-delete',
          confirmButtonText: t('products-element-button-accept'),
          titleText: t('products-element-product-deleted-title'),
          type: 'success',
          isEnableConfirmButton: true,
        }}
      ></modal-element>
    `;
  }

  /**
   * Returns the edit success modal template.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplEditSuccessModal() {
    return html`
      <modal-element
        ${ref(this._editSuccessModalRef)}
        .data=${{
          bodyText: t('products-element-product-updated'),
          code: 'success-update',
          confirmButtonText: t('products-element-button-accept'),
          titleText: t('products-element-product-updated-title'),
          type: 'success',
          isEnableConfirmButton: true,
        }}
        @modal-element-confirm-action-success-update=${this
          ._closeEditModal}
      ></modal-element>
    `;
  }

  /**
   * Returns the edit error modal template.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplEditErrorResponseModal() {
    return html`
      <modal-element
        ${ref(this._editErrorResponseModalRef)}
        .data=${{
          bodyText: `${this._messageByCode[this.editErrorResponse.code] || t('products-element-product-update-error')}`,
          code: 'error-update',
          confirmButtonText: t('products-element-button-accept'),
          titleText: t('products-element-product-update-error-title'),
          type: 'error',
          isEnableConfirmButton: true,
        }}
      ></modal-element>
    `;
  }

  /** @returns {import('lit').TemplateResult} Pagination for registered products. */
  get _tplPagination() {
    return html`
      <pagination-element
        .totalPages=${Math.ceil(this.registeredProducts.length)}
        @pagination-element-page-changed=${this._handlePageChanged}
      ></pagination-element>
    `;
  }

  /** @returns {import('lit').CSSResult[]} Styles applied to the products page. */
  static get styles() {
    return [styles];
  }

  /**
   * Renders the products-element template.
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html`
      ${!this._showEditForm ? this._tplProductList : this._tplEditForm}
      ${this._tplDeleteModal} ${this._tplDeleteSuccessModal}
      ${this._tplEditSuccessModal}
      ${this._tplEditErrorResponseModal}
      ${!this._showEditForm ? this._tplPagination : nothing}
    `;
  }
}

window.customElements.define('products-element', ProductsElement);
