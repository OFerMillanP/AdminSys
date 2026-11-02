import {LitElement, html, nothing} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import { dispatchCustomEvent, t } from '../../../utils/utils.js';

import styles from './tools.css.js';

/**
 * Sales page element.
 *
 * Handles barcode entry, product quantity updates, and sale completion events.
 */
export class ToolsElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'tools-element';
  }

  static get scopedElements() {
    return {};
  }

  static get properties() {
    return {
      changePasswordMessageError: {
        type: String,
      },
      generatedBarcode: {
        type: Object,
      },
      userData: {
        type: Object,
      },
      _barcode: {
        type: String,
        state: true,
      },
      _changePasswordModalRef: {
        type: Object,
        state: true
      },
      _isEnableChangePassword: {
        type: Boolean,
        state: true,
      },
      _pwdData: {
        type: Object,
        state: true
      }
    }
  }

  /**
   * Initialize component state.
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

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('generatedBarcode') && this.generatedBarcode.barcode?.length) {
      this._updateImg();
    }
  }

  _updateImg() {
    let img = this.shadowRoot.querySelector('img') || {src: ''};
    let rutaBase = img.src.split('?')[0];
    let timestamp = new Date().getTime();
    img.src = rutaBase + "?t=" + timestamp;
  }

  _setBarcode({target: {value}}) {
    this._barcode = value;
  }
  
  _randomBarcode() {
    let max = Math.floor(9999999999);
    let randomCode = (Math.floor(Math.random() * (max - 0 + 1)) + 0).toString();
    let randomBarcode = randomCode.padEnd(13, '0');
    this._barcode = randomBarcode;
  }

  _removeBarcode() {
    this._barcode = '';
  }

  _generateBarcode(){
    if (this._barcode.length) {
      dispatchCustomEvent(this, `${ToolsElement.is}-request-generate-barcode`, this._barcode);
    }
  }

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
   * Returns the confirmation modal template for completing a sale.
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
   * Returns the register section template.
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
   * Returns the register section template.
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
