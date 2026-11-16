# Guía de inicio

Esta guía explica cómo levantar el sistema completo en tu máquina para desarrollo o para una demo. Hay dos caminos:

- **Opción A — H2 (recomendada para probar rápido):** no requiere Docker ni MySQL.
- **Opción B — MySQL con Docker:** se acerca más al entorno real.
- **Opción C — MySQL instalado localmente:** si ya tenés un servidor MySQL.

En los tres casos el frontend se ejecuta aparte con Angular CLI.

## Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| JDK | 21 | Compilar y ejecutar el backend |
| Node.js | 22 o 24 | Compilar y ejecutar el frontend |
| npm | Incluido con Node | Instalar dependencias del frontend |
| Docker Desktop | Opcional | MySQL + backend en contenedores (Opción B) |
| MySQL | 8.x (opcional) | Base de datos local (Opción C) |

Verificá las versiones instaladas:

```bash
java -version
node -v
npm -v
```

El frontend usa Angular 22, así que Node 22 o 24 evita problemas de compatibilidad. El backend usa Java 21.

## Preparar el proyecto

1. Descargá y descomprimí el proyecto (o cloná el repositorio).
2. Abrí una terminal en la carpeta raíz, donde están `backend/`, `frontend/` y `docker-compose.yml`.

Todos los comandos de esta guía asumen esa ubicación.

---

## Opción A — H2, sin Docker ni MySQL

H2 es una base embebida que se guarda en un archivo dentro de `backend/data/`. Es la opción más simple y no necesita instalar nada extra.

### 1. Levantar el backend

**Windows (PowerShell):**

```powershell
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

**Linux / macOS:**

```bash
cd backend
mkdir -p data

export DB_URL='jdbc:h2:file:./data/banco;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1'
export DB_USER='sa'
export DB_PASSWORD=''
export SPRING_DATASOURCE_DRIVER_CLASS_NAME='org.h2.Driver'
export JWT_SECRET='TTKPdsHPtj0nggLnZknjZerGefychlRbnZ40pC38te2CH5FFBnCG5CNRp/fGj1oS'
export CORS_ALLOWED_ORIGINS='http://localhost:4200'

chmod +x mvnw   # solo si hace falta
./mvnw spring-boot:run
```

Esperá hasta ver un mensaje similar a `Started BancoAlimentosApplication`. El backend queda escuchando en `http://localhost:8080`.

> Las variables de entorno valen solo para esa terminal. Si la cerrás, hay que volver a definirlas antes de arrancar el backend. También podés crear un archivo `backend/.env` con esos valores (el proyecto lo lee automáticamente) y no versionarlo.

### 2. Levantar el frontend

En **otra terminal**, desde la raíz:

```bash
cd frontend
npm ci
npm start
```

`npm ci` instala exactamente las versiones del `package-lock.json`. La primera vez puede tardar unos minutos.

Cuando compile, abrí `http://localhost:4200`.

### 3. Ingresar

Usá cualquiera de las cuentas de prueba:

| Usuario | Contraseña |
|---|---|
| `deposito` | `deposito123` |
| `tesoreria` | `tesoreria123` |
| `institucional` | `institucional123` |

La base H2 se guarda en `backend/data/banco.mv.db`. Para empezar de cero, detené el backend y borrá la carpeta `backend/data`.

---

## Opción B — MySQL con Docker

Esta opción levanta MySQL y el backend en contenedores. El frontend sigue corriendo en tu máquina.

### 1. Crear el archivo `.env`

En la raíz del proyecto, copiá `.env.example` como `.env` y ajustá los valores:

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=Banco_Alimentos
DB_USER=banco
DB_PASSWORD=banco123
JWT_SECRET=TTKPdsHPtj0nggLnZknjZerGefychlRbnZ40pC38te2CH5FFBnCG5CNRp/fGj1oS
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

`JWT_SECRET` debe ser un Base64 que decodifique a 48 bytes o más. El valor de ejemplo ya cumple.

### 2. Levantar los contenedores

Con Docker Desktop iniciado:

```bash
docker compose up --build -d
```

El primer arranque descarga MySQL y compila el backend, así que puede tardar varios minutos. Verificá el estado:

```bash
docker compose ps
docker compose logs -f app
```

Cuando el backend esté listo, respondiendo en `http://localhost:8080`, seguí con el frontend:

```bash
cd frontend
npm ci
npm start
```

### 3. Administrar los contenedores

```bash
docker compose stop        # detener sin borrar datos
docker compose start       # volver a iniciar
docker compose down        # eliminar contenedores (los datos quedan en el volumen)
docker compose down -v     # eliminar contenedores y borrar la base
```

Los datos de MySQL se guardan en el volumen `banco_alimentos_data`.

---

## Opción C — MySQL instalado localmente

1. Creá la base:

