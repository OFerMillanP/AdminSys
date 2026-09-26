import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(port=8101, debug=True)
