import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {dispatchCustomEvent} from '../../utils/utils.js';

import styles from './modal.css.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class ModalElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'modal-element';
  }

  static get scopedElements() {
    return {};
  }

  static get properties() {
    return {
      /**
       * Data to show in the modal
       * @type {Object}
       * @default {}
       */
      data: {
        type: Object,
      },
      /**
       * Toggle to show modal
       * @type {Boolean}
       * @attribute show-modal
       * @default ''
       */
      showModal: {
        type: Boolean,
        attribute: 'show-modal',
      },
    };
  }

  constructor() {
    super();
    this.data = {
      bodyText: '',
      cancelButtonText: '',
      code: '',
      confirmButtonText: '',
      titleText: '',
      type: '',
    };
    this.showModal = false;
  }

  _confirmActionButton() {
    console.log(
      `${ModalElement.is}-confirm-action${
        this.data.code ? `-${this.data.code}` : ''
      }`
    );
    dispatchCustomEvent(
      this,
      `${ModalElement.is}-confirm-action${
        this.data.code ? `-${this.data.code}` : ''
      }`
    );
  }

  _cancelActionButton() {
    dispatchCustomEvent(this, `${ModalElement.is}-cancel-action`);
  }

  _selectModalType() {
    const choices = {
      success: {
        icon: '✓',
        type: 'success',
        acceptClass: 'accept-modal-button',
        cancelClass: 'cancel-modal-button',
      },
      error: {
        icon: '✖',
        type: 'error',
        acceptClass: 'accept-modal-button',
        cancelClass: 'cancel-modal-button',
      },
      info: {
        icon: 'i',
        type: 'info',
        acceptClass: 'accept-modal-button',
        cancelClass: 'cancel-modal-button',
      },
      warning: {
        icon: html`&#9888;`,
        type: 'warning',
        acceptClass: 'accept-modal-button-warning',
        cancelClass: 'cancel-modal-button-warning',
      },
    };
    return (
      choices[this.data.type] ?? {
        icon: '',
        type: '',
        acceptClass: '',
        cancelClass: '',
      }
    );
  }

  get _tplModal() {
    return this.showModal
      ? html`
          <div class="modal-container show" id="modal-container">
            <div class="modal-content">
              <div class="${this._selectModalType().type}-icon">
                ${this._selectModalType().icon}
              </div>
              <h2>${this.data.titleText}</h2>
              <p>${this.data.bodyText}</p>
              <div class="button-container">
                ${this.data.confirmButtonText.length
                  ? html`<button
                      id="confirm-button"
                      class=${this._selectModalType().type === 'warning'
                        ? 'accept-modal-button-warning'
                        : 'accept-modal-button'}
                      @click=${this._confirmActionButton}
                    >
                      ${this.data.confirmButtonText}
                    </button>`
                  : nothing}
                ${this.data.cancelButtonText.length
                  ? html`
                      <button
                        id="cancel-button"
                        class="${this._selectModalType().type === 'warning'
                          ? 'cancel-modal-button-warning'
                          : 'cancel-modal-button'}"
                        @click=${this._cancelActionButton}
                      >
                        ${this.data.cancelButtonText}
                      </button>
                    `
                  : nothing}
              </div>
            </div>
          </div>
        `
      : nothing;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html` ${this._tplModal} `;
  }
}

window.customElements.define('modal-element', ModalElement);
