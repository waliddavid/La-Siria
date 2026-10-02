-- 8H-2: estandar de material por labor (cantidad de material por unidad de labor)
ALTER TABLE labor_material ADD COLUMN cantidad_std REAL;
INSERT OR IGNORE INTO configuracion (clave, valor, descripcion, tipo, actualizado_en)
VALUES ('desviacion_tolerancia_pct','15','Tolerancia % de desviacion de material/rendimiento antes de alertar (manual Banacol)','numero', datetime('now'));
