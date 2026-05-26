/**
 * Dispatches a custom event from the provided component.
 *
 * @param {EventTarget} component - The component instance dispatching the event.
 * @param {string} [name=''] - The custom event name.
 * @param {*} [detail=true] - The event payload detail.
 * @param {boolean} [bubbles=true] - Whether the event bubbles.
 * @param {boolean} [composed=true] - Whether the event crosses shadow DOM boundaries.
 */
export function dispatchCustomEvent(
  component,
  name = '',
  detail = true,
  bubbles = true,
  composed = true
) {
  component.dispatchEvent(
    new CustomEvent(name, {
      bubbles,
      composed,
      detail,
    })
  );
}

/**
 * Returns the current local date and time in `DD/MM/YYYY - HH:MM:SS` format.
 * @returns {string} Formatted date and time.
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
  }:${date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()}`;
  return `${fecha} - ${hora}`;
}

/**
 * Generates the full HTML document for printing a purchase ticket.
 *
 * @param {string} body - The ticket body HTML content.
 * @returns {string} The full HTML document ready for printing.
 */
export function ticketTplToPrint(body) {
  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ticket de Compra</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
          }

          .ticket-container {
            font-weight: bolder;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .ticket-header {
            text-align: center;
            border-bottom: 2px solid #111;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }

          .store-name {
            font-size: 18px;
            font-weight: bold;
          }

          .store-info {
            font-size: 11px;
            margin-top: 5px;
            line-height: 1.4;
          }

          .ticket-number {
            font-size: 12px;
            margin-top: 10px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }

          .ticket-items {
            margin-bottom: 15px;
          }

          .item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 12px;
            border-bottom: 1px dotted #ccc;
          }

          .item-name {
            flex: 1;
          }

          .item-qty {
            width: 40px;
            text-align: center;
          }

          .item-price {
            width: 60px;
            text-align: right;
            font-weight: bold;
          }

          .item-desc {
            font-size: 10px;
            padding-left: 0;
            margin-top: 2px;
          }

          .totals {
            margin: 15px 0;
            padding: 10px 0;
            border-top: 2px solid #111;
            border-bottom: 2px solid #111;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 5px;
          }

          .total-row.subtotal {
          }

          .total-row.tax {
          }

          .total-row.total {
            font-weight: bold;
            font-size: 14px;
            margin-top: 5px;
          }

          .payment-method {
            text-align: center;
            font-size: 11px;
            margin: 10px 0;
            padding: 8px 0;
            border-top: 1px dotted #ccc;
          }

          .ticket-footer {
            text-align: center;
            font-size: 10px;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dotted #ccc;
          }

          .footer-message {
            line-height: 1.6;
          }

          @media print {
            body {
              padding: 0;
            }

            .ticket-container {
              box-shadow: none;
              border: none;
              max-width: 500%;
            }
          }
        </style>
      </head>

      <body>
        ${body}
      </body>
    </html>
  `;
}
