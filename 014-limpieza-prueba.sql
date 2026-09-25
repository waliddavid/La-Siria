-- LIMPIEZA de la prueba de mantenimiento duplicado (EQ-000)
-- OJO: borra TODOS los mantenimientos y lecturas de horometro del equipo de prueba.
-- Despues vuelve a registrar el mantenimiento UNA vez con la pagina ya corregida.
DELETE FROM mantenimientos WHERE equipo_id=(SELECT id FROM equipos WHERE codigo='EQ-000');
DELETE FROM equipo_horometro WHERE equipo_id=(SELECT id FROM equipos WHERE codigo='EQ-000');
UPDATE equipos SET estado='operativo' WHERE codigo='EQ-000';
