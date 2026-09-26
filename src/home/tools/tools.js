import {LitElement, html, nothing} from 'lit';
import {repeat} from 'lit/directives/repeat.js';
import {ref, createRef} from 'lit/directives/ref.js';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

import {
  dispatchCustomEvent,
  ticketTplToPrint,
  getCurrentDate,
} from '../../../utils/utils.js';

import styles from './tools.css.js';
import {map} from 'lit/directives/map.js';

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
      _barcode: {
        type: String,
        state: true,
      },
      generatedBarcode: {
        type: Object,
      }
    }
  }

  /**
   * Initialize component state.
   */
  constructor() {
    super();
    this.generatedBarcode = {};
    this._barcode = '';
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

  _generateBarcode(){
    if (this._barcode.length) {
      dispatchCustomEvent(this, `${ToolsElement.is}-request-generate-barcode`, this._barcode);
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
   * Returns the register section template.
   * @returns {import('lit').TemplateResult}
   */
  get _tplTools() {
    return html`
      <section class="tools-content">
        <mwc-textfield
          id="barcode"
          label="Barcode"
          type="text"
          value="${this._barcode}"
          @input="${this._setBarcode}"
        ></mwc-textfield>
        <mwc-button
          class="random"
          label="Random Barcode"
          @click=${this._randomBarcode}
        ></mwc-button>
      </section>
      <section class="generator">
        <mwc-button
          raised
          class="generator"
          label="Generate Barcode"
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
      <img src="http://localhost:8100/resources/img/${this.generatedBarcode.barcode?.length ? 'barcode.png' : ''}" alt="Barcode ${this._barcode}">
      <section>
        <mwc-button
          raised
          class="generator"
          label="Save Image"
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
    `;
  }
}

window.customElements.define('tools-element', ToolsElement);
