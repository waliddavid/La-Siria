-- FASE 8H-1: Costo de la caja (conceptos + liquidaciones + facturas + gastos + IA extraction-ready)
CREATE TABLE IF NOT EXISTS conceptos_costo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE,              -- ej 2.1.1, 3.1.1 (estructura del manual Banacol)
  nombre TEXT NOT NULL,
  grupo TEXT NOT NULL,             -- VARIABLE | AGRICOLA FIJO | MANTENIMIENTO | PERSONAL | ADMINISTRACION | SERVICIOS TERCEROS
  es_variable INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO conceptos_costo (codigo, nombre, grupo, es_variable) VALUES
('3.1.1','Cosecha y empaque (corte, empaque, paletizado, cargue)','VARIABLE',1),
('3.1.2','Plasticos y sellos (bolsas, laminas, sellos marca)','VARIABLE',1),
('3.1.3','Quimicos y fungicidas de proceso (Limalum, Remlat, Mertec, Hipoclorito, Alumbre)','VARIABLE',1),
('3.1.4','Otros materiales de empaque','VARIABLE',1),
('3.1.5','Manejo de rechazo y aseos','VARIABLE',1),
('3.1.6','Transporte de fruta','VARIABLE',1),
('3.1.7','Cargue al buque','VARIABLE',1),
('3.2.1','Contribuciones (AUGURA, comunales, cooperativas, vigilancia)','VARIABLE',1),
('2.1.1','Proteccion de fruta (embolse, amarre, desflore, laminilla)','AGRICOLA FIJO',0),
('2.1.2','Desmache','AGRICOLA FIJO',0),
('2.1.3','Deshoje','AGRICOLA FIJO',0),
('2.1.4','Fertilizacion','AGRICOLA FIJO',0),
('2.1.5','Control de malezas','AGRICOLA FIJO',0),
('2.2.1','Resiembra','AGRICOLA FIJO',0),
('2.2.2','Riego (operador, ACPM, repuestos sistema)','AGRICOLA FIJO',0),
('2.2.3','Drenajes','AGRICOLA FIJO',0),
('2.2.4','Sigatoka (cirugia, MIS, mezclas)','AGRICOLA FIJO',0),
('2.2.5','Control otras enfermedades y plagas','AGRICOLA FIJO',0),
('2.2.6','Medio ambiente','AGRICOLA FIJO',0),
('2.2.7','Otros costos de finca (salarios basicos, celadores, bonificaciones)','AGRICOLA FIJO',0),
('2.2.8','Repiques y eventos (viento, inundaciones)','AGRICOLA FIJO',0),
('2.3.2','Mantenimiento equipos e infraestructura','MANTENIMIENTO',0),
('2.3.3','Servicios publicos y combustibles','MANTENIMIENTO',0),
('2.4.1','Incapacidades y permisos','PERSONAL',0),
('2.4.2','Beneficios convencionales y dotacion','PERSONAL',0),
('2.4.3','Transporte de personal','PERSONAL',0),
('2.4.4','Fumigacion aerea (servicio tercerizado Tecbaco)','SERVICIOS TERCEROS',0),
('2.4.5','Herramientas y equipos de proteccion','PERSONAL',0),
('2.3.1','Salarios administracion finca','ADMINISTRACION',0),
('4.0.0','Salarios administracion grupo / UPB','ADMINISTRACION',0),
('9.9.9','Mano de obra campo y empaque (nómina)','PERSONAL',0);

CREATE TABLE IF NOT EXISTS liquidaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  corte_id INTEGER,
  embarque TEXT,
  fecha TEXT NOT NULL,
  semana INTEGER,
  tasa_cambio REAL,
  estado TEXT NOT NULL DEFAULT 'borrador',   -- borrador | aprobada
  notas TEXT,
  aprobado_por INTEGER, aprobado_en TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS liquidacion_lineas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  liquidacion_id INTEGER NOT NULL,
  tipo_caja TEXT NOT NULL,      -- Dole 18kg | Aldi 13kg | Single | Otro
  cantidad INTEGER,
  precio_unit REAL,             -- COP por caja
  incentivo REAL,               -- bonos/incentivos por caja si vienen aparte
  empaque_especial REAL,        -- reembolso empaque especial por caja
  total_linea REAL
);
CREATE TABLE IF NOT EXISTS facturas_compra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proveedor TEXT, numero TEXT, fecha TEXT NOT NULL,
  concepto_id INTEGER,          -- clasificacion de costo
  subtotal REAL, iva REAL, total REAL,
  estado TEXT NOT NULL DEFAULT 'borrador',
  aprobado_por INTEGER, aprobado_en TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS factura_lineas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factura_id INTEGER NOT NULL,
  descripcion TEXT, cantidad REAL, vr_unit REAL, total REAL
);
CREATE TABLE IF NOT EXISTS gastos_mes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anio INTEGER NOT NULL, mes INTEGER NOT NULL,
  concepto_id INTEGER NOT NULL,
  valor REAL NOT NULL,
  nota TEXT,
  UNIQUE(anio, mes, concepto_id)
);

ALTER TABLE labores ADD COLUMN es_variable INTEGER NOT NULL DEFAULT 0;
