const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'registro_accidentes',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    dialectOptions: {
      // Usar socket de XAMPP en macOS
      socketPath: process.env.DB_SOCKET || '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock'
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return false;
  }
};

// Función para sincronizar los modelos con la base de datos
const syncDatabase = async () => {
  try {
    // Solo sincronizar si las tablas no existen
    // Esto preserva los datos existentes
    await sequelize.sync({ force: false });
    console.log('✅ Base de datos sincronizada correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error.message);
    return false;
  }
};

// Función para forzar la recreación de tablas (SOLO PARA DESARROLLO)
const forceSyncDatabase = async () => {
  try {
    console.log('⚠️  ADVERTENCIA: Esto eliminará todos los datos existentes');
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos recreada completamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al recrear la base de datos:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  forceSyncDatabase
};
