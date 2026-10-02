-- 8J: clasificacion de costos en 3 pisos (fijo puro / SEMI-FIJO por ha / variable)
ALTER TABLE conceptos_costo ADD COLUMN es_semifijo INTEGER NOT NULL DEFAULT 0;

-- nuevos conceptos agregados del analisis contable 2026 (Kimi Code)
INSERT OR IGNORE INTO conceptos_costo (codigo, nombre, grupo, es_variable, es_semifijo) VALUES
('9.9.8','Mano de obra campo POR HECTAREA (semi-fijo: escala con ha cultivadas)','PERSONAL',0,1),
('7.3.0','CIF finca: energia, vigilancia, ADR, transporte, temporales','MANTENIMIENTO',0,0),
('7.1.0','Costos indirectos de produccion - liquidacion sociedad','SERVICIOS TERCEROS',0,0),
('5.3.0','Gastos financieros y bancarios','ADMINISTRACION',0,0);

-- reclasificar: MO campo 9.9.9 pasa a ser estructura pura (nombre mas preciso)
UPDATE conceptos_costo SET nombre='Mano de obra campo ESTRUCTURA (fijo puro)' WHERE codigo='9.9.9';
