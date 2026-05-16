let cors = require('cors');
let express = require('express');
var bodyParser = require('body-parser');
let api = express();

/**
 * Configs --------------------------------------------------------
 */
/**
 * Puerto en el que escucha el servidor. Se puede configurar vía `process.env.PORT`.
 * @type {number|string}
 */
let port = process.env.PORT || 8100;

/**
 * Opciones CORS para permitir peticiones desde el frontend local.
 * @type {{origin: string, optionsSuccessStatus: number}}
 */
const corsOptions = {
  origin: 'http://localhost:8000',
  optionsSuccessStatus: 200,
};

api.use(cors(corsOptions));
api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());

/**
 * Data --------------------------------------------------------
 */

/**
 * Usuarios válidos para autenticación en el API (solo datos de ejemplo).
 * Cada objeto contiene: `user`, `name`, `password`, `level`.
 * @type {{user:string,name:string,password:string,level:string}[]}
 */
let validUsers = [
  {
    user: 'Anel',
    name: 'Anel CZV',
    password: '1234',
    level: 'admin',
  },
  {
    user: 'Oscar',
    name: 'Oscar FMP',
    password: '1234',
    level: 'manager',
  },
  {
    user: 'Fer',
    name: 'O Fer MP',
    password: '1234',
    level: 'general',
  },
];

/**
 * Usuario actual en sesión. Se usa para mantener el estado entre peticiones.
 * @type {Object}
 */
let userToSend = {};

/**
 * Contador de intentos de login fallidos en sesión.
 * @type {number}
 */
let userLoginTry = 0;

let products = [
  {
    id: 0,
    name: 'GOMA',
    barcode: '11111',
    barcodeSecondary: '',
    price: 5,
    stock: 50,
    description: 'Goma de Migajon Marca Pelican',
    date: '07/04/2026 - 10:14:26',
  },
  {
    id: 1,
    name: 'SACAPUNTAS',
    barcode: '2',
    barcodeSecondary: '2222',
    price: 5,
    stock: 50,
    description: '',
    date: '07/04/2026 - 10:15:26',
  },
  {
    id: 2,
    name: 'LAPIZ',
    barcode: '3',
    barcodeSecondary: '',
    price: 5,
    stock: 50,
    description: '',
    date: '07/04/2026 - 10:16:26',
  },
  {
    id: 3,
    name: 'CUADERNO',
    barcode: '4',
    barcodeSecondary: '',
    price: 5,
    stock: 50,
    description: '',
    date: '07/04/2026 - 10:17:26',
  },
  {
    id: 4,
    name: 'HOJA DE COLOR',
    barcode: '5',
    barcodeSecondary: '5555',
    price: 1,
    stock: 50,
    description: '',
    date: '07/04/2026 - 10:18:26',
  },
  {
    id: 5,
    name: 'HOJA BLANCA',
    barcode: '6',
    barcodeSecondary: '',
    price: 0.5,
    stock: 50,
    description: '',
    date: '07/04/2026 - 10:19:26',
  },
];

/**
 * Ventas registradas en memoria.
 * @type {Array<Object>}
 */
let sales = [];

/**
 * Productos preparados para enviar en la respuesta de listado.
 * @type {Array<Object>}
 */
let productsToSend = [];

/**
 * Próximo id para nuevos productos.
 * @type {number}
 */
let newProduct = products.length;

/**
 * Devuelve la fecha y hora actual en formato `DD/MM/YYYY - HH:MM:SS`.
 * @returns {string} Fecha y hora formateada.
 */
