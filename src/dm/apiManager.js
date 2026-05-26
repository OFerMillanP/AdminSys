import {LitElement} from 'lit';

import {dispatchCustomEvent} from '../../utils/utils.js';

/**
 * Element responsible for executing API requests and dispatching events with
 * the results.
 */
export class ApiManagerElement extends LitElement {
  static get is() {
    return 'api-manager-element';
  }

  static get properties() {
    return {};
  }

  /**
  * Creates an instance of the API manager.
   */
  constructor() {
    super();
  }

  /**
  * Sends an HTTP request to the specified service and dispatches success or
  * error events based on the response.
   *
    * @param {string} method - The HTTP verb to use (GET, POST, PATCH, DELETE).
    * @param {string} service - The service path relative to the local host.
    * @param {string} event - The base name of the event to dispatch.
    * @param {Object} [body={}] - The request body for POST/PATCH.
   */
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
