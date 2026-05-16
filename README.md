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

- Iniciar servidor de desarrollo y compilación SCSS:

```bash
npm run start
```

- Iniciar solo la API local:

```bash
npm run api
```

- Iniciar servidor de desarrollo + API en Windows:

```bash
npm run start:all:w
```

- Iniciar servidor de desarrollo + API en Mac y Linux:

```bash
npm run start:all
```

- Ejecutar tests:

```bash
npm test
```

- Ejecutar lint:

```bash
npm run lint
```

- Generar documentación estática:

```bash
npm run docs
```

- Servir la documentación localmente:

```bash
npm run docs:serve
```

- Observar cambios en documentación:

```bash
npm run docs:watch
```

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
- `GET /api/v0/products` — lista productos
- `GET /api/v0/products/product/:id` — obtiene un producto
- `POST /api/v0/products/product` — registra un producto nuevo
- `PATCH /api/v0/products/product/:id` — actualiza un producto
- `DELETE /api/v0/products/product/:id` — elimina un producto (requiere nivel `admin`)
- `POST /api/v0/sales` — registra una venta y actualiza stock

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

