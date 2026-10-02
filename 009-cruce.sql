-- FASE 8B-2: cruce salida<->actividad y embolse vs bolsas
-- Parametros de configuracion (el admin los ajusta en la pagina Configuracion)
INSERT OR IGNORE INTO configuracion (clave, valor, descripcion, tipo, actualizado_en)
VALUES ('embolse_labor_id', '', 'ID de la labor de embolse (usada en el cruce bolsas vs embolse)', 'texto', datetime('now'));
INSERT OR IGNORE INTO configuracion (clave, valor, descripcion, tipo, actualizado_en)
VALUES ('bolsas_material_id', '', 'ID del material de bolsas de embolse', 'texto', datetime('now'));
INSERT OR IGNORE INTO configuracion (clave, valor, descripcion, tipo, actualizado_en)
VALUES ('bolsas_por_racimo', '1', 'Bolsas esperadas por racimo embolsado. Default 1:1. Subir si hay reuso (ej. 1.2)', 'numero', datetime('now'));
INSERT OR IGNORE INTO configuracion (clave, valor, descripcion, tipo, actualizado_en)
VALUES ('bolsas_tolerancia_pct', '10', 'Porcentaje de tolerancia sobre el consumo esperado de bolsas antes de alertar', 'numero', datetime('now'));

-- Justificaciones manuales de salidas sin actividad asociada
CREATE TABLE IF NOT EXISTS cruce_justificaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salida_id INTEGER NOT NULL,
  comentario TEXT NOT NULL,
  usuario_id INTEGER,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cruce_just_salida ON cruce_justificaciones(salida_id);
