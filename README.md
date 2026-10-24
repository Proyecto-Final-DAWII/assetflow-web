# AssetFlow Web

Frontend profesional en Angular 22 para la gestion integral del ciclo de vida de activos tecnologicos. Incluye inventario, trazabilidad, asignaciones y devoluciones, mantenimientos, garantias, licencias, documentos, codigos QR, incidencias, alertas, usuarios y roles.

## Caracteristicas principales

- Angular standalone, estricto, zoneless y organizado por funcionalidades.
- Dashboard ejecutivo con indicadores y distribuciones.
- Inventario con busqueda, filtros, paginacion, alta, edicion y detalle.
- Historial completo del activo y control de estados.
- Asignaciones, devoluciones y responsables.
- Mantenimientos preventivos y correctivos.
- Licencias, capacidad disponible, uso, costos y vencimientos.
- Incidencias reportadas por colaboradores y gestionadas por TI.
- Alertas de garantia, mantenimiento, licencia e incidencias.
- Gestion de usuarios con roles `ADMIN`, `SUPPORT` y `EMPLOYEE`.
- Codigos QR reales y descarga de etiqueta.
- Documentos con carga multipart, listado y eliminacion.
- Modo demo sin backend y cambio a APIs reales mediante un JSON.
- Interceptores para JWT, correlacion, loading, timeout y errores.
- Docker + Nginx con fallback SPA y configuracion runtime sin cache.

## Requisitos

- Node.js 22.22.3 o superior compatible con Angular 22.
- npm 10 o superior.

## Inicio rapido

```bash
nvm use
npm install
npm start
```

Abre `http://localhost:4200`.

Cuentas demo:

| Rol | Correo | Clave |
| --- | --- | --- |
| Administrador TI | `admin@assetflow.pe` | `Demo123*` |
| Soporte TI | `soporte@assetflow.pe` | `Demo123*` |
| Colaborador | `colaborador@assetflow.pe` | `Demo123*` |

En modo demo tambien puedes entrar directamente con los botones por rol.

## Integracion con backend

El archivo central es:

```text
public/config/app.config.json
```

1. Cambia `api.useMocks` a `false`.
2. Reemplaza las URLs de `api.clients`.
3. Ajusta las rutas y metodos de `api.endpoints`.
4. Conserva las claves de endpoint, por ejemplo `assets.list` o `maintenance.create`.

Ejemplo:

```json
{
  "api": {
    "useMocks": false,
    "timeoutMs": 20000,
    "clients": {
      "core": { "baseUrl": "https://api.empresa.com/core/v1" },
      "identity": { "baseUrl": "https://api.empresa.com/identity/v1" },
      "files": { "baseUrl": "https://api.empresa.com/files/v1" }
    }
  }
}
```

No hay URLs escritas dentro de componentes o repositorios. Los servicios usan:

```ts
this.api.execute<Asset>('assets.detail', {
  pathParams: { id },
});
```

Consulta [docs/integration-guide.md](docs/integration-guide.md) y [docs/api-contract.md](docs/api-contract.md).

## Comandos

```bash
npm run validate:config
npm run build
npm run test
npm run check
```

## Estructura

```text
src/app/
  core/             configuracion, auth, HTTP, layout, mocks y estado global
  features/         modulos funcionales y repositorios
  shared/models/    contratos de dominio
  shared/ui/        componentes visuales reutilizables
public/config/      configuracion runtime de APIs
```

## Docker

```bash
docker build -t assetflow-web .
docker run --rm -p 8080:80 assetflow-web
```

Para cambiar URLs sin reconstruir la imagen, monta el JSON:

```bash
docker run --rm -p 8080:80 \
  -v "$PWD/public/config/app.config.json:/usr/share/nginx/html/config/app.config.json:ro" \
  assetflow-web
```

## Contratos de respuesta

Los repositorios aceptan una respuesta directa o un envelope `{ "data": ... }`. Para listados paginados, el normalizador admite `content`, `items` o `data`, ademas de `totalElements` o `total`.

## Seguridad

El frontend agrega `Authorization: Bearer <token>`, `X-Request-Id`, `X-Correlation-Id` y `Accept-Language`. La autorizacion real debe validarse siempre en backend; las guardas del frontend solo mejoran la experiencia de usuario.
