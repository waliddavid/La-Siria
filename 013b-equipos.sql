-- FASE 8F FIX: crea las tablas de equipos SIN tocar salidas
-- (mantenimiento_id ya fue agregado a salidas en el intento anterior)
CREATE TABLE IF NOT EXISTS equipos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  ubicacion_id INTEGER,
  estado TEXT NOT NULL DEFAULT 'operativo' CHECK (estado IN ('operativo','en_mantenimiento','fuera_servicio','baja')),
  frec_dias INTEGER,
  frec_horas REAL,
  nota TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS equipo_horometro (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  equipo_id INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  lectura REAL NOT NULL,
  nota TEXT,
  registrado_por INTEGER,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_hrm_equipo ON equipo_horometro(equipo_id);

CREATE TABLE IF NOT EXISTS mantenimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  equipo_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('preventivo','correctivo')),
  fecha TEXT NOT NULL,
  descripcion TEXT,
  repuestos_estimados TEXT,
  costo_mano_obra REAL,
  horometro REAL,
  cerrado_en TEXT,
  registrado_por INTEGER,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mant_equipo ON mantenimientos(equipo_id);
