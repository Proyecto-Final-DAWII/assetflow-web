# Arquitectura

## Principios

AssetFlow usa una arquitectura por funcionalidades. Los componentes presentan datos y capturan eventos; los repositorios encapsulan el origen de datos; `ApiClientService` resuelve las URLs desde la configuracion runtime.

Flujo principal:

```text
Page Component -> Feature Repository -> Mock Database o ApiClientService
                                      -> RuntimeConfigService
                                      -> HttpClient + Interceptors
```

## Capas

### Core

- `core/config`: carga y valida `app.config.json` antes del arranque.
- `core/http`: cliente generico, resolucion de URLs, normalizadores e interceptores.
- `core/auth`: sesion, login y guardas por rol.
- `core/layout`: shell, menu lateral y barra superior.
- `core/mocks`: base de datos reactiva para desarrollo sin backend.
- `core/state`: loading global y notificaciones toast.

### Features

Cada funcionalidad contiene su pagina, estilos y repositorio. El componente no conoce `HttpClient`, URL ni formato de infraestructura.

### Shared

Contiene contratos de dominio y componentes de UI sin logica de negocio.

## Estado

Se usan signals para estado local y stores. Las llamadas HTTP siguen siendo Observables, lo que facilita cancelacion, composicion y uso de interceptores.

## Roles

- `ADMIN`: acceso completo, usuarios y configuracion.
- `SUPPORT`: operaciones de inventario, asignaciones y mantenimiento.
- `EMPLOYEE`: consulta de activos e incidencias propias.

Las rutas usan guardas y el menu se filtra por rol. El backend debe repetir la validacion de permisos.
