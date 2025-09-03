#!/usr/bin/env node

/**
 * Script para verificar y preservar datos existentes en la base de datos
 * Sistema de Registro de Accidentes e Incidentes
 * 
 * Uso: node scripts/check-data.js
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

function logHeader(message) {
  log(`\n${message}`, 'bright');
  log('='.repeat(message.length), 'cyan');
}

async function checkDatabaseConnection() {
  try {
    logHeader('🔍 VERIFICANDO CONEXIÓN A LA BASE DE DATOS');
    
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      socketPath: config.socketPath
    });
    
    // Verificar versión de MySQL
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    logInfo(`Versión de MySQL: ${versionResult[0].version}`);
    
    // Verificar que la base de datos existe
    const [databases] = await connection.execute('SHOW DATABASES LIKE ?', [config.database]);
    if (databases.length === 0) {
      logError(`Base de datos '${config.database}' no existe`);
      return null;
    }
    
    logSuccess(`Base de datos '${config.database}' encontrada`);
    
    await connection.end();
    return true;
  } catch (error) {
    logError(`Error al conectar con MySQL: ${error.message}`);
    return null;
  }
}

async function checkTableStructure() {
  try {
    logHeader('📋 VERIFICANDO ESTRUCTURA DE TABLAS');
    
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      socketPath: config.socketPath,
      database: config.database
    });
    
    // Verificar tablas existentes
    const [tables] = await connection.execute('SHOW TABLES');
    logInfo(`Tablas encontradas: ${tables.length}`);
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      log(`  - ${tableName}`, 'cyan');
      
      // Verificar estructura de la tabla eventos
      if (tableName === 'eventos') {
        const [columns] = await connection.execute('DESCRIBE eventos');
        logInfo(`  Campos en tabla eventos: ${columns.length}`);
        
        // Verificar índices
        const [indexes] = await connection.execute('SHOW INDEX FROM eventos');
        logInfo(`  Índices en tabla eventos: ${indexes.length}`);
      }
    }
    
    await connection.end();
    return tables.length > 0;
  } catch (error) {
    logError(`Error al verificar estructura: ${error.message}`);
    return false;
  }
}

async function checkExistingData() {
  try {
    logHeader('📊 VERIFICANDO DATOS EXISTENTES');
    
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      socketPath: config.socketPath,
      database: config.database
    });
    
    // Contar eventos
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM eventos');
    const totalEventos = countResult[0].total;
    
    logInfo(`Total de eventos en la base de datos: ${totalEventos}`);
    
    if (totalEventos > 0) {
      // Mostrar eventos existentes
      const [eventos] = await connection.execute(`
        SELECT 
          id, 
          tipo, 
          lugar, 
          persona_afectada, 
          estado, 
          prioridad,
          DATE_FORMAT(fecha, '%d/%m/%Y %H:%i') as fecha_formateada
        FROM eventos 
        ORDER BY fecha DESC 
        LIMIT 10
      `);
      
      logInfo('Últimos eventos:');
      eventos.forEach(evento => {
        log(`  ID ${evento.id}: ${evento.tipo} - ${evento.lugar} - ${evento.persona_afectada} (${evento.estado})`, 'cyan');
      });
    } else {
      logWarning('No hay eventos en la base de datos');
    }
    
    await connection.end();
    return totalEventos;
  } catch (error) {
    logError(`Error al verificar datos: ${error.message}`);
    return 0;
  }
}

async function createBackup() {
  try {
    logHeader('💾 CREANDO RESPALDO DE DATOS');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    const backupFile = path.join(backupDir, `backup-data-${timestamp}.sql`);
    
    // Crear directorio de respaldos si no existe
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    // Crear respaldo solo de datos (sin estructura)
    const dumpCommand = `mysqldump -u ${config.user} -S ${config.socketPath} --no-create-info --inserts ${config.database} eventos > "${backupFile}"`;
    
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    await execAsync(dumpCommand);
    
    // Verificar que el archivo se creó
    const stats = await fs.stat(backupFile);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    
    logSuccess(`Respaldo creado: ${backupFile}`);
    logInfo(`Tamaño: ${fileSizeKB} KB`);
    
    return backupFile;
  } catch (error) {
    logError(`Error al crear respaldo: ${error.message}`);
    return null;
  }
}

async function checkSequelizeSync() {
  try {
    logHeader('🔧 VERIFICANDO CONFIGURACIÓN DE SEQUELIZE');
    
    const configPath = path.join(__dirname, '../config/database.js');
    const configContent = await fs.readFile(configPath, 'utf8');
    
    // Verificar si usa alter: true (problemático)
    if (configContent.includes('alter: true')) {
      logWarning('⚠️  ADVERTENCIA: Sequelize está configurado con alter: true');
      logWarning('   Esto puede causar pérdida de datos al reiniciar el servidor');
      logWarning('   Recomendado: Cambiar a force: false');
    } else if (configContent.includes('force: false')) {
      logSuccess('✅ Sequelize está configurado correctamente (force: false)');
    } else if (configContent.includes('force: true')) {
      logError('❌ PELIGRO: Sequelize está configurado con force: true');
      logError('   Esto ELIMINARÁ todos los datos al reiniciar');
    } else {
      logInfo('ℹ️  Configuración de Sequelize no especificada');
    }
    
    return true;
  } catch (error) {
    logError(`Error al verificar configuración: ${error.message}`);
    return false;
  }
}

async function generateReport() {
  try {
    logHeader('📝 GENERANDO REPORTE COMPLETO');
    
    const report = {
      timestamp: new Date().toISOString(),
      database: config.database,
      connection: await checkDatabaseConnection(),
      structure: await checkTableStructure(),
      dataCount: await checkExistingData(),
      sequelizeConfig: await checkSequelizeSync(),
      backupCreated: await createBackup()
    };
    
    // Guardar reporte en archivo
    const reportDir = path.join(__dirname, '../reports');
    try {
      await fs.access(reportDir);
    } catch {
      await fs.mkdir(reportDir, { recursive: true });
    }
    
    const reportFile = path.join(reportDir, `data-check-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    logSuccess(`Reporte guardado: ${reportFile}`);
    
    return report;
  } catch (error) {
    logError(`Error al generar reporte: ${error.message}`);
    return null;
  }
}

async function main() {
  log('🔍 VERIFICADOR DE DATOS - Sistema de Registro de Accidentes', 'bright');
  log('============================================================', 'cyan');
  
  try {
    const report = await generateReport();
    
    logHeader('📊 RESUMEN DEL DIAGNÓSTICO');
    
    if (report.connection) {
      logSuccess('✅ Conexión a base de datos: OK');
    } else {
      logError('❌ Conexión a base de datos: FALLIDA');
    }
    
    if (report.structure) {
      logSuccess('✅ Estructura de tablas: OK');
    } else {
      logError('❌ Estructura de tablas: PROBLEMA');
    }
    
    if (report.dataCount > 0) {
      logSuccess(`✅ Datos existentes: ${report.dataCount} eventos`);
    } else {
      logWarning('⚠️  No hay datos en la base de datos');
    }
    
    if (report.backupCreated) {
      logSuccess('✅ Respaldo creado exitosamente');
    } else {
      logError('❌ Error al crear respaldo');
    }
    
    logHeader('💡 RECOMENDACIONES');
    
    if (report.sequelizeConfig === 'alter: true') {
      logWarning('1. Cambiar configuración de Sequelize de alter: true a force: false');
      logWarning('2. Esto evitará la pérdida de datos al reiniciar');
    }
    
    if (report.dataCount === 0) {
      logInfo('1. La base de datos está vacía, considera insertar datos de ejemplo');
      logInfo('2. Ejecuta: npm run setup-db para crear datos de prueba');
    }
    
    logInfo('3. Revisa el reporte generado para más detalles');
    logInfo('4. Mantén respaldos regulares de tus datos');
    
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
  checkDatabaseConnection, 
  checkTableStructure, 
  checkExistingData, 
  createBackup,
  checkSequelizeSync,
  generateReport 
};
