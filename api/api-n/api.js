// import pool from '../database/db.js';
const pool = require('../database/db.js');
const utils = require('./utils/utils.js');

/** CORS middleware used by the API server. */
let cors = require('cors');
/** Express factory used to create the API application. */
let express = require('express');
/** Filesystem access used by the static image route. */
let fs = require('fs');
/** Multer error type used when handling product image uploads. */
let multer  = require('multer');
/** Path helpers used to configure static image serving. */
let path = require('path');
/** Starts the fixed Windows backup script requested by an authorized user. */
let {spawn} = require('child_process');
/** Resolves the current Windows user's Documents directory. */
let os = require('os');
/** Express application that defines the API routes and static resources. */
let api = express();

api.use(cors());
api.use(express.json());

/** Middleware for parsing URL-encoded and JSON request bodies. */
var bodyParser = require('body-parser');

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
 * Counter for failed login attempts in the session.
 * @type {number}
 */
/** Number of failed login attempts tracked for the current process. */
let userLoginTry = 0;
/** Most recently generated barcode; repeat requests return it without regenerating the image. */
let lastBarcode = '';
/** User object retained for login-related API responses and authorization checks. */
let userToSend = {};
/** Prevents concurrent database backup processes. */
let backupInProgress = false;

/** Returns the directory where the batch script stores SQL backups. */
function getBackupDirectory() {
  return path.join(os.homedir(), 'Documents', 'Respaldos DB');
}

/**
 * Returns the start of the current Friday 8 PM backup cycle.
 * @param {Date} date - Date used to determine the current cycle.
 * @returns {Date} Most recent Friday at 8 PM.
 */
function getBackupCycleStart(date) {
  const cycleStart = new Date(date);
  const daysSinceFriday = (date.getDay() - 5 + 7) % 7;
  cycleStart.setDate(date.getDate() - daysSinceFriday);
  cycleStart.setHours(20, 0, 0, 0);
  if (cycleStart > date) {
    cycleStart.setDate(cycleStart.getDate() - 7);
  }
  return cycleStart;
}

/**
 * Checks whether a non-empty SQL backup exists in the current weekly cycle.
 * @param {Date} date - Date used to determine the current cycle.
 * @returns {boolean} Whether a backup exists since the cycle's Friday at 8 PM.
 */
function hasBackupInCurrentCycle(date) {
  const backupDirectory = getBackupDirectory();
  if (!fs.existsSync(backupDirectory)) {
    return false;
  }

  const cycleStart = getBackupCycleStart(date);
  const nextCycleStart = new Date(cycleStart);
  nextCycleStart.setDate(nextCycleStart.getDate() + 7);
  return fs.readdirSync(backupDirectory).some((fileName) => {
    const match = fileName.match(
      /^AdminSys_(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})-(\d{2})\.sql$/
    );
    if (!match) {
      return false;
    }

    const [, day, month, year, hour, minute, second] = match;
    const backupDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    if (
      backupDate.getFullYear() !== Number(year) ||
      backupDate.getMonth() !== Number(month) - 1 ||
      backupDate.getDate() !== Number(day) ||
      backupDate.getHours() !== Number(hour) ||
      backupDate.getMinutes() !== Number(minute) ||
      backupDate.getSeconds() !== Number(second) ||
      backupDate < cycleStart ||
      backupDate > date ||
      backupDate >= nextCycleStart
    ) {
      return false;
    }

    return fs.statSync(path.join(backupDirectory, fileName)).size > 0;
  });
}

/**
 * Starts the project's Windows batch script and waits for it to complete.
 * @returns {Promise<void>}
 */
async function createDatabaseBackup() {
  if (backupInProgress) {
    const error = new Error('A database backup is already running');
    error.code = 'BACKUP_IN_PROGRESS';
    throw error;
  }
  if (process.platform !== 'win32') {
    const error = new Error('Database backup requires Windows');
    error.code = 'BACKUP_UNSUPPORTED';
    throw error;
  }

  const projectRoot = path.resolve(__dirname, '..', '..');
  const backupScript = path.join(projectRoot, 'run-backup-db.bat');
  if (!fs.existsSync(backupScript)) {
    throw new Error('Database backup script was not found');
  }

  backupInProgress = true;
  try {
    const command = `call "${backupScript}"`;
    const result = await new Promise((resolve, reject) => {
      const backupProcess = spawn(
        process.env.ComSpec || 'cmd.exe',
        ['/d', '/c', command],
        {
          cwd: projectRoot,
          windowsHide: true,
          windowsVerbatimArguments: true
        }
      );
      let output = '';
      let errors = '';
      backupProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      backupProcess.stderr.on('data', (data) => {
        errors += data.toString();
      });
      backupProcess.once('error', reject);
      backupProcess.once('close', (code, signal) => resolve({code, signal, output, errors}));
    });

    if (result.code !== 0) {
      throw new Error(result.errors || result.output || result.signal || 'Backup process failed');
    }
  } finally {
    backupInProgress = false;
  }
}

