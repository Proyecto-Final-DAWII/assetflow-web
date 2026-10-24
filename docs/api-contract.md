# Contrato API esperado

Las URLs finales se controlan desde `app.config.json`. Este documento describe las formas de datos esperadas por el frontend.

## Respuestas

Una operacion puede responder directamente:

```json
{ "id": "ast-001", "code": "AF-LAP-0001" }
```

O dentro de un envelope:

```json
{ "data": { "id": "ast-001", "code": "AF-LAP-0001" }, "message": "OK" }
```

Un listado paginado puede usar:

```json
{
  "content": [],
  "page": 0,
  "size": 10,
  "totalElements": 0,
  "totalPages": 0
}
```

Tambien se aceptan `items`, `data`, `pageNumber`, `pageSize` y `total`.

## Activos

- `GET /assets`: filtros `search`, `status`, `category`, `page`, `size`.
- `GET /assets/{id}`.
- `POST /assets`.
- `PUT /assets/{id}`.
- `DELETE /assets/{id}`.
- `GET /assets/{id}/history`.

Estados: `AVAILABLE`, `ASSIGNED`, `MAINTENANCE`, `REPAIR`, `LOST`, `RETIRED`.

## Asignaciones

- `GET /assignments`.
- `POST /assignments`.
- `POST /assignments/{id}/return`.

## Mantenimientos

- `GET /maintenance`.
- `POST /maintenance`.
- `PUT /maintenance/{id}`.
- `POST /maintenance/{id}/complete`.

## Licencias

- `GET /licenses`.
- `POST /licenses`.
- `PUT /licenses/{id}`.

## Incidencias

- `GET /incidents`.
- `POST /incidents`.
- `PATCH /incidents/{id}` con `{ "status": "IN_REVIEW" }`.

## Alertas

- `GET /alerts`.
- `PATCH /alerts/{id}/read`.
- `PATCH /alerts/read-all`.

## Usuarios

- `GET /users`.
- `POST /users`.
- `PUT /users/{id}`.

Roles: `ADMIN`, `SUPPORT`, `EMPLOYEE`.

## Documentos

- `GET /assets/{assetId}/documents`.
- `POST /assets/{assetId}/documents` multipart.
- `GET /documents/{id}/download`.
- `DELETE /documents/{id}`.
