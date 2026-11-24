-- Los precios pasan a pesos colombianos (COP).
-- Los beats y compras guardados antes tenian valores pensados en dolares
-- (por ejemplo 29.99); se llevan a pesos redondeando a la centena
-- (29.99 -> 30000). Solo se tocan valores menores a 1000, asi que repetir la
-- migracion no vuelve a multiplicar precios que ya estan en pesos.
UPDATE "pistas"
SET "precio" = ROUND("precio" * 1000 / 100) * 100
WHERE "precio" > 0 AND "precio" < 1000;

UPDATE "compras"
SET "monto" = ROUND("monto" * 1000 / 100) * 100
WHERE "monto" > 0 AND "monto" < 1000;

UPDATE "simulaciones_pago"
SET "monto" = ROUND("monto" * 1000 / 100) * 100,
    "moneda" = 'COP'
WHERE "monto" > 0 AND "monto" < 1000;

-- Las simulaciones nuevas tambien se registran en pesos por defecto.
ALTER TABLE "simulaciones_pago" ALTER COLUMN "moneda" SET DEFAULT 'COP';
