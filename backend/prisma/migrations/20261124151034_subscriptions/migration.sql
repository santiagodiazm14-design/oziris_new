-- CreateTable
CREATE TABLE "suscripciones" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'COP',
    "estado" TEXT NOT NULL DEFAULT 'ACTIVE',
    "metodo_pago" TEXT,
    "transaccion_id" TEXT NOT NULL,
    "nombre_pagador" TEXT,
    "correo_pagador" TEXT,
    "telefono_pagador" TEXT,
    "documento_pagador" TEXT,
    "tarjeta_ultimos4" TEXT,
    "inicia_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "termina_en" TIMESTAMP(3) NOT NULL,
    "cancelada_en" TIMESTAMP(3),
    "usuario_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suscripciones_transaccion_id_key" ON "suscripciones"("transaccion_id");

-- CreateIndex
CREATE INDEX "suscripciones_usuario_id_estado_idx" ON "suscripciones"("usuario_id", "estado");

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
