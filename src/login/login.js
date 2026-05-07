import {LitElement, html} from 'lit';

import {dispatchCustomEvent} from '../../utils/utils.js';

import styles from './login.css.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class LoginElement extends LitElement {
  static get is() {
    return 'login-element';
  }

  static get properties() {
    return {
      /**
       * The name to say "Hello" to.
       */
      user: {
        type: String,
        attribute: 'user',
      },
      /**
       * Whether the user is logged in.
       */
      password: {
        type: String,
        attribute: 'password',
      },
      /**
       * Whether the user is logged in.
       */
      loginError: {
        type: String,
        attribute: 'login-error',
      },
      /**
       * Whether the user is logged in.
       */
      _errorMessage: {
        type: String,
        state: true,
      },
    };
  }

  constructor() {
    super();
    this.user = '';
    this.password = '';
    this.loginError = '';
    this._errorMessage = '';
  }

  /**
   * Updated function from lifecycle
   * @param {Object} changedProperties checked value
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('loginError') || this.loginError.length > 0) {
      this._showErrorMessage();
    }
  }

  requestLoginAccess({key = ''}) {
    this._errorMessage =
      !this.user || !this.password ? 'Favor de llenar todos los campos' : '';
    if ((key === '' || key === 'Enter') && this.user && this.password) {
      dispatchCustomEvent(this, 'login-page-request-login', {
        user: this.user.slice(0, 15).replace(/\s/g, ''),
        password: this.password.slice(0, 20).replace(/\s/g, ''),
      });
    }
  }

  _handleInput({target: {id, value}}) {
    this.loginError = '';
    const inputsLogin = {
      user: () => {
        this.user = value || '';
      },
      password: () => {
        this.password = value || '';
      },
    };
    inputsLogin[id]?.call();
    this._errorMessage = '';
  }

  _showErrorMessage() {
    const errors = {
      E001: 'El usuario o contraseña son incorrectos.',
      E002: 'Multiples intentos de inicio de sesión fallidos',
    };
    this._errorMessage = errors[this.loginError];
  }

  get _tplLogin() {
    return html`
      <div class="login">
        <div class="login-container">
          <h1>Login</h1>
          <div>
            <div class="input-container">
              <mwc-textfield
                outlined
                label="User"
                autocomplete="off"
                id="user"
                maxlength="15"
                type="text"
                .value=${this.user.replace(/\s/g, '')}
                @input=${this._handleInput}
                @keypress=${this.requestLoginAccess}
              ></mwc-textfield>
            </div>
            <div class="input-container">
              <mwc-textfield
                outlined
                label="Password"
                autocomplete="off"
                id="password"
                type="password"
                autocomplete="off"
                maxlength="20"
                .value=${this.password.replace(/\s/g, '')}
                @input=${this._handleInput}
                @keypress=${this.requestLoginAccess}
              ></mwc-textfield>
            </div>
            <div class="button-container">
              <mwc-button
                raised
                label="Login"
                @click=${this.requestLoginAccess}
              ></mwc-button>
              <!-- <button class="login-button" @click=${this
                .requestLoginAccess}>
                Login
              </button> -->
            </div>
            <div class="label-error-containter">
              <label class="error-label">${this._errorMessage}</label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [styles];
  }

  render() {
    return html` ${this._tplLogin} `;
  }
}

window.customElements.define('login-element', LoginElement);
