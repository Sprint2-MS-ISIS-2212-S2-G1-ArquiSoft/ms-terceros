# Solventa · microservicio `terceros`

ISIS-2212 Arquitecturas de software robustas · Grupo 1 · Sprint 2

**Responsabilidad:** Capa anticorrupción hacia proveedores externos (Open Data, KYC, pasarela de pagos). Concentra timeouts, reintentos, circuit breaker y bulkhead. En los experimentos los proveedores pueden ser mocks.

| | |
|---|---|
| Nodo de despliegue | EC2 Soporte |
| Llama a | Proveedores externos: Open Data, KYC, pasarela de pagos (HTTPS) |
| Lo llaman | identidad, suscripciones, cotizacion |
| Base de datos | Sin base de datos (servicio sin estado) |
| Puerto interno | 3000 |
| Origen en el monolito | `src/modules/terceros` |

## Correr en local

```bash
cp .env.example .env
npm ci
npm run start:dev
```

El despliegue (docker-compose por nodo EC2), el gateway, los certificados y la documentación de experimentos viven en el repositorio paraguas `Sprint2-MS-ISIS-2212-S2-G1-ArquiSoft/ISIS2212_202620_S2_Grupo1`, rama `sprint-2-microservicios`.

## Correr en local con Docker

```bash
docker compose -f docker-compose.local.yml up -d --build
curl localhost:3007/health
docker compose -f docker-compose.local.yml down
```

`docker-compose.local.yml` es **solo para desarrollo**: levanta un único contenedor (host `3007` → contenedor `3000`). No hay `postgres` porque Terceros no tiene base de datos.

## API

Los tres proveedores externos están simulados dentro de este servicio. Las rutas se agrupan por proveedor (`/kyc/…`, `/open-data/…`, `/pagos/…`) y son `POST` porque el body lleva datos personales. Todas las respuestas son `application/json`.

### `GET /health`

Salud del contenedor. No consulta ninguna base de datos (no hay) ni a los proveedores, para que la caída simulada de uno de ellos no tumbe el health check.

| | |
|---|---|
| Body | — |
| `200` | `{ "status": "ok" }` |

```bash
curl localhost:3007/health
```

```json
{ "status": "ok" }
```

### `POST /kyc/verificaciones`

Verifica la identidad del cliente contra el proveedor KYC. Reemplaza la llamada en proceso `tercerosService.verifyKyc(documento, nombre)` del monolito.

**Este es el contrato que ya consume `ms-identidad`** (`src/clients/terceros.client.ts`, con timeout de 5 s y propagación de `X-Socio-Id`) y **no puede cambiar**: ni la ruta, ni las dos claves del body, ni la clave `valido` de la respuesta. Identidad solo acepta `valido === true` estricto; un `4xx` lo lee como "no pasa la verificación" (su propio `400`) y un `5xx` o un timeout como "no pudimos verificar" (su propio `503`).

| | |
|---|---|
| Header | `X-Socio-Id` (opcional): lo inyecta el gateway |
| Body | `{ "documento": string, "nombre": string }`, ambos obligatorios y no vacíos |
| `200` | `{ "valido": true }` |
| `400` | body inválido: falta un campo, está vacío o no es string |
| `503` | `{ "message": "Proveedor KYC no disponible", ... }` |

```bash
curl -X POST localhost:3007/kyc/verificaciones \
  -H 'Content-Type: application/json' \
  -d '{"documento":"1020304050","nombre":"Ana Gomez"}'
```

```json
{ "valido": true }
```

El proveedor simulado aprueba siempre, igual que en el monolito: no mira el documento ni el nombre. Ojo con el orden de los argumentos, la firma original es `verifyKyc(documento, nombre)`.

### `POST /open-data/scores`

Consulta el score del cliente en Open Data. Reemplaza `tercerosService.getOpenDataScore(documento)`, que en el monolito llamaba `distribucion` durante el cotizar; en microservicios lo consumirá **cotizacion**.

| | |
|---|---|
| Body | `{ "documento": string }`, obligatorio y no vacío |
| `200` | `{ "score": number }`, entero entre 0 y 100 |
| `400` | body inválido |
| `503` | `{ "message": "Proveedor Open Data no disponible", ... }` |

```bash
curl -X POST localhost:3007/open-data/scores \
  -H 'Content-Type: application/json' \
  -d '{"documento":"1020304050"}'
```