function getCurrentDate() {
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

/**
 * Apis --------------------------------------------------------
 */

/**
 * Cierra la sesión del usuario en memoria.
 * @route GET /api/v0/logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {200} Vacío (estado reseteado)
 */
api.get('/api/v0/logout', function (req, res) {
  userToSend = {};
  res.status(200);
});

/**
 * Devuelve el usuario actualmente logueado (sin contraseña).
 * @route GET /api/v0/login
 * @returns {Object} Usuario logueado o objeto vacío
 */
api.get('/api/v0/login', function (req, res) {
  res.status(200).json(userToSend);
});

/**
 * Valida credenciales y establece usuario en memoria.
 * @route POST /api/v0/login
 * @param {{user:string,password:string}} req.body - Credenciales de acceso
 * @returns {201} Usuario autenticado (sin password) | {400} Error con código y mensaje
 */
api.post('/api/v0/login', function (req, res) {
  userLoginTry += 1;
  for (const validUser of validUsers) {
    if (
      validUser.user === req.body.user &&
      validUser.password === req.body.password
    ) {
      userLoginTry = 0;
      userToSend = Object.assign({}, validUser);
      delete userToSend.password;
      delete userToSend.user;
      userToSend.loginDate = getCurrentDate();
      return res.status(201).json(userToSend);
    }
  }
  if (!Object.keys(userToSend).length && userLoginTry <= 3) {
    userToSend = {};
    return res
      .status(400)
      .json({message: 'User Not Found', code: 'E001', status: false});
  }
  if (!Object.keys(userToSend).length && userLoginTry > 3) {
    userLoginTry = 0;
    return res
      .status(400)
      .json({message: 'To Many Login Tries', code: 'E002', status: false});
  }
});

/**
 * Registra un nuevo producto si no existe y los valores son válidos.
 * @route POST /api/v0/products/product
 * @param {{barcode:string,price:number,stock:number}} req.body - Datos del producto
 * @returns {200} Producto creado | {400} Error con código y mensaje
 */
api.post('/api/v0/products/product', function (req, res) {
  if (products.find((product) => product.barcode === req.body.barcode)) {
    return res
      .status(400)
      .json({message: 'Duplicated product', code: 'ERP001', status: false});
  } else if (req.body.price < 0 || req.body.stock < 0) {
    return res
      .status(400)
      .json({message: 'Negative Values', code: 'ERP002', status: false});
  } else {
    req.body.date = getCurrentDate();
    newProduct += 1;
    req.body.id = newProduct;
    products.push(req.body);
    return res.status(200).json(req.body);
  }
});

/**
 * Elimina un producto por `id`. Requiere nivel `admin`.
 * @route DELETE /api/v0/products/product/:id
 * @param {Object} req.params.id - Id del producto a eliminar
 * @returns {200} true | {400|403} Error con código y mensaje
 */
api.delete('/api/v0/products/product/:id', function (req, res) {
  const productToDelete = products.find(
    (product) => product.id === parseInt(req.params.id)
  );
  if (!(userToSend.level === 'admin')) {
    return res
      .status(403)
      .json({message: 'Not Authorized', code: 'EDP002', status: false});
  }
  if (productToDelete) {
    products.splice(products.indexOf(productToDelete), 1);
    return res.status(200).json(true);
  } else {
    return res
      .status(400)
      .json({message: 'Not Found Product', code: 'EDP001', status: false});
  }
});

/**
 * Devuelve la lista de productos (orden invertido).
 * @route GET /api/v0/products
 * @returns {Object[]} Lista de productos
 */
api.get('/api/v0/products', function (req, res) {
  productsToSend = Array.from(products);
  productsToSend.reverse();
  res.status(200).json(productsToSend);
});

/**
 * Obtiene un producto por `id`.
 * @route GET /api/v0/products/product/:id
 * @param {Object} req.params.id - Id del producto a buscar
 * @returns {200} Producto | {400} Error si no existe
 */
api.get('/api/v0/products/product/:id', function (req, res) {
  const productToFind = products.find(
    (product) => product.id === parseInt(req.params.id)
  );
  if (productToFind) {
    return res.status(200).json(productToFind);
  } else {
    return res
      .status(400)
      .json({message: 'Not Found Product', code: 'EEP001', status: false});
  }
});

/**
 * Actualiza un producto por `id` reemplazando su contenido.
 * @route PATCH /api/v0/products/product/:id
 * @param {Object} req.params.id - Id del producto a actualizar
 * @param {Object} req.body - Nuevo objeto producto
 * @returns {200} Producto actualizado | {400} Error si no existe
 */
api.patch('/api/v0/products/product/:id', function (req, res) {
  const productToFind = products.find(
    (product) => product.id === parseInt(req.params.id)
  );
  if (productToFind) {
    products = products.map((product) =>
      product.id === parseInt(req.params.id) ? req.body : product
    );
    return res.status(200).json(req.body);
  } else {
    return res
      .status(400)
      .json({message: 'Not Found Product', code: 'EEP001', status: false});
  }
});

/**
 * Ruta de prueba que devuelve un mensaje simple.
 * @route DELETE /
 */
api.delete('/', function (req, res) {
  res.json({mensaje: 'Método delete'});
});

/**
 * Registra una nueva venta y actualiza el stock de los productos vendidos.
 * @route POST /api/v0/sales
 * @param {Object[]} req.body - Lista de productos vendidos con cantidad.
 * @returns {200} Venta registrada
 */
api.post('/api/v0/sales', function (req, res) {
  const sale = req.body;
  sales.push(sale);
  products.map((product) => {
    const productInSale = sale.find(
      (productSale) => productSale.barcode === product.barcode
    );
    if (productInSale) {
      product.stock -= productInSale.quantity;
    }
  });
  res.status(200).json(sale);
});

/**
 * Init server --------------------------------------------------------
 */
api.listen(port);
console.log('Listen to port ' + port);
