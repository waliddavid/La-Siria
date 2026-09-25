-- FASE 8C: modulo de herramientas (identificacion individual + prestamos)
CREATE TABLE IF NOT EXISTS herramientas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','danada','retirada')),
  nota TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS prestamos_herramientas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  herramienta_id INTEGER NOT NULL REFERENCES herramientas(id),
  trabajador_id INTEGER NOT NULL REFERENCES trabajadores(id),
  fecha_prestamo TEXT NOT NULL,
  fecha_devolucion TEXT,
  volvio_danada INTEGER NOT NULL DEFAULT 0,
  nota TEXT,
  registrado_por INTEGER,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_prest_herr ON prestamos_herramientas(herramienta_id);
CREATE INDEX IF NOT EXISTS idx_prest_trab ON prestamos_herramientas(trabajador_id);
