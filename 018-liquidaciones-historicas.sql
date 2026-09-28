-- FASE 8H-1b: historico de liquidaciones 2026 (85 embarques, desde analisis Kimi Code 28-sep-2026)
-- Idempotente: no duplica si el embarque ya existe.
-- NOTA: los 2 bonos de fidelizacion (US$10.829) NO se cargan aqui (no tienen cajas);
-- registrar aparte si se quieren en los libros.
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '250368', '01/01/2026', 3757.08, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM FORT FLEUR D, US$2,380.80)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='250368');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 384, 23294, NULL, NULL, 8944856
FROM liquidaciones l WHERE l.embarque='250368'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260002', '03/01/2026', 3790.77, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$7,226.40)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260002');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 912, 30037, NULL, NULL, 27393620
FROM liquidaciones l WHERE l.embarque='260002'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260004', '07/01/2026', 3730.26, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM SAMBHAR, US$3,315.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260004');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 500, 24732, NULL, NULL, 12365812
FROM liquidaciones l WHERE l.embarque='260004'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260007', '10/01/2026', 3717.09, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$5,294.40)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260007');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 672, 29285, NULL, NULL, 19679761
FROM liquidaciones l WHERE l.embarque='260007'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260009', '14/01/2026', 3663.24, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM DOLOMITES, US$1,989.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260009');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 24287, NULL, NULL, 7286184
FROM liquidaciones l WHERE l.embarque='260009'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260012', '17/01/2026', 3700.05, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$10,207.20)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260012');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1296, 29141, NULL, NULL, 37767150
FROM liquidaciones l WHERE l.embarque='260012'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260017', '24/01/2026', 3637.88, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$12,520.80)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260017');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1584, 28756, NULL, NULL, 45549168
FROM liquidaciones l WHERE l.embarque='260017'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260014', '23/01/2026', 3630.33, 'aprobada', 'Cargada del histórico 2026 (barco CMA, US$3,315.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260014');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 500, 24069, NULL, NULL, 12034544
FROM liquidaciones l WHERE l.embarque='260014'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260019', '30/01/2026', 3661.29, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM ZINGARO, US$3,978.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260019');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 600, 24274, NULL, NULL, 14564612
FROM liquidaciones l WHERE l.embarque='260019'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260022', '31/01/2026', 3670.47, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$9,816.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260022');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1248, 28870, NULL, NULL, 36029334
FROM liquidaciones l WHERE l.embarque='260022'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260025', '06/02/2026', 3691.75, 'aprobada', 'Cargada del histórico 2026 (barco CMA, US$1,989.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260025');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 24476, NULL, NULL, 7342891
FROM liquidaciones l WHERE l.embarque='260025'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260028', '07/02/2026', 3670.2, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$9,043.20)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260028');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1152, 28811, NULL, NULL, 33190353
FROM liquidaciones l WHERE l.embarque='260028'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260035', '14/02/2026', 3652.88, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$12,163.20)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260035');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1536, 28926, NULL, NULL, 44430832
FROM liquidaciones l WHERE l.embarque='260035'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260032', '13/02/2026', 3665.78, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM FOURDLAND, US$1,657.50)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260032');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 250, 24304, NULL, NULL, 6076030
FROM liquidaciones l WHERE l.embarque='260032'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260038', '18/02/2026', 3664.26, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM NANSHA, US$2,085.12)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260038');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 288, 26529, NULL, NULL, 7640422
FROM liquidaciones l WHERE l.embarque='260038'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260042', '21/02/2026', 3691.34, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$10,588.80)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260042');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1344, 29082, NULL, NULL, 39086861
FROM liquidaciones l WHERE l.embarque='260042'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260044', '24/02/2026', 3697.36, 'aprobada', 'Cargada del histórico 2026 (barco MAERSK BATUR, US$1,390.08)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260044');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 192, 26769, NULL, NULL, 5139626
FROM liquidaciones l WHERE l.embarque='260044'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260045', '25/02/2026', 3703.28, 'aprobada', 'Cargada del histórico 2026 (barco HANSA SIEGBURG, US$1,390.08)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260045');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 192, 26812, NULL, NULL, 5147855
FROM liquidaciones l WHERE l.embarque='260045'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260049', '28/02/2026', 3745.78, 'aprobada', 'Cargada del histórico 2026 (barco DOLE, US$9,059.04)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260049');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1152, 29456, NULL, NULL, 33933171
FROM liquidaciones l WHERE l.embarque='260049'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260050', '03/03/2026', 3768.73, 'aprobada', 'Cargada del histórico 2026 (barco MAERSK BAYETE, US$1,042.56)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260050');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 144, 27286, NULL, NULL, 3929127
FROM liquidaciones l WHERE l.embarque='260050'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260051', '04/03/2026', 3797.84, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM DOLOMITES, US$1,042.56)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260051');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 144, 27495, NULL, NULL, 3959268
FROM liquidaciones l WHERE l.embarque='260051'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260054', '07/03/2026', 3767.94, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$9,074.88)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260054');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1152, 29682, NULL, NULL, 34193603
FROM liquidaciones l WHERE l.embarque='260054'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260056', '10/03/2026', 3795.55, 'aprobada', 'Cargada del histórico 2026 (barco MAERSK BATAM, US$1,042.56)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260056');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 144, 27480, NULL, NULL, 3957089
FROM liquidaciones l WHERE l.embarque='260056'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260057', '11/03/2026', 3744.84, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM MERCANTOUR, US$1,042.56)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260057');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 144, 27113, NULL, NULL, 3904220
FROM liquidaciones l WHERE l.embarque='260057'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260060', '14/03/2026', 3700.46, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$12,134.40)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260060');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1536, 29234, NULL, NULL, 44902862
FROM liquidaciones l WHERE l.embarque='260060'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260062', '17/03/2026', 3685.53, 'aprobada', 'Cargada del histórico 2026 (barco FORT DESAIX, US$695.04)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260062');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 96, 26683, NULL, NULL, 2561591
FROM liquidaciones l WHERE l.embarque='260062'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260063', '18/03/2026', 3691.9, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM ZINGARO, US$1,042.56)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260063');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 144, 26729, NULL, NULL, 3849027
FROM liquidaciones l WHERE l.embarque='260063'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260066', '21/03/2026', 3692.48, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$8,656.80)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260066');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1104, 28954, NULL, NULL, 31965061
FROM liquidaciones l WHERE l.embarque='260066'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260069', '25/03/2026', 3700.67, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM BAIKAL, US$1,657.50)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260069');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 250, 24535, NULL, NULL, 6133861
FROM liquidaciones l WHERE l.embarque='260069'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260071', '27/03/2026', 3675.29, 'aprobada', 'Cargada del histórico 2026 (barco LUZON STRAIT, US$331.50)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260071');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 50, 24367, NULL, NULL, 1218359
FROM liquidaciones l WHERE l.embarque='260071'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260072', '28/03/2026', 3675.29, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$8,772.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260072');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1104, 29203, NULL, NULL, 32239644
FROM liquidaciones l WHERE l.embarque='260072'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260075', '01/04/2026', 3669.96, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM FIROLAND, US$1,326.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260075');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 24332, NULL, NULL, 4866367
FROM liquidaciones l WHERE l.embarque='260075'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260078', '04/04/2026', 3675.81, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$8,276.05)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260078');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1057, 28781, NULL, NULL, 30421187
FROM liquidaciones l WHERE l.embarque='260078'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260081', '08/04/2026', 3664.41, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM KHAO SOK, US$2,652.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260081');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 400, 24295, NULL, NULL, 9718015
FROM liquidaciones l WHERE l.embarque='260081'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260084', '11/04/2026', 3642.93, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$9,461.28)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260084');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1200, 28722, NULL, NULL, 34466781
FROM liquidaciones l WHERE l.embarque='260084'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260087', '15/04/2026', 3608.1, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM KRUGER, US$1,657.50)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260087');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 250, 23922, NULL, NULL, 5980426
FROM liquidaciones l WHERE l.embarque='260087'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260090', '18/04/2026', 3615.1, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$9,043.20)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260090');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1152, 28379, NULL, NULL, 32692072
FROM liquidaciones l WHERE l.embarque='260090'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260093', '22/04/2026', 3573.3, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM DOLOMITES, US$1,657.50)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260093');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 250, 23691, NULL, NULL, 5922745
FROM liquidaciones l WHERE l.embarque='260093'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260096', '25/04/2026', 3560.62, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$8,270.40)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260096');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 1056, 27886, NULL, NULL, 29447752
FROM liquidaciones l WHERE l.embarque='260096'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260098', '28/04/2026', 3551.17, 'aprobada', 'Cargada del histórico 2026 (barco MAERSK BATUR, US$1,326.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260098');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 23544, NULL, NULL, 4708851
FROM liquidaciones l WHERE l.embarque='260098'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260099', '29/04/2026', 3593.17, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM MERCANTOUR, US$1,326.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260099');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 23823, NULL, NULL, 4764543
FROM liquidaciones l WHERE l.embarque='260099'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260102', '02/05/2026', 3637.51, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$7,612.80)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260102');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 960, 28845, NULL, NULL, 27691636
FROM liquidaciones l WHERE l.embarque='260102'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260105', '06/05/2026', 3707.58, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM ZINGARO, US$1,698.96)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260105');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 248, 25399, NULL, NULL, 6299030
FROM liquidaciones l WHERE l.embarque='260105'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260108', '09/05/2026', 3729.27, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$6,724.80)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260108');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 864, 29026, NULL, NULL, 25078595
FROM liquidaciones l WHERE l.embarque='260108'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260111', '13/05/2026', 3759.0, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM BAIKAL, US$1,326.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260111');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 24922, NULL, NULL, 4984434
FROM liquidaciones l WHERE l.embarque='260111'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260114', '16/05/2026', 3784.7, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$6,724.80)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260114');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 864, 29458, NULL, NULL, 25451351
FROM liquidaciones l WHERE l.embarque='260114'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260117', '20/05/2026', 3796.78, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM FIROLAND, US$1,326.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260117');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 25173, NULL, NULL, 5034530
FROM liquidaciones l WHERE l.embarque='260117'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260120', '23/05/2026', 3701.37, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$7,497.60)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260120');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 960, 28908, NULL, NULL, 27751392
FROM liquidaciones l WHERE l.embarque='260120'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260123', '27/05/2026', 3667.06, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM KHAO SOK, US$1,326.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260123');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 24313, NULL, NULL, 4862522
FROM liquidaciones l WHERE l.embarque='260123'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260125', '29/05/2026', 3646.58, 'aprobada', 'Cargada del histórico 2026 (barco ATLANTIC KLIPPER, US$663.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260125');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 100, 24177, NULL, NULL, 2417683
FROM liquidaciones l WHERE l.embarque='260125'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260126', '30/05/2026', 3646.58, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$7,122.72)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260126');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 912, 28480, NULL, NULL, 25973568
FROM liquidaciones l WHERE l.embarque='260126'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260129', '03/06/2026', 3560.24, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM KRUGER, US$663.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260129');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 100, 23604, NULL, NULL, 2360439
FROM liquidaciones l WHERE l.embarque='260129'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260132', '06/06/2026', 3565.32, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$6,744.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260132');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 864, 27829, NULL, NULL, 24044518
FROM liquidaciones l WHERE l.embarque='260132'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260135', '10/06/2026', 3581.46, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM DOLOMITES, US$1,989.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260135');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 23745, NULL, NULL, 7123524
FROM liquidaciones l WHERE l.embarque='260135'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260138', '13/06/2026', 3513.54, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$7,519.20)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260138');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 960, 27520, NULL, NULL, 26419010
FROM liquidaciones l WHERE l.embarque='260138'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260141', '17/06/2026', 3427.07, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM MERCANTOUR, US$1,326.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260141');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 22721, NULL, NULL, 4544295
FROM liquidaciones l WHERE l.embarque='260141'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260144', '20/06/2026', 3459.53, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$6,880.80)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260144');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 864, 27551, NULL, NULL, 23804334
FROM liquidaciones l WHERE l.embarque='260144'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260147', '23/06/2026', 3408.14, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM ZINGARO, US$1,326.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260147');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 22583, NULL, NULL, 4516542
FROM liquidaciones l WHERE l.embarque='260147'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260150', '27/06/2026', 3433.71, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$6,763.20)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260150');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 864, 26878, NULL, NULL, 23222867
FROM liquidaciones l WHERE l.embarque='260150'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260153', '01/07/2026', 3440.83, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM BAIKAL, US$2,199.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260153');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 25221, NULL, NULL, 7566385
FROM liquidaciones l WHERE l.embarque='260153'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260156', '04/07/2026', 3357.82, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$6,678.80)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260156');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 864, 25948, NULL, NULL, 22419493
FROM liquidaciones l WHERE l.embarque='260156'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260158', '08/07/2026', 3350.68, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM FIROLAND, US$2,199.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260158');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 24560, NULL, NULL, 7368145
FROM liquidaciones l WHERE l.embarque='260158'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260161', '11/07/2026', 3305.38, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$6,805.44)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260161');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 864, 26035, NULL, NULL, 22494565
FROM liquidaciones l WHERE l.embarque='260161'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260163', '15/07/2026', 3252.11, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM KHAO SOK, US$2,199.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260163');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 23838, NULL, NULL, 7151390
FROM liquidaciones l WHERE l.embarque='260163'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260166', '18/07/2026', 3262.58, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$6,441.12)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260166');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 816, 25753, NULL, NULL, 21014669
FROM liquidaciones l WHERE l.embarque='260166'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260168', '22/07/2026', 3238.19, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM KRUGER, US$1,466.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260168');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 23736, NULL, NULL, 4747187
FROM liquidaciones l WHERE l.embarque='260168'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260171', '25/07/2026', 3219.31, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$6,321.60)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260171');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 816, 24940, NULL, NULL, 20351190
FROM liquidaciones l WHERE l.embarque='260171'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260174', '29/07/2026', 3205.8, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM DOLOMITES, US$2,199.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260174');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 23499, NULL, NULL, 7049554
FROM liquidaciones l WHERE l.embarque='260174'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260177', '01/08/2026', 3132.42, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$5,028.48)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260177');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 672, 23439, NULL, NULL, 15751311
FROM liquidaciones l WHERE l.embarque='260177'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260180', '05/08/2026', 3230.44, 'aprobada', 'Cargada del histórico 2026 (barco MAURITIUS PRIDE, US$2,199.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260180');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 23679, NULL, NULL, 7103738
FROM liquidaciones l WHERE l.embarque='260180'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260183', '08/08/2026', 3157.43, 'aprobada', 'Cargada del histórico 2026 (barco DOLE CHILE, US$3,726.72)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260183');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 480, 24514, NULL, NULL, 11766858
FROM liquidaciones l WHERE l.embarque='260183'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260186', '12/08/2026', 3125.47, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM ZINGARO, US$1,832.50)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260186');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 250, 22910, NULL, NULL, 5727424
FROM liquidaciones l WHERE l.embarque='260186'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260189', '15/08/2026', 3127.51, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$2,839.68)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260189');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 384, 23128, NULL, NULL, 8881128
FROM liquidaciones l WHERE l.embarque='260189'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260191', '19/08/2026', 3098.79, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM BAIKAL, US$1,832.50)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260191');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 250, 22714, NULL, NULL, 5678533
FROM liquidaciones l WHERE l.embarque='260191'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260194', '22/08/2026', 3082.96, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$4,383.36)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260194');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 576, 23309, NULL, NULL, 13426056
FROM liquidaciones l WHERE l.embarque='260194'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260196', '26/08/2026', 3056.51, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM FIROLAND, US$2,199.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260196');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 22404, NULL, NULL, 6721265
FROM liquidaciones l WHERE l.embarque='260196'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260199', '29/08/2026', 3144.28, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$4,383.36)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260199');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 576, 23928, NULL, NULL, 13782511
FROM liquidaciones l WHERE l.embarque='260199'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260202', '02/09/2026', 3213.97, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM KHAO SOK, US$2,565.50)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260202');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 350, 23558, NULL, NULL, 8245440
FROM liquidaciones l WHERE l.embarque='260202'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260205', '05/09/2026', 3141.36, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$5,136.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260205');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 672, 24009, NULL, NULL, 16134025
FROM liquidaciones l WHERE l.embarque='260205'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260208', '09/09/2026', 3126.08, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM KRUGER, US$2,565.50)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260208');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 350, 22914, NULL, NULL, 8019958
FROM liquidaciones l WHERE l.embarque='260208'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260211', '11/09/2026', 3101.0, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$5,537.28)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260211');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 720, 23849, NULL, NULL, 17171105
FROM liquidaciones l WHERE l.embarque='260211'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260214', '16/09/2026', 3109.3, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM DOLOMITES, US$1,466.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260214');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 200, 22791, NULL, NULL, 4558234
FROM liquidaciones l WHERE l.embarque='260214'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260217', '19/09/2026', 3151.73, 'aprobada', 'Cargada del histórico 2026 (barco DOLE WARI, US$4,751.52)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260217');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 624, 23999, NULL, NULL, 14975508
FROM liquidaciones l WHERE l.embarque='260217'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260220', '23/09/2026', 3208.66, 'aprobada', 'Cargada del histórico 2026 (barco CMA CGM MERCANTOUR, US$2,223.00)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260220');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 300, 23776, NULL, NULL, 7132851
FROM liquidaciones l WHERE l.embarque='260220'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260223', '26/09/2026', 3306.86, 'aprobada', 'Cargada del histórico 2026 (barco DOLE INCA, US$3,600.96)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260223');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'Otro', 480, 24808, NULL, NULL, 11907871
FROM liquidaciones l WHERE l.embarque='260223'
  AND NOT EXISTS (SELECT 1 FROM liquidacion_lineas x WHERE x.liquidacion_id=l.id);