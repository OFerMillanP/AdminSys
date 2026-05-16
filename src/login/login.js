import {LitElement, html} from 'lit';

import {dispatchCustomEvent} from '../../utils/utils.js';

import styles from './login.css.js';

/**
 * Login page element.
 *
 * Manages user credential input, validation and dispatches login requests.
 */
export class LoginElement extends LitElement {
  static get is() {
    return 'login-element';
  }

  static get properties() {
    return {
      /**
       * Username entered in the login form.
       */
      user: {
        type: String,
        attribute: 'user',
      },
      /**
       * Password entered in the login form.
       */
      password: {
        type: String,
        attribute: 'password',
      },
      /**
       * Error code returned by the authentication API.
       */
      loginError: {
        type: String,
        attribute: 'login-error',
      },
      /**
       * User-visible login error message.
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
   * Lit lifecycle callback invoked when reactive properties change.
   *
   * @param {Map} changedProperties - The changed reactive properties.
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('loginError') || this.loginError.length > 0) {
      this._showErrorMessage();
    }
  }

  /**
   * Validates the login form and dispatches a login request event.
   *
   * @param {KeyboardEvent|Object} event - The click or keypress event.
   * @param {string} event.key - Optional key pressed during login submission.
   */
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

  /**
   * Handles form input updates for the login fields.
   *
   * @param {InputEvent} event - The input event.
   */
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

  /**
   * Maps the login error code to a friendly error message for display.
   */
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
