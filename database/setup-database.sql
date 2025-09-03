-- =====================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS
-- Sistema de Registro de Accidentes e Incidentes
-- =====================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `registro_accidentes`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `registro_accidentes`;

-- Eliminar tabla si existe (para reinicio limpio)
DROP TABLE IF EXISTS `eventos`;

-- Crear tabla de eventos
CREATE TABLE `eventos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo` enum('accidente','incidente','casi_accidente') NOT NULL,
  `lugar` varchar(255) NOT NULL,
  `persona_afectada` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `evidencia` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','en_revision','resuelto','cerrado') DEFAULT 'pendiente',
  `prioridad` enum('baja','media','alta','critica') DEFAULT 'media',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_estado` (`estado`),
  KEY `idx_prioridad` (`prioridad`),
  KEY `idx_persona_afectada` (`persona_afectada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de ejemplo
INSERT INTO `eventos` 
(`fecha`, `tipo`, `lugar`, `persona_afectada`, `descripcion`, `estado`, `prioridad`) 
VALUES 
-- Incidente reciente
(NOW() - INTERVAL 2 DAY, 'incidente', 'Área de producción - Línea A', 'Juan Pérez', 
 'Casi resbalón en piso mojado cerca de la máquina de empaque. Se colocó señalización temporal.', 
 'pendiente', 'media'),

-- Accidente que requiere revisión
(NOW() - INTERVAL 1 DAY, 'accidente', 'Almacén - Pasillo principal', 'María García', 
 'Caída desde escalera de 2 metros mientras alcanzaba material en estante superior. Lesión menor en brazo derecho.', 
 'en_revision', 'alta'),

-- Casi accidente resuelto
(NOW() - INTERVAL 3 DAY, 'casi_accidente', 'Oficina administrativa', 'Carlos López', 
 'Silla de oficina con ruedas defectuosas que se movía inesperadamente. Se reemplazó la silla.', 
 'resuelto', 'baja'),

-- Incidente de seguridad
(NOW() - INTERVAL 5 DAY, 'incidente', 'Estacionamiento - Zona de carga', 'Ana Rodríguez', 
 'Vehículo de carga estacionado bloqueando salida de emergencia. Se movió inmediatamente.', 
 'cerrado', 'alta'),

-- Accidente menor
(NOW() - INTERVAL 1 WEEK, 'accidente', 'Cafetería', 'Luis Martínez', 
 'Quemadura menor en mano por contacto con cafetera caliente. Se aplicó primeros auxilios.', 
 'resuelto', 'media');

-- Crear tabla de usuarios (opcional para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `rol` enum('admin','supervisor','empleado') DEFAULT 'empleado',
  `activo` boolean DEFAULT TRUE,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario administrador de ejemplo
INSERT INTO `usuarios` (`nombre`, `email`, `rol`) 
VALUES ('Administrador Sistema', 'admin@empresa.com', 'admin')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- Crear tabla de departamentos (opcional)
CREATE TABLE IF NOT EXISTS `departamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `activo` boolean DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar departamentos de ejemplo
INSERT INTO `departamentos` (`nombre`, `descripcion`) VALUES
('Producción', 'Área de fabricación y ensamblaje'),
('Almacén', 'Gestión de inventarios y logística'),
('Administración', 'Recursos humanos y finanzas'),
('Mantenimiento', 'Servicios técnicos y reparaciones'),
('Seguridad', 'Prevención y control de riesgos');

-- Crear tabla de estadísticas (vista materializada)
CREATE OR REPLACE VIEW `v_estadisticas_eventos` AS
SELECT 
  COUNT(*) as total_eventos,
  SUM(CASE WHEN tipo = 'accidente' THEN 1 ELSE 0 END) as total_accidentes,
  SUM(CASE WHEN tipo = 'incidente' THEN 1 ELSE 0 END) as total_incidentes,
  SUM(CASE WHEN tipo = 'casi_accidente' THEN 1 ELSE 0 END) as total_casi_accidentes,
  SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as eventos_pendientes,
  SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) as eventos_en_revision,
  SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as eventos_resueltos,
  SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as eventos_cerrados,
  SUM(CASE WHEN prioridad = 'critica' THEN 1 ELSE 0 END) as prioridad_critica,
  SUM(CASE WHEN prioridad = 'alta' THEN 1 ELSE 0 END) as prioridad_alta,
  SUM(CASE WHEN prioridad = 'media' THEN 1 ELSE 0 END) as prioridad_media,
  SUM(CASE WHEN prioridad = 'baja' THEN 1 ELSE 0 END) as prioridad_baja
FROM eventos;

-- Mostrar información de la base de datos
SELECT 'Base de datos configurada exitosamente' as mensaje;
SELECT CONCAT('Base de datos: ', DATABASE()) as base_datos;
SELECT CONCAT('Caracteres: ', @@character_set_database) as charset;
SELECT CONCAT('Colación: ', @@collation_database) as collation;

-- Mostrar tablas creadas
SHOW TABLES;

-- Mostrar estructura de la tabla eventos
DESCRIBE eventos;

-- Mostrar datos de ejemplo
SELECT 
  id, 
  tipo, 
  lugar, 
  persona_afectada, 
  estado, 
  prioridad,
  DATE_FORMAT(fecha, '%d/%m/%Y %H:%i') as fecha_formateada
FROM eventos 
ORDER BY fecha DESC;

-- Mostrar estadísticas
SELECT * FROM v_estadisticas_eventos;
