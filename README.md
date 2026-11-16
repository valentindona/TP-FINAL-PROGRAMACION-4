# Banco de Alimentos — Gestor Global Solidario

Sistema interno de gestión para un banco de alimentos. Centraliza el padrón de empresas donantes, las donaciones y su stock, el catálogo de productos, los remitos a instituciones beneficiarias, la facturación y la auditoría de cambios.

El proyecto tiene una API REST en **Spring Boot** y una aplicación web en **Angular**, con autenticación JWT y permisos por rol.

> Proyecto académico desarrollado para la Tecnicatura Universitaria en Programación (UTN).

## Índice

- [El sistema](#el-sistema)
- [Módulos](#módulos)
- [Roles y accesos](#roles-y-accesos)
- [Experiencia de uso](#experiencia-de-uso)
- [Stack](#stack)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Inicio rápido](#inicio-rápido)
- [Variables de entorno](#variables-de-entorno)
- [Documentación de la API](#documentación-de-la-api)
- [Notas](#notas)

## El sistema

La aplicación arranca en una **landing pública** (`/`) con la presentación del sistema y un acceso a `/login`. Una vez autenticado, el usuario entra al **panel** (`/home`), desde donde ve los módulos habilitados para su rol.

El menú y las rutas se adaptan al perfil: un usuario de depósito no puede entrar a la administración de instituciones y un usuario institucional no ve donaciones, productos ni remitos. Las rutas están protegidas tanto en el frontend como en el backend.

## Módulos

| Módulo | Ruta | Qué permite |
|---|---|---|
| Panel | `/home` | Resumen operativo y accesos según el rol. |
| Empresas donantes | `/empresas` | Alta, edición, baja y consulta de empresas, con sus datos fiscales y de contacto. Incluye historial de auditoría. |
| Donaciones | `/donaciones` | Registro y edición de donaciones con sus ítems, confirmación de la donación y consulta del detalle. |
| Ítems de donación | `/itemdonacion` | Consulta de los ítems registrados en las donaciones. |
| Productos | `/productos` | Catálogo de productos con categoría y unidad de medida, con búsqueda y filtros. |
| Remitos | `/remitos` | Emisión de remitos hacia instituciones y consulta de los existentes. |
| Instituciones | `/instituciones` | Alta, edición, baja y consulta de instituciones beneficiarias, con estado de pago e historial de auditoría. |
| Facturas | `/facturas` | Consulta y filtrado de los comprobantes asociados a las donaciones. |
| Auditoría | `/auditoria/...` | Historial de cambios de donantes e instituciones (Hibernate Envers). |

Reglas de negocio destacadas del backend:

- Un remito no se puede emitir para una institución con deuda pendiente.
- Al confirmar una donación se genera su factura y el stock queda disponible para los remitos.
- Los ítems de donación validan producto, cantidad, vencimiento y valor unitario.
- Los errores de negocio se devuelven con un mensaje legible para el usuario.

## Roles y accesos

| Rol | Usuario de prueba | Acceso principal |
|---|---|---|
| Depósito | `deposito` / `deposito123` | Empresas, donaciones, ítems, productos, remitos y facturas. Instituciones en modo lectura. Auditoría de donantes. |
| Tesorería | `tesoreria` / `tesoreria123` | Instituciones y actualización del estado de pago. |
| Institucional | `institucional` / `institucional123` | Alta, edición y baja de instituciones. Auditoría de instituciones. |

Los usuarios y roles se crean automáticamente al iniciar el backend. Las contraseñas son solo para desarrollo local.

## Experiencia de uso

- Diseño propio y responsive, sin librerías de componentes ni dependencias de UI.
- Notificaciones globales (toasts) para confirmar altas, ediciones, bajas y errores, con el mensaje que devuelve el backend.
- Diálogos de confirmación propios para las acciones destructivas, con foco inicial en "Cancelar", cierre con `Esc` o clic en el fondo y bloqueo del scroll.
- Navegación accesible: el logo vuelve al inicio, los formularios muestran validaciones y los estados de carga/error están integrados en la interfaz.
- Tipografía y recursos servidos localmente: la aplicación no depende de CDNs.

## Stack

**Backend**

- Java 21
- Spring Boot 4
- Spring Security + JWT (jjwt)
- Spring Data JPA / Hibernate
- MySQL 8 (principal) y H2 (alternativa para desarrollo)
- Hibernate Envers (auditoría)
- Springdoc OpenAPI (Swagger)
- Lombok y ModelMapper
- Maven

**Frontend**

- Angular 22
- TypeScript
- RxJS
- CSS propio con variables de diseño
- Vitest para pruebas unitarias

**Infraestructura**

- Docker y Docker Compose para MySQL + backend
- Frontend servido con Angular CLI en desarrollo

## Estructura del repositorio

```text
BancoAlimentos/
├── backend/                  API REST (Spring Boot)
│   ├── src/main/java/        Código por features (Donantes, Donacion, Producto, ...)
│   ├── src/main/resources/   application.yaml
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                 Aplicación Angular
│   ├── src/app/
│   │   ├── pages/            Landing, login, panel, empresas, instituciones
│   │   ├── components/       Donaciones, productos, remitos, facturas, toasts, modales
│   │   ├── service/          Servicios HTTP y de estado
│   │   ├── guards/           Protección de rutas
│   │   └── interceptors/     JWT y notificaciones
│   ├── public/               Logo y tipografía
│   └── package.json
├── docker-compose.yml        MySQL + backend
├── .env.example              Variables para Docker
├── GUIA-DE-INICIO.md         Guía paso a paso de instalación
└── README.md
```

## Inicio rápido

Requisitos: **Java 21**, **Node.js 22 o 24** y, si no usás Docker, una base **MySQL 8** o **H2**.

La forma más rápida de probarlo es con H2, sin Docker ni MySQL:

```powershell
# Backend (PowerShell)
cd backend
New-Item -ItemType Directory -Force data | Out-Null
$env:DB_URL='jdbc:h2:file:./data/banco;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1'
$env:DB_USER='sa'
$env:DB_PASSWORD=''
$env:SPRING_DATASOURCE_DRIVER_CLASS_NAME='org.h2.Driver'
$env:JWT_SECRET='TTKPdsHPtj0nggLnZknjZerGefychlRbnZ40pC38te2CH5FFBnCG5CNRp/fGj1oS'
$env:CORS_ALLOWED_ORIGINS='http://localhost:4200'
.\mvnw.cmd spring-boot:run
```

```powershell
# Frontend (otra terminal)
cd frontend
npm ci
npm start
```

Abrí `http://localhost:4200` e ingresá con `deposito / deposito123`.

Para Docker, MySQL local, la guía para Linux/macOS y la resolución de problemas, ver **[GUIA-DE-INICIO.md](GUIA-DE-INICIO.md)**.

## Variables de entorno

| Variable | Obligatoria | Valor por defecto | Descripción |
|---|---|---|---|
| `JWT_SECRET` | Sí | — | Secreto en Base64 para firmar los tokens. Debe decodificar a 48 bytes o más. |
| `JWT_EXPIRATION` | No | `86400000` | Duración del token en milisegundos (24 h). |
| `DB_URL` | No | `jdbc:mysql://localhost:3306/Banco_Alimentos` | URL JDBC de la base. |
| `DB_USER` | No | `root` | Usuario de la base. |
| `DB_PASSWORD` | No | `root` | Contraseña de la base. |
| `SPRING_DATASOURCE_DRIVER_CLASS_NAME` | Solo con H2 | `com.mysql.cj.jdbc.Driver` | Driver JDBC a usar. |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:4200` | Orígenes permitidos, separados por coma. |
| `SHOW_SQL` | No | `false` | Muestra las consultas SQL en consola. |

Para Docker, las variables de MySQL (`MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`) se toman del archivo `.env` de la raíz. Hay una plantilla en `.env.example`.

## Documentación de la API

Con el backend en marcha:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Los endpoints se agrupan por recurso: `/api/donantes`, `/api/donaciones`, `/api/productos`, `/api/remitos`, `/api/instituciones`, `/api/facturas`, `/api/auth`, entre otros.

## Notas

- La base arranca **vacía**: se crean usuarios, roles y permisos, pero no hay empresas, productos ni donaciones de ejemplo. Para probar el flujo, cargá primero productos y empresas, después una donación y confirmala; recién entonces vas a poder emitir remitos y ver facturas.
- El frontend apunta a `http://localhost:8080`; si el backend corre en otro host o puerto, hay que ajustar las URL de los servicios.
- El secreto y las contraseñas incluidos son de demostración. Para un entorno real hay que cambiarlos y no versionar el `.env`.
- En cada inicio del backend se recrean los usuarios y permisos de prueba. Los datos de negocio se conservan.
