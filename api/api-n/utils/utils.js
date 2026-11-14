
/**
 * ----------------------------------------------- Imports -----------------------------------------------
 */

const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

/** SQL statement that clears the login flag for every user. */
const logoutUser = `
        UPDATE users 
        SET is_logged = false 
    `;

/** SQL statement used to look up a user by login name and encoded password. */
const getUserAndLevel = `
        SELECT u.name, u.last_login, l.name AS level FROM users u
        INNER JOIN levels l
        ON u.level = l.id
        WHERE user_name = $1 AND password = $2
    `;

/**
 * Sends the standard internal-server-error response.
 * @param {import('express').Response} res - Express response to complete.
 * @returns {import('express').Response} Response with status 500 and `{message, code, status}` JSON.
 */
function returnErrorServer(res) {
    return res
      .status(500)
      .json({message: 'Server ERROR', code: 'D00B1', status: false});
};

///////////////////////////////// BARCODE /////////////////////////////////

/**
 * Generates a CODE128 barcode PNG at the API's shared barcode image path.
 * @param {string} texto - Text encoded in the barcode.
 * @returns {void} Writes the PNG asynchronously; write errors are logged.
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

/** Absolute directory where uploaded product images are stored. */
const productImagesPath = path.join(__dirname, '..', 'resources', 'img', 'products');

/** Maps accepted product-image MIME types to their filename extensions. */
const allowedProductImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
]);

/**
 * Multer middleware for product images: stores by product ID, accepts JPEG/PNG/WebP/GIF,
 * and limits uploads to 5 MiB.
 */
const productImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      fs.mkdir(productImagesPath, {recursive: true}, (error) => {
        callback(error, productImagesPath);
      });
    },
    filename: (req, file, callback) => {
      const productId = Number(req.params.id);
      const extension = allowedProductImageTypes.get(file.mimetype);
      callback(null, `${productId}.${extension}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!allowedProductImageTypes.has(file.mimetype)) {
      callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
      return;
    }
    callback(null, true);
  },
  limits: {fileSize: 5 * 1024 * 1024},
});


module.exports = { returnErrorServer, getUserAndLevel, logoutUser, guardarCodigoBarras, productImageUpload };