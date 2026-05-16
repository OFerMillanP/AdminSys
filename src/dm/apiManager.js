import {LitElement} from 'lit';

import {dispatchCustomEvent} from '../../utils/utils.js';

/**
 * Elemento encargado de ejecutar llamadas API y despachar eventos con los
 * resultados.
 */
export class ApiManagerElement extends LitElement {
  static get is() {
    return 'api-manager-element';
  }

  static get properties() {
    return {};
  }

  /**
   * Crea una instancia del administrador de API.
   */
  constructor() {
    super();
  }

  /**
   * Realiza una petición HTTP al servicio especificado y despacha eventos
   * de éxito o error según la respuesta.
   *
   * @param {string} method - El verbo HTTP a utilizar (GET, POST, PATCH, DELETE).
   * @param {string} service - La ruta del servicio relativa al host local.
   * @param {string} event - El nombre base del evento para despacho.
   * @param {Object} [body={}] - El cuerpo de la petición para POST/PATCH.
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
