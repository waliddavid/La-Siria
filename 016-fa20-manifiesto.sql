-- FASE 8G-2: Racimos rechazados por defecto (F.A.20) + Manifiesto de produccion (FAG-005)
CREATE TABLE IF NOT EXISTS corte_rechazados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  corte_id INTEGER NOT NULL,
  lote_id INTEGER,
  edad INTEGER,
  mano INTEGER,
  calibre REAL,
  defecto TEXT
);
CREATE INDEX IF NOT EXISTS idx_cr_corte ON corte_rechazados(corte_id);

CREATE TABLE IF NOT EXISTS corte_manifiesto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  corte_id INTEGER NOT NULL,
  pallet INTEGER,
  dsn TEXT,
  producto TEXT,
  cajas INTEGER
);
CREATE INDEX IF NOT EXISTS idx_cm_corte ON corte_manifiesto(corte_id);

-- datos de cabecera del manifiesto, guardados en el corte
ALTER TABLE cortes ADD COLUMN manifiesto_no TEXT;
ALTER TABLE cortes ADD COLUMN contenedor TEXT;
ALTER TABLE cortes ADD COLUMN sello_entrada TEXT;
ALTER TABLE cortes ADD COLUMN sello_salida TEXT;
ALTER TABLE cortes ADD COLUMN placa TEXT;
