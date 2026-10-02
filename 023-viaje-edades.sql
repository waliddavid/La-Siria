-- 8G-1d: detalle del F.A.14 por viaje x edad x cinta
CREATE TABLE IF NOT EXISTS inspeccion_viaje_edades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  corte_id INTEGER NOT NULL,
  viaje INTEGER NOT NULL,
  lote_id INTEGER,
  edad_semanas INTEGER,
  color TEXT,
  cortados INTEGER,
  recusados INTEGER
);
CREATE INDEX IF NOT EXISTS idx_ive_corte ON inspeccion_viaje_edades(corte_id);
