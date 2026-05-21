import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {dispatchCustomEvent} from '../../../utils/utils.js';

import styles from './modal.css.js';

/**
 * Reusable modal dialog element.
 *
 * Renders modal content based on data passed by the parent and
 * dispatches confirm/cancel actions.
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
      isEnableConfirmButton: false,
    };
    this.showModal = false;
  }

  /**
   * Opens the internal HTML dialog element.
   */
  openModal(){
    this.shadowRoot.querySelector('#dialog')?.showModal();
  }

  /**
   * Handles the confirm button click and dispatches the corresponding event.
   */
  _confirmActionButton() {
    console.log(
      `${ModalElement.is}-confirm-action${
        this.data.code ? `-${this.data.code}` : ''
      }`
    );
    this.shadowRoot.querySelector('#dialog').close();
    dispatchCustomEvent(
      this,
      `${ModalElement.is}-confirm-action${
        this.data.code ? `-${this.data.code}` : ''
      }`
    );
  }

  /**
   * Handles the cancel button click and dispatches the cancel action event.
   */
  _cancelActionButton() {
    this.shadowRoot.querySelector('#dialog')?.close();
    dispatchCustomEvent(
      this,
      `${ModalElement.is}-cancel-action`
    );
  }

  /**
   * Selects modal styling and icons based on the configured modal type.
   *
   * @returns {Object} The display properties for the current modal type.
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
   * Returns the template for the dialog content.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplModal() {
    return html`
      <dialog id="dialog" popover>
        <div class="modal-content">
          <div class="${this._selectModalType().type}-icon">
            ${this._selectModalType().icon}
          </div>
          <h2>${this.data.titleText}</h2>
          <p>${this.data.bodyText}</p>
          <slot name="content-data"></slot>
          <div class="button-container">
            ${this.data.confirmButtonText?.length
              ? html`<mwc-button
                  id="confirm-button"
                  ?disabled=${!this.data.isEnableConfirmButton}
                  class="${this._selectModalType().type === 'warning'
                    ? 'accept-modal-button-warning'
                    : 'accept-modal-button'}"
                  @click=${this._confirmActionButton}
                >
                  ${this.data.confirmButtonText}
                </mwc-button>`
              : nothing}
            ${this.data.cancelButtonText?.length
              ? html`
                  <mwc-button
                    id="cancel-button"
                    class="${this._selectModalType().type === 'warning'
                      ? 'cancel-modal-button-warning'
                      : 'cancel-modal-button'}"
                    @click=${this._cancelActionButton}
                  >
                    ${this.data.cancelButtonText}
                  </mwc-button>
                `
              : nothing}
          </div>
        </div>
      </dialog>
    `;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html`
      ${this._tplModal}
    `;
  }
}

window.customElements.define('modal-element', ModalElement);
