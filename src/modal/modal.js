import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {dispatchCustomEvent} from '../../utils/utils.js';

import styles from './modal.css.js';

/**
 * Reusable modal dialog element.
 *
 * Renders a modal overlay using `showModal` state and dispatches confirm/cancel actions.
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

  /**
   * Handles the confirm action and dispatches the confirm event.
   */
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

  /**
   * Handles the cancel action and dispatches the cancel event.
   */
  _cancelActionButton() {
    dispatchCustomEvent(this, `${ModalElement.is}-cancel-action`);
  }

  /**
   * Selects styling properties for the modal based on its type.
   *
   * @returns {Object} The selected icon and CSS classes.
   */
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

  /**
   * Returns the modal content template when `showModal` is true.
   *
   * @returns {import('lit').TemplateResult|import('lit').Nothing}
   */
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
