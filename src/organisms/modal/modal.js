import {LitElement, html, nothing} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {dispatchCustomEvent} from '../../../utils/utils.js';

import styles from './modal.css.js';

/**
 * Reusable modal dialog element.
 *
 * Renders modal content based on data passed by the parent and
 * dispatches confirm/cancel actions.
 *
 * @fires modal-element-confirm-action[-{code}] - Fired when the confirm button is clicked; the optional suffix is `data.code`. `event.detail` is `true`.
 * @fires modal-element-cancel-action - Fired when the cancel button is clicked; `event.detail` is `true`.
 */
export class ModalElement extends ScopedElementsMixin(LitElement) {
  /** @returns {string} The custom-element tag name. */
  static get is() {
    return 'modal-element';
  }

  /** @returns {Object} Child custom-element constructors registered in this scope. */
  static get scopedElements() {
    return {};
  }

  /** @returns {Object} Reactive property definitions for modal data and visibility. */
  static get properties() {
    return {
      /**
       * Data to show in the modal
       * @type {Object}
       * @attribute data
       * @default {}
       */
      data: {
        type: Object,
      },
      /**
       * Toggle to show modal
       * @type {boolean}
       * @attribute show-modal
       * @default false
       */
      showModal: {
        type: Boolean,
        attribute: 'show-modal',
      },
    };
  }

  /** Initializes the modal data and hides the dialog. */
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
   *
   * @returns {void}
   */
  openModal(){
    this.shadowRoot.querySelector('#dialog')?.showModal();
  }

  /**
   * Closes the dialog and dispatches the code-specific confirm action event.
   * @fires modal-element-confirm-action[-{code}] - Fired with `event.detail === true`.
   * @returns {void}
   */
  _confirmActionButton() {
    this.shadowRoot.querySelector('#dialog').close();
    dispatchCustomEvent(
      this,
      `${ModalElement.is}-confirm-action${
        this.data.code ? `-${this.data.code}` : ''
      }`
    );
  }

  /**
   * Closes the dialog and dispatches the cancel action event.
   * @fires modal-element-cancel-action - Fired with `event.detail === true`.
   * @returns {void}
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

  /** @returns {import('lit').CSSResult[]} Styles applied to the modal. */
  static get styles() {
    return [styles];
  }

  /**
   * Renders the modal element template.
   *
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html`
      ${this._tplModal}
    `;
  }
}

window.customElements.define('modal-element', ModalElement);
