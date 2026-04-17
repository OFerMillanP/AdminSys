import {LitElement, html} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {ModalElement} from '../../modal/modal.js';

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
      _showDeleteModal: {
        type: Boolean,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.registeredProducts = [];
    this._confirmDelete = false;
    this._productIdToAction = {};
    this._showDeleteModal = false;
  }

  _handleInput({target: {id, value}}) {
    const inputs = {
      search: () => {
        dispatchCustomEvent(this, `${ProductsElement.is}-search-product`, {
          value,
        });
      },
    };
    inputs[id]?.call();
  }

  _editProduct({target: {id}}) {
    dispatchCustomEvent(this, `${ProductsElement.is}-edit-product`, {id});
  }

  _deleteProduct({target: {id}}) {
    this._productIdToAction = {id};
    this._confirmDelete = true;
    this._showDeleteModal = true;
  }

  _closeModal() {
    this._showDeleteModal = false;
  }

  _confirmDeleteProduct() {
    this._showDeleteModal = false;
    dispatchCustomEvent(
      this,
      `${ProductsElement.is}-delete-product`,
      this._productIdToAction
    );
  }

  get _tplProductList() {
    return html`
      <div class="list-products-navigation">
        <div class="list-products-header">
          <div class="input-container">
            <label for="barcode">Search</label>
            <input
              id="search"
              type="text"
              autofocus
              autocomplete="off"
              @input=${this._handleInput}
            />
          </div>
        </div>
        ${this.registeredProducts?.length
          ? html` <table>
              <thead>
                <tr>
                  <th>
                    <div class="header-table">
                      Barcode
                    </div>
                  </th>
                  <th>
                    <div class="header-table">
                      Product Name
                    </div>
                  </th>
                  <th>
                    <div class="header-table">
                      Price
                    </div>
                  </th>
                  <th>
                    <div class="header-table">
                      Stock
                    </div>
                  </th>
                  <th>
                    <div class="header-table">
                      Description
                    </div>
                  </th>
                  <th>
                    <div class="header-table">
                      Registered date
                    </div>
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
                      <td>${product.name}</td>
                      <td>
                        <div class="data-number">
                          $${product.price}
                        </div>
                      </td>
                      <td>
                        <div class="data-number">
                          ${product.stock}
                        </div>
                      </td>
                      <td>${product.description}</td>
                      <td>${product.date}</td>
                      <td>
                        <div class="product-tools">
                          <div
                            class="edit-product"
                            id="${product.id}"
                            @click=${this._editProduct}
                          >
                            &#9998;
                          </div>
                          <div
                            class="delete-product"
                            id="${product.id}"
                            @click=${this._deleteProduct}
                          >
                            ✖
                          </div>
                        </div>
                      </td>
                    </tr>`
                )}
              </tbody>
            </table>`
          : 'No se han encontrado productos'}
      </div>
      ${this._tplDeleteModal}
    `;
  }

  get _tplDeleteModal() {
    return html`
      <modal-element
        ?show-modal=${this._showDeleteModal}
        .data=${{
          bodyText:
            '¿Está seguro de eliminar el producto? se borrará permanentemente del inventario.',
          cancelButtonText: 'Cancelar',
          code: 'confirm-delete',
          confirmButtonText: 'Eliminar',
          titleText: '¿Desea eliminar este producto?',
          type: 'warning',
        }}
        @modal-element-cancel-action=${this._closeModal}
        @modal-element-confirm-action-confirm-delete=${this
          ._confirmDeleteProduct}
      ></modal-element>
    `;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html` ${this._tplProductList} `;
  }
}

window.customElements.define('products-element', ProductsElement);
