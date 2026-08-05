// import pool from '../database/db.js';
const pool = require('../database/db.js');
const utils = require('./utils/utils.js');

let cors = require('cors');
let express = require('express');
let api = express();

api.use(cors());
api.use(express.json());

var bodyParser = require('body-parser');
const { forEach } = require('pdfkit');

/**
 * Configs --------------------------------------------------------
 */
/**
 * Port on which the server listens. Can be configured via `process.env.PORT`.
 * @type {number|string}
 */
let port = process.env.PORT || 8100;

api.use(cors());
api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());

/**
 * Data --------------------------------------------------------
 */

/**
 * Current session user. Used to preserve state between requests.
 * @type {Object}
 */
let userToSend = {};

/**
 * Counter for failed login attempts in the session.
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
 * Registered sales stored in memory.
 * @type {Array<Object>}
 */
let sales = [
  {
    products: [
      {
        id: 1,
        name: 'SACAPUNTAS',
        barcode: '2',
        barcodeSecondary: '2222',
        price: 5,
        stock: 50,
        description: '',
        date: '07/04/2026 - 10:15:26',
        quantity: 2,
      },
      {
        id: 2,
        name: 'LAPIZ',
        barcode: '3',
        barcodeSecondary: '',
        price: 5,
        stock: 48,
        description: '',
        date: '07/04/2026 - 10:16:26',
        quantity: 1,
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
        quantity: 1,
      },
      {
        id: 0,
        name: 'GOMA',
        barcode: '11111',
        barcodeSecondary: '',
        price: 5,
        stock: 50,
        description: 'Goma de Migajon Marca Pelican',
        date: '07/04/2026 - 10:14:26',
        quantity: 1,
      },
    ],
    total: 25,
    date: '25/05/2026 - 18:09:50',
    changeToGive: 0,
    paymentMethod: 'card',
    id: 2,
    showProducts: false,
  },
  {
    products: [
      {
        id: 4,
        name: 'HOJA DE COLOR',
        barcode: '5',
        barcodeSecondary: '5555',
        price: 1,
        stock: 50,
        description: '',
        date: '07/04/2026 - 10:18:26',
        quantity: 1,
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
        quantity: 2,
      },
    ],
    total: 12,
    date: '25/05/2026 - 18:09:26',
    changeToGive: 3,
    paymentMethod: 'cash',
    id: 1,
    showProducts: false,
  },
];

/**
 * Products prepared to send in the listing response.
 * @type {Array<Object>}
 */
let productsToSend = [];

let newSale = sales.length;

let closedCashRegisters = [
  {
    date: '24/05/2026 - 01:00:00',
    totalCash: '12',
    totalCard: '25',
    total: '37'
  }
];

/**
 * Returns the current date and time in `DD/MM/YYYY - HH:MM:SS` format.
 * @returns {string} Fecha y hora formateada.
 */
function getCurrentDate() {
  const date = new Date();
  const fecha = `${
    date.getDate()
  }/${
    date.getMonth() + 1
  }/${date.getFullYear()}`;
  const hora = `${date.getHours()}:${
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  }:${date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()}`;
  return `${fecha}, ${hora}`;
}

function renameProductKeys(product, oldKey, newKey) {
  let renamedObject = {
    ...product,
    [newKey]: product[oldKey],
  };
  delete renamedObject[oldKey];
  return renamedObject;
}

async function getUserLogged() {
  const res_db = await pool.query(
    `
      SELECT u.name, u.last_login, l.name AS level FROM users u
      INNER JOIN levels l
      ON u.level = l.id
      WHERE is_logged = true
    `);
  return res_db.rows[0];
}

async function validateExistProductById(value, res) {
  const validate_exist_product = await pool.query(
    `
      SELECT * FROM products WHERE id = $1
    `, [value]);
  return validate_exist_product;
}

async function validateExistProduct(param, value, res) {
  const validate_exist_product = await pool.query(
    `
      SELECT * FROM products WHERE ${param} = $1
    `, [value]);
  return validate_exist_product;
}

/**
 * Apis --------------------------------------------------------
 */

/**
 * Logs out the user from memory.
 * @route GET /api/v0/logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {200} Vacío (estado reseteado)
 */
