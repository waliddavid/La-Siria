-- FIX: normalizar fechas de liquidaciones de DD/MM/YYYY a YYYY-MM-DD
-- (la carga 018 trajo fechas del CSV en formato dia/mes; 019 solo reemplazo lineas)
-- Idempotente: solo toca las que tienen formato dd/mm/aaaa.
UPDATE liquidaciones
SET fecha = substr(fecha,7,4) || '-' || substr(fecha,4,2) || '-' || substr(fecha,1,2)
WHERE fecha LIKE '__/__/____';

-- Verificacion (debe mostrar primero las de septiembre 2026):
-- SELECT embarque, fecha FROM liquidaciones ORDER BY fecha DESC LIMIT 5;
