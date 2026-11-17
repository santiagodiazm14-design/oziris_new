# Pruebas de carga con k6 - OZIRIS

Todos los correos de prueba terminan en `@loadtest.oziris.test`.

## Requisitos
1. Backend corriendo. **Para pruebas de carga hay que subir los límites de tasa**
   (por defecto el registro permite 10/min por IP y el resto 120/min):
   ```powershell
   cd backend
   npm run build
   $env:PORT=4100; $env:REGISTER_RATE_LIMIT=1000000; $env:RATE_LIMIT_GLOBAL=1000000; node dist/main
   ```
2. k6 instalado (`winget install GrafanaLabs.k6`).

## 1) Registro de 200 usuarios (`test-register.js`)
```powershell
k6 run -e API_URL=http://localhost:4100 k6/test-register.js
# Variables: USERS (200), VUS (20)
```
Criterios: 0 % de errores, p95 < 2 s y 200 registros creados.

## 2) Estrés por escalones (`stress-register.js`)
Sube la tasa de registros/segundo por escalones para encontrar el punto de quiebre.
```powershell
k6 run -e API_URL=http://localhost:4100 -e RATES=20,40,60,80,100,150,200 -e STEP=15 k6/stress-register.js
```

## Limpieza de los usuarios de prueba
```sql
DELETE FROM usuarios WHERE correo LIKE '%@loadtest.oziris.test';
```

## Resultados (máquina de desarrollo, PostgreSQL local, bcrypt nativo)
| Prueba | Resultado |
|---|---|
| 200 usuarios, 20 VUs | 200/200 creados, 0 errores, p95 ≈ 0,69 s, ≈ 42 registros/s |
| Estrés 20-60 req/s | p95 ≈ 0,1 s, 0 errores |
| Estrés 80 req/s | p95 ≈ 3,7 s (empieza a saturarse la CPU por bcrypt) |
| Estrés 100-200 req/s | latencia 6-25 s (cola), pero **0 peticiones fallidas** y sin caídas |

Capacidad sostenida ≈ **60-70 registros por segundo** (≈ 4.000/min).
