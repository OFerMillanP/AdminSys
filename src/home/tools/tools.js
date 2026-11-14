import {LitElement, html, nothing} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import { dispatchCustomEvent, t } from '../../../utils/utils.js';

import styles from './tools.css.js';

/**
 * Tools page element.
 *
 * Generates and downloads barcodes and supports changing the current user's password.
 *
 * @fires tools-element-request-generate-barcode - Requests barcode generation with the barcode string in `event.detail`.
 * @fires tools-element-request-backup-db - Requests a database backup.
 * @fires tools-element-request-change-password - Requests a password change with `{current, new, confirm}` Base64-encoded strings in `event.detail`.
 * @listens modal-element-confirm-action-change-password-sale - Requests the password change; `event.detail` is `true`.
 */
export class ToolsElement extends ScopedElementsMixin(LitElement) {
  /** @returns {string} The custom-element tag name. */
  static get is() {
    return 'tools-element';
  }

  /** @returns {Object} Child custom-element constructors registered in this scope. */
  static get scopedElements() {
    return {};
  }

  /** @returns {Object} Reactive property definitions for tools inputs and state. */
  static get properties() {
    return {
      /**
       * Password-change error message supplied by the parent.
       * @type {string}
       * @attribute change-password-message-error
       */
      changePasswordMessageError: {
        type: String,
      },
      /**
       * Result of the most recent barcode-generation request.
       * @type {Object}
       * @attribute generated-barcode
       */
      generatedBarcode: {
        type: Object,
      },
      /**
       * Current authenticated user's data and permissions.
       * @type {Object}
       * @attribute user-data
       */
      userData: {
        type: Object,
      },
      /**
       * Barcode currently entered in the generator.
       * @type {string}
       * @state
       */
      _barcode: {
        type: String,
        state: true,
      },
      /**
       * Reference to the change-password confirmation modal.
       * @type {Object}
       * @state
       */
      _changePasswordModalRef: {
        type: Object,
        state: true
      },
      /**
       * Whether the change-password confirmation action is enabled.
       * @type {boolean}
       * @state
       */
      _isEnableChangePassword: {
        type: Boolean,
        state: true,
      },
      /**
       * Current, new, and confirmation password field values.
       * @type {Object}
       * @state
       */
      _pwdData: {
        type: Object,
        state: true
      }
    }
  }

  /**
   * Initializes the barcode generator and password-change form state.
   */
  constructor() {
    super();
    this._barcode = '';
    this._changePasswordModalRef = createRef();
    this._isEnableChangePassword = false;
    this._pwdData = {
      current: '',
      new: '',
      confirm: '',
    }
    this.changePasswordMessageError = '';
    this.generatedBarcode = {};
    this.userData = {};
  }

  /**
   * Refreshes the displayed barcode image when a new barcode is generated.
   * @param {Map} changedProperties - Reactive properties that changed.
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('generatedBarcode') && this.generatedBarcode.barcode?.length) {
      this._updateImg();
    }
  }

  /** Updates the barcode image URL to bypass a cached previous image. */
  _updateImg() {
    let img = this.shadowRoot.querySelector('img') || {src: ''};
    let rutaBase = img.src.split('?')[0];
    let timestamp = new Date().getTime();
    img.src = rutaBase + "?t=" + timestamp;
  }

  /**
   * Copies the barcode input value into component state.
   * @param {InputEvent} event - Input event from the barcode field.
   */
  _setBarcode({target: {value}}) {
    this._barcode = value;
  }
  
  /** Generates a random 13-character barcode candidate. */
  _randomBarcode() {
    let max = Math.floor(9999999999);
    let randomCode = (Math.floor(Math.random() * (max - 0 + 1)) + 0).toString();
    let randomBarcode = randomCode.padEnd(13, '0');
    this._barcode = randomBarcode;
  }

  /** Clears the barcode generator input. */
  _removeBarcode() {
    this._barcode = '';
  }

  /**
   * Requests generation of the entered barcode when it is non-empty.
   * @fires tools-element-request-generate-barcode - Fired with the barcode string as `event.detail`.
   */
  _generateBarcode(){
    if (this._barcode.length) {
      dispatchCustomEvent(this, `${ToolsElement.is}-request-generate-barcode`, this._barcode);
    }
  }

  /** Requests a database backup from the application manager. */
  _requestDatabaseBackup() {
    dispatchCustomEvent(this, `${ToolsElement.is}-request-backup-db`);
  }

  /**
   * Updates password fields and validates whether a password change can be confirmed.
   * @param {InputEvent} event - Input event from one of the password fields.
   */
  _handleInput({target: {id, value}}) {
    const pwdField = {
      'current-pwd': () => {
        this._pwdData.current = value;
      },
      'new-pwd': () => {
        this._pwdData.new = value;
        this.changePasswordMessageError = 
          this._pwdData.new === this._pwdData.current ?
          'La nueva contraseña no puede ser igual que la anterior' : '';
      },
      'confirm-pwd': () => {
        this._pwdData.confirm = value;
        this.changePasswordMessageError = 
          this._pwdData.new !== this._pwdData.confirm ?
          'Las contraseñas no coinciden' : '';
      },
    }
    pwdField[id].call();
    this._isEnableChangePassword = 
      this._pwdData.current.length && 
      this._pwdData.new.length &&
      this._pwdData.confirm.length &&
      (this._pwdData.current !== this._pwdData.new) &&
      (this._pwdData.new === this._pwdData.confirm);
  }

