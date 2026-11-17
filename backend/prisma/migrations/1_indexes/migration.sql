-- Índices para las consultas más frecuentes (listado/filtrado de beats,
-- compras por usuario, descargas, favoritos).
CREATE INDEX IF NOT EXISTS "pistas_productor_id_idx" ON "pistas"("productor_id");
CREATE INDEX IF NOT EXISTS "pistas_genero_idx" ON "pistas"("genero");
CREATE INDEX IF NOT EXISTS "pistas_creado_en_idx" ON "pistas"("creado_en");
CREATE INDEX IF NOT EXISTS "compras_usuario_id_pista_id_idx" ON "compras"("usuario_id", "pista_id");
CREATE INDEX IF NOT EXISTS "compras_pista_id_idx" ON "compras"("pista_id");
CREATE INDEX IF NOT EXISTS "registros_descargas_usuario_id_idx" ON "registros_descargas"("usuario_id");
CREATE INDEX IF NOT EXISTS "registros_descargas_pista_id_idx" ON "registros_descargas"("pista_id");
CREATE INDEX IF NOT EXISTS "favoritos_pista_id_idx" ON "favoritos"("pista_id");
CREATE INDEX IF NOT EXISTS "simulaciones_pago_usuario_id_idx" ON "simulaciones_pago"("usuario_id");
CREATE INDEX IF NOT EXISTS "restablecimiento_contrasenas_usuario_id_idx" ON "restablecimiento_contrasenas"("usuario_id");
