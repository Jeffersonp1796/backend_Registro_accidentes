#!/usr/bin/env node

/**
 * Script para configurar la base de datos MySQL
 * Sistema de Registro de Accidentes e Incidentes
 * 
 * Uso: node scripts/setup-database.js
 */

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

// Configuración de conexión
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'registro_accidentes',
  socketPath: process.env.DB_SOCKET || '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock'
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testConnection() {
  try {
    const { host, port, user, password, socketPath } = config;
    
    // Conectar sin especificar base de datos
    const connection = await mysql.createConnection({ 
      host, 
      port, 
      user, 
      password,
      socketPath
    });
    
    logSuccess('Conexión a MySQL establecida correctamente');
    
    // Verificar versión
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    logInfo(`Versión de MySQL: ${versionResult[0].version}`);
    
    await connection.end();
    return true;
  } catch (error) {
    logError(`Error al conectar con MySQL: ${error.message}`);
    return false;
  }
}

async function createDatabase() {
  try {
    const { host, port, user, password, socketPath, database } = config;
    
    // Conectar sin especificar base de datos
    const connection = await mysql.createConnection({ 
      host, 
      port, 
      user, 
      password,
      socketPath
    });
    
    logInfo('Creando base de datos...');
    
    // Crear la base de datos
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    
    logSuccess(`Base de datos '${database}' creada/verificada`);
    
    await connection.end();
    return true;
  } catch (error) {
    logError(`Error al crear la base de datos: ${error.message}`);
    return false;
  }
}

async function executeSQLFile() {
  try {
    const { host, port, user, password, socketPath, database } = config;
    
    // Conectar a la base de datos específica
    const connection = await mysql.createConnection({ 
      host, 
      port, 
      user, 
      password,
      socketPath,
      database
    });
    
    logInfo('Ejecutando script SQL...');
    
    // Leer y ejecutar el archivo SQL
    const sqlFile = path.join(__dirname, '../database/setup-database.sql');
    const sqlContent = await fs.readFile(sqlFile, 'utf8');
    
    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await connection.execute(command);
        } catch (error) {
          // Ignorar errores de comandos que ya existen
          if (!error.message.includes('already exists') && 
              !error.message.includes('Duplicate entry')) {
            logWarning(`Comando SQL: ${command.substring(0, 50)}... - ${error.message}`);
          }
        }
      }
    }
    
    logSuccess('Script SQL ejecutado correctamente');
    
    // Verificar las tablas creadas
    const [tables] = await connection.execute('SHOW TABLES');
    logInfo(`Tablas creadas: ${tables.length}`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      log(`  - ${tableName}`, 'cyan');
    });
    
    // Verificar datos de ejemplo
    const [eventos] = await connection.execute('SELECT COUNT(*) as total FROM eventos');
    logInfo(`Eventos de ejemplo insertados: ${eventos[0].total}`);
    
    await connection.end();
    return true;
  } catch (error) {
    logError(`Error al ejecutar el script SQL: ${error.message}`);
    return false;
  }
}

async function verifyDatabase() {
  try {
    const { host, port, user, password, socketPath, database } = config;
    
    const connection = await mysql.createConnection({ 
      host, 
      port, 
      user, 
      password,
      socketPath,
      database
    });
    
    logInfo('Verificando estructura de la base de datos...');
    
    // Verificar estructura de la tabla eventos
    const [columns] = await connection.execute('DESCRIBE eventos');
    logInfo(`Campos en tabla eventos: ${columns.length}`);
    
    // Verificar índices
    const [indexes] = await connection.execute('SHOW INDEX FROM eventos');
    logInfo(`Índices creados: ${indexes.length}`);
    
    // Verificar vista de estadísticas
    const [views] = await connection.execute('SHOW FULL TABLES WHERE Table_type = "VIEW"');
    logInfo(`Vistas creadas: ${views.length}`);
    
    await connection.end();
    return true;
  } catch (error) {
    logError(`Error al verificar la base de datos: ${error.message}`);
    return false;
  }
}

async function main() {
  log('🚀 Iniciando configuración de la base de datos...', 'bright');
  log('================================================', 'cyan');
  
  try {
    // Paso 1: Probar conexión
    log('\n1️⃣ Probando conexión a MySQL...', 'yellow');
    const isConnected = await testConnection();
    if (!isConnected) {
      logError('No se pudo conectar a MySQL. Verifica la configuración.');
      process.exit(1);
    }
    
    // Paso 2: Crear base de datos
    log('\n2️⃣ Creando base de datos...', 'yellow');
    const dbCreated = await createDatabase();
    if (!dbCreated) {
      logError('No se pudo crear la base de datos.');
      process.exit(1);
    }
    
    // Paso 3: Ejecutar script SQL
    log('\n3️⃣ Ejecutando script de configuración...', 'yellow');
    const sqlExecuted = await executeSQLFile();
    if (!sqlExecuted) {
      logError('No se pudo ejecutar el script SQL.');
      process.exit(1);
    }
    
    // Paso 4: Verificar configuración
    log('\n4️⃣ Verificando configuración...', 'yellow');
    const verified = await verifyDatabase();
    if (!verified) {
      logError('No se pudo verificar la configuración.');
      process.exit(1);
    }
    
    log('\n🎉 ¡Base de datos configurada exitosamente!', 'bright');
    log('================================================', 'green');
    
    log('\n📝 Próximos pasos:', 'cyan');
    log('  1. Ejecutar: npm run dev');
    log('  2. Verificar API: http://localhost:3001/api/health');
    log('  3. Conectar DBeaver a localhost:3306');
    log('  4. Base de datos: registro_accidentes');
    
    log('\n🔧 Comandos útiles:', 'cyan');
    log('  - Ver estado: brew services list | grep mysql');
    log('  - Reiniciar: brew services restart mysql');
    log('  - Conectar: mysql -u root -S /Applications/XAMPP/xamppfiles/var/mysql/mysql.sock');
    
  } catch (error) {
    logError(`Error general: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { 
  testConnection, 
  createDatabase, 
  executeSQLFile, 
  verifyDatabase 
};
