-- FASE 8D: ubicaciones de la finca (lugares que no son lotes)
CREATE TABLE IF NOT EXISTS ubicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO ubicaciones (nombre) VALUES
('Empacadora'),
('Cartonera'),
('Reservorio'),
('Cuarto de Motobombas'),
('Vivero'),
('Taller'),
('Oficina');
