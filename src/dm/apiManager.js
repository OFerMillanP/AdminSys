import {LitElement} from 'lit';

import {dispatchCustomEvent} from '../../utils/utils.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class ApiManagerElement extends LitElement {
  static get is() {
    return 'api-manager-element';
  }

  static get properties() {
    return {};
  }

  constructor() {
    super();
  }

  async fetch(method = '', service = '', event = '', body = {}) {
    dispatchCustomEvent(this, 'show-spinner');
    const url = 'http://localhost:8100/' + service;
    let responseData = {};
    try {
      let request = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': url,
          'Access-Control-Allow-Methods': 'POST, GET, DELETE, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      };
      method === 'POST' || method === 'PATCH'
        ? (request.body = JSON.stringify(body))
        : request;
      const response = await fetch(url, request);
      responseData = await response.json();

      if (!response.ok) {
        throw new Error('Error en el servicio');
      } else {
        dispatchCustomEvent(
          this,
          `api-${event}-success-response`,
          responseData
        );
      }
    } catch (error) {
      dispatchCustomEvent(this, `api-${event}-handle-error`, responseData);
    } finally {
      dispatchCustomEvent(this, 'close-spinner');
    }
  }
}

window.customElements.define('api-manager-element', ApiManagerElement);
