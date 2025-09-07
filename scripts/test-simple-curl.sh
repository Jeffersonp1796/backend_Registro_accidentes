#!/bin/bash

echo "🧪 Probando guardado de URLs de Cloudinary..."

# Crear un evento de prueba
echo "📝 Creando evento de prueba..."
EVENTO_RESPONSE=$(curl -s -X POST http://localhost:3001/api/eventos \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "'$(date +%Y-%m-%d)'",
    "tipo": "incidente",
    "lugar": "Área de prueba URLs",
    "persona_afectada": "Usuario de prueba",
    "descripcion": "Prueba de guardado de URLs de Cloudinary",
    "estado": "pendiente",
    "prioridad": "media"
  }')

echo "Respuesta del evento: $EVENTO_RESPONSE"

# Extraer el ID del evento
EVENTO_ID=$(echo $EVENTO_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "✅ Evento creado con ID: $EVENTO_ID"

# Crear un archivo de imagen de prueba
echo "📤 Creando archivo de imagen de prueba..."
echo "Test image content" > test-image.txt

# Subir imagen
echo "📤 Subiendo imagen de prueba..."
UPLOAD_RESPONSE=$(curl -s -X PUT http://localhost:3001/api/eventos/$EVENTO_ID \
  -F "evidencia=@test-image.txt")

echo "Respuesta de upload: $UPLOAD_RESPONSE"

# Verificar el evento actualizado
echo "🔍 Verificando URLs guardadas..."
EVENTO_ACTUALIZADO=$(curl -s -X GET http://localhost:3001/api/eventos/$EVENTO_ID)

echo "📋 Evento actualizado:"
echo "$EVENTO_ACTUALIZADO" | jq '.'

# Limpiar archivo de prueba
rm -f test-image.txt
echo "🧹 Archivo de prueba eliminado"

echo "🎉 Prueba completada!"
