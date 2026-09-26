
/**
 * ----------------------------------------------- Imports -----------------------------------------------
 */

const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');
const fs = require('fs');
const path = require('path');

///////////////////////////////// DB Querys /////////////////////////////////

const logoutUser = `
        UPDATE users 
        SET is_logged = false 
    `;

const getUserAndLevel = `
        SELECT u.name, u.last_login, l.name AS level FROM users u
        INNER JOIN levels l
        ON u.level = l.id
        WHERE user_name = $1 AND password = $2
    `;

/////////////////////////////////  Error Server /////////////////////////////////

function returnErrorServer(res) {
    return res
      .status(500)
      .json({message: 'Server ERROR', code: 'D00B1', status: false});
};


///////////////////////////////// BARCODE /////////////////////////////////

/**
 * Genera un código de barras y lo guarda en una ruta local.
 * @param {string} texto - El valor que llevará el código de barras.
 * @param {string} rutaDestino - El nombre o ruta del archivo de salida (ej. 'imagenes/codigo.png').
 */
function guardarCodigoBarras(texto) {
    // 1. Crear un lienzo virtual (Canvas)
    const canvas = createCanvas(300*Number(texto.length/10), 150);

    // 2. Asignar ruta absoluta para no generar demasiados codigos
    const rutaDestino = path.join(__dirname, '../resources/img', 'barcode.png');

    // 3. Generar el código de barras dentro del canvas usando JsBarcode
    JsBarcode(canvas, texto, {
        format: "CODE128",       // Formato estándar compatible con texto/números
        lineColor: "#000000",    // Color de las barras
        width: 2,                // Ancho de cada barra
        height: 100,             // Alto del código de barras
        displayValue: true       // Mostrar el texto debajo de las barras
    });

    // 4. Asegurar que el directorio de destino exista
    const directorio = path.dirname(rutaDestino);
    if (!fs.existsSync(directorio)){
        fs.mkdirSync(directorio, { recursive: true });
    }

    // 5. Convertir el lienzo a un Buffer de imagen PNG
    const buffer = canvas.toBuffer('image/png');

    // 6. Guardar el archivo en la ruta especificada
    fs.writeFile(rutaDestino, buffer, (err) => {
        if (err) {
            console.error('Error al guardar el código de barras:', err);
        } 
    });
}

module.exports = { returnErrorServer, getUserAndLevel, logoutUser, guardarCodigoBarras };