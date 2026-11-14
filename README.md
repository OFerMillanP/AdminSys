# AdminSys

AdminSys es una aplicación de gestión de inventario y ventas construida con LitElement y una API Node.js/Express.

## Qué incluye

- Interfaz de usuario con Web Components usando `lit`
- Módulos de `home`, `login`, `register`, `products`, `sell` y `modal`
- API local en `api/api-n/api.js` para login, logout, productos y ventas
- Documentación estática generada con Eleventy en `docs/`
- Tests con Karma, Mocha y Chai

## Requisitos

- Node.js 16+ recomendado
- `npm` para instalar dependencias y ejecutar scripts

## Instalación

```bash
npm install
```

## Comandos principales

### Desarrollo y API

| Comando | Descripción |
| --- | --- |
| `npm install` | Instala las dependencias del proyecto. |
| `npm run start` | Inicia el servidor de desarrollo y abre la aplicación. |
| `npm run start-server` | Inicia el servidor de desarrollo sin el ejecutor paralelo de `start`. |
| `npm run serve` | Inicia el servidor de desarrollo sin abrir automáticamente el navegador. |
| `npm run api` | Inicia la API Node.js con Nodemon. |
| `npm run api:python` | Inicia la API Python ubicada en `api/api.py`. |
| `npm run api:all` | Inicia en segundo plano las APIs Python y Node.js. |
| `npm run start:all` | Inicia la aplicación y las APIs. |
| `npm run start:all:w` | Inicia la aplicación y las APIs en segundo plano en Windows. |
| `npm run api:install:dependencies` | Instala las dependencias de la API Node.js y las de Python. |
| `npm run api:python:install` | Instala las dependencias declaradas en `api/requirements.txt`. |

### Calidad y pruebas

| Comando | Descripción |
| --- | --- |
| `npm run lint` | Ejecuta el analizador de Lit y ESLint. |
| `npm test` | Ejecuta los tests con Karma. |
| `npm run test:watch` | Ejecuta los tests y vuelve a correrlos al detectar cambios. |
| `npm run test:update-snapshots` | Actualiza los snapshots de los tests. |
| `npm run test:prune-snapshots` | Elimina los snapshots que ya no se usan. |
| `npm run analyze` | Analiza los componentes y genera `custom-elements.json`. |
| `npm run build` | No realiza una compilación: el script informa que el proyecto no usa TypeScript. |

### Documentación

| Comando | Descripción |
| --- | --- |
| `npm run docs` | Limpia y vuelve a generar la documentación estática. |
| `npm run docs:clean` | Elimina la documentación generada en `docs/`. |
| `npm run docs:gen` | Genera las páginas con Eleventy. |
| `npm run docs:gen:watch` | Observa los archivos de documentación y regenera las páginas al cambiar. |
| `npm run docs:build` | Genera el bundle de ejemplo en `docs/my-element.bundled.js`. |
| `npm run docs:assets` | Copia el tema CSS de Prism a `docs/`. |
| `npm run docs:serve` | Sirve la documentación generada en modo de desarrollo. |

### Utilidades

| Comando | Descripción |
| --- | --- |
| `npm run format` | Formatea `main.js` y los archivos de `test/` con Prettier. |
| `npm run watch-scss` | Observa `scss/styles.scss` y compila cambios a `css/styles.css`. |
| `npm run checksize` | Construye el bundle y calcula su tamaño comprimido con gzip. |

## Estructura del proyecto

- `src/` - Código de frontend principal
  - `main.js` - App root y coordinación de rutas
  - `home/`, `login/`, `register/`, `sell/`, `products/` - vistas y componentes
  - `dm/` - capa de gestión de datos y llamadas API
  - `modal/`, `organisms/modal/` - componentes de diálogo reutilizables
- `api/api-n/` - API Express que expone endpoints de autenticación, productos y ventas
- `utils/` - utilidades compartidas, como eventos personalizados y fecha
- `docs-src/` - origen de la documentación estática Eleventy
- `docs/` - sitio generado para documentación estática

## Endpoints principales de la API

- `GET /api/v0/login` — obtiene el usuario en sesión
- `POST /api/v0/login` — inicia sesión con usuario y contraseña
- `GET /api/v0/logout` — cierra la sesión
- `POST /api/v0/users/user/password` — cambia la contraseña del usuario en sesión
- `GET /api/v0/products` — lista productos
- `GET /api/v0/products/product/:id` — obtiene un producto
- `POST /api/v0/products/product` — registra un producto nuevo
- `PATCH /api/v0/products/product/:id` — actualiza un producto
- `DELETE /api/v0/products/product/:id` — elimina un producto (requiere nivel `admin`)
- `POST /api/v0/sales` — registra una venta y actualiza stock
- `GET /api/v0/sales` — lista las ventas registradas
- `POST /api/v0/sales/report` — genera un reporte de ventas para un rango inclusivo de fechas (`startDate` y `endDate` con `year`, `month` y `day`)
- `GET /api/v0/sales/cash-register` — consulta los cortes de caja
- `POST /api/v0/sales/cash-register` — cierra la caja y registra los totales desde el último corte
- `POST /api/v0/barcode/generate` — genera el código de barras indicado

## Uso rápido

1. Ejecuta `npm install`
2. Ejecuta `npm run start` para abrir la aplicación en modo desarrollo
3. Si necesitas la API en otra terminal, ejecuta `npm run api`
4. Accede a la interfaz en el navegador según el puerto que use `es-dev-server`

## Notas

- La aplicación usa `@material/mwc-*`, `@vaadin/*` y `@open-wc/scoped-elements`
- El servidor de desarrollo se basa en `es-dev-server`
- No hay compilación de producción automática; la app funciona como módulos ES nativos

## Contribuir

Para colaborar en este proyecto:

1. Clona el repositorio
2. Instala dependencias
3. Usa `npm run lint` antes de crear un PR
4. Ejecuta `npm test` para validar cambios en los tests

---

Este README ha sido actualizado para reflejar la estructura y comandos actuales del proyecto AdminSys.