/**
 * Creates an automatic backup if the current cycle does not already have one.
 * @param {string} trigger - Description of the event that triggered the check.
 * @returns {Promise<void>}
 */
async function runAutomaticBackup(trigger) {
  if (backupInProgress) {
    return;
  }

  try {
    if (hasBackupInCurrentCycle(new Date())) {
      return;
    }

    console.log(`Iniciando respaldo automatico (${trigger}).`);
    await createDatabaseBackup();
    console.log('Respaldo automatico creado correctamente.');
  } catch (err) {
    console.error('Error al crear el respaldo automatico: ', err.stack);
  }
}

/**
 * Determines whether the API startup should trigger a backup.
 * @param {Date} date - Date used to determine the startup window.
 * @returns {boolean} Whether startup falls on Friday after 8 PM, Saturday, or Monday.
 */
function shouldRunBackupOnStartup(date) {
  const day = date.getDay();
  const isFridayAfterEight = day === 5 && date.getHours() >= 20;
  return isFridayAfterEight || day === 6 || day === 1;
}

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

/**
 * Fetches the active logged-in user and their access level.
 * @returns {Promise<Object|undefined>} User row, or `undefined` when no user is logged in.
 */
async function getUserLogged() {
  const res_db = await pool.query(
    `
      SELECT u.name, u.last_name, u.id, u.last_login, u.change_password, l.name AS level FROM users u
      INNER JOIN levels l
      ON u.level = l.id
      WHERE is_logged = true
    `);
  return res_db.rows[0];
}

/**
 * Fetches one product by its database ID.
 * @param {number|string} value - Product ID.
 * @returns {Promise<Object|undefined>} Product row, or `undefined` if it does not exist.
 */
async function getProductById(value) {
  const productById = await pool.query(
    `
      SELECT * FROM products WHERE id = $1
    `, [value]);
  return productById.rows[0];
}

/**
 * Fetches barcode rows matching a column value.
 * @param {string} param - Barcode-table column used in the filter.
 * @param {*} value - Value to match.
 * @returns {Promise<Object[]>} Matching barcode rows.
 */
async function getBarcodes(param, value) {
  const barcodes = await pool.query(
    `
      SELECT * FROM barcodes WHERE ${param} = $1
    `, [value]);
  return barcodes.rows;
}

/**
 * Fetches barcode rows where the value is either a primary or secondary barcode.
 * @param {string} value - Barcode value to match.
 * @returns {Promise<Object[]>} Matching barcode rows.
 */
async function getBarcodesAndPrimaryBarcode(value) {
  const barcodes = await pool.query(
    `
      SELECT * FROM barcodes WHERE barcode = $1 OR primary_barcode = $1
    `, [value]);
  return barcodes.rows;
}

/**
 * Fetches product rows matching a column value.
 * @param {string} param - Product-table column used in the filter.
 * @param {*} value - Value to match.
 * @returns {Promise<Object[]>} Matching product rows.
 */
async function getProducts(param, value) {
  const barcodes = await pool.query(
    `
      SELECT * FROM products WHERE ${param} = $1
    `, [value]);
  return barcodes.rows;
}

/**
 * Apis --------------------------------------------------------
 */

/**
 * Logs out all users by clearing their database login flags.
 * @route GET /api/v0/logout
 * @authorization No authentication required.
 * @returns {200} An empty JSON object (`{}`) after clearing login state.
 * @returns {500} `{message, code, status}` if the database operation fails.
 */