```sql
CREATE DATABASE Banco_Alimentos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

2. Definí las variables y arrancá el backend:

**Windows (PowerShell):**

```powershell
cd backend
$env:DB_URL='jdbc:mysql://localhost:3306/Banco_Alimentos'
$env:DB_USER='root'
$env:DB_PASSWORD='tu_password'
$env:JWT_SECRET='TTKPdsHPtj0nggLnZknjZerGefychlRbnZ40pC38te2CH5FFBnCG5CNRp/fGj1oS'
$env:CORS_ALLOWED_ORIGINS='http://localhost:4200'
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
cd backend
export DB_URL='jdbc:mysql://localhost:3306/Banco_Alimentos'
export DB_USER='root'
export DB_PASSWORD='tu_password'
export JWT_SECRET='TTKPdsHPtj0nggLnZknjZerGefychlRbnZ40pC38te2CH5FFBnCG5CNRp/fGj1oS'
export CORS_ALLOWED_ORIGINS='http://localhost:4200'
./mvnw spring-boot:run
```

Las tablas se crean solas (`ddl-auto: update`). Después levantá el frontend igual que en la Opción A.

También podés usar Docker solo para MySQL y correr el backend local:

```bash
docker compose up -d mysql
```

y luego arrancar el backend con `DB_URL=jdbc:mysql://localhost:3306/Banco_Alimentos`, `DB_USER=banco` y `DB_PASSWORD=banco123` (los valores del `.env`).

---

## Primeros pasos dentro de la aplicación

La base arranca sin datos de negocio, solo con usuarios y permisos. Para recorrer el flujo completo:

1. Entrá con `deposito`.
2. Cargá algunos **productos** en `/productos` (nombre, categoría y unidad de medida).
3. Cargá **empresas donantes** en `/empresas`.
4. Creá una **donación** en `/donaciones` con uno o más ítems y confirmala.
5. Al confirmar la donación se genera la factura y el stock queda disponible para los remitos.
6. Creá una **institución** beneficiaria (con `institucional` o `tesoreria`).
7. Emití un **remito** en `/remitos` hacia esa institución.
8. Revisá las **facturas** en `/facturas` y el historial de auditoría desde el detalle de una empresa o institución.

Con `tesoreria` podés cambiar el estado de pago de una institución. Si la institución queda con deuda pendiente, el backend rechaza el remito con un mensaje explicativo.

---

## Verificación rápida

| Qué comprobar | Cómo |
|---|---|
| Backend arriba | `http://localhost:8080/v3/api-docs` devuelve JSON |
| Swagger | `http://localhost:8080/swagger-ui/index.html` |
| Frontend arriba | `http://localhost:4200` muestra la landing |
| Login | `deposito / deposito123` entra al panel |
| API desde el frontend | Al crear o eliminar un registro aparece un toast de éxito |

---

## Problemas frecuentes

**`Could not resolve placeholder 'JWT_SECRET'`**

No definiste la variable. Copiá el bloque de variables de la opción elegida y volvé a arrancar. En Docker, verificá que el `.env` esté en la raíz (junto a `docker-compose.yml`).

**`WeakKeyException: The signing key's size is ... bits`**

El `JWT_SECRET` no es Base64 válido o decodifica a menos de 48 bytes. Usá el valor de ejemplo.

**`Communications link failure` o `Connection refused` con MySQL**

MySQL no está corriendo, la base no existe o la URL/usuario/contraseña no coinciden. Con Docker: `docker compose ps` y `docker compose logs mysql`.

**El backend no arranca porque el puerto 8080 está ocupado**

Buscá el proceso y cerralo:

```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

En Linux/macOS: `lsof -i :8080`.

**El frontend no compila o falla al instalar**

Revisá `node -v`. Usá Node 22 o 24 y volvé a ejecutar `npm ci`.

**Error de CORS en el navegador**

El backend debe permitir el origen del frontend. Verificá `CORS_ALLOWED_ORIGINS=http://localhost:4200` (o el puerto que uses).

**La página muestra "No se pudo conectar con el servidor"**

El backend no está levantado, está en otro puerto o se cayó. Revisá la terminal del backend y que `http://localhost:8080` responda.

**H2 dice que la base está bloqueada**

Hay otro proceso usando el mismo archivo. Cerrá todas las instancias del backend antes de volver a arrancar.

**Quiero reiniciar la base**

- H2: detené el backend y borrá `backend/data`.
- Docker/MySQL: `docker compose down -v` (borra el volumen).
- MySQL local: `DROP DATABASE Banco_Alimentos;` y volvé a crearla.

---

## Comandos útiles

```bash
# Backend
cd backend
./mvnw test                 # pruebas
./mvnw spring-boot:run      # ejecutar en desarrollo

# Frontend
cd frontend
npm start                   # servidor de desarrollo en :4200
npm run build               # build de producción en dist/
npm test                    # pruebas unitarias
```

Recordá que las variables de entorno del backend deben estar definidas en la terminal donde lo ejecutás.
