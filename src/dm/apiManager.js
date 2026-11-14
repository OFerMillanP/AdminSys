import {LitElement} from 'lit';

import {dispatchCustomEvent} from '../../utils/utils.js';

/**
 * Element responsible for executing API requests and dispatching events with
 * the results.
 *
 * @fires show-spinner - Starts the global request indicator.
 * @fires api-{event}-success-response - Carries the parsed JSON response.
 * @fires api-{event}-handle-error - Carries response data when a request fails.
 * @fires close-spinner - Stops the global request indicator.
 */
export class ApiManagerElement extends LitElement {
  /** @returns {string} Registered tag name for the API request element. */
  static get is() {
    return 'api-manager-element';
  }

  /** @returns {Object} This element defines no reactive properties. */
  static get properties() {
    return {};
  }

  /** Initializes the API request element. */
  constructor() {
    super();
  }

  /**
   * Sends a request and emits events named from the supplied event prefix.
   *
   * @param {string} method - HTTP method, such as GET, POST, PATCH, or DELETE.
   * @param {string} service - API path relative to the base URI.
   * @param {string} event - Prefix used to name success and error events.
   * @param {Object|FormData} [body={}] - Payload for POST or PATCH requests.
   * @param {string} [uri='http://localhost:8100/'] - Base URI of the API.
   * @returns {Promise<void>}
   * @fires show-spinner
   * @fires api-{event}-success-response
   * @fires api-{event}-handle-error
   * @fires close-spinner
   */
  async fetch(method = '', service = '', event = '', body = {}, uri = 'http://localhost:8100/') {
    dispatchCustomEvent(this, 'show-spinner');
    const url = uri + service;
    let responseData = {};
    const isFormData = body instanceof FormData;
    try {
      let request = {
        method,
        headers: {
          ...(isFormData ? {} : {'Content-Type': 'application/json'}),
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': url,
          'Access-Control-Allow-Methods': 'POST, GET, DELETE, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      };
      method === 'POST' || method === 'PATCH'
        ? (request.body = isFormData ? body : JSON.stringify(body))
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
