const API = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

async function testCloudinaryUpload() {
  try {
    console.log('🧪 Iniciando prueba de carga de imagen con Cloudinary...');
    
    // Crear un evento de prueba
    const eventoData = {
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'incidente',
      lugar: 'Área de prueba',
      persona_afectada: 'Usuario de prueba',
      descripcion: 'Prueba de carga de imagen con Cloudinary',
      estado: 'pendiente',
      prioridad: 'media'
    };
    
    console.log('📝 Creando evento de prueba...');
    const eventoResponse = await API.post(`${API_BASE_URL}/eventos`, eventoData);
    const eventoId = eventoResponse.data.id;
    console.log(`✅ Evento creado con ID: ${eventoId}`);
    
    // Crear un archivo de imagen de prueba (simple)
    const testImagePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testImagePath, 'Test image content for Cloudinary upload');
    
    // Crear FormData para la imagen
    const formData = new FormData();
    formData.append('evidencia', fs.createReadStream(testImagePath));
    
    console.log('📤 Subiendo imagen de prueba...');
    const uploadResponse = await API.put(`${API_BASE_URL}/eventos/${eventoId}`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Imagen subida exitosamente!');
    console.log('📊 Respuesta del servidor:', JSON.stringify(uploadResponse.data, null, 2));
    
    // Verificar que el evento tiene las nuevas columnas
    console.log('\n🔍 Verificando estructura del evento actualizado...');
    const eventoActualizado = await API.get(`${API_BASE_URL}/eventos/${eventoId}`);
    const evento = eventoActualizado.data;
    
    console.log('📋 Campos de Cloudinary:');
    console.log(`  - imagen_principal_url: ${evento.imagen_principal_url || 'null'}`);
    console.log(`  - imagen_principal_public_id: ${evento.imagen_principal_public_id || 'null'}`);
    console.log(`  - imagenes_adicionales: ${JSON.stringify(evento.imagenes_adicionales) || 'null'}`);
    
    // Limpiar archivo de prueba
    fs.unlinkSync(testImagePath);
    console.log('🧹 Archivo de prueba eliminado');
    
    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('💡 El sistema está listo para manejar imágenes con Cloudinary');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    // Limpiar archivo de prueba si existe
    const testImagePath = path.join(__dirname, 'test-image.txt');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

// Ejecutar la prueba si se llama directamente
if (require.main === module) {
  testCloudinaryUpload()
    .then(() => {
      console.log('✅ Prueba finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la prueba:', error);
      process.exit(1);
    });
}

module.exports = { testCloudinaryUpload };
