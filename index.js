const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection, syncDatabase } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rutas
const eventosRoutes = require('./routes/eventosRoutes');
app.use('/api/eventos', eventosRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Ruta para archivos no encontrados
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;

// Inicializar la base de datos y el servidor
const initializeServer = async () => {
  try {
    // Probar conexión a la base de datos
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Sincronizar modelos con la base de datos
      await syncDatabase();
      
      // Iniciar servidor
      app.listen(PORT, () => {
        console.log(`🚀 Servidor backend iniciado en puerto ${PORT}`);
        console.log(`📊 API disponible en http://localhost:${PORT}/api`);
        console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      });
    } else {
      console.error('❌ No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
    process.exit(1);
  }
};

initializeServer();
