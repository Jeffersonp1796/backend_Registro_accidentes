#!/bin/bash

echo "🧪 Probando Cloudinary con imagen real..."

# Crear un evento de prueba
echo "📝 Creando evento de prueba..."
EVENTO_RESPONSE=$(curl -s -X POST http://localhost:3001/api/eventos \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "'$(date +%Y-%m-%d)'",
    "tipo": "incidente",
    "lugar": "Área de prueba Cloudinary",
    "persona_afectada": "Usuario de prueba",
    "descripcion": "Prueba de Cloudinary con imagen real",
    "estado": "pendiente",
    "prioridad": "media"
  }')

echo "Respuesta del evento: $EVENTO_RESPONSE"

# Extraer el ID del evento
EVENTO_ID=$(echo $EVENTO_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "✅ Evento creado con ID: $EVENTO_ID"

# Crear una imagen PNG simple (1x1 pixel transparente)
echo "📤 Creando imagen PNG de prueba..."
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB\x60\x82" > test-image.png

# Subir imagen
echo "📤 Subiendo imagen PNG a Cloudinary..."
UPLOAD_RESPONSE=$(curl -s -X PUT http://localhost:3001/api/eventos/$EVENTO_ID \
  -F "evidencia=@test-image.png")

echo "Respuesta de upload: $UPLOAD_RESPONSE"

# Verificar el evento actualizado
echo "🔍 Verificando URLs de Cloudinary..."
EVENTO_ACTUALIZADO=$(curl -s -X GET http://localhost:3001/api/eventos/$EVENTO_ID)

echo "📋 Evento actualizado:"
echo "$EVENTO_ACTUALIZADO" | jq '.'

# Verificar si la URL contiene cloudinary.com
if echo "$EVENTO_ACTUALIZADO" | grep -q "cloudinary.com"; then
    echo "✅ ¡Cloudinary funcionando correctamente! URL contiene cloudinary.com"
else
    echo "❌ Cloudinary no está funcionando. URL no contiene cloudinary.com"
fi

# Limpiar archivo de prueba
rm -f test-image.png
echo "🧹 Archivo de prueba eliminado"

echo "🎉 Prueba completada!"
