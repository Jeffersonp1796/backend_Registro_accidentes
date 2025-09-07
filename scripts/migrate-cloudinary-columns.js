const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

async function migrateCloudinaryColumns() {
  try {
    console.log('🔄 Iniciando migración para agregar columnas de Cloudinary...');
    
    // Verificar si las columnas ya existen
    const results = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'eventos' 
      AND COLUMN_NAME IN ('imagen_principal_url', 'imagen_principal_public_id', 'imagenes_adicionales')
    `, { type: QueryTypes.SELECT });
    
    const existingColumns = results.map(row => row.COLUMN_NAME);
    console.log('📋 Columnas existentes:', existingColumns);
    
    // Agregar imagen_principal_url si no existe
    if (!existingColumns.includes('imagen_principal_url')) {
      await sequelize.query(`
        ALTER TABLE eventos 
        ADD COLUMN imagen_principal_url VARCHAR(500) NULL 
        COMMENT 'URL de la imagen principal en Cloudinary'
      `);
      console.log('✅ Columna imagen_principal_url agregada');
    } else {
      console.log('⏭️  Columna imagen_principal_url ya existe');
    }
    
    // Agregar imagen_principal_public_id si no existe
    if (!existingColumns.includes('imagen_principal_public_id')) {
      await sequelize.query(`
        ALTER TABLE eventos 
        ADD COLUMN imagen_principal_public_id VARCHAR(255) NULL 
        COMMENT 'Public ID de la imagen principal en Cloudinary'
      `);
      console.log('✅ Columna imagen_principal_public_id agregada');
    } else {
      console.log('⏭️  Columna imagen_principal_public_id ya existe');
    }
    
    // Agregar imagenes_adicionales si no existe
    if (!existingColumns.includes('imagenes_adicionales')) {
      await sequelize.query(`
        ALTER TABLE eventos 
        ADD COLUMN imagenes_adicionales JSON NULL 
        COMMENT 'Array de objetos con URLs y public_ids de imágenes adicionales'
      `);
      console.log('✅ Columna imagenes_adicionales agregada');
    } else {
      console.log('⏭️  Columna imagenes_adicionales ya existe');
    }
    
    // Verificar la estructura final de la tabla
    const finalStructure = await sequelize.query(`
      DESCRIBE eventos
    `, { type: QueryTypes.SELECT });
    
    console.log('\n📊 Estructura final de la tabla eventos:');
    finalStructure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    console.log('\n🎉 Migración completada exitosamente!');
    console.log('💡 Las nuevas columnas de Cloudinary están listas para usar.');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  migrateCloudinaryColumns()
    .then(() => {
      console.log('✅ Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateCloudinaryColumns };
