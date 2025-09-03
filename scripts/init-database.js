#!/usr/bin/env node

/**
 * Script para inicializar la base de datos MySQL
 * Ejecutar: node scripts/init-database.js
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'registro_accidentes'
};

async function createDatabase() {
  let connection;
  
  try {
    // Conectar sin especificar base de datos para crearla
    const { host, port, user, password } = config;
    connection = await mysql.createConnection({ host, port, user, password });
    
    console.log('🔌 Conectado a MySQL...');
    
    // Crear la base de datos si no existe
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    
    console.log(`✅ Base de datos '${config.database}' creada/verificada`);
    
    // Usar la base de datos
    await connection.execute(`USE \`${config.database}\``);
    
    // Crear tabla de eventos si no existe
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`eventos\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`fecha\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`tipo\` enum('accidente','incidente','casi_accidente') NOT NULL,
        \`lugar\` varchar(255) NOT NULL,
        \`persona_afectada\` varchar(255) NOT NULL,
        \`descripcion\` text NOT NULL,
        \`evidencia\` varchar(255) DEFAULT NULL,
        \`estado\` enum('pendiente','en_revision','resuelto','cerrado') DEFAULT 'pendiente',
        \`prioridad\` enum('baja','media','alta','critica') DEFAULT 'media',
        \`fecha_creacion\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`fecha_actualizacion\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_fecha\` (\`fecha\`),
        KEY \`idx_tipo\` (\`tipo\`),
        KEY \`idx_estado\` (\`estado\`),
        KEY \`idx_prioridad\` (\`prioridad\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ Tabla eventos creada/verificada');
    
    // Insertar datos de ejemplo
    const insertSampleData = `
      INSERT IGNORE INTO \`eventos\` 
      (\`fecha\`, \`tipo\`, \`lugar\`, \`persona_afectada\`, \`descripcion\`, \`estado\`, \`prioridad\`) 
      VALUES 
      (NOW(), 'incidente', 'Área de producción', 'Juan Pérez', 'Casi resbalón en piso mojado', 'pendiente', 'media'),
      (NOW(), 'accidente', 'Almacén', 'María García', 'Caída desde escalera de 2 metros', 'en_revision', 'alta'),
      (NOW(), 'casi_accidente', 'Oficina', 'Carlos López', 'Silla de oficina con ruedas defectuosas', 'resuelto', 'baja')
    `;
    
    await connection.execute(insertSampleData);
    console.log('✅ Datos de ejemplo insertados');
    
    // Verificar la estructura
    const [rows] = await connection.execute('DESCRIBE eventos');
    console.log('\n📋 Estructura de la tabla eventos:');
    rows.forEach(row => {
      console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Contar registros
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM eventos');
    console.log(`\n📊 Total de eventos en la base de datos: ${countResult[0].total}`);
    
    console.log('\n🎉 Base de datos inicializada correctamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('  1. Ejecutar: npm run dev');
    console.log('  2. Verificar conexión en: http://localhost:3001/api/health');
    console.log('  3. Conectar DBeaver a localhost:3306');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solución: Verifica que MySQL esté ejecutándose');
      console.log('   - macOS: brew services start mysql');
      console.log('   - Windows: Verificar servicios de MySQL');
      console.log('   - Linux: sudo systemctl start mysql');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solución: Verifica las credenciales en config.env');
      console.log('   - Usuario y contraseña correctos');
      console.log('   - Usuario tenga permisos para crear bases de datos');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createDatabase();
}

module.exports = { createDatabase };