  /**
   * Requests a password change when all three password fields are populated.
   * @fires tools-element-request-change-password - Fired with Base64-encoded `current`, `new`, and `confirm` values in `event.detail`.
   */
  _requestChangePassword() {
    if (this._pwdData.current.length > 0 && this._pwdData.new.length > 0 && this._pwdData.confirm.length > 0 ) {
      dispatchCustomEvent(this, `${ToolsElement.is}-request-change-password`, 
        {
          current: btoa(this._pwdData.current),
          new: btoa(this._pwdData.new),
          confirm: btoa(this._pwdData.confirm)
        }
      );
    }
  }

  /**
   * Downloads the generated barcode image.
   * @returns {Promise<void>}
   */
  async _saveImg(){
    const imageUrl = `http://localhost:8100/resources/img/${this.generatedBarcode.barcode?.length ? 'barcode.png' : ''}`;
    try {
      const response = await fetch(imageUrl);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(await response.blob());
      link.download = this.generatedBarcode?.barcode + '.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('No se pudo descargar la imagen por restricciones de CORS:', error);
    }
  }

  /**
   * Returns the styles for the tools element.
   *
   * @returns {import('lit').CSSResult[]}
   */
  static get styles() {
    return [styles];
  }

  /**
   * Returns the password-change confirmation modal template.
   *
   * @returns {import('lit').TemplateResult}
   */
  get _tplChangePasswordModal() {
    return html`
      <modal-element
        id="data-ticket-modal"
        ${ref(this._changePasswordModalRef)}
        .data=${{
          bodyText: t('Una vez cambiada la contraseña no se volverá a mostrar el botón hasta que contacte al administrador'),
          code: 'change-password-sale',
          confirmButtonText: t('Cambiar'),
          cancelButtonText: t('Cancelar'),
          titleText: t('¿Desea cambiar la contraseña?'),
          type: 'warning',
          isEnableConfirmButton: this._isEnableChangePassword,
        }}
        @modal-element-confirm-action-change-password-sale="${this
          ._requestChangePassword}"
      >
        <section slot="content-data" class="confirm-sale-data">
          <div class="confirm-sale-cash-input">
            <mwc-textfield
              id="current-pwd"
              label="${t('Contraseña Actual')}"
              type="password"
              value=""
              @input="${this._handleInput}"
            ></mwc-textfield>
            <mwc-textfield
              id="new-pwd"
              label="${t('Nueva contraseña')}"
              type="password"
              value=""
              @input="${this._handleInput}"
            ></mwc-textfield>
            <mwc-textfield
              id="confirm-pwd"
              label="${t('Confirmar Contraseña')}"
              type="password"
              value=""
              @input="${this._handleInput}"
            ></mwc-textfield>
          </div>
          
          ${this.changePasswordMessageError.length > 0 ? 
            html`    
              <section class="pwd-message-error">
                ${this.changePasswordMessageError}
              </section>
            ` : nothing}
        </section>
      </modal-element>
    `;
  }

  /**
   * Returns the tools page template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplTools() {
    return html`
      ${this.userData.changePassword ? 
        html`
          <section class="change-password">
            <mwc-button
              raised
              label="${t('tools-element-change-password')}"
              id="tools"
              @click="${() => {this._changePasswordModalRef.value.openModal()}}"
            ></mwc-button>
          </section>
        ` : nothing
      }
      ${this.userData.level === 'admin' ? html`
        <section class="backup">
          <mwc-button
            raised
            label="${t('tools-element-backup-db')}"
            id="tools"
            @click=${this._requestDatabaseBackup}
          >
            <mwc-icon 
              slot="icon"
            >sync</mwc-icon>
          </mwc-button>
        </section>
      ` : nothing}
      <section class="tools-content">
        ${this._barcode.length ? 
          html`
            <mwc-button
              class="remove"
              label="${t('X')}"
              @click=${this._removeBarcode}
            ></mwc-button>
           ` : nothing
        }
        <mwc-textfield
          id="barcode"
          label="${t('tools-element-product-barcode')}"
          type="text"
          value="${this._barcode}"
          @input="${this._setBarcode}"
        ></mwc-textfield>
        <mwc-button
          class="random"
          label="${t('tools-element-tools-random-barcode')}"
          @click=${this._randomBarcode}
        ></mwc-button>
      </section>
      <section class="generator">
        <mwc-button
          raised
          class="generator"
          label="${t('tools-element-tools-generate-barcode')}"
          @click=${this._generateBarcode}
        ></mwc-button>
      </section>
      <section class="canvas-barcode">
        ${this.generatedBarcode.barcode?.length ? html`${this._tplCanvasBarcode}` : nothing}
      </section>
    `;
  }

  
  /**
   * Returns the generated barcode image and its download control.
   * @returns {import('lit').TemplateResult}
   */
  get _tplCanvasBarcode() {
    return html`
      <img src="http://localhost:8100/resources/img/${this.generatedBarcode.barcode?.length ? 'barcode.png' : ''}" alt="${t('tools-element-product-barcode')} ${this._barcode}">
      <section>
        <mwc-button
          raised
          class="generator"
          label="${t('tools-element-tools-save-image')}"
          @click=${this._saveImg}
        ></mwc-button>
      </section>
    `;
  }

  /**
   * Renders the tools-element template.
   *
   * @returns {import('lit').TemplateResult}
   */
  render() {
    return html`
      ${this._tplTools}
      ${this._tplChangePasswordModal}
    `;
  }
}

window.customElements.define('tools-element', ToolsElement);
