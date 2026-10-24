# Guia de integracion

## 1. Configuracion runtime

`RuntimeConfigService` carga `public/config/app.config.json` con `fetch` y `cache: no-store` antes de crear la aplicacion. Por eso las URLs pueden cambiar entre ambientes sin recompilar.

Cada cliente representa una base URL:

```json
"clients": {
  "core": { "baseUrl": "http://localhost:8080/api/v1" },
  "identity": { "baseUrl": "http://localhost:8081/api/v1" },
  "files": { "baseUrl": "http://localhost:8082/api/v1" }
}
```

Cada endpoint indica cliente, metodo y ruta:

```json
"assets.detail": {
  "client": "core",
  "method": "GET",
  "path": "/assets/{id}"
}
```

Los parametros entre llaves se resuelven y codifican automaticamente.

## 2. Agregar una operacion

1. Agrega la entrada en `api.endpoints`.
2. Crea un metodo en el repositorio de la funcionalidad.
3. Define tipos de request y response en `shared/models`.
4. Consume el metodo desde el componente o store.

```ts
create(value: AssetFormValue): Observable<Asset> {
  return this.api
    .execute<Asset | ApiEnvelope<Asset>, AssetFormValue>('assets.create', { body: value })
    .pipe(map(unwrapApiData));
}
```

## 3. Apagar mocks

```json
"useMocks": false
```

Los mismos componentes empezaran a consumir el backend. No es necesario cambiar imports ni URLs en TypeScript.

## 4. Autenticacion

El login real debe devolver como minimo:

```json
{
  "accessToken": "jwt",
  "refreshToken": "opcional",
  "expiresAt": "2026-10-24T02:00:00Z",
  "user": {
    "id": "usr-1",
    "fullName": "Nombre Apellido",
    "email": "correo@empresa.com",
    "area": "Tecnologia",
    "position": "Administrador",
    "role": "ADMIN",
    "status": "ACTIVE",
    "assignedAssets": 0,
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

El interceptor agrega el bearer token a todas las solicitudes salvo aquellas marcadas con `SKIP_AUTH`.

## 5. Errores

El frontend reconoce `message`, `detail` o `error` en la respuesta del backend. Recomendacion:

```json
{
  "code": "ASSET_SERIAL_DUPLICATED",
  "message": "Ya existe un activo con ese numero de serie.",
  "traceId": "..."
}
```

## 6. CORS

Permite el origen del frontend, los metodos configurados y los headers:

- `Authorization`
- `Content-Type`
- `X-Request-Id`
- `X-Correlation-Id`
- `Accept-Language`

## 7. Archivos

`documents.upload` envia `multipart/form-data` con:

- `file`: archivo binario.
- `type`: `INVOICE`, `WARRANTY`, `DELIVERY_ACT`, `PHOTO` u `OTHER`.

El frontend limita a 10 MB; el backend debe validar nuevamente tamano, MIME, extension y contenido.