api.get('/api/v0/logout', async function (req, res) {
  try {
    const res_db = await pool.query(utils.logoutUser);
    return res.status(200);
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Returns the currently logged-in user (without password).
 * @route GET /api/v0/login
 * @returns {Object} Usuario logueado o objeto vacío
 */
api.get('/api/v0/login', async function (req, res) {
  try {
    const res_db = await getUserLogged();
    userToSend = Object.assign({}, res_db);
    if (res_db.last_login.toLocaleString().substring(0, 9) !== getCurrentDate().substring(0, 9)) {
      await pool.query(utils.logoutUser);
      return res.status(200).json({});
    } else {
      return res.status(200).json(userToSend);
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Validates credentials and sets the user in memory.
 * @route POST /api/v0/login
 * @param {{user:string,password:string}} req.body - Credenciales de acceso
 * @returns {201} Usuario autenticado (sin password) | {400} Error con código y mensaje
 */
api.post('/api/v0/login', async function (req, res) {
  userLoginTry += 1;
  let res_db = {};
  try {
    res_db = await pool.query(utils.getUserAndLevel, [req.body.user, req.body.password]);
    userLoginTry = 0;
    userToSend = Object.assign({}, res_db.rows[0]);
    if (res_db.rows.length) {
      await pool.query(
      `
        UPDATE users 
        SET is_logged = $3 , last_login = now()
        WHERE user_name = $1 AND password = $2
      `, [req.body.user, req.body.password, true]);
      return res.status(201).json(userToSend);
    }
    if (!res_db.rows.length && userLoginTry <= 3) {
      userToSend = {};
      return res
        .status(400)
        .json({message: 'User Not Found', code: 'E001', status: false});
    }
    if (!res_db.rows.length && userLoginTry > 3) {
      userLoginTry = 0;
      return res
        .status(400)
        .json({message: 'To Many Login Tries', code: 'E002', status: false});
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {
    // pool.end(); - para terminar
  }
});

/**
 * Creates a new product if it does not already exist and the values are valid.
 * @route POST /api/v0/products/product
 * @param {{barcode:string,price:number,stock:number}} req.body - Datos del producto
 * @returns {200} Producto creado | {400} Error con código y mensaje
 */
api.post('/api/v0/products/product', async function (req, res) {
  try {
    const user_logged = await getUserLogged();

    const validate_exist = await pool.query(
      `
        SELECT * FROM products WHERE barcode = $1
      `, [req.body.barcode]);
    
    if (validate_exist.rows.length) {
      return res
        .status(400)
        .json({message: 'Duplicated product', code: 'ERP001', status: false});
    } else if (req.body.price <= 0 || req.body.stock < 0) {
      return res
        .status(400)
        .json({message: 'Negative Values', code: 'ERP002', status: false});
    } else if (Object.keys(user_logged).length > 0) {
      const product = await pool.query(
      `
        INSERT INTO products (name, barcode, barcode_secondary, price, stock, description)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [req.body.name, req.body.barcode, req.body.barcodeSecondary, req.body.price, req.body.stock, req.body.description]);
      
      return res.status(200).json(req.body);
    } else {
      return res
        .status(400)
        .json({message: 'Not Authorized', code: 'ECP001', status: false});
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Deletes a product by `id`. Requires `admin` level.
 * @route DELETE /api/v0/products/product/:id
 * @param {Object} req.params.id - Id del producto a eliminar
 * @returns {200} true | {400|403} Error con código y mensaje
 */
api.delete('/api/v0/products/product/:id', async function (req, res) {
  try {
    const user_logged = await getUserLogged();
    if (!(Object.keys(user_logged).length > 0)) {
      return res
        .status(403)
        .json({message: 'Not Authorized', code: 'EDP002', status: false});
    }
    if (Object.keys(await validateExistProductById(req.params.id, res)).length === 0) {
      return res
        .status(400)
        .json({message: 'Not Found Product', code: 'EDP001', status: false});
    }
    if ( user_logged.level === 'admin') {
      await pool.query(
        `
          DELETE FROM products WHERE id = $1
        `, [req.params.id]);
      return res.status(200).json(true);
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Returns the product list (reversed order).
 * @route GET /api/v0/products
 * @returns {Object[]} Lista de productos
 */
api.get('/api/v0/products', async function (req, res) {
  try {
    const user_logged = await getUserLogged() || {};
    if (Object.keys(user_logged).length > 0) {
      const res_db = await pool.query(
        `
          SELECT * FROM products
        `);
      mappingProducts = res_db.rows.map((product) => renameProductKeys(product, 'barcode_secondary', 'barcodeSecondary'));
      return res.status(200).json(mappingProducts.reverse());
    } else {
      return res
        .status(400)
        .json({message: 'Not Authorized', code: 'EGP001', status: false});
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Retrieves a product by `id`.
 * @route GET /api/v0/products/product/:id
 * @param {Object} req.params.id - Id del producto a buscar
 * @returns {200} Producto | {400} Error si no existe
 */
api.get('/api/v0/products/product/:id', async function (req, res) {
  try {
    const user_logged = await getUserLogged() || {};
    const validate_exist_product = await validateExistProductById(req.params.id, res);
    if (Object.keys(validate_exist_product).length === 0) {
      return res
        .status(400)
        .json({message: 'Not Found Product', code: 'EDP001', status: false});
    }
    if (Object.keys(user_logged).length > 0 && user_logged.level === 'admin') { 
      return res
        .status(200)
        .json(renameProductKeys(validate_exist_product.rows[0], 'barcode_secondary', 'barcodeSecondary'));
    } else {
      return res
        .status(400)
        .json({message: 'Not Found Product', code: 'EEP001', status: false});
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Updates a product by `id` by replacing its content.
 * @route PATCH /api/v0/products/product/:id
 * @param {Object} req.params.id - Id del producto a actualizar
 * @param {Object} req.body - Nuevo objeto producto
 * @returns {200} Producto actualizado | {400} Error si no existe
 */
api.patch('/api/v0/products/product/:id', async function (req, res) {
  try {
    const user_logged = await getUserLogged();
    const validate_exist_product = await validateExistProductById(req.params.id, res);
    if (!(Object.keys(user_logged).length > 0)) {
      return res
        .status(403)
        .json({message: 'Not Authorized', code: 'EDP001', status: false});
    }
    if (Object.keys(validate_exist_product.rows).length === 0) {
      return res
        .status(400)
        .json({message: 'Not Found Product', code: 'EDP002', status: false});
    }
    const validate_exist_product_new_barcode = await validateExistProduct('barcode', req.body.barcode, res);
    const validate_exist_product_new_barcode_secondary = await validateExistProduct('barcode_secondary', req.body.barcodeSecondary, res);
    if (validate_exist_product.rows[0].barcode !== req.body.barcode 
        && validate_exist_product_new_barcode.rows.length > 0) {
      return res
        .status(400)
        .json({message: 'Barcode already exists', code: 'EDP003', status: false});
    } else if (validate_exist_product.rows[0].barcode_secondary !== req.body.barcodeSecondary 
        && validate_exist_product_new_barcode_secondary.rows.length > 0) {
      return res
        .status(400)
        .json({message: 'Barcode Secondary already exists', code: 'EDP004', status: false});
    } else if (user_logged.level === 'admin') {
      const res_db = await pool.query(
        `
          UPDATE products
          SET name = $1, barcode = $2, barcode_secondary = $3, price = $4, stock = $5, description = $6
          WHERE id = $7
        `, [req.body.name, req.body.barcode, req.body.barcodeSecondary, req.body.price, req.body.stock, req.body.description, req.params.id]);
      return res.status(200).json(req.body);
    } 
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Registers a new sale and updates stock for sold products.
 * @route POST /api/v0/sales
 * @param {Object[]} req.body - Lista de productos vendidos con cantidad.
 * @returns {200} Venta registrada
 */
api.post('/api/v0/sales', async function (req, res) {
   try {
    const user_logged = await getUserLogged() || {};
    
    if ((Object.keys(user_logged).length > 0)) {
      const sale = req.body;

      await pool.query(
        `
        INSERT INTO sales (total, change_to_give, payment_method)
        VALUES ($1, $2, $3)
        `, [sale.total, sale.changeToGive, sale.paymentMethod]);
      
      const getLastSale = await pool.query(
        `
          SELECT id FROM sales
          ORDER BY id DESC
          LIMIT 1
        `);
      
      sale.products.forEach(async (product) => {
        await pool.query(
        `
          INSERT INTO sales_products (sale, product, quantity)
          VALUES ($1, $2, $3)
        `, [getLastSale.rows[0].id, product.id, product.quantity]);
        
        await pool.query(
        `
          UPDATE products
          SET stock = stock - $2
          WHERE id = $1;
        `, [product.id, product.quantity]);

      })
      res.status(200).json({message: 'Sale registered successfully', code: 'ESR001', status: true});
    } else {
      return res
        .status(400)
        .json({message: 'Not Authorized', code: 'EGS001', status: false});
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Returns the list of registered sales.
 * @route GET /api/v0/sales
 * @returns {Object[]} List of sales
 */
api.get('/api/v0/sales', async function (req, res) {
   try {
    if (Object.keys(userToSend).length) {
      const getSales = await pool.query(
        `
          SELECT * FROM sales
          ORDER BY id DESC
        `);

      const salesWithProducts = await Promise.all(
        getSales.rows.map(async (sale) => {
          const getProductsFromSale = await pool.query(
            `
              SELECT p.id, p.name, p.barcode,
              p.barcode_secondary, p.price, p.description,
              sp.quantity
              FROM products p
              INNER JOIN sales_products sp
              ON sp.product = p.id
              INNER JOIN sales s
              ON sp.sale = s.id
              WHERE s.id = $1
            `, [sale.id]);

          return {
            ...sale,
            showProducts: false,
            products: getProductsFromSale.rows,
          };
        })
      );

      return res.status(200).json(salesWithProducts);
    } else {
      return res
        .status(400)
        .json({message: 'Not Authorized', code: 'EGS001', status: false});
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

api.get('/api/v0/sales/cash-register', function (req, res) {
  if (Object.keys(userToSend).length) {
    res.status(200).json(closedCashRegisters || []);
  } else {
    return res
      .status(400)
      .json({message: 'Not Authorized', code: 'EGS001', status: false});
  }
});

api.post('/api/v0/sales/cash-register', function (req, res) {
  if (Object.keys(userToSend).length) {
    const closedCashRegisterData = req.body;
    closedCashRegisters.push(
      {
        date: getCurrentDate(),
        totalCash: closedCashRegisterData.totalCash,
        totalCard: closedCashRegisterData.totalCard,
        total: closedCashRegisterData.total
      }
    );
     res.status(200).json(closedCashRegisters || []);
  } else {
    return res
      .status(400)
      .json({message: 'Not Authorized', code: 'EGS001', status: false});
  }
});

/**
 * Init server --------------------------------------------------------
 */
api.listen(port);
console.log('Listen to port ' + port);
