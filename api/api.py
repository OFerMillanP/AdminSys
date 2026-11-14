"""Flask endpoint for opening the network-shared cash-register drawer."""

from flask import Flask, request, jsonify
from flask_cors import CORS

# Flask application serving the local cash-register API.
app = Flask(__name__)
# Allow cross-origin requests to the cash-register API.
CORS(app)

# Opens the printer-connected cash drawer by sending its ESC/POS pulse command.
# Route: GET /api/v0/open-register. No parameters or request body are required.
# No authentication is required. Printer access errors are printed; the endpoint responds with plain-text
# "ok" and Flask's default HTTP 200 status.
@app.route('/api/v0/open-register', methods=['GET'])
def open_register():
    ruta_impresora = r'\\127.0.0.1\tickets'
    comando_apertura = b'\x1b\x70\x00\x19\xfa'
    try:
        with open(ruta_impresora, 'wb') as impresora:
            impresora.write(comando_apertura)
        print('Cajón abierto correctamente sin imprimir.')
    except OSError as e:
        print(f'No se pudo acceder a la impresora. Verifica que esté compartida: {e}')
    return "ok"

# Starts the development server on port 8101 when this module is run directly.
if __name__ == '__main__':
    app.run(port=8101, debug=True)
