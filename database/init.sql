-- Script de inicialización para la base de datos de registro de accidentes
-- Ejecutar este script en MySQL para crear la base de datos y el usuario

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS registro_accidentes
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE registro_accidentes;

-- Crear tabla de eventos (opcional, Sequelize la creará automáticamente)
-- Esta tabla se creará automáticamente cuando ejecutes el servidor

-- Crear usuario para la aplicación (opcional)
-- CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
-- GRANT ALL PRIVILEGES ON registro_accidentes.* TO 'app_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Verificar que la base de datos se creó
SHOW DATABASES LIKE 'registro_accidentes';

-- Mostrar el estado actual
SELECT 'Base de datos registro_accidentes creada exitosamente' AS mensaje;
