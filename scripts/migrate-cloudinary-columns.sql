-- =====================================================
-- MIGRACIÓN: Agregar columnas de Cloudinary
-- Sistema de Registro de Accidentes e Incidentes
-- =====================================================

-- Usar la base de datos
USE registro_accidentes;

-- Verificar columnas existentes
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'registro_accidentes' 
AND TABLE_NAME = 'eventos' 
AND COLUMN_NAME IN ('imagen_principal_url', 'imagen_principal_public_id', 'imagenes_adicionales');

-- Agregar columna para URL de imagen principal
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS imagen_principal_url VARCHAR(500) NULL 
COMMENT 'URL de la imagen principal en Cloudinary';

-- Agregar columna para Public ID de imagen principal
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS imagen_principal_public_id VARCHAR(255) NULL 
COMMENT 'Public ID de la imagen principal en Cloudinary';

-- Agregar columna para imágenes adicionales (JSON)
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS imagenes_adicionales JSON NULL 
COMMENT 'Array de objetos con URLs y public_ids de imágenes adicionales';

-- Verificar la estructura final de la tabla
DESCRIBE eventos;

-- Mostrar información de las nuevas columnas
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite NULL',
    COLUMN_COMMENT as 'Comentario'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'registro_accidentes' 
AND TABLE_NAME = 'eventos' 
AND COLUMN_NAME IN ('imagen_principal_url', 'imagen_principal_public_id', 'imagenes_adicionales');

-- Mostrar mensaje de confirmación
SELECT 'Migración de columnas Cloudinary completada exitosamente' as mensaje;
