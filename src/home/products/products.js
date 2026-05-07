import {LitElement, html} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {ModalElement} from '../../organisms/modal/modal.js';

import {dispatchCustomEvent} from '../../../utils/utils.js';

import {repeat} from 'lit/directives/repeat.js';
import styles from './products.css.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class ProductsElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'products-element';
  }

  static get scopedElements() {
    return {'modal-element': ModalElement};
  }

  static get properties() {
    return {
      /**
       * The name to say "Hello" to.
       */
      deleteSuccess: {
        type: Boolean,
        attribute: 'delete-success',
      },
      /**
       * The name to say "Hello" to.
       */
      editSuccess: {
        type: Boolean,
        attribute: 'edit-success',
      },
      /**
       * The name to say "Hello" to.
       */
      levelUser: {
        type: String,
        attribute: 'level-user',
      },
      /**
       * Contains list products.
       */
      productToEdit: {
        type: Object,
      },
      /**
       * Contains list products.
       */
      registeredProducts: {
        type: Array,
      },
      /**
       * Contains list products.
       */
      _confirmDelete: {
        type: Boolean,
        state: true,
      },
      _deleteModalRef: {
        type: Object,
        state: true,
      },
      _successDeleteModalRef: {
        type: Object,
        state: true,
      },
      _editSuccessModalRef: {
        type: Object,
        state: true,
      },
      /**
       * Contains list products.
       */
      _productIdToAction: {
        type: Object,
        state: true,
      },
      /**
       * Contains list products.
       */
      _showEditForm: {
        type: Boolean,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.deleteSuccess = false;
    this.editSuccess = false;
    this.levelUser = '';
    this.productToEdit = {};
    this.registeredProducts = [];
    this._confirmDelete = false;
    this._deleteModalRef = createRef();
    this._editSuccessModalRef = createRef();
    this._productIdToAction = {};
    this._showEditForm = false;
    this._successDeleteModalRef = createRef();
  }

  /**
   * Updated function from lifecycle
   * @param {Object} changedProperties checked value
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
  }

  _handleInput({target: {id, value}}) {
    const inputs = {
      barcode: () => {
        this.productToEdit.barcode = value.toUpperCase() || '';
      },
      'barcode-secondary': () => {
        this.productToEdit.barcodeSecondary = value.toUpperCase() || '';
      },
      'product-name': () => {
        this.productToEdit.name = value.toUpperCase() || '';
      },
      price: () => {
        this.productToEdit.price = value || 0;
      },
      stock: () => {
        this.productToEdit.stock = value || 0;
      },
      description: () => {
        this.productToEdit.description = value || '';
      },
      search: () => {
        dispatchCustomEvent(this, `${ProductsElement.is}-search-product`, {
          value,
        });
      },
    };
    inputs[id]?.call();
  }

  _selectProductToEdit({target: {id}}) {
    dispatchCustomEvent(this, `${ProductsElement.is}-select-product-to-edit`, {
      id: parseInt(id),
    });
  }

  _deleteProduct({target: {id}}) {
    this._productIdToAction = {id};
    this._confirmDelete = true;
    this._deleteModalRef.value.openModal();
  }

  _closeEditSuccessModal() {
    this._showEditForm = false;
  }

  _confirmDeleteProduct() {
    dispatchCustomEvent(
      this,
      `${ProductsElement.is}-delete-product`,
      this._productIdToAction
    );
  }

  _cancelEdit() {
    this._showEditForm = false;
  }

  _updateProduct() {
    dispatchCustomEvent(
      this,
      `${ProductsElement.is}-edit-product`,
      this.productToEdit
    );
    this._editSuccessModalRef.value.openModal();
  }

  get _tplEditForm() {
    return html`
      <div class="register-container">
        <div id="register-product">
          <h2 class="register-header">Register product</h2>
          <div>
            <div class="input-container">
              <mwc-textfield
                raised
                required
                ?disabled="${!(this.levelUser === 'admin')}"
                label="Barcode"
                autocomplete="off"
                id="barcode"
                type="text"
                autocomplete="off"
                .value="${this.productToEdit.barcode}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            <div class="input-container">
              <mwc-textfield
                raised
                label="Barcode (Secondary)"
                autocomplete="off"
                id="barcode-secondary"
                type="text"
                .value="${this.productToEdit.barcodeSecondary}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            <div class="input-container">
              <mwc-textfield
                raised
                required
                ?disabled="${!(this.levelUser === 'admin')}"
                label="Product name"
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
                label="Price"
                autocomplete="off"
                id="price"
                type="number"
                min="0"
                iconTrailing="attach_money"
                .value="${this.productToEdit.price}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            <div class="input-container">
              <mwc-textfield
                raised
                label="Stock"
                autocomplete="off"
                id="stock"
                type="number"
                min="0"
                .value="${this.productToEdit.stock}"
                @input=${this._handleInput}
              ></mwc-textfield>
            </div>
            <div class="input-container textarea">
              <mwc-textarea
                label="Description"
                id="description"
                type="text"
                rows="4"
                cols="51"
                .value="${this.productToEdit.description}"
                @input=${this._handleInput}
              >
              </mwc-textarea>
            </div>
            <div class="info-label">
              <label>Required Fields (*)</label>
            </div>
            <div class="button-container">
              <button class="register-button" @click="${this._updateProduct}">
                Save
              </button>
              <button class="register-button" @click="${this._cancelEdit}">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  get _tplProductList() {
    return html`
      <div class="list-products-navigation">
        <div class="list-products-header">
          <div class="input-container">
            <mwc-textfield
              raise
              label="Search"
              autocomplete="off"
              iconTrailing="search"
              id="search"
              type="text"
              @input=${this._handleInput}
            ></mwc-textfield>
          </div>
        </div>
        ${this.registeredProducts?.length
          ? html` <table>
              <thead>
                <tr>
                  <th>
                    <div class="header-table">Barcode</div>
                  </th>
                  <th>
                    <div class="header-table">Barcode (Secondary)</div>
                  </th>
                  <th>
                    <div class="header-table">Product Name</div>
                  </th>
                  <th>
                    <div class="header-table">Price</div>
                  </th>
                  <th>
                    <div class="header-table">Stock</div>
                  </th>
                  <th>
                    <div class="header-table">Description</div>
                  </th>
                  <th>
                    <div class="header-table">Registered date</div>
                  </th>
                  <th>
                    <div class="header-table">Tools</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                ${repeat(
                  this.registeredProducts || {},
                  (product) =>
                    html` <tr>
                      <td>${product.barcode}</td>
                      <td>${product.barcodeSecondary}</td>
                      <td>${product.name}</td>
                      <td>
                        <div class="data-number">$${product.price}</div>
                      </td>
                      <td>
                        <div class="data-number">${product.stock}</div>
                      </td>
                      <td>${product.description}</td>
                      <td>${product.date}</td>
                      <td>
                        <div class="product-tools">
                          <button
                            class="edit-product"
                            id="${product.id}"
                            @click=${this._selectProductToEdit}
                            popovertarget="my-dialog"
                          >
                            &#9998;
                          </button>
                          <button
                            class="delete-product"
                            id="${product.id}"
                            @click=${this._deleteProduct}
                            popovertarget="my-dialog"
                          >
                            ✖
                          </button>
                        </div>
                      </td>
                    </tr>`
                )}
              </tbody>
            </table>`
          : 'No se han encontrado productos'}
      </div>
    `;
  }

  get _tplDeleteModal() {
    return html`
      <modal-element
        ${ref(this._deleteModalRef)}
        .data=${{
          bodyText:
            '¿Está seguro de eliminar el producto? se borrará permanentemente del inventario.',
          cancelButtonText: 'Cancelar',
          code: 'confirm-delete',
          confirmButtonText: 'Eliminar',
          titleText: '¿Desea eliminar este producto?',
          type: 'warning',
        }}
        @modal-element-confirm-action-confirm-delete=${this
          ._confirmDeleteProduct}
      ></modal-element>
    `;
  }

  get _tplDeleteSuccessModal() {
    return html`
      <modal-element
        ${ref(this._successDeleteModalRef)}
        .data=${{
          bodyText: 'El producto se ha eliminado correctamente',
          code: 'success-delete',
          confirmButtonText: 'Aceptar',
          titleText: '¡Producto Eliminado!',
          type: 'success',
        }}
      ></modal-element>
    `;
  }

  get _tplEditSuccessModal() {
    return html`
      <modal-element
        ${ref(this._editSuccessModalRef)}
        .data=${{
          bodyText: 'El producto se ha actualizado correctamente',
          code: 'success-update',
          confirmButtonText: 'Aceptar',
          titleText: '¡Producto Actualizado!',
          type: 'success',
        }}
        @modal-element-confirm-action-success-update=${this
          ._closeEditSuccessModal}
      ></modal-element>
    `;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html`
      ${!this._showEditForm ? this._tplProductList : this._tplEditForm}
      ${this._tplDeleteModal} ${this._tplDeleteSuccessModal}
      ${this._tplEditSuccessModal}
    `;
  }
}

window.customElements.define('products-element', ProductsElement);
