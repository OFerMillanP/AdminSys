/**
 * Dispatches a custom event from the provided component.
 *
 * @param {EventTarget} component - The component instance dispatching the event.
 * @param {string} [name=''] - The custom event name.
 * @param {*} [detail=true] - The event payload detail.
 * @param {boolean} [bubbles=true] - Whether the event bubbles.
 * @param {boolean} [composed=true] - Whether the event crosses shadow DOM boundaries.
 */
export function dispatchCustomEvent(component, name = '', detail = true, bubbles = true, composed = true) {
    component.dispatchEvent(
        new CustomEvent(name, {
        bubbles,
        composed,
        detail,
        }),
    );
}

/**
 * Devuelve la fecha y hora local actual en formato `DD/MM/YYYY - HH:MM:SS`.
 * @returns {string} Fecha y hora formateadas.
 */
export function getCurrentDate() {
  const date = new Date();
  const fecha = `${
    date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  }/${
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }/${date.getFullYear()}`;
  const hora = `${date.getHours()}:${
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  }:${date.getSeconds()}`;
  return `${fecha} - ${hora}`;
}