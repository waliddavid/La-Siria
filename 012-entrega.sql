-- FASE 8E: entrega unificada + catalogo de repuestos
-- EJECUTAR UNA SOLA VEZ (si da error "duplicate column name", ya esta aplicada: sigue adelante)

-- 1) los materiales existentes quedan como 'material'; los nuevos pueden ser 'repuesto'
ALTER TABLE materiales ADD COLUMN tipo TEXT NOT NULL DEFAULT 'material';

-- 2) salidas: destino por ubicacion + hora exacta de la entrega
ALTER TABLE salidas_almacen ADD COLUMN ubicacion_id INTEGER;
ALTER TABLE salidas_almacen ADD COLUMN hora TEXT;

-- 3) prestamos de herramientas: hora exacta
ALTER TABLE prestamos_herramientas ADD COLUMN hora TEXT;
