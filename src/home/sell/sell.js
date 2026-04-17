import {LitElement, html} from 'lit';
import {ScopedElementsMixin} from '@open-wc/scoped-elements/html-element.js';

// import {dispatchCustomEvent} from '../../utils/utils.js';

import styles from './sell.css.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class SellElement extends ScopedElementsMixin(LitElement) {
  static get is() {
    return 'sell-element';
  }

  static get scopedElements() {
    return {};
  }

  static get properties() {
    return {
      /**
       * The name to say "Hello" to.
       */
      name: {
        type: String,
        attribute: 'name',
      },
    };
  }

  constructor() {
    super();
    this.name = '';
  }

  get _tplSell() {
    return html`
      <div class="sell-container">
        <h1>Sell</h1>
        <div>
          <div class="input-container">
            <label for="user">User:</label>
            <input
              id="user"
              required
              type="text"
              autocomplete="off"
            />
          </div>
          <div class="button-container">
            <button class="sell-button">
              Sell
            </button>
          </div>
          <div class="label-error-containter">
            <label class="error-label">${this._errorMessage}</label>
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html` ${this._tplSell} `;
  }
}

window.customElements.define('sell-element', SellElement);