```json
{ "score": 73 }
```

El score es aleatorio entre 0 y 100, igual que en el monolito. Cotización lo usa como `(score / 100) * 0.3` para ajustar la prima y la suma asegurada, así que el rango no puede cambiar.

### `POST /pagos/cobros`

Cobra un monto a través de la pasarela de pagos. Reemplaza `tercerosService.processPayment(documento, amount)`, que en el monolito llamaba `distribucion` al suscribir; en microservicios lo consumirá **suscripciones**.

| | |
|---|---|
| Body | `{ "documento": string, "monto": string }`; `monto` es una cadena numérica (p. ej. `"85000.00"`) |
| `200` | `{ "exitoso": true }` |
| `400` | body inválido: falta un campo o `monto` no es numérico |
| `503` | `{ "message": "Proveedor Pagos no disponible", ... }` |

```bash
curl -X POST localhost:3007/pagos/cobros \
  -H 'Content-Type: application/json' \
  -d '{"documento":"1020304050","monto":"85000.00"}'
```

```json
{ "exitoso": true }
```

`monto` viaja como string porque en el monolito el argumento era `cotizacion.primaMensual`, un `numeric(14,2)` que TypeORM entrega como string. La pasarela simulada aprueba siempre.

## Simulación de proveedores

Los proveedores externos siguen siendo simulados dentro de este servicio, con el mismo comportamiento del monolito: una latencia aleatoria y un fallo aleatorio del 0,01 % (1 en 10 000) que responde `503`. Cada proveedor vive en su propio adaptador (`src/proveedores/kyc.adapter.ts`, `open-data.adapter.ts`, `pagos.adapter.ts`) para poder reemplazarlo por un proveedor real sin tocar los controladores.

| Variable | Default | Efecto |
|---|---|---|
| `SIMULAR_CAIDA_KYC` | `false` | En `true`, `/kyc/…` responde `503 "Proveedor KYC no disponible"` |
| `SIMULAR_CAIDA_OPEN_DATA` | `false` | En `true`, `/open-data/…` responde `503 "Proveedor Open Data no disponible"` |
| `SIMULAR_CAIDA_PAGOS` | `false` | En `true`, `/pagos/…` responde `503 "Proveedor Pagos no disponible"` |
| `SIMULAR_LATENCIA_MIN_MS` | `200` | Piso de la latencia simulada, en milisegundos |
| `SIMULAR_LATENCIA_MAX_MS` | `800` | Techo de la latencia simulada, en milisegundos |

La caída es **el estímulo del experimento, no una táctica**: cada variable afecta solo a su proveedor, los demás siguen respondiendo `200` y `GET /health` sigue en `ok`. Con los defaults `200`/`800` la latencia es idéntica a la del monolito (`Math.random() * 600 + 200`); poner ambas en `0` responde sin espera, útil para medir sin el ruido de la latencia simulada.

En Docker, `docker-compose.local.yml` declara las cinco variables con su default, así que basta ponerle una delante al comando para recrear el contenedor con ese proveedor caído:

```bash
SIMULAR_CAIDA_OPEN_DATA=true docker compose -f docker-compose.local.yml up -d --force-recreate
curl -s -X POST localhost:3007/open-data/scores \
  -H 'Content-Type: application/json' -d '{"documento":"1020304050"}'
# → 503 {"message":"Proveedor Open Data no disponible", ...}
```

## Tácticas de ASR que no se migraron

El mock del monolito traía tácticas de resiliencia alrededor de la simulación. Quedan **fuera** de este andamio y se agregarán después, en ramas propias:

- **Circuit breaker:** tres instancias de `opossum` (una por proveedor) con `timeout: 3000`, `errorThresholdPercentage: 50` y `resetTimeout: 5000`, más sus logs de `open` / `halfOpen` / `close`. La dependencia `opossum` no está en el `package.json`.
- **Reintentos con backoff exponencial:** hasta 3 intentos por llamada con esperas de 200 / 400 / 800 ms.
- **Caché y bulkhead:** no existían en el monolito y tampoco se agregan aquí.

Lo que sí se conserva es el **timeout** obligatorio de toda llamada saliente (regla 5 de `CLAUDE.md`), que vive del lado del cliente: `ms-identidad` ya usa `AbortSignal.timeout(5000)`.
