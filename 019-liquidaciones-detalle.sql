-- FASE 8H-1c: historico de liquidaciones 2026 REHECHO desde el detalle por conceptos
-- (fruta con su tarifa + bono por caja como incentivo + empaque especial separado)
-- Reemplaza las lineas de la carga anterior (018) si existen. Idempotente por embarque.
DELETE FROM liquidacion_lineas WHERE liquidacion_id IN (SELECT id FROM liquidaciones);
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '250368', '2026-01-01', 3757.08, 'aprobada', 'Histórico 2026 (barco CMA CGM FORT FLEUR D)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='250368');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 384, 20176, 3118, NULL, 8944856
FROM liquidaciones l WHERE l.embarque='250368';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260002', '2026-01-03', 3790.77, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260002');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 48, 19902, 1516, NULL, 1028057
FROM liquidaciones l WHERE l.embarque='260002';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 864, 24450, 6065, NULL, 26365564
FROM liquidaciones l WHERE l.embarque='260002';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260004', '2026-01-07', 3730.26, 'aprobada', 'Histórico 2026 (barco CMA CGM SAMBHAR)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260004');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 500, 20815, 3917, NULL, 12365812
FROM liquidaciones l WHERE l.embarque='260004';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260007', '2026-01-10', 3717.09, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260007');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 48, 19515, 1487, NULL, 1008075
FROM liquidaciones l WHERE l.embarque='260007';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 624, 23975, 5947, NULL, 18671686
FROM liquidaciones l WHERE l.embarque='260007';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260009', '2026-01-14', 3663.24, 'aprobada', 'Histórico 2026 (barco CMA CGM DOLOMITES)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260009');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 300, 20441, 3846, NULL, 7286184
FROM liquidaciones l WHERE l.embarque='260009';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260012', '2026-01-17', 3700.05, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260012');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19425, 1480, NULL, 2006907
FROM liquidaciones l WHERE l.embarque='260012';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1200, 23865, 5920, NULL, 35742483
FROM liquidaciones l WHERE l.embarque='260012';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 240, 0, NULL, 74, 17760
FROM liquidaciones l WHERE l.embarque='260012';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260014', '2026-01-23', 3630.33, 'aprobada', 'Histórico 2026 (barco CMA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260014');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 500, 20257, 3812, NULL, 12034544
FROM liquidaciones l WHERE l.embarque='260014';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260017', '2026-01-24', 3637.88, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260017');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19099, 1455, NULL, 1973186
FROM liquidaciones l WHERE l.embarque='260017';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1488, 23464, 5821, NULL, 43575982
FROM liquidaciones l WHERE l.embarque='260017';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260019', '2026-01-30', 3661.29, 'aprobada', 'Histórico 2026 (barco CMA CGM ZINGARO)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260019');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 600, 20430, 3844, NULL, 14564612
FROM liquidaciones l WHERE l.embarque='260019';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260022', '2026-01-31', 3670.47, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260022');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19270, 1468, NULL, 1990863
FROM liquidaciones l WHERE l.embarque='260022';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1152, 23675, 5873, NULL, 34038471
FROM liquidaciones l WHERE l.embarque='260022';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260025', '2026-02-06', 3691.75, 'aprobada', 'Histórico 2026 (barco CMA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260025');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 300, 20600, 3876, NULL, 7342891
FROM liquidaciones l WHERE l.embarque='260025';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260028', '2026-02-07', 3670.2, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260028');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19269, 1468, NULL, 1990716
FROM liquidaciones l WHERE l.embarque='260028';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1056, 23673, 5872, NULL, 31199636
FROM liquidaciones l WHERE l.embarque='260028';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260032', '2026-02-13', 3665.78, 'aprobada', 'Histórico 2026 (barco CMA CGM FOURDLAND)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260032');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 250, 20455, 3849, NULL, 6076030
FROM liquidaciones l WHERE l.embarque='260032';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260035', '2026-02-14', 3652.88, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260035');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19178, 1461, NULL, 1981322
FROM liquidaciones l WHERE l.embarque='260035';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1440, 23561, 5845, NULL, 42344185
FROM liquidaciones l WHERE l.embarque='260035';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 1440, 0, NULL, 73, 105203
FROM liquidaciones l WHERE l.embarque='260035';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260038', '2026-02-18', 3664.26, 'aprobada', 'Histórico 2026 (barco CMA CGM NANSHA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260038');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 288, 22315, 4214, NULL, 7640422
FROM liquidaciones l WHERE l.embarque='260038';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260042', '2026-02-21', 3691.34, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260042');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19380, 1477, NULL, 2002183
FROM liquidaciones l WHERE l.embarque='260042';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1248, 23809, 5906, NULL, 37084678
FROM liquidaciones l WHERE l.embarque='260042';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260044', '2026-02-24', 3697.36, 'aprobada', 'Histórico 2026 (barco MAERSK BATUR)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260044');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 192, 22517, 4252, NULL, 5139626
FROM liquidaciones l WHERE l.embarque='260044';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260045', '2026-02-25', 3703.28, 'aprobada', 'Histórico 2026 (barco HANSA SIEGBURG)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260045');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 192, 22553, 4259, NULL, 5147855
FROM liquidaciones l WHERE l.embarque='260045';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260049', '2026-02-28', 3745.78, 'aprobada', 'Histórico 2026 (barco DOLE)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260049');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19665, 1498, NULL, 2031711
FROM liquidaciones l WHERE l.embarque='260049';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1056, 24160, 5993, NULL, 31842127
FROM liquidaciones l WHERE l.embarque='260049';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 528, 0, NULL, 112, 59333
FROM liquidaciones l WHERE l.embarque='260049';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260050', '2026-03-03', 3768.73, 'aprobada', 'Histórico 2026 (barco MAERSK BAYETE)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260050');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 144, 22952, 4334, NULL, 3929127
FROM liquidaciones l WHERE l.embarque='260050';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260051', '2026-03-04', 3797.84, 'aprobada', 'Histórico 2026 (barco CMA CGM DOLOMITES)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260051');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 144, 23129, 4368, NULL, 3959476
FROM liquidaciones l WHERE l.embarque='260051';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260054', '2026-03-07', 3767.94, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260054');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19782, 1507, NULL, 2043731
FROM liquidaciones l WHERE l.embarque='260054';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1056, 24303, 6029, NULL, 32030504
FROM liquidaciones l WHERE l.embarque='260054';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 1056, 0, NULL, 113, 119368
FROM liquidaciones l WHERE l.embarque='260054';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260056', '2026-03-10', 3795.55, 'aprobada', 'Histórico 2026 (barco MAERSK BATAM)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260056');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 144, 23115, 4365, NULL, 3957089
FROM liquidaciones l WHERE l.embarque='260056';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260057', '2026-03-11', 3744.84, 'aprobada', 'Histórico 2026 (barco CMA CGM MERCANTOUR)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260057');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 144, 22806, 4307, NULL, 3904220
FROM liquidaciones l WHERE l.embarque='260057';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260060', '2026-03-14', 3700.46, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260060');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19427, 1480, NULL, 2007130
FROM liquidaciones l WHERE l.embarque='260060';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1440, 23868, 5921, NULL, 42895732
FROM liquidaciones l WHERE l.embarque='260060';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260062', '2026-03-17', 3685.53, 'aprobada', 'Histórico 2026 (barco FORT DESAIX)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260062');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 96, 22445, 4238, NULL, 2561591
FROM liquidaciones l WHERE l.embarque='260062';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260063', '2026-03-18', 3691.9, 'aprobada', 'Histórico 2026 (barco CMA CGM ZINGARO)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260063');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO MIXTO', 144, 22484, 4246, NULL, 3849027
FROM liquidaciones l WHERE l.embarque='260063';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260066', '2026-03-21', 3692.48, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260066');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19386, 1477, NULL, 2002801
FROM liquidaciones l WHERE l.embarque='260066';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1008, 23816, 5908, NULL, 29962260
FROM liquidaciones l WHERE l.embarque='260066';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260069', '2026-03-25', 3700.67, 'aprobada', 'Histórico 2026 (barco CMA CGM BAIKAL)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260069');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 250, 20650, 3886, NULL, 6133861
FROM liquidaciones l WHERE l.embarque='260069';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260071', '2026-03-27', 3675.29, 'aprobada', 'Histórico 2026 (barco LUZON STRAIT)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260071');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 50, 20508, 3859, NULL, 1218359
FROM liquidaciones l WHERE l.embarque='260071';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260072', '2026-03-28', 3675.29, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260072');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 48, 19295, 1470, NULL, 996739
FROM liquidaciones l WHERE l.embarque='260072';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1056, 23706, 5880, NULL, 31242905
FROM liquidaciones l WHERE l.embarque='260072';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260075', '2026-04-01', 3669.96, 'aprobada', 'Histórico 2026 (barco CMA CGM FIROLAND)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260075');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 20478, 3853, NULL, 4866367
FROM liquidaciones l WHERE l.embarque='260075';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260078', '2026-04-04', 3675.81, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260078');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 97, 19298, 1470, NULL, 2014528
FROM liquidaciones l WHERE l.embarque='260078';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 960, 23709, 5881, NULL, 28406660
FROM liquidaciones l WHERE l.embarque='260078';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260081', '2026-04-08', 3664.41, 'aprobada', 'Histórico 2026 (barco CMA CGM KHAO SOK)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260081');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 400, 20447, 3848, NULL, 9718015
FROM liquidaciones l WHERE l.embarque='260081';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260084', '2026-04-11', 3642.93, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260084');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19125, 1457, NULL, 1975925
FROM liquidaciones l WHERE l.embarque='260084';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1104, 23497, 5829, NULL, 32375447
FROM liquidaciones l WHERE l.embarque='260084';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 1056, 0, NULL, 109, 115408
FROM liquidaciones l WHERE l.embarque='260084';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260087', '2026-04-15', 3608.1, 'aprobada', 'Histórico 2026 (barco CMA CGM KRUGER)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260087');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 250, 20133, 3789, NULL, 5980426
FROM liquidaciones l WHERE l.embarque='260087';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260090', '2026-04-18', 3615.1, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260090');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 18979, 1446, NULL, 1960830
FROM liquidaciones l WHERE l.embarque='260090';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 1056, 23317, 5784, NULL, 30731242
FROM liquidaciones l WHERE l.embarque='260090';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260093', '2026-04-22', 3573.3, 'aprobada', 'Histórico 2026 (barco CMA CGM DOLOMITES)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260093');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 250, 19939, 3752, NULL, 5922745
FROM liquidaciones l WHERE l.embarque='260093';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260096', '2026-04-25', 3560.62, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260096');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 18693, 1424, NULL, 1931280
FROM liquidaciones l WHERE l.embarque='260096';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 960, 22966, 5697, NULL, 27516471
FROM liquidaciones l WHERE l.embarque='260096';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260098', '2026-04-28', 3551.17, 'aprobada', 'Histórico 2026 (barco MAERSK BATUR)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260098');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 19816, 3729, NULL, 4708851
FROM liquidaciones l WHERE l.embarque='260098';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260099', '2026-04-29', 3593.17, 'aprobada', 'Histórico 2026 (barco CMA CGM MERCANTOUR)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260099');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 20050, 3773, NULL, 4764543
FROM liquidaciones l WHERE l.embarque='260099';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260102', '2026-05-02', 3637.51, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260102');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 48, 19097, 1455, NULL, 986493
FROM liquidaciones l WHERE l.embarque='260102';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 912, 23462, 5820, NULL, 26705143
FROM liquidaciones l WHERE l.embarque='260102';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260105', '2026-05-06', 3707.58, 'aprobada', 'Histórico 2026 (barco CMA CGM ZINGARO)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260105');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO EUROPEO SMALL', 48, 23024, 4486, 1298, 1382779
FROM liquidaciones l WHERE l.embarque='260105';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 20688, 3893, NULL, 4916251
FROM liquidaciones l WHERE l.embarque='260105';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260108', '2026-05-09', 3729.27, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260108');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19579, 1492, NULL, 2022756
FROM liquidaciones l WHERE l.embarque='260108';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 768, 24054, 5967, NULL, 23055839
FROM liquidaciones l WHERE l.embarque='260108';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260111', '2026-05-13', 3759.0, 'aprobada', 'Histórico 2026 (barco CMA CGM BAIKAL)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260111');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 20975, 3947, NULL, 4984434
FROM liquidaciones l WHERE l.embarque='260111';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260114', '2026-05-16', 3784.7, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260114');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19870, 1514, NULL, 2052821
FROM liquidaciones l WHERE l.embarque='260114';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 768, 24411, 6056, NULL, 23398529
FROM liquidaciones l WHERE l.embarque='260114';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260117', '2026-05-20', 3796.78, 'aprobada', 'Histórico 2026 (barco CMA CGM FIROLAND)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260117');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 21186, 3987, NULL, 5034530
FROM liquidaciones l WHERE l.embarque='260117';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260120', '2026-05-23', 3701.37, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260120');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19432, 1481, NULL, 2007623
FROM liquidaciones l WHERE l.embarque='260120';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 864, 23874, 5922, NULL, 25743769
FROM liquidaciones l WHERE l.embarque='260120';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260123', '2026-05-27', 3667.06, 'aprobada', 'Histórico 2026 (barco CMA CGM KHAO SOK)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260123');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 20462, 3850, NULL, 4862522
FROM liquidaciones l WHERE l.embarque='260123';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260125', '2026-05-29', 3646.58, 'aprobada', 'Histórico 2026 (barco ATLANTIC KLIPPER)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260125');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 100, 20348, 3829, NULL, 2417683
FROM liquidaciones l WHERE l.embarque='260125';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260126', '2026-05-30', 3646.58, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260126');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 19145, 1459, NULL, 1977905
FROM liquidaciones l WHERE l.embarque='260126';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 816, 23520, 5835, NULL, 23953655
FROM liquidaciones l WHERE l.embarque='260126';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 576, 0, NULL, 73, 42009
FROM liquidaciones l WHERE l.embarque='260126';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260129', '2026-06-03', 3560.24, 'aprobada', 'Histórico 2026 (barco CMA CGM KRUGER)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260129');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 100, 19866, 3738, NULL, 2360439
FROM liquidaciones l WHERE l.embarque='260129';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260132', '2026-06-06', 3565.32, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260132');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 18718, 1426, NULL, 1933830
FROM liquidaciones l WHERE l.embarque='260132';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 768, 22996, 5705, NULL, 22042234
FROM liquidaciones l WHERE l.embarque='260132';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 384, 0, NULL, 178, 68454
FROM liquidaciones l WHERE l.embarque='260132';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260135', '2026-06-10', 3581.46, 'aprobada', 'Histórico 2026 (barco CMA CGM DOLOMITES)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260135');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 300, 19985, 3761, NULL, 7123524
FROM liquidaciones l WHERE l.embarque='260135';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260138', '2026-06-13', 3513.54, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260138');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 18446, 1405, NULL, 1905744
FROM liquidaciones l WHERE l.embarque='260138';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 864, 22662, 5622, NULL, 24437373
FROM liquidaciones l WHERE l.embarque='260138';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 432, 0, NULL, 176, 75892
FROM liquidaciones l WHERE l.embarque='260138';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260141', '2026-06-17', 3427.07, 'aprobada', 'Histórico 2026 (barco CMA CGM MERCANTOUR)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260141');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 19123, 3598, NULL, 4544295
FROM liquidaciones l WHERE l.embarque='260141';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260144', '2026-06-20', 3459.53, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260144');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 48, 18163, 1384, NULL, 938225
FROM liquidaciones l WHERE l.embarque='260144';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 816, 22314, 5535, NULL, 22724961
FROM liquidaciones l WHERE l.embarque='260144';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 816, 0, NULL, 173, 141149
FROM liquidaciones l WHERE l.embarque='260144';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260147', '2026-06-23', 3408.14, 'aprobada', 'Histórico 2026 (barco CMA CGM ZINGARO)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260147');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 19017, 3579, NULL, 4519194
FROM liquidaciones l WHERE l.embarque='260147';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260150', '2026-06-27', 3433.71, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260150');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 18027, 1373, NULL, 1862444
FROM liquidaciones l WHERE l.embarque='260150';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 768, 22147, 5494, NULL, 21228569
FROM liquidaciones l WHERE l.embarque='260150';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 768, 0, NULL, 172, 131854
FROM liquidaciones l WHERE l.embarque='260150';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260153', '2026-07-01', 3440.83, 'aprobada', 'Histórico 2026 (barco CMA CGM BAIKAL)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260153');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 300, 18305, 6916, NULL, 7566385
FROM liquidaciones l WHERE l.embarque='260153';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260156', '2026-07-04', 3357.82, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260156');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 14607, 4029, NULL, 1789046
FROM liquidaciones l WHERE l.embarque='260156';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 768, 19475, 7354, NULL, 20604658
FROM liquidaciones l WHERE l.embarque='260156';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 384, 0, NULL, 67, 25788
FROM liquidaciones l WHERE l.embarque='260156';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260158', '2026-07-08', 3350.68, 'aprobada', 'Histórico 2026 (barco CMA CGM FIROLAND)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260158');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 300, 17826, 6735, NULL, 7368145
FROM liquidaciones l WHERE l.embarque='260158';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260161', '2026-07-11', 3305.38, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260161');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 48, 14378, 3966, NULL, 880553
FROM liquidaciones l WHERE l.embarque='260161';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 816, 19171, 7239, NULL, 21550549
FROM liquidaciones l WHERE l.embarque='260161';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 384, 0, NULL, 165, 63463
FROM liquidaciones l WHERE l.embarque='260161';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260163', '2026-07-15', 3252.11, 'aprobada', 'Histórico 2026 (barco CMA CGM KHAO SOK)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260163');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 300, 17301, 6537, NULL, 7151390
FROM liquidaciones l WHERE l.embarque='260163';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260166', '2026-07-18', 3262.58, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260166');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 48, 14192, 3915, NULL, 869151
FROM liquidaciones l WHERE l.embarque='260166';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 768, 18923, 7145, NULL, 20020235
FROM liquidaciones l WHERE l.embarque='260166';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 768, 0, NULL, 163, 125283
FROM liquidaciones l WHERE l.embarque='260166';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260168', '2026-07-22', 3238.19, 'aprobada', 'Histórico 2026 (barco CMA CGM KRUGER)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260168');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 17227, 6509, NULL, 4747187
FROM liquidaciones l WHERE l.embarque='260168';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260171', '2026-07-25', 3219.31, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260171');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 14004, 3863, NULL, 1715248
FROM liquidaciones l WHERE l.embarque='260171';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 720, 18672, 7050, NULL, 18520047
FROM liquidaciones l WHERE l.embarque='260171';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 720, 0, NULL, 161, 115895
FROM liquidaciones l WHERE l.embarque='260171';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260174', '2026-07-29', 3205.8, 'aprobada', 'Histórico 2026 (barco CMA CGM DOLOMITES)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260174');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 300, 17055, 6444, NULL, 7049554
FROM liquidaciones l WHERE l.embarque='260174';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260177', '2026-08-01', 3132.42, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260177');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 144, 13626, 3759, NULL, 2503430
FROM liquidaciones l WHERE l.embarque='260177';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 528, 18168, 6860, NULL, 13214803
FROM liquidaciones l WHERE l.embarque='260177';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 528, 0, NULL, 63, 33078
FROM liquidaciones l WHERE l.embarque='260177';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260180', '2026-08-05', 3230.44, 'aprobada', 'Histórico 2026 (barco MAURITIUS PRIDE)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260180');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 300, 17186, 6493, NULL, 7103738
FROM liquidaciones l WHERE l.embarque='260180';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260183', '2026-08-08', 3157.43, 'aprobada', 'Histórico 2026 (barco DOLE CHILE)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260183');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 48, 13735, 3789, NULL, 841139
FROM liquidaciones l WHERE l.embarque='260183';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 432, 18313, 6915, NULL, 10898438
FROM liquidaciones l WHERE l.embarque='260183';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 432, 0, NULL, 63, 27280
FROM liquidaciones l WHERE l.embarque='260183';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260186', '2026-08-12', 3125.47, 'aprobada', 'Histórico 2026 (barco CMA CGM ZINGARO)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260186');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 250, 16628, 6282, NULL, 5727424
FROM liquidaciones l WHERE l.embarque='260186';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260189', '2026-08-15', 3127.51, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260189');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 13605, 3753, NULL, 1666337
FROM liquidaciones l WHERE l.embarque='260189';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 288, 18140, 6849, NULL, 7196776
FROM liquidaciones l WHERE l.embarque='260189';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 288, 0, NULL, 63, 18014
FROM liquidaciones l WHERE l.embarque='260189';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260191', '2026-08-19', 3098.79, 'aprobada', 'Histórico 2026 (barco CMA CGM BAIKAL)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260191');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 250, 16486, 6229, NULL, 5678533
FROM liquidaciones l WHERE l.embarque='260191';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260194', '2026-08-22', 3082.96, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260194');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 13411, 3700, NULL, 1642601
FROM liquidaciones l WHERE l.embarque='260194';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 480, 17881, 6752, NULL, 11823768
FROM liquidaciones l WHERE l.embarque='260194';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 288, 0, NULL, 62, 17758
FROM liquidaciones l WHERE l.embarque='260194';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 192, 0, NULL, 154, 29596
FROM liquidaciones l WHERE l.embarque='260194';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260196', '2026-08-26', 3056.51, 'aprobada', 'Histórico 2026 (barco CMA CGM FIROLAND)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260196');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 300, 16261, 6144, NULL, 6721265
FROM liquidaciones l WHERE l.embarque='260196';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260199', '2026-08-29', 3144.28, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260199');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 13678, 3773, NULL, 1675272
FROM liquidaciones l WHERE l.embarque='260199';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 480, 18237, 6886, NULL, 12058943
FROM liquidaciones l WHERE l.embarque='260199';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 288, 0, NULL, 63, 18111
FROM liquidaciones l WHERE l.embarque='260199';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 192, 0, NULL, 157, 30185
FROM liquidaciones l WHERE l.embarque='260199';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260202', '2026-09-02', 3213.97, 'aprobada', 'Histórico 2026 (barco CMA CGM KHAO SOK)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260202');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 350, 17098, 6460, NULL, 8245440
FROM liquidaciones l WHERE l.embarque='260202';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260205', '2026-09-05', 3141.36, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260205');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 13665, 3770, NULL, 1673717
FROM liquidaciones l WHERE l.embarque='260205';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 576, 18220, 6880, NULL, 14457293
FROM liquidaciones l WHERE l.embarque='260205';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 48, 0, NULL, 63, 3016
FROM liquidaciones l WHERE l.embarque='260205';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260208', '2026-09-09', 3126.08, 'aprobada', 'Histórico 2026 (barco CMA CGM KRUGER)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260208');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 350, 16631, 6283, NULL, 8019958
FROM liquidaciones l WHERE l.embarque='260208';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260211', '2026-09-11', 3101.0, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260211');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 13489, 3721, NULL, 1652213
FROM liquidaciones l WHERE l.embarque='260211';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 624, 17986, 6791, NULL, 15460842
FROM liquidaciones l WHERE l.embarque='260211';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 96, 0, NULL, 62, 5954
FROM liquidaciones l WHERE l.embarque='260211';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 240, 0, NULL, 93, 22327
FROM liquidaciones l WHERE l.embarque='260211';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD CONVENCIONAL', 192, 0, NULL, 155, 29770
FROM liquidaciones l WHERE l.embarque='260211';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260214', '2026-09-16', 3109.3, 'aprobada', 'Histórico 2026 (barco CMA CGM DOLOMITES)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260214');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 200, 16541, 6250, NULL, 4558234
FROM liquidaciones l WHERE l.embarque='260214';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260217', '2026-09-19', 3151.73, 'aprobada', 'Histórico 2026 (barco DOLE WARI)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260217');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 13710, 3782, NULL, 1679242
FROM liquidaciones l WHERE l.embarque='260217';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 528, 18280, 6902, NULL, 13296266
FROM liquidaciones l WHERE l.embarque='260217';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260220', '2026-09-23', 3208.66, 'aprobada', 'Histórico 2026 (barco CMA CGM MERCANTOUR)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260220');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 150, 17070, 5984, NULL, 3458133
FROM liquidaciones l WHERE l.embarque='260220';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD EUROPEO 5X20', 150, 17231, 5984, NULL, 3482198
FROM liquidaciones l WHERE l.embarque='260220';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'EMP__FTA STANDARD EUROPEO 5X20', 150, 0, NULL, 1283, 192520
FROM liquidaciones l WHERE l.embarque='260220';
INSERT INTO liquidaciones (corte_id, embarque, fecha, tasa_cambio, estado, notas, aprobado_por, aprobado_en)
SELECT NULL, '260223', '2026-09-26', 3306.86, 'aprobada', 'Histórico 2026 (barco DOLE INCA)', NULL, datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM liquidaciones WHERE embarque='260223');
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO DE SEGUNDA SINGLE CONVENCIONAL', 96, 14385, 3968, NULL, 1761895
FROM liquidaciones l WHERE l.embarque='260223';
INSERT INTO liquidacion_lineas (liquidacion_id, tipo_caja, cantidad, precio_unit, incentivo, empaque_especial, total_linea)
SELECT l.id, 'BANANO STANDARD CONVENCIONAL', 384, 19180, 7242, NULL, 10145976
FROM liquidaciones l WHERE l.embarque='260223';