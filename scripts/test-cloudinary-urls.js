const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

async function testCloudinaryURLs() {
  try {
    console.log('🧪 Probando guardado de URLs de Cloudinary...');
    
    // Crear un archivo de imagen de prueba
    const testImagePath = path.join(__dirname, 'test-image.png');
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, testImageContent);
    
    // Crear un evento de prueba
    const eventoData = {
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'incidente',
      lugar: 'Área de prueba URLs',
      persona_afectada: 'Usuario de prueba',
      descripcion: 'Prueba de guardado de URLs de Cloudinary',
      estado: 'pendiente',
      prioridad: 'media'
    };
    
    console.log('📝 Creando evento de prueba...');
    const eventoResponse = await API.post(`${API_BASE_URL}/eventos`, eventoData);
    const eventoId = eventoResponse.data.id;
    console.log(`✅ Evento creado con ID: ${eventoId}`);
    
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
    
    // Verificar que el evento tiene las URLs correctas
    console.log('\n🔍 Verificando URLs guardadas...');
    const eventoActualizado = await API.get(`${API_BASE_URL}/eventos/${eventoId}`);
    const evento = eventoActualizado.data;
    
    console.log('📋 Campos de Cloudinary:');
    console.log(`  - imagen_principal_url: ${evento.imagen_principal_url || 'null'}`);
    console.log(`  - imagen_principal_public_id: ${evento.imagen_principal_public_id || 'null'}`);
    console.log(`  - evidencia (legacy): ${evento.evidencia || 'null'}`);
    
    // Verificar que las URLs son válidas
    if (evento.imagen_principal_url) {
      const isCloudinaryURL = evento.imagen_principal_url.includes('cloudinary.com') || 
                             evento.imagen_principal_url.includes('res.cloudinary.com');
      console.log(`  - URL válida de Cloudinary: ${isCloudinaryURL ? '✅' : '❌'}`);
    }
    
    if (evento.evidencia) {
      const isCloudinaryURL = evento.evidencia.includes('cloudinary.com') || 
                             evento.evidencia.includes('res.cloudinary.com');
      console.log(`  - Evidencia legacy con URL válida: ${isCloudinaryURL ? '✅' : '❌'}`);
    }
    
    // Limpiar archivo de prueba
    fs.unlinkSync(testImagePath);
    console.log('🧹 Archivo de prueba eliminado');
    
    console.log('\n🎉 Prueba completada!');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    // Limpiar archivo de prueba si existe
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

// Ejecutar la prueba si se llama directamente
if (require.main === module) {
  testCloudinaryURLs()
    .then(() => {
      console.log('✅ Prueba finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la prueba:', error);
      process.exit(1);
    });
}

module.exports = { testCloudinaryURLs };
