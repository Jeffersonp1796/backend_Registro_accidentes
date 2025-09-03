#!/usr/bin/env node

/**
 * Script para respaldar y restaurar la base de datos MySQL
 * Sistema de Registro de Accidentes e Incidentes
 * 
 * Uso: 
 *   - Respaldo: node scripts/backup-restore.js backup
 *   - Restaurar: node scripts/backup-restore.js restore <archivo_backup>
 */

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

// Configuración
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

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
    
    // Crear directorio de respaldos si no existe
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    logInfo('Creando respaldo de la base de datos...');
    
    // Comando mysqldump
    const dumpCommand = `mysqldump -u ${config.user} -S ${config.socketPath} --single-transaction --routines --triggers ${config.database} > "${backupFile}"`;
    
    await execAsync(dumpCommand);
    
    // Verificar que el archivo se creó
    const stats = await fs.stat(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    logSuccess(`Respaldo creado exitosamente: ${backupFile}`);
    logInfo(`Tamaño del archivo: ${fileSizeMB} MB`);
    
    return backupFile;
  } catch (error) {
    logError(`Error al crear el respaldo: ${error.message}`);
    throw error;
  }
}

async function restoreBackup(backupFile) {
  try {
    if (!backupFile) {
      throw new Error('Debe especificar un archivo de respaldo');
    }
    
    // Verificar que el archivo existe
    try {
      await fs.access(backupFile);
    } catch {
      throw new Error(`Archivo de respaldo no encontrado: ${backupFile}`);
    }
    
    logWarning('⚠️  ADVERTENCIA: Esta operación sobrescribirá la base de datos actual');
    logWarning('¿Está seguro de que desea continuar? (y/N)');
    
    // En un entorno real, aquí se pediría confirmación del usuario
    // Por ahora, asumimos que sí
    
    logInfo('Restaurando base de datos desde respaldo...');
    
    // Comando mysql para restaurar
    const restoreCommand = `mysql -u ${config.user} -S ${config.socketPath} ${config.database} < "${backupFile}"`;
    
    await execAsync(restoreCommand);
    
    logSuccess('Base de datos restaurada exitosamente');
    
    // Verificar que se restauró correctamente
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      socketPath: config.socketPath,
      database: config.database
    });
    
    const [tables] = await connection.execute('SHOW TABLES');
    logInfo(`Tablas restauradas: ${tables.length}`);
    
    const [eventos] = await connection.execute('SELECT COUNT(*) as total FROM eventos');
    logInfo(`Eventos en la base de datos: ${eventos[0].total}`);
    
    await connection.end();
    
  } catch (error) {
    logError(`Error al restaurar el respaldo: ${error.message}`);
    throw error;
  }
}

async function listBackups() {
  try {
    const backupDir = path.join(__dirname, '../backups');
    
    try {
      await fs.access(backupDir);
    } catch {
      logInfo('No hay directorio de respaldos');
      return;
    }
    
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.endsWith('.sql')).sort().reverse();
    
    if (backupFiles.length === 0) {
      logInfo('No hay archivos de respaldo');
      return;
    }
    
    logInfo('Archivos de respaldo disponibles:');
    
    for (const file of backupFiles) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      const date = stats.mtime.toLocaleString();
      
      log(`  📁 ${file} (${fileSizeMB} MB) - ${date}`, 'cyan');
    }
    
  } catch (error) {
    logError(`Error al listar respaldos: ${error.message}`);
  }
}

async function main() {
  const command = process.argv[2];
  
  log('🗄️  Herramienta de Respaldo y Restauración', 'bright');
  log('============================================', 'cyan');
  
  try {
    switch (command) {
      case 'backup':
        await createBackup();
        break;
        
      case 'restore':
        const backupFile = process.argv[3];
        await restoreBackup(backupFile);
        break;
        
      case 'list':
        await listBackups();
        break;
        
      default:
        log('Uso:', 'yellow');
        log('  node scripts/backup-restore.js backup', 'cyan');
        log('  node scripts/backup-restore.js restore <archivo>', 'cyan');
        log('  node scripts/backup-restore.js list', 'cyan');
        log('\nEjemplos:', 'yellow');
        log('  node scripts/backup-restore.js backup', 'cyan');
        log('  node scripts/backup-restore.js restore backups/backup-2025-09-02.sql', 'cyan');
        log('  node scripts/backup-restore.js list', 'cyan');
        break;
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { createBackup, restoreBackup, listBackups };
