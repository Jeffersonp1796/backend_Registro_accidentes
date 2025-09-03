#!/usr/bin/env node

/**
 * Script simple para probar la conexión a la base de datos
 */

const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a MySQL...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock',
      database: 'registro_accidentes'
    });
    
    console.log('✅ Conexión exitosa a MySQL');
    
    // Verificar datos existentes
    const [eventos] = await connection.execute('SELECT COUNT(*) as total FROM eventos');
    console.log(`📊 Total de eventos: ${eventos[0].total}`);
    
    if (eventos[0].total > 0) {
      const [datos] = await connection.execute('SELECT id, tipo, lugar, persona_afectada FROM eventos LIMIT 5');
      console.log('📋 Eventos encontrados:');
      datos.forEach(evento => {
        console.log(`  - ID ${evento.id}: ${evento.tipo} en ${evento.lugar}`);
      });
    }
    
    await connection.end();
    console.log('✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