api.get('/api/v0/logout', async function (req, res) {
  try {
    await pool.query(utils.logoutUser);
    return res.status(200).json({});
  } catch (err) {
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Returns the active user when their last-login date is today; otherwise clears login state.
 * @route GET /api/v0/login
 * @authorization No authentication required.
 * @returns {200} User object without credentials for a current-day session, or `{}` after an expired session is cleared.
 * @returns {500} `{message, code, status}` if there is no usable user row or the database operation fails.
 */
api.get('/api/v0/login', async function (req, res) {
  try {
    const res_db = await getUserLogged();
    userToSend = Object.assign({}, res_db);
    if (res_db?.last_login.toLocaleString().substring(0, 9) !== getCurrentDate().substring(0, 9)) {
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
 * Validates credentials, marks a matching account as logged in, and returns its user record.
 * @route POST /api/v0/login
 * @param {{user:string,password:string}} req.body - Login name and password.
 * @authorization No authentication required; credentials are supplied in the request body.
 * @returns {201} Authenticated user object.
 * @returns {400} `{message, code, status}` when credentials do not match.
 * @returns {500} `{message, code, status}` if the database operation fails.
 */
api.post('/api/v0/login', async function (req, res) {
  userLoginTry += 1;
  let res_db = {};
  try {
    res_db = await pool.query(utils.getUserAndLevel, [req.body.user, btoa(req.body.password)]);
    userLoginTry = 0;
    userToSend = Object.assign({}, res_db.rows[0]);
    if (res_db.rows.length) {
      await pool.query(
      `
        UPDATE users 
        SET is_logged = $3 , last_login = now()
        WHERE user_name = $1 AND password = $2
      `, [req.body.user, btoa(req.body.password), true]);
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
 * Changes the active user's password and ends their session.
 * @route POST /api/v0/users/user/password
 * @param {{current:string,new:string}} req.body - Current password and replacement password.
 * @authorization Requires an active logged-in user.
 * @returns {200} JSON string `"Success"`.
 * @returns {400} `{message, code, status}` when the logged-in user is unauthorized or the current password is incorrect.
 * @returns {500} `{message, code, status}` if the database operation fails.
 */
api.post('/api/v0/users/user/password', async function (req, res) {
  try {
    const user_logged = await getUserLogged();
    if (Object.keys(user_logged).length > 0) {
      const getPassword = await pool.query(
        `
          SELECT password FROM users WHERE id = $1
        `,[user_logged.id]);
      if (req.body.current === getPassword.rows[0].password) {
        await pool.query(
        `
          UPDATE users 
          SET change_password = $3 ,
              is_logged = $4 ,
              password = $5
          WHERE id = $1 AND password = $2
        `, [user_logged.id, getPassword.rows[0].password, false, false, req.body.new]);
        
        return res.status(200).json('Success');
      } else {
        return res
        .status(400)
        .json({message: 'Current Password Not Correct', code: 'ECP001', status: false});
      }
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
 * Creates a product and its additional barcode records after checking uniqueness and values.
 * @route POST /api/v0/products/product
 * @param {{name:string,barcode:string,price:number,stock:number,description:string,category:string|number,barcodeList:Array<{value:string}>}} req.body - Product fields and optional additional barcodes.
 * @authorization Requires an active logged-in user.
 * @returns {200} The submitted product JSON object.
 * @returns {400} `{message, code, status}` for duplicate/invalid values or missing login.
 * @returns {500} `{message, code, status}` if the database operation fails.
 */
api.post('/api/v0/products/product', async function (req, res) {
  try {
    const user_logged = await getUserLogged();
    const validateExist = await pool.query(
      `
        SELECT * FROM products WHERE barcode = $1;
      `, [req.body.barcode]);
      let existBarcode = await Promise.all(
        req.body.barcodeList.map(async (barcode) => {
          let validateExistBarcodes = await pool.query(
          `
            SELECT * FROM barcodes WHERE barcode = $1;
          `, [barcode.value]);
          return validateExistBarcodes.rows.length;
        })
      )
    if (validateExist.rows.length || !!existBarcode.find((value) => value == 1)) {
      return res
        .status(400)
        .json({message: 'Duplicated product', code: 'ERP001', status: false});
    } else if (req.body.price <= 0 || req.body.stock < 0) {
      return res
        .status(400)
        .json({message: 'Negative Values', code: 'ERP002', status: false});
    } else if (Object.keys(user_logged).length > 0) {
      await pool.query(
      `
        INSERT INTO products (name, barcode, price, stock, description, category)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [req.body.name, req.body.barcode, req.body.price, req.body.stock, req.body.description, req.body.category]);

      const getLastProduct = await pool.query(
        `
          SELECT id FROM products
          ORDER BY id DESC
          LIMIT 1
        `);

      req.body.barcodeList.forEach(
        async (barcode) => {
          await pool.query(
          `
           INSERT INTO barcodes (product_id, primary_barcode, barcode)
            VALUES ($1, $2, $3)
          `, [getLastProduct.rows[0].id, req.body.barcode, barcode.value]);
          
        }
      );
      
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
 * Deletes a product and its associated barcodes.
 * @route DELETE /api/v0/products/product/:id
 * @param {string} req.params.id - Product ID to delete.
 * @authorization Requires an active logged-in user with `admin` level.
 * @returns {200} JSON boolean `true` when the product is deleted.
 * @returns {400} `{message, code, status}` if the product does not exist.
 * @returns {403} `{message, code, status}` when the login lookup returns an empty user object.
 * @returns {500} `{message, code, status}` for database errors or an absent login row.
 * @returns {500} `{message, code, status}` if the database operation fails.
 */
api.delete('/api/v0/products/product/:id', async function (req, res) {
  try {
    const user_logged = await getUserLogged();
    if (!(Object.keys(user_logged).length > 0)) {
      return res
        .status(403)
        .json({message: 'Not Authorized', code: 'EDP002', status: false});
    }
    if (Object.keys(await getProductById(req.params.id, res)).length === 0) {
      return res
        .status(400)
        .json({message: 'Not Found Product', code: 'EDP001', status: false});
    }
    if ( user_logged.level === 'admin') {
      await pool.query(
        `
          DELETE FROM barcodes WHERE product_id = $1
        `, [req.params.id]);
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
 * Returns all products with their associated barcode rows.
 * @route GET /api/v0/products
 * @authorization Requires an active logged-in user.
 * @returns {200} Product array; each row includes `barcodeList`, `showBarcodes`, and `showImage`.
 * @returns {400} `{message, code, status}` when not logged in.
 * @returns {500} `{message, code, status}` if the database operation fails.
 */
api.get('/api/v0/products', async function (req, res) {
  try {
    const user_logged = await getUserLogged() || {};
    if (Object.keys(user_logged).length > 0) {
      const res_db = await pool.query(
        `
          SELECT * FROM products ORDER BY date ASC
        `);
      let fullProducts = await Promise.all(
        res_db.rows.map(async (product) => {
          const getProductsFromSale = await pool.query(
            `
              SELECT b.product_id, b.barcode, b.primary_barcode
              FROM products p
              INNER JOIN barcodes b
              ON b.product_id = p.id
              WHERE b.product_id = $1
            `, [product.id]);
            
          product = {
            ...product,
            barcodeList: getProductsFromSale.rows,
            showBarcodes: false,
            showImage: false
          };
          return product;
        })
      ) 
      return res.status(200).json(fullProducts.reverse());
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
 * Retrieves a product and its associated barcode rows by ID.
 * @route GET /api/v0/products/product/:id
 * @param {string} req.params.id - Product ID to retrieve.
 * @authorization Requires an active `admin` or `manager` user.
 * @returns {200} Product object with `barcodeList`, `showBarcodes`, and `showImage`.
 * @returns {400} `{message, code, status}` if not found or not authorized.
 * @returns {500} `{message, code, status}` if the database operation fails.
 */
api.get('/api/v0/products/product/:id', async function (req, res) {
  try {
    const userLogged = await getUserLogged() || {};
    let productGotById = await getProductById(req.params.id, res);
    if (Object.keys(productGotById).length === 0) {
      return res
        .status(400)
        .json({message: 'Not Found Product', code: 'EDP001', status: false});
    }
    if (Object.keys(userLogged).length > 0 && (userLogged.level === 'admin' 
      || userLogged.level === 'manager'
    )) {
      let getProductsFromSale = await pool.query(
        `
          SELECT b.product_id, b.barcode, b.primary_barcode, b.id
          FROM products p
          INNER JOIN barcodes b
          ON b.product_id = p.id
          WHERE b.product_id = $1
        `, [productGotById.id]);
        
      productGotById = {
        ...productGotById,
        barcodeList: getProductsFromSale.rows,
        showBarcodes: false,
        showImage: false
      };
      return res
        .status(200)
        .json(productGotById);
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
 * Updates product fields and applies requested barcode changes; optionally stores a product image.
 * @route PATCH /api/v0/products/product/:id
 * @param {string} req.params.id - Product ID to update.
 * @param {Object} req.body - Product fields; `barcodeList` may be a JSON string or array with barcode/action data.
 * @param {File} req.file - Optional multipart image in field `img` (JPEG, PNG, WebP, or GIF; up to 5 MiB).
 * @authorization Requires an active `admin` or `manager` user.
 * @returns {200} Updated product object, including its `image` filename.
 * @returns {400} `{message, code?, status}` for invalid ID, missing product, invalid/duplicate barcodes, or upload errors.
 * @returns {403} `{message, code, status}` when not authorized.
 * @returns {500} `{message, code, status}` if the database operation fails.
 */
api.patch('/api/v0/products/product/:id', async function (req, res) {
  try {
    const userLogged = await getUserLogged();
    if (!userLogged || !['admin', 'manager'].includes(userLogged.level)) {
      return res
        .status(403)
        .json({message: 'Not Authorized', code: 'EDP001', status: false}); 
    }
    const productToUpdateId = Number(req.params.id);
    if (!Number.isSafeInteger(productToUpdateId) || productToUpdateId < 1) {
      return res.status(400).json({message: 'Invalid product ID', status: false});
    }
    let productGotById = await getProductById(productToUpdateId);
    if (!productGotById) {
      return res
        .status(400)
        .json({message: 'Not Found Product', code: 'EDP002', status: false});
    }

    await new Promise((resolve, reject) => {
      utils.productImageUpload.single('img')(req, res, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    const productToUpdate = req.body;
    if (typeof productToUpdate.barcodeList === 'string') {
      try {
        productToUpdate.barcodeList = JSON.parse(productToUpdate.barcodeList);
      } catch {
        return res.status(400).json({message: 'Invalid barcode list', status: false});
      }
    }
    if (!Array.isArray(productToUpdate.barcodeList)) {
      productToUpdate.barcodeList = [];
    }

    productGotById = {
      ...productGotById,
      barcodeList: await getBarcodes('product_id', productToUpdateId)
    }

    if (productGotById.barcode !== productToUpdate.barcode) {
      const primaryBarcodeExistent = await getProducts('barcode', productToUpdate.barcode);
      if (primaryBarcodeExistent.length) {
        return res
        .status(400) 
        .json({message: 'Barcode already exists', code: 'EDP003', status: false});
      }
      const extraBarcodesExistent = await getBarcodes('barcode', productToUpdate.barcode);
      if (extraBarcodesExistent.length > 0) {
        return res
          .status(400) 
          .json({message: 'Barcode already exists', code: 'EDP003', status: false});
      }
    }

    if (productToUpdate.barcodeList.length) {
      let errorOcurs = await Promise.all(productToUpdate.barcodeList.map(async (barcode) => {
        const extraBarcodesExistent = await getBarcodesAndPrimaryBarcode(barcode.barcode);
        if (barcode.action === 'add' && extraBarcodesExistent.length) {
          return 'error'
        } else if (barcode.action === 'edit' && (extraBarcodesExistent.length && extraBarcodesExistent[0].id !== barcode.id)) {
          return 'error'
        } else {
          return ''
        }
      }))

      if (errorOcurs.find((value) => value === 'error')) {
        return res
          .status(400) 
          .json({message: 'Barcode already exists', code: 'EDP004', status: false});
      }
    }

    const imagePath = req.file
      ? `${req.file.filename}`
      : productGotById.image;
    await pool.query(
      ` 
        UPDATE products
        SET name = $1, barcode = $2, price = $3, stock = $4, description = $5,
            category = $6, image = $7
        WHERE id = $8
      `, [
            productToUpdate.name,
            productToUpdate.barcode,
            productToUpdate.price,
            productToUpdate.stock,
            productToUpdate.description,
            productToUpdate.category,
            imagePath,
            productToUpdateId
          ]);

    if (productToUpdate.barcodeList.length) {
      await Promise.all(productToUpdate.barcodeList.map(async (barcode) => {
        if (barcode.action === 'add') {
          await pool.query(
            `
              INSERT INTO barcodes (product_id, primary_barcode, barcode)
              VALUES ($1, $2, $3)
            `, [productToUpdate.id, productToUpdate.barcode, barcode.barcode]
          ); 
        }
        if (barcode.action === 'edit') {
          await pool.query(
            ` 
              UPDATE barcodes
              SET barcode = $1
              WHERE id = $2
            `, [barcode.barcode, barcode.id]
          );
        }
        if (barcode.action === 'remove') {
          await pool.query(
            ` 
              DELETE FROM barcodes
              WHERE id = $1
            `, [barcode.id]
          );
        }
      }))
    }
    return res.status(200).json({...productToUpdate, image: imagePath});

  } catch (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({message: err.message, status: false});
    }
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {}
});

/**
 * Registers a sale, associates its products, and decrements stock for non-service items.
 * @route POST /api/v0/sales
 * @param {{total:number,changeToGive:number,paymentMethod:string,products:Array<{id:number,quantity:number,category:string|number}>}} req.body - Sale totals, payment method, and sold product lines.
 * @authorization Requires an active logged-in user.
 * @returns {200} Saved sale object with `paymentMethod`, `changeToGive`, formatted `date`, and `products`.
 * @returns {400} `{message, code, status}` when not logged in.
 * @returns {500} `{message, code, status}` if the database operation fails.
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
        
        if (!Number(product.category)) {
          await pool.query(
          `
            UPDATE products
            SET stock = stock - $2
            WHERE id = $1;
          `, [product.id, product.quantity]);
        }
      });

      const getSale = await pool.query(
        `
          SELECT * FROM sales
          WHERE id = $1
        `, [getLastSale.rows[0].id]);

      let saleSaved = getSale.rows[0];

      const getProductsFromSale = await pool.query(
        `
          SELECT p.id, p.name, p.barcode, p.price, p.description,
          sp.quantity
          FROM products p
          INNER JOIN sales_products sp
          ON sp.product = p.id
          INNER JOIN sales s
          ON sp.sale = s.id
          WHERE s.id = $1
        `, [saleSaved.id]);

      saleSaved = {
        ...saleSaved,
        paymentMethod: saleSaved.payment_method,
        changeToGive: saleSaved.change_to_give,
        products: getProductsFromSale.rows,
        date: new Date(saleSaved.date).toLocaleString('es-MX', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      };
      delete sale.payment_method;
      delete sale.change_to_give;

      res.status(200).json(saleSaved);
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
 * Returns a sales report for an inclusive, validated date range.
 * @route POST /api/v0/sales/report
 * @param {{startDate:{year:number|string,month:number|string,day:number|string},endDate:{year:number|string,month:number|string,day:number|string}}} req.body - Report date range
 * @authorization Requires a user object in the server's current login state.
 * @returns {200} `{listSales, startDate, endDate, totalSales}`; each sale includes its product rows and formatted date.
 * @returns {400} `{message, code, status}` when unauthorized or the date range is invalid.
 * @returns {500} `{message, code, status}` if report generation fails.
 */
api.post('/api/v0/sales/report', async function (req, res) {
  try {
    if (!Object.keys(userToSend).length) {
      return res
        .status(400)
        .json({message: 'Not Authorized', code: 'EGR001', status: false});
    }

    const parseDate = (date) => {
      if (!date || typeof date !== 'object') {
        return null;
      }

      const {year, month, day} = date;
      const yearNumber = Number(year);
      const monthNumber = Number(month);
      const dayNumber = Number(day);
      const parsedDate = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber));

      if (
        !Number.isInteger(yearNumber) ||
        !Number.isInteger(monthNumber) ||
        !Number.isInteger(dayNumber) ||
        parsedDate.getUTCFullYear() !== yearNumber ||
        parsedDate.getUTCMonth() !== monthNumber - 1 ||
        parsedDate.getUTCDate() !== dayNumber
      ) {
        return null;
      }

      return {
        sqlDate: `${String(yearNumber).padStart(4, '0')}-${String(monthNumber).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`,
        parts: {year: String(yearNumber), month: String(monthNumber).padStart(2, '0'), day: String(dayNumber).padStart(2, '0')},
      };
    };

    const startDate = parseDate(req.body.startDate);
    const endDate = parseDate(req.body.endDate);
    if (!startDate || !endDate || startDate.sqlDate > endDate.sqlDate) {
      return res
        .status(400)
        .json({message: 'Invalid date range', code: 'EGR002', status: false});
    }

    const getSales = await pool.query(
      `
        SELECT * FROM sales
        WHERE date::date >= $1::date AND date::date <= $2::date
      `,
      [startDate.sqlDate, endDate.sqlDate]
    );

    const listSales = await Promise.all(
      getSales.rows.map(async (sale) => {
        const getProductsFromSale = await pool.query(
          `
            SELECT p.id, p.name, p.barcode, p.price, p.description,
            sp.quantity
            FROM products p
            INNER JOIN sales_products sp
            ON sp.product = p.id
            INNER JOIN sales s
            ON sp.sale = s.id
            WHERE s.id = $1
          `,
          [sale.id]
        );

        const saleWithProducts = {
          ...sale,
          paymentMethod: sale.payment_method,
          changeToGive: sale.change_to_give,
          showProducts: false,
          products: getProductsFromSale.rows,
          date: new Date(sale.date).toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
        };
        delete saleWithProducts.payment_method;
        delete saleWithProducts.change_to_give;
        return saleWithProducts;
      })
    );

    return res.status(200).json({
      listSales,
      startDate: startDate.parts,
      endDate: endDate.parts,
      totalSales: listSales.reduce(
        (total, sale) => total + Number(sale.total),
        0
      ),
    });
  } catch (err) {
    console.error('Error al generar el reporte: ', err.stack);
    return utils.returnErrorServer(res);
  }
});

/**
 * Returns all registered sales with their product rows.
 * @route GET /api/v0/sales
 * @authorization Requires a user object in the server's current login state.
 * @returns {200} Sales array; each sale includes `paymentMethod`, `changeToGive`, `showProducts`, `products`, and formatted `date`.
 * @returns {400} `{message, code, status}` when unauthorized.
 * @returns {500} `{message, code, status}` if the database operation fails.
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
              SELECT p.id, p.name, p.barcode, p.price, p.description,
              sp.quantity
              FROM products p
              INNER JOIN sales_products sp
              ON sp.product = p.id
              INNER JOIN sales s
              ON sp.sale = s.id
              WHERE s.id = $1
            `, [sale.id]);
            
          sale = {
            ...sale,
            paymentMethod: sale.payment_method,
            changeToGive: sale.change_to_give,
            showProducts: false,
            products: getProductsFromSale.rows,
            date: new Date(sale.date).toLocaleString('es-MX', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })
          };
          delete sale.payment_method;
          delete sale.change_to_give;
          return sale
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

/**
 * Returns cash-register closing records; administrators see all records, other users see their own.
 * @route GET /api/v0/sales/cash-register
 * @authorization Requires an active logged-in user.
 * @returns {200} Closing-record array with camel-case `totalCash`/`totalCard` and formatted `date`.
 * @returns {400} `{message, code, status}` when not logged in.
 * @returns {500} `{message, code, status}` if the database operation fails.
 */
api.get('/api/v0/sales/cash-register', async function (req, res) {
  try {
    const user_logged = await getUserLogged() || {};
    if (Object.keys(user_logged).length > 0) {
      let res_db;
      if (user_logged.level === 'admin') {
        res_db = await pool.query(
        `
          SELECT 
            crc.date,
            crc.total_cash,
            crc.total_card,
            crc.total,
            crc.user_id,
            u.id,
            u.name,
            u.last_name
          FROM cash_register_closed crc
          INNER JOIN users u
          ON crc.user_id = u.id
        `);
      } else {
        res_db = await pool.query(
        `
          SELECT * FROM cash_register_closed WHERE user_id = $1
        `, [user_logged.id]);
      }
      let mappingData = res_db.rows.map((data) => {
        data = {
          ...data,
          totalCash: data.total_cash,
          totalCard: data.total_card,
          date: new Date(data.date).toLocaleString('es-MX', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
        }
        delete data.total_cash;
        delete data.total_card;
        return data
      });
      return res.status(200).json(mappingData.reverse());
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
 * Records a cash-register closing for sales since the previous closing.
 * @route POST /api/v0/sales/cash-register
 * @authorization Requires an active logged-in user.
 * @returns {200} Closing object with cash/card totals and formatted date, or `{message: "No sales to close", status: true}`.
 * @returns {400} `{message, code, status}` when not logged in.
 * @returns {500} `{message, code, status}` if closing fails.
 */
api.post('/api/v0/sales/cash-register', async function (req, res) {
  let client;
  try {
    const user_logged = await getUserLogged() || {};
    if (Object.keys(user_logged).length > 0) {
      client = await pool.connect();
      await client.query('BEGIN');
      await client.query(
        `SELECT pg_advisory_xact_lock(hashtext('adminsys'), hashtext('cash_register'))`
      );
      const closing = await client.query(
        `
          WITH cash_register_boundary AS (
            SELECT MAX(date) AS last_closed_at, clock_timestamp() AS closed_at
            FROM cash_register_closed
          ),
          sales_totals AS (
            SELECT
              COALESCE(SUM(s.total) FILTER (WHERE s.payment_method = 'cash'), 0) AS total_cash,
              COALESCE(SUM(s.total) FILTER (WHERE s.payment_method = 'card'), 0) AS total_card,
              COALESCE(SUM(s.total), 0) AS total,
              COUNT(*) AS sale_count,
              boundary.closed_at
            FROM sales s
            CROSS JOIN cash_register_boundary boundary
            WHERE (boundary.last_closed_at IS NULL OR s.date > boundary.last_closed_at)
              AND s.date <= boundary.closed_at
            GROUP BY boundary.closed_at
          )
          INSERT INTO cash_register_closed (total_cash, total_card, total, user_id, date)
          SELECT total_cash, total_card, total, $1, closed_at
          FROM sales_totals
          WHERE sale_count > 0
          RETURNING
            id,
            total_cash AS "totalCash",
            total_card AS "totalCard",
            total,
            user_id,
            date
        `,
        [user_logged.id]
      );
      await client.query('COMMIT');
      if (!closing.rows.length) {
        return res.status(200).json({message: 'No sales to close', status: true});
      }
      const savedClosing = closing.rows[0];
      return res.status(200).json({
        ...savedClosing,
        date: new Date(savedClosing.date).toLocaleString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      });
    } else {
      return res
        .status(400)
        .json({message: 'Not Authorized', code: 'EGP001', status: false});
    }
  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error al revertir el corte de caja: ', rollbackError.stack);
      }
    }
    console.error('Error al conectar a la base de datos: ', err.stack);
    return utils.returnErrorServer(res);
  } finally {
    if (client) {
      client.release();
    }
  }
});

/**
 * Generates the barcode image for a new barcode value; repeated last-value requests return that value unchanged.
 * @route POST /api/v0/barcode/generate
 * @param {{barcode:string}} req.body - Barcode text to generate.
 * @authorization Requires an active logged-in user for a new value; the most recently generated value may be repeated without login.
 * @returns {200} The requested barcode string.
 * @returns {400} `{message, code, status}` when a new value is requested without login.
 * @returns {500} `{message, code, status}` if barcode generation fails.
 */
api.post('/api/v0/barcode/generate', async function (req, res) {
  try {
    const user_logged = await getUserLogged() || {};
    let barcode = req.body.barcode;
    if (Object.keys(user_logged).length > 0 && lastBarcode !== barcode) {
      utils.guardarCodigoBarras(barcode);
      lastBarcode = req.body.barcode;
      return res.status(200).json(barcode);
    } else if (lastBarcode === barcode){
        return res.status(200).json(barcode);
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
 * Runs the project's database backup script for an administrator.
 * @route POST /api/v0/database/backup
 * @authorization Requires an active administrator session.
 * @returns {200} `{success:true}` when the SQL backup completes.
 * @returns {403} `{message, code, status}` when the user is not an administrator.
 * @returns {409} `{message, code, status}` when another backup is running.
 * @returns {501} `{message, code, status}` when the server is not running Windows.
 * @returns {500} `{message, code, status}` when the script fails.
 */
api.post('/api/v0/database/backup', async function (req, res) {
  try {
    const user_logged = await getUserLogged() || {};
    if (!user_logged.id || user_logged.level !== 'admin') {
      return res
        .status(403)
        .json({message: 'Not Authorized', code: 'EBA001', status: false});
    }

    await createDatabaseBackup();
    return res.status(200).json({success: true});
  } catch (err) {
    if (err.code === 'BACKUP_IN_PROGRESS') {
      return res
        .status(409)
        .json({message: 'Backup already in progress', code: 'EBA002', status: false});
    }
    if (err.code === 'BACKUP_UNSUPPORTED') {
      return res
        .status(501)
        .json({message: 'Backup script requires Windows', code: 'EBA003', status: false});
    }
    console.error('Error al crear el respaldo: ', err.stack);
    return res
      .status(500)
      .json({message: 'Backup failed', code: 'EBA004', status: false});
  }
});

/** Publicly serves files in the API image directory under `/resources/img/*`. */
api.use('/resources/img', express.static(path.join(__dirname, 'resources', 'img')));

/**
 * Init server --------------------------------------------------------
 */
api.listen(port, () => {
  console.log('Listen to port ' + port);
  const now = new Date();
  if (shouldRunBackupOnStartup(now)) {
    runAutomaticBackup('inicio del sistema');
  }

  setInterval(() => {
    const currentTime = new Date();
    if (currentTime.getDay() === 5 && currentTime.getHours() >= 20) {
      runAutomaticBackup('viernes despues de las 20:00');
    }
  }, 60 * 1000);
});
