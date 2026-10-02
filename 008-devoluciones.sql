-- FASE 8B-1: devoluciones de almacen
-- Material no usado que vuelve al inventario, ligado a su salida original.
CREATE TABLE IF NOT EXISTS devoluciones_almacen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salida_id INTEGER NOT NULL REFERENCES salidas_almacen(id),
  fecha TEXT NOT NULL,
  cantidad REAL NOT NULL,
  precio_unit REAL,
  entrada_id INTEGER REFERENCES entradas_almacen(id),
  nota TEXT,
  registrado_por INTEGER,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_dev_salida ON devoluciones_almacen(salida_id);
